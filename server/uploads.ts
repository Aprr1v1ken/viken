/**
 * Penyimpanan berkas unggahan SYSJEGER (foto jemaat).
 *
 * Foto disimpan sebagai berkas di folder `uploads/members/` (dapat diubah
 * lewat SYSJEGER_UPLOADS_DIR) dan disajikan lewat rute statis `/uploads/...`
 * dengan nama berkas acak yang sulit ditebak. Database hanya menyimpan URL
 * fotonya pada kolom members.photo_url, sehingga ukuran database dan
 * respons API daftar jemaat tetap ringan.
 */
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const UPLOADS_DIR = process.env.SYSJEGER_UPLOADS_DIR
  ? path.resolve(process.env.SYSJEGER_UPLOADS_DIR)
  : path.resolve(process.cwd(), 'uploads');

export const MEMBER_PHOTO_DIR = path.join(UPLOADS_DIR, 'members');

const MAX_PHOTO_BYTES = 3 * 1024 * 1024; // 3 MB setelah didekode

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function sniffMatches(buf: Buffer, ext: string): boolean {
  if (ext === 'jpg') return buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
  if (ext === 'png') return buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  if (ext === 'webp') {
    return buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP';
  }
  return false;
}

/**
 * Simpan foto jemaat yang dikirim sebagai data URL base64
 * (data:image/jpeg;base64,...). Mengembalikan URL publik berkasnya.
 * Melempar Error dengan pesan Bahasa Indonesia bila tidak valid.
 */
export function saveMemberPhoto(dataUrl: string): string {
  const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/.exec(String(dataUrl || '').trim());
  if (!match) throw new Error('Format foto tidak valid. Gunakan berkas gambar JPG, PNG, atau WebP.');

  const ext = MIME_TO_EXT[match[1].toLowerCase()];
  if (!ext) throw new Error('Format foto tidak didukung. Gunakan JPG, PNG, atau WebP.');

  const buf = Buffer.from(match[2], 'base64');
  if (buf.length === 0) throw new Error('Berkas foto kosong.');
  if (buf.length > MAX_PHOTO_BYTES) throw new Error('Ukuran foto melebihi batas 3 MB setelah diproses.');
  if (!sniffMatches(buf, ext)) throw new Error('Isi berkas tidak cocok dengan format gambar yang dinyatakan.');

  fs.mkdirSync(MEMBER_PHOTO_DIR, { recursive: true });
  const filename = `jemaat-${Date.now()}-${randomBytes(9).toString('hex')}.${ext}`;
  fs.writeFileSync(path.join(MEMBER_PHOTO_DIR, filename), buf);
  return `/uploads/members/${filename}`;
}

/** Hapus berkas foto lama (hanya untuk URL unggahan lokal; URL lain diabaikan). */
export function deleteMemberPhoto(photoUrl?: string | null): void {
  if (!photoUrl || !photoUrl.startsWith('/uploads/members/')) return;
  const filename = path.basename(photoUrl);
  try {
    fs.rmSync(path.join(MEMBER_PHOTO_DIR, filename), { force: true });
  } catch {
    /* berkas sudah tidak ada — abaikan */
  }
}
