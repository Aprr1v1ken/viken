import { Router } from 'express';
import { getDb, emptyAllDatabaseTables, resetToSeedData } from './db.ts';
import { authGate, hashPassword, requireRole, signToken, verifyPassword } from './auth.ts';
import { saveMemberPhoto, deleteMemberPhoto } from './uploads.ts';
import {
  generateMemberNo,
  generateFamilyNo,
  validateMemberInput,
  calculateChurchStats,
  formatDateDMY,
  getUpcomingBirthdays,
} from '../src/utils/church-logic.ts';
import type { Member, Family, FinancialTransaction } from '../src/types/index.ts';

export const apiRouter = Router();

// Seluruh rute API wajib login, kecuali daftar rute publik pada server/auth.ts
// (login, warta, kegiatan, statistik ringkas, dan health-check untuk halaman web publik).
apiRouter.use(authGate);

apiRouter.get('/health', (_req, res) => {
  res.json({ success: true, service: 'SYSJEGER V2.0', status: 'ok', time: new Date().toISOString() });
});

// Statistik ringkas tanpa data pribadi — aman ditampilkan di web publik.
apiRouter.get('/public/stats', (_req, res) => {
  const db = getDb();
  const count = (sql: string) => (db.prepare(sql).get() as { count: number }).count;
  res.json({
    success: true,
    stats: {
      totalMembers: count("SELECT count(*) as count FROM members WHERE status = 'Aktif'"),
      totalFamilies: count('SELECT count(*) as count FROM families'),
      totalRayons: count('SELECT count(*) as count FROM rayons'),
      totalStaff: count("SELECT count(*) as count FROM church_staff WHERE status = 'Aktif'"),
    },
  });
});

// Peran pelayan (selain warga Jemaat biasa) — berhak mengelola data gereja.
const STAFF_ROLES = ['Super Admin', 'Admin Gereja', 'Ketua Majelis/Pendeta', 'Majelis/Rayon'];
const staffOnly = requireRole(...STAFF_ROLES);
const adminOnly = requireRole('Super Admin', 'Admin Gereja');

/** ID anggota yang terhubung dengan akun login (untuk pembatasan data Jemaat). */
function getOwnMemberId(userId: string): string | null {
  const row = getDb().prepare('SELECT member_id FROM users WHERE id = ?').get(userId) as any;
  return row?.member_id || null;
}

/** ID keluarga dari akun login Jemaat. */
function getOwnFamilyId(userId: string): string | null {
  const memberId = getOwnMemberId(userId);
  if (!memberId) return null;
  const row = getDb().prepare('SELECT family_id FROM members WHERE id = ?').get(memberId) as any;
  return row?.family_id || null;
}

/** Ambil nilai dari body bila dikirim; jika tidak, pertahankan nilai lama di DB (update parsial aman). */
function pick(data: any, key: string, old: any, column: string, fallback: any = '') {
  return data?.[key] !== undefined ? data[key] : (old?.[column] ?? fallback);
}

/** Balasan error tulis DB: pelanggaran UNIQUE menjadi 400 yang ramah, sisanya 500. */
function writeErr(res: any, err: any) {
  const msg = String(err?.message || err);
  if (msg.includes('UNIQUE constraint failed')) {
    return res.status(400).json({ success: false, message: 'Data dengan nomor/kode yang sama sudah ada. Gunakan nomor/kode lain.' });
  }
  return res.status(500).json({ success: false, message: msg });
}

/** Pembuat handler DELETE generik (nama tabel hanya dari konstanta internal). */
function handleDelete(table: string, label: string, module: string, nameColumn = 'id') {
  return (req: any, res: any) => {
    const db = getDb();
    const { id } = req.params;
    const old = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(id) as any;
    if (!old) return res.status(404).json({ success: false, message: `Data ${label} tidak ditemukan` });
    try {
      db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
      addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', `Hapus ${label}`, module, `Menghapus ${label}: ${old[nameColumn] || id}`);
      return res.json({ success: true, message: `Data ${label} berhasil dihapus` });
    } catch (err: any) {
      return writeErr(res, err);
    }
  };
}

const superAdminOnly = requireRole('Super Admin');
const ALL_ROLES = ['Super Admin', 'Admin Gereja', 'Ketua Majelis/Pendeta', 'Majelis/Rayon', 'Jemaat'];

// Log audit action helper
function addAuditLog(userId: string, userName: string, action: string, module: string, details: string) {
  try {
    const db = getDb();
    const id = 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    db.prepare('INSERT INTO audit_logs (id, user_id, user_name, action, module, details, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, userId, userName, action, module, details, now);
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

// 1. Auth Login
apiRouter.post('/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username dan kata sandi wajib diisi' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE LOWER(username) = LOWER(?) AND status = \'Aktif\'').get(String(username).trim()) as any;

  const check = user ? verifyPassword(String(password), user.password_hash) : { ok: false, needsRehash: false };
  if (!user || !check.ok) {
    return res.status(401).json({ success: false, message: 'Nama pengguna atau kata sandi salah' });
  }

  // Tingkatkan kata sandi format lama menjadi hash pada login pertama.
  if (check.needsRehash) {
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(String(password)), user.id);
  }

  addAuditLog(user.id, user.name, 'Login Berhasil', 'Autentikasi', `Pengguna ${user.username} (${user.role}) masuk ke sistem`);

  const sessionUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    rayonId: user.rayon_id || undefined,
    memberId: user.member_id || undefined,
    phone: user.phone || undefined,
    email: user.email || undefined,
    status: user.status,
  };

  return res.json({
    success: true,
    user: sessionUser,
    token: signToken({ id: user.id, username: user.username, name: user.name, role: user.role }),
  });
});

// Validasi sesi tersimpan (dipakai frontend saat halaman dimuat ulang)
apiRouter.get('/auth/me', (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ? AND status = \'Aktif\'').get(req.user!.id) as any;
  if (!user) {
    return res.status(401).json({ success: false, message: 'Pengguna tidak ditemukan atau sudah nonaktif' });
  }
  return res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      rayonId: user.rayon_id || undefined,
      memberId: user.member_id || undefined,
      phone: user.phone || undefined,
      email: user.email || undefined,
      status: user.status,
    },
  });
});

// Ganti kata sandi pengguna yang sedang masuk
apiRouter.post('/auth/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Kata sandi saat ini dan kata sandi baru wajib diisi' });
  }
  if (String(newPassword).length < 8) {
    return res.status(400).json({ success: false, message: 'Kata sandi baru minimal 8 karakter' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id) as any;
  if (!user || !verifyPassword(String(currentPassword), user.password_hash).ok) {
    return res.status(401).json({ success: false, message: 'Kata sandi saat ini salah' });
  }

  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(String(newPassword)), user.id);
  addAuditLog(user.id, user.name, 'Ganti Kata Sandi', 'Autentikasi', `Pengguna ${user.username} memperbarui kata sandinya`);
  return res.json({ success: true, message: 'Kata sandi berhasil diperbarui. Gunakan kata sandi baru pada login berikutnya.' });
});

// 1b. Unggah Foto Jemaat (disimpan sebagai berkas di /uploads/members)
apiRouter.post('/uploads/member-photo', staffOnly, (req, res) => {
  try {
    const url = saveMemberPhoto(req.body?.imageDataUrl || '');
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Unggah Foto Jemaat', 'Database Jemaat', `Mengunggah foto jemaat: ${url}`);
    return res.json({ success: true, url, message: 'Foto jemaat berhasil diunggah' });
  } catch (err: any) {
    return res.status(400).json({ success: false, message: err.message || 'Foto gagal diunggah' });
  }
});

// 1c. Manajemen Pengguna & Hak Akses (khusus Super Admin)
function serializeUser(u: any) {
  return {
    id: u.id,
    username: u.username,
    name: u.name,
    role: u.role,
    rayonId: u.rayon_id || undefined,
    memberId: u.member_id || undefined,
    phone: u.phone || undefined,
    email: u.email || undefined,
    status: u.status,
    createdAt: u.created_at,
  };
}

apiRouter.get('/users', superAdminOnly, (_req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM users ORDER BY role ASC, username ASC').all() as any[];
  res.json({ success: true, count: rows.length, users: rows.map(serializeUser) });
});

apiRouter.post('/users', superAdminOnly, (req, res) => {
  const db = getDb();
  const data = req.body || {};
  const username = String(data.username || '').trim();
  const name = String(data.name || '').trim();
  const role = String(data.role || 'Jemaat');
  if (username.length < 3) return res.status(400).json({ success: false, message: 'Username minimal 3 karakter' });
  if (!name) return res.status(400).json({ success: false, message: 'Nama pengguna wajib diisi' });
  if (!ALL_ROLES.includes(role)) return res.status(400).json({ success: false, message: 'Peran pengguna tidak dikenal' });
  if (!data.password || String(data.password).length < 8) {
    return res.status(400).json({ success: false, message: 'Kata sandi akun baru minimal 8 karakter' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?)').get(username) as any;
  if (existing) return res.status(400).json({ success: false, message: `Username "${username}" sudah digunakan` });

  const id = 'u-' + Date.now();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  try {
    db.prepare('INSERT INTO users (id, username, password_hash, name, role, rayon_id, member_id, phone, email, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(id, username, hashPassword(String(data.password)), name, role, data.rayonId || null, data.memberId || null, data.phone || '', data.email || '', data.status === 'Nonaktif' ? 'Nonaktif' : 'Aktif', now);
    addAuditLog(req.user!.id, req.user!.name, 'Tambah Pengguna', 'Pengguna & Hak Akses', `Membuat akun ${username} (${role})`);
    return res.json({ success: true, message: 'Akun pengguna berhasil dibuat', id });
  } catch (err: any) {
    return writeErr(res, err);
  }
});

apiRouter.put('/users/:id', superAdminOnly, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const data = req.body || {};
  const old = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!old) return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });

  const username = String(pick(data, 'username', old, 'username')).trim();
  const name = String(pick(data, 'name', old, 'name')).trim();
  const role = String(pick(data, 'role', old, 'role'));
  const status = String(pick(data, 'status', old, 'status'));
  if (username.length < 3) return res.status(400).json({ success: false, message: 'Username minimal 3 karakter' });
  if (!name) return res.status(400).json({ success: false, message: 'Nama pengguna wajib diisi' });
  if (!ALL_ROLES.includes(role)) return res.status(400).json({ success: false, message: 'Peran pengguna tidak dikenal' });
  if (id === req.user!.id && (role !== old.role || status !== old.status)) {
    return res.status(400).json({ success: false, message: 'Anda tidak dapat mengubah peran/status akun Anda sendiri' });
  }
  const dup = db.prepare('SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND id != ?').get(username, id) as any;
  if (dup) return res.status(400).json({ success: false, message: `Username "${username}" sudah digunakan` });

  try {
    db.prepare('UPDATE users SET username = ?, name = ?, role = ?, rayon_id = ?, member_id = ?, phone = ?, email = ?, status = ? WHERE id = ?')
      .run(username, name, role, pick(data, 'rayonId', old, 'rayon_id', null) || null, pick(data, 'memberId', old, 'member_id', null) || null,
        pick(data, 'phone', old, 'phone'), pick(data, 'email', old, 'email'), status, id);
    if (data.password) {
      if (String(data.password).length < 8) return res.status(400).json({ success: false, message: 'Kata sandi baru minimal 8 karakter' });
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hashPassword(String(data.password)), id);
    }
    addAuditLog(req.user!.id, req.user!.name, 'Ubah Pengguna', 'Pengguna & Hak Akses', `Mengubah akun ${username} (${role})${data.password ? ' + reset kata sandi' : ''}`);
    return res.json({ success: true, message: 'Data pengguna berhasil diperbarui' });
  } catch (err: any) {
    return writeErr(res, err);
  }
});

apiRouter.delete('/users/:id', superAdminOnly, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  if (id === req.user!.id) {
    return res.status(400).json({ success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri' });
  }
  const old = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!old) return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan' });
  if (old.role === 'Super Admin') {
    const count = (db.prepare("SELECT count(*) as count FROM users WHERE role = 'Super Admin'").get() as { count: number }).count;
    if (count <= 1) return res.status(400).json({ success: false, message: 'Akun Super Admin terakhir tidak dapat dihapus' });
  }
  try {
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    addAuditLog(req.user!.id, req.user!.name, 'Hapus Pengguna', 'Pengguna & Hak Akses', `Menghapus akun ${old.username} (${old.role})`);
    return res.json({ success: true, message: 'Akun pengguna berhasil dihapus' });
  } catch (err: any) {
    return writeErr(res, err);
  }
});

// 2. Members CRUD
apiRouter.get('/members', (req, res) => {
  const db = getDb();
  const { query, rayonId, categorialId, status } = req.query;

  // Akun Jemaat hanya boleh melihat anggota keluarganya sendiri (Portal Jemaat).
  const jemaatFamilyId = req.user?.role === 'Jemaat' ? getOwnFamilyId(req.user.id) : null;
  if (req.user?.role === 'Jemaat' && !jemaatFamilyId) {
    return res.json({ success: true, count: 0, members: [] });
  }

  let sql = `
    SELECT m.*, r.name as rayon_name, c.name as categorial_group_name, f.family_no
    FROM members m
    LEFT JOIN rayons r ON m.rayon_id = r.id
    LEFT JOIN categorial_groups c ON m.categorial_group_id = c.id
    LEFT JOIN families f ON m.family_id = f.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (jemaatFamilyId) {
    sql += ' AND m.family_id = ?';
    params.push(jemaatFamilyId);
  }
  if (rayonId && rayonId !== 'all') {
    sql += ' AND m.rayon_id = ?';
    params.push(rayonId);
  }
  if (categorialId && categorialId !== 'all') {
    sql += ' AND m.categorial_group_id = ?';
    params.push(categorialId);
  }
  if (status && status !== 'all') {
    sql += ' AND m.status = ?';
    params.push(status);
  }
  if (query && typeof query === 'string') {
    const q = `%${query.trim()}%`;
    sql += ' AND (m.full_name LIKE ? OR m.member_no LIKE ? OR m.nik LIKE ? OR m.phone LIKE ? OR m.address LIKE ?)';
    params.push(q, q, q, q, q);
  }

  sql += ' ORDER BY m.member_no ASC';

  const rows = db.prepare(sql).all(...params) as any[];

  const members: Member[] = rows.map((r) => ({
    id: r.id,
    memberNo: r.member_no,
    fullName: r.full_name,
    nickname: r.nickname || '',
    nik: r.nik || '',
    familyCardNo: r.family_card_no || '',
    familyId: r.family_id || '',
    familyName: r.head_of_family_name || '',
    familyRole: r.family_role,
    gender: r.gender,
    birthPlace: r.birth_place || '',
    birthDate: r.birth_date,
    address: r.address,
    kelurahan: r.kelurahan || 'Fuimelang',
    kecamatan: r.kecamatan || 'Alor Tengah Utara',
    kabupaten: r.kabupaten || 'Alor',
    phone: r.phone || '',
    email: r.email || '',
    maritalStatus: r.marital_status,
    spouseName: r.spouse_name || '',
    rayonId: r.rayon_id,
    rayonName: r.rayon_name || '',
    categorialGroupId: r.categorial_group_id,
    categorialGroupName: r.categorial_group_name || '',
    membershipStatus: r.membership_status,
    baptismStatus: r.baptism_status,
    baptismDate: r.baptism_date || '',
    confirmationStatus: r.confirmation_status,
    confirmationDate: r.confirmation_date || '',
    marriageChurchStatus: r.marriage_church_status,
    marriageDate: r.marriage_date || '',
    education: r.education || '',
    occupation: r.occupation || '',
    joinDate: r.join_date,
    status: r.status,
    notes: r.notes || '',
    photoUrl: r.photo_url || '',
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  res.json({ success: true, count: members.length, members });
});

apiRouter.post('/members', staffOnly, (req, res) => {
  const db = getDb();
  const data = req.body;
  const validation = validateMemberInput(data);
  if (!validation.valid) {
    return res.status(400).json({ success: false, message: validation.errors.join(', ') });
  }

  if (data.nik && data.nik.trim().length > 0 && !/^\d{16}$/.test(data.nik.trim())) {
    return res.status(400).json({ success: false, message: 'Nomor Induk Kependudukan (NIK) tidak boleh kurang atau lebih dari 16 angka' });
  }

  // Count to generate new member_no if not provided
  const countRow = db.prepare('SELECT count(*) as count FROM members').get() as { count: number };
  const memberNo = data.memberNo || generateMemberNo((countRow?.count || 0) + 1);
  const id = 'm-' + Date.now();
  const now = new Date().toISOString().substring(0, 10);

  try {
    db.prepare(`
      INSERT INTO members (
        id, member_no, full_name, nickname, nik, family_card_no, family_id, family_role, gender,
        birth_place, birth_date, address, kelurahan, kecamatan, kabupaten, phone, email,
        marital_status, spouse_name, rayon_id, categorial_group_id, membership_status,
        baptism_status, baptism_date, confirmation_status, confirmation_date,
        marriage_church_status, marriage_date, education, occupation, join_date, status,
        notes, photo_url, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?
      )
    `).run(
      id, memberNo, data.fullName, data.nickname || '', data.nik || '', data.familyCardNo || '',
      data.familyId || '', data.familyRole || 'Anggota', data.gender, data.birthPlace || '',
      data.birthDate, data.address || '', data.kelurahan || 'Fuimelang', data.kecamatan || 'Alor Tengah Utara',
      data.kabupaten || 'Alor', data.phone || '', data.email || '', data.maritalStatus || 'Belum Menikah',
      data.spouseName || '', data.rayonId, data.categorialGroupId || 'c1', data.membershipStatus || 'Tetap',
      data.baptismStatus || 'Belum', data.baptismDate || '', data.confirmationStatus || 'Belum',
      data.confirmationDate || '', data.marriageChurchStatus || 'Belum', data.marriageDate || '',
      data.education || '', data.occupation || '', data.joinDate || now, data.status || 'Aktif',
      data.notes || '', data.photoUrl || '', now, now
    );

    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Tambah Jemaat', 'Database Jemaat', `Menambahkan anggota jemaat baru: ${data.fullName} (${memberNo})`);

    res.json({ success: true, message: 'Data jemaat berhasil disimpan', id, memberNo });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Gagal menyimpan data: ' + err.message });
  }
});

apiRouter.put('/members/:id', staffOnly, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const data = req.body;
  const now = new Date().toISOString().substring(0, 10);
  const oldMember = db.prepare('SELECT photo_url FROM members WHERE id = ?').get(id) as any;
  if (!oldMember) return res.status(404).json({ success: false, message: 'Data jemaat tidak ditemukan' });
  const photoUrl = data.photoUrl !== undefined ? data.photoUrl : (oldMember.photo_url || '');

  if (data.nik && data.nik.trim().length > 0 && !/^\d{16}$/.test(data.nik.trim())) {
    return res.status(400).json({ success: false, message: 'Nomor Induk Kependudukan (NIK) tidak boleh kurang atau lebih dari 16 angka' });
  }

  try {
    db.prepare(`
      UPDATE members SET
        full_name = ?, nickname = ?, nik = ?, family_card_no = ?, family_id = ?, family_role = ?,
        gender = ?, birth_place = ?, birth_date = ?, address = ?, kelurahan = ?, kecamatan = ?,
        kabupaten = ?, phone = ?, email = ?, marital_status = ?, spouse_name = ?, rayon_id = ?,
        categorial_group_id = ?, membership_status = ?, baptism_status = ?, baptism_date = ?,
        confirmation_status = ?, confirmation_date = ?, marriage_church_status = ?, marriage_date = ?,
        education = ?, occupation = ?, status = ?, notes = ?, photo_url = ?, updated_at = ?
      WHERE id = ?
    `).run(
      data.fullName, data.nickname || '', data.nik || '', data.familyCardNo || '', data.familyId || '',
      data.familyRole || 'Anggota', data.gender, data.birthPlace || '', data.birthDate, data.address || '',
      data.kelurahan || 'Fuimelang', data.kecamatan || 'Alor Tengah Utara', data.kabupaten || 'Alor',
      data.phone || '', data.email || '', data.maritalStatus || 'Belum Menikah', data.spouseName || '',
      data.rayonId, data.categorialGroupId || 'c1', data.membershipStatus || 'Tetap',
      data.baptismStatus || 'Belum', data.baptismDate || '', data.confirmationStatus || 'Belum',
      data.confirmationDate || '', data.marriageChurchStatus || 'Belum', data.marriageDate || '',
      data.education || '', data.occupation || '', data.status || 'Aktif', data.notes || '',
      photoUrl || '', now, id
    );

    if (oldMember.photo_url && oldMember.photo_url !== photoUrl) deleteMemberPhoto(oldMember.photo_url);
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Ubah Jemaat', 'Database Jemaat', `Mengubah data anggota jemaat: ${data.fullName}`);

    res.json({ success: true, message: 'Data jemaat berhasil diperbarui' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui data: ' + err.message });
  }
});

apiRouter.delete('/members/:id', staffOnly, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  try {
    const member = db.prepare('SELECT full_name, member_no, photo_url FROM members WHERE id = ?').get(id) as any;
    db.prepare('DELETE FROM members WHERE id = ?').run(id);
    // Lepaskan tautan dari akun pengguna & pelayan majelis, lalu hapus berkas fotonya.
    db.prepare('UPDATE users SET member_id = NULL WHERE member_id = ?').run(id);
    db.prepare('UPDATE church_staff SET member_id = NULL WHERE member_id = ?').run(id);
    deleteMemberPhoto(member?.photo_url);

    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Hapus Jemaat', 'Database Jemaat', `Menghapus anggota jemaat: ${member?.full_name || id}`);
    res.json({ success: true, message: 'Data jemaat berhasil dihapus' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Gagal menghapus data: ' + err.message });
  }
});

// 3. Families CRUD
apiRouter.get('/families', (req, res) => {
  const db = getDb();
  // Akun Jemaat hanya menerima kartu keluarganya sendiri.
  if (req.user?.role === 'Jemaat') {
    const ownFamilyId = getOwnFamilyId(req.user.id);
    const scoped = ownFamilyId
      ? db.prepare(`
          SELECT f.*, r.name as rayon_name,
            (SELECT count(*) FROM members WHERE family_id = f.id) as member_count
          FROM families f
          LEFT JOIN rayons r ON f.rayon_id = r.id
          WHERE f.id = ?
        `).all(ownFamilyId) as any[]
      : [];
    return res.json({
      success: true,
      families: scoped.map((f) => ({
        id: f.id,
        familyNo: f.family_no,
        headOfFamilyName: f.head_of_family_name,
        headOfFamilyId: f.head_of_family_id || '',
        address: f.address,
        rayonId: f.rayon_id,
        rayonName: f.rayon_name || '',
        phone: f.phone || '',
        notes: f.notes || '',
        createdAt: f.created_at,
        memberCount: f.member_count,
      })),
    });
  }
  const rows = db.prepare(`
    SELECT f.*, r.name as rayon_name,
      (SELECT count(*) FROM members WHERE family_id = f.id) as member_count
    FROM families f
    LEFT JOIN rayons r ON f.rayon_id = r.id
    ORDER BY f.family_no ASC
  `).all() as any[];

  const families: Family[] = rows.map((r) => ({
    id: r.id,
    familyNo: r.family_no,
    headOfFamilyName: r.head_of_family_name,
    headOfFamilyId: r.head_of_family_id,
    address: r.address,
    rayonId: r.rayon_id,
    rayonName: r.rayon_name || '',
    phone: r.phone || '',
    memberCount: r.member_count || 0,
    notes: r.notes || '',
    createdAt: r.created_at,
  }));

  res.json({ success: true, count: families.length, families });
});

apiRouter.post('/families', staffOnly, (req, res) => {
  const db = getDb();
  const data = req.body;
  if (!data.headOfFamilyName || !data.rayonId) {
    return res.status(400).json({ success: false, message: 'Nama Kepala Keluarga dan Rayon wajib diisi' });
  }

  const countRow = db.prepare('SELECT count(*) as count FROM families').get() as { count: number };
  const familyNo = data.familyNo || generateFamilyNo((countRow?.count || 0) + 1);
  const id = 'f-' + Date.now();
  const now = new Date().toISOString().substring(0, 10);

  try {
    db.prepare(`
      INSERT INTO families (id, family_no, head_of_family_name, head_of_family_id, address, rayon_id, phone, notes, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, familyNo, data.headOfFamilyName, data.headOfFamilyId || null, data.address || '', data.rayonId, data.phone || '', data.notes || '', now);

    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Tambah Kartu Keluarga', 'Keluarga & KK', `Menambahkan Kartu Keluarga baru: ${data.headOfFamilyName} (${familyNo})`);

    res.json({ success: true, message: 'Kartu Keluarga berhasil ditambahkan', id, familyNo });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Gagal menambahkan KK: ' + err.message });
  }
});

apiRouter.put('/families/:id', staffOnly, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const data = req.body || {};
  const old = db.prepare('SELECT * FROM families WHERE id = ?').get(id) as any;
  if (!old) return res.status(404).json({ success: false, message: 'Data KK tidak ditemukan' });
  try {
    db.prepare(`UPDATE families SET family_no = ?, head_of_family_name = ?, head_of_family_id = ?,
      address = ?, rayon_id = ?, phone = ?, notes = ? WHERE id = ?`).run(
      pick(data, 'familyNo', old, 'family_no'),
      pick(data, 'headOfFamilyName', old, 'head_of_family_name'),
      pick(data, 'headOfFamilyId', old, 'head_of_family_id', null) || null,
      pick(data, 'address', old, 'address'),
      pick(data, 'rayonId', old, 'rayon_id'),
      pick(data, 'phone', old, 'phone'),
      pick(data, 'notes', old, 'notes'),
      id
    );
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Ubah Kartu Keluarga', 'Keluarga & KK', `Mengubah KK: ${pick(data, 'headOfFamilyName', old, 'head_of_family_name')} (${pick(data, 'familyNo', old, 'family_no')})`);
    return res.json({ success: true, message: 'Kartu Keluarga berhasil diperbarui' });
  } catch (err: any) {
    return writeErr(res, err);
  }
});

apiRouter.delete('/families/:id', staffOnly, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  try {
    // Anggota keluarga tidak ikut terhapus; tautan KK-nya dilepaskan agar dapat dipindahkan.
    db.prepare("UPDATE members SET family_id = '' WHERE family_id = ?").run(id);
    db.prepare('DELETE FROM families WHERE id = ?').run(id);
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Hapus Kartu Keluarga', 'Keluarga & KK', `Menghapus KK ID: ${id}`);
    res.json({ success: true, message: 'Data KK berhasil dihapus' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Gagal menghapus KK: ' + err.message });
  }
});

// 4. Rayons & Kategorial
apiRouter.get('/rayons', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT r.*,
      (SELECT count(*) FROM members WHERE rayon_id = r.id AND status = 'Aktif') as member_count,
      (SELECT count(*) FROM families WHERE rayon_id = r.id) as family_count
    FROM rayons r
    ORDER BY r.code ASC
  `).all() as any[];

  res.json({ success: true, rayons: rows.map(r => ({
    id: r.id,
    code: r.code,
    name: r.name,
    leaderName: r.leader_name,
    leaderPhone: r.leader_phone || '',
    coverageArea: r.coverage_area || '',
    familyCount: r.family_count,
    memberCount: r.member_count,
    notes: r.notes || '',
  }))});
});

apiRouter.get('/categorials', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT c.*,
      (SELECT count(*) FROM members WHERE categorial_group_id = c.id AND status = 'Aktif') as member_count
    FROM categorial_groups c
    ORDER BY c.code ASC
  `).all() as any[];

  res.json({ success: true, categorials: rows.map(c => ({
    id: c.id,
    code: c.code,
    name: c.name,
    targetAgeDesc: c.target_age_desc || '',
    coordinator: c.coordinator || '',
    memberCount: c.member_count,
  }))});
});

apiRouter.post('/rayons', staffOnly, (req, res) => {
  const db = getDb();
  const data = req.body || {};
  if (!String(data.code || '').trim() || !String(data.name || '').trim()) {
    return res.status(400).json({ success: false, message: 'Kode dan nama rayon wajib diisi' });
  }
  const id = 'r-' + Date.now();
  try {
    db.prepare('INSERT INTO rayons (id, code, name, leader_name, leader_phone, coverage_area, notes) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, String(data.code).trim(), String(data.name).trim(), data.leaderName || '', data.leaderPhone || '', data.coverageArea || '', data.notes || '');
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Tambah Rayon', 'Rayon & Kategorial', `Menambahkan rayon ${data.name} (${data.code})`);
    return res.json({ success: true, message: 'Rayon berhasil ditambahkan', id });
  } catch (err: any) {
    return writeErr(res, err);
  }
});

apiRouter.put('/rayons/:id', staffOnly, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const data = req.body || {};
  const old = db.prepare('SELECT * FROM rayons WHERE id = ?').get(id) as any;
  if (!old) return res.status(404).json({ success: false, message: 'Rayon tidak ditemukan' });
  try {
    db.prepare('UPDATE rayons SET code = ?, name = ?, leader_name = ?, leader_phone = ?, coverage_area = ?, notes = ? WHERE id = ?').run(
      pick(data, 'code', old, 'code'), pick(data, 'name', old, 'name'), pick(data, 'leaderName', old, 'leader_name'),
      pick(data, 'leaderPhone', old, 'leader_phone'), pick(data, 'coverageArea', old, 'coverage_area'),
      pick(data, 'notes', old, 'notes'), id
    );
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Ubah Rayon', 'Rayon & Kategorial', `Mengubah rayon ${pick(data, 'name', old, 'name')}`);
    return res.json({ success: true, message: 'Rayon berhasil diperbarui' });
  } catch (err: any) {
    return writeErr(res, err);
  }
});

apiRouter.delete('/rayons/:id', staffOnly, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const old = db.prepare('SELECT * FROM rayons WHERE id = ?').get(id) as any;
  if (!old) return res.status(404).json({ success: false, message: 'Rayon tidak ditemukan' });
  const dipakai = (db.prepare('SELECT (SELECT count(*) FROM members WHERE rayon_id = ?) + (SELECT count(*) FROM families WHERE rayon_id = ?) as total').get(id, id) as { total: number }).total;
  if (dipakai > 0) {
    return res.status(409).json({ success: false, message: `Rayon "${old.name}" masih dipakai ${dipakai} data jemaat/KK. Pindahkan dulu datanya ke rayon lain, lalu hapus rayon ini.` });
  }
  try {
    db.prepare('DELETE FROM rayons WHERE id = ?').run(id);
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Hapus Rayon', 'Rayon & Kategorial', `Menghapus rayon ${old.name} (${old.code})`);
    return res.json({ success: true, message: 'Rayon berhasil dihapus' });
  } catch (err: any) {
    return writeErr(res, err);
  }
});

apiRouter.post('/categorials', staffOnly, (req, res) => {
  const db = getDb();
  const data = req.body || {};
  if (!String(data.code || '').trim() || !String(data.name || '').trim()) {
    return res.status(400).json({ success: false, message: 'Kode dan nama kelompok kategorial wajib diisi' });
  }
  const id = 'c-' + Date.now();
  try {
    db.prepare('INSERT INTO categorial_groups (id, code, name, target_age_desc, coordinator) VALUES (?, ?, ?, ?, ?)')
      .run(id, String(data.code).trim(), String(data.name).trim(), data.targetAgeDesc || '', data.coordinator || '');
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Tambah Kategorial', 'Rayon & Kategorial', `Menambahkan kelompok ${data.name} (${data.code})`);
    return res.json({ success: true, message: 'Kelompok kategorial berhasil ditambahkan', id });
  } catch (err: any) {
    return writeErr(res, err);
  }
});

apiRouter.put('/categorials/:id', staffOnly, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const data = req.body || {};
  const old = db.prepare('SELECT * FROM categorial_groups WHERE id = ?').get(id) as any;
  if (!old) return res.status(404).json({ success: false, message: 'Kelompok kategorial tidak ditemukan' });
  try {
    db.prepare('UPDATE categorial_groups SET code = ?, name = ?, target_age_desc = ?, coordinator = ? WHERE id = ?').run(
      pick(data, 'code', old, 'code'), pick(data, 'name', old, 'name'),
      pick(data, 'targetAgeDesc', old, 'target_age_desc'), pick(data, 'coordinator', old, 'coordinator'), id
    );
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Ubah Kategorial', 'Rayon & Kategorial', `Mengubah kelompok ${pick(data, 'name', old, 'name')}`);
    return res.json({ success: true, message: 'Kelompok kategorial berhasil diperbarui' });
  } catch (err: any) {
    return writeErr(res, err);
  }
});

apiRouter.delete('/categorials/:id', staffOnly, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const old = db.prepare('SELECT * FROM categorial_groups WHERE id = ?').get(id) as any;
  if (!old) return res.status(404).json({ success: false, message: 'Kelompok kategorial tidak ditemukan' });
  const dipakai = (db.prepare('SELECT count(*) as count FROM members WHERE categorial_group_id = ?').get(id) as { count: number }).count;
  if (dipakai > 0) {
    return res.status(409).json({ success: false, message: `Kelompok "${old.name}" masih memiliki ${dipakai} anggota. Pindahkan dulu anggotanya ke kelompok lain, lalu hapus kelompok ini.` });
  }
  try {
    db.prepare('DELETE FROM categorial_groups WHERE id = ?').run(id);
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Hapus Kategorial', 'Rayon & Kategorial', `Menghapus kelompok ${old.name} (${old.code})`);
    return res.json({ success: true, message: 'Kelompok kategorial berhasil dihapus' });
  } catch (err: any) {
    return writeErr(res, err);
  }
});

// 5. Church Staff / Majelis
apiRouter.get('/staff', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM church_staff ORDER BY position ASC').all() as any[];
  res.json({ success: true, staff: rows.map(s => ({
    id: s.id,
    memberId: s.member_id,
    name: s.name,
    position: s.position,
    period: s.period,
    phone: s.phone || '',
    email: s.email || '',
    status: s.status,
  }))});
});

apiRouter.post('/staff', staffOnly, (req, res) => {
  const db = getDb();
  const data = req.body;
  const id = 'st-' + Date.now();
  try {
    db.prepare('INSERT INTO church_staff (id, member_id, name, position, period, phone, email, status) VALUES (?, NULL, ?, ?, ?, ?, ?, ?)')
      .run(id, data.name, data.position, data.period || '2024 - 2027', data.phone || '', data.email || '', data.status || 'Aktif');
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Tambah Majelis', 'Majelis & Pendeta', `Menambahkan pelayan majelis: ${data.name}`);
    res.json({ success: true, message: 'Pelayan majelis berhasil ditambahkan' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.put('/staff/:id', staffOnly, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const data = req.body || {};
  const old = db.prepare('SELECT * FROM church_staff WHERE id = ?').get(id) as any;
  if (!old) return res.status(404).json({ success: false, message: 'Data pelayan majelis tidak ditemukan' });
  try {
    db.prepare('UPDATE church_staff SET member_id = ?, name = ?, position = ?, period = ?, phone = ?, email = ?, status = ? WHERE id = ?').run(
      pick(data, 'memberId', old, 'member_id', null) || null,
      pick(data, 'name', old, 'name'), pick(data, 'position', old, 'position'), pick(data, 'period', old, 'period'),
      pick(data, 'phone', old, 'phone'), pick(data, 'email', old, 'email'), pick(data, 'status', old, 'status'), id
    );
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Ubah Majelis', 'Majelis & Pendeta', `Mengubah pelayan majelis: ${pick(data, 'name', old, 'name')}`);
    return res.json({ success: true, message: 'Data pelayan majelis berhasil diperbarui' });
  } catch (err: any) {
    return writeErr(res, err);
  }
});

apiRouter.delete('/staff/:id', staffOnly, handleDelete('church_staff', 'Pelayan Majelis', 'Majelis & Pendeta', 'name'));

// 6. Sacraments (Baptism, Confirmation, Marriage)
apiRouter.get('/sacraments', staffOnly, (req, res) => {
  const db = getDb();
  const baptisms = db.prepare('SELECT * FROM baptisms ORDER BY baptism_date DESC').all();
  const confirmations = db.prepare('SELECT * FROM confirmations ORDER BY confirmation_date DESC').all();
  const marriages = db.prepare('SELECT * FROM marriages ORDER BY blessing_date DESC').all();

  res.json({
    success: true,
    baptisms: baptisms.map((b: any) => ({
      id: b.id,
      registerNo: b.register_no,
      memberId: b.member_id,
      memberName: b.member_name,
      birthDate: b.birth_date,
      parentNames: b.parent_names,
      baptismDate: b.baptism_date,
      churchPlace: b.church_place,
      ministerName: b.minister_name,
      certificateNo: b.certificate_no,
      witnesses: b.witnesses || '',
      notes: b.notes || '',
    })),
    confirmations: confirmations.map((c: any) => ({
      id: c.id,
      registerNo: c.register_no,
      memberId: c.member_id,
      memberName: c.member_name,
      confirmationDate: c.confirmation_date,
      churchPlace: c.church_place,
      ministerName: c.minister_name,
      certificateNo: c.certificate_no,
      bibleVerse: c.bible_verse || '',
      notes: c.notes || '',
    })),
    marriages: marriages.map((m: any) => ({
      id: m.id,
      registerNo: m.register_no,
      groomId: m.groom_id,
      groomName: m.groom_name,
      brideId: m.bride_id,
      brideName: m.bride_name,
      blessingDate: m.blessing_date,
      churchPlace: m.church_place,
      ministerName: m.minister_name,
      certificateNo: m.certificate_no,
      witnessNames: m.witness_names || '',
      notes: m.notes || '',
    })),
  });
});

apiRouter.post('/sacraments/baptisms', staffOnly, (req, res) => {
  const db = getDb();
  const data = req.body;
  const id = 'bp-' + Date.now();
  const regNo = data.registerNo || `REG-BAP-${Date.now().toString().slice(-4)}`;

  try {
    db.prepare(`
      INSERT INTO baptisms (id, register_no, member_id, member_name, birth_date, parent_names, baptism_date, church_place, minister_name, certificate_no, witnesses, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, regNo, data.memberId, data.memberName, data.birthDate || '', data.parentNames || '', data.baptismDate, data.churchPlace || 'Gedung Kebaktian GMIT Betel Fuimelang', data.ministerName, data.certificateNo, data.witnesses || '', data.notes || '');

    // Update member's baptism status
    if (data.memberId) {
      db.prepare("UPDATE members SET baptism_status = 'Sudah', baptism_date = ? WHERE id = ?").run(data.baptismDate, data.memberId);
    }

    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Catat Sakramen Baptis', 'Sakramen & Peristiwa', `Mencatat baptisan kudus untuk: ${data.memberName}`);
    res.json({ success: true, message: 'Data baptisan berhasil dicatat' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.post('/sacraments/confirmations', staffOnly, (req, res) => {
  const db = getDb();
  const data = req.body;
  const id = 'cf-' + Date.now();
  const regNo = data.registerNo || `REG-SD-${Date.now().toString().slice(-4)}`;

  try {
    db.prepare(`
      INSERT INTO confirmations (id, register_no, member_id, member_name, confirmation_date, church_place, minister_name, certificate_no, bible_verse, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, regNo, data.memberId, data.memberName, data.confirmationDate, data.churchPlace || 'Gedung Kebaktian GMIT Betel Fuimelang', data.ministerName, data.certificateNo, data.bibleVerse || '', data.notes || '');

    if (data.memberId) {
      db.prepare("UPDATE members SET confirmation_status = 'Sudah', confirmation_date = ? WHERE id = ?").run(data.confirmationDate, data.memberId);
    }

    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Catat Peneguhan Sidi', 'Sakramen & Peristiwa', `Mencatat peneguhan sidi untuk: ${data.memberName}`);
    res.json({ success: true, message: 'Data peneguhan sidi berhasil dicatat' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.post('/sacraments/marriages', staffOnly, (req, res) => {
  const db = getDb();
  const data = req.body;
  const id = 'mr-' + Date.now();
  const regNo = data.registerNo || `REG-NK-${Date.now().toString().slice(-4)}`;

  try {
    db.prepare(`
      INSERT INTO marriages (id, register_no, groom_id, groom_name, bride_id, bride_name, blessing_date, church_place, minister_name, certificate_no, witness_names, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, regNo, data.groomId || null, data.groomName, data.brideId || null, data.brideName, data.blessingDate, data.churchPlace || 'Gedung Kebaktian GMIT Betel Fuimelang', data.ministerName, data.certificateNo, data.witnessNames || '', data.notes || '');

    if (data.groomId) {
      db.prepare("UPDATE members SET marriage_church_status = 'Sudah', marriage_date = ? WHERE id = ?").run(data.blessingDate, data.groomId);
    }
    if (data.brideId) {
      db.prepare("UPDATE members SET marriage_church_status = 'Sudah', marriage_date = ? WHERE id = ?").run(data.blessingDate, data.brideId);
    }

    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Catat Nikah Kudus', 'Sakramen & Peristiwa', `Mencatat pemberkatan nikah kudus: ${data.groomName} & ${data.brideName}`);
    res.json({ success: true, message: 'Data pernikahan gerejawi berhasil dicatat' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.put('/sacraments/baptisms/:id', staffOnly, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const data = req.body || {};
  const old = db.prepare('SELECT * FROM baptisms WHERE id = ?').get(id) as any;
  if (!old) return res.status(404).json({ success: false, message: 'Catatan baptisan tidak ditemukan' });
  try {
    db.prepare(`UPDATE baptisms SET register_no = ?, member_id = ?, member_name = ?, birth_date = ?, parent_names = ?,
      baptism_date = ?, church_place = ?, minister_name = ?, certificate_no = ?, witnesses = ?, notes = ? WHERE id = ?`).run(
      pick(data, 'registerNo', old, 'register_no'), pick(data, 'memberId', old, 'member_id'), pick(data, 'memberName', old, 'member_name'),
      pick(data, 'birthDate', old, 'birth_date'), pick(data, 'parentNames', old, 'parent_names'), pick(data, 'baptismDate', old, 'baptism_date'),
      pick(data, 'churchPlace', old, 'church_place'), pick(data, 'ministerName', old, 'minister_name'), pick(data, 'certificateNo', old, 'certificate_no'),
      pick(data, 'witnesses', old, 'witnesses'), pick(data, 'notes', old, 'notes'), id
    );
    const memberId = pick(data, 'memberId', old, 'member_id');
    if (memberId) db.prepare("UPDATE members SET baptism_status = 'Sudah', baptism_date = ? WHERE id = ?").run(pick(data, 'baptismDate', old, 'baptism_date'), memberId);
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Ubah Catatan Baptis', 'Sakramen & Peristiwa', `Mengubah catatan baptisan: ${pick(data, 'memberName', old, 'member_name')}`);
    return res.json({ success: true, message: 'Catatan baptisan berhasil diperbarui' });
  } catch (err: any) {
    return writeErr(res, err);
  }
});

apiRouter.delete('/sacraments/baptisms/:id', staffOnly, handleDelete('baptisms', 'Catatan Baptisan', 'Sakramen & Peristiwa', 'member_name'));

apiRouter.put('/sacraments/confirmations/:id', staffOnly, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const data = req.body || {};
  const old = db.prepare('SELECT * FROM confirmations WHERE id = ?').get(id) as any;
  if (!old) return res.status(404).json({ success: false, message: 'Catatan peneguhan sidi tidak ditemukan' });
  try {
    db.prepare(`UPDATE confirmations SET register_no = ?, member_id = ?, member_name = ?, confirmation_date = ?,
      church_place = ?, minister_name = ?, certificate_no = ?, bible_verse = ?, notes = ? WHERE id = ?`).run(
      pick(data, 'registerNo', old, 'register_no'), pick(data, 'memberId', old, 'member_id'), pick(data, 'memberName', old, 'member_name'),
      pick(data, 'confirmationDate', old, 'confirmation_date'), pick(data, 'churchPlace', old, 'church_place'),
      pick(data, 'ministerName', old, 'minister_name'), pick(data, 'certificateNo', old, 'certificate_no'),
      pick(data, 'bibleVerse', old, 'bible_verse'), pick(data, 'notes', old, 'notes'), id
    );
    const memberId = pick(data, 'memberId', old, 'member_id');
    if (memberId) db.prepare("UPDATE members SET confirmation_status = 'Sudah', confirmation_date = ? WHERE id = ?").run(pick(data, 'confirmationDate', old, 'confirmation_date'), memberId);
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Ubah Catatan Sidi', 'Sakramen & Peristiwa', `Mengubah catatan sidi: ${pick(data, 'memberName', old, 'member_name')}`);
    return res.json({ success: true, message: 'Catatan peneguhan sidi berhasil diperbarui' });
  } catch (err: any) {
    return writeErr(res, err);
  }
});

apiRouter.delete('/sacraments/confirmations/:id', staffOnly, handleDelete('confirmations', 'Catatan Peneguhan Sidi', 'Sakramen & Peristiwa', 'member_name'));

apiRouter.put('/sacraments/marriages/:id', staffOnly, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const data = req.body || {};
  const old = db.prepare('SELECT * FROM marriages WHERE id = ?').get(id) as any;
  if (!old) return res.status(404).json({ success: false, message: 'Catatan pernikahan tidak ditemukan' });
  try {
    db.prepare(`UPDATE marriages SET register_no = ?, groom_id = ?, groom_name = ?, bride_id = ?, bride_name = ?,
      blessing_date = ?, church_place = ?, minister_name = ?, certificate_no = ?, witness_names = ?, notes = ? WHERE id = ?`).run(
      pick(data, 'registerNo', old, 'register_no'), pick(data, 'groomId', old, 'groom_id', null) || null, pick(data, 'groomName', old, 'groom_name'),
      pick(data, 'brideId', old, 'bride_id', null) || null, pick(data, 'brideName', old, 'bride_name'), pick(data, 'blessingDate', old, 'blessing_date'),
      pick(data, 'churchPlace', old, 'church_place'), pick(data, 'ministerName', old, 'minister_name'), pick(data, 'certificateNo', old, 'certificate_no'),
      pick(data, 'witnessNames', old, 'witness_names'), pick(data, 'notes', old, 'notes'), id
    );
    const blessingDate = pick(data, 'blessingDate', old, 'blessing_date');
    const groomId = pick(data, 'groomId', old, 'groom_id', null);
    const brideId = pick(data, 'brideId', old, 'bride_id', null);
    if (groomId) db.prepare("UPDATE members SET marriage_church_status = 'Sudah', marriage_date = ? WHERE id = ?").run(blessingDate, groomId);
    if (brideId) db.prepare("UPDATE members SET marriage_church_status = 'Sudah', marriage_date = ? WHERE id = ?").run(blessingDate, brideId);
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Ubah Catatan Nikah', 'Sakramen & Peristiwa', `Mengubah catatan nikah: ${pick(data, 'groomName', old, 'groom_name')} & ${pick(data, 'brideName', old, 'bride_name')}`);
    return res.json({ success: true, message: 'Catatan pernikahan berhasil diperbarui' });
  } catch (err: any) {
    return writeErr(res, err);
  }
});

apiRouter.delete('/sacraments/marriages/:id', staffOnly, handleDelete('marriages', 'Catatan Pernikahan', 'Sakramen & Peristiwa', 'groom_name'));

// 7. Mutations
apiRouter.get('/mutations', staffOnly, (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM member_mutations ORDER BY request_date DESC').all() as any[];
  res.json({
    success: true,
    mutations: rows.map(m => ({
      id: m.id,
      mutationNo: m.mutation_no,
      memberId: m.member_id,
      memberName: m.member_name,
      mutationType: m.mutation_type,
      fromRayonId: m.from_rayon_id,
      toRayonId: m.to_rayon_id,
      fromChurch: m.from_church,
      toChurch: m.to_church,
      requestDate: m.request_date,
      effectiveDate: m.effective_date,
      reason: m.reason || '',
      status: m.status,
      approvedBy: m.approved_by || '',
      notes: m.notes || '',
    })),
  });
});

apiRouter.post('/mutations', staffOnly, (req, res) => {
  const db = getDb();
  const data = req.body;
  const id = 'mut-' + Date.now();
  const mutNo = `MUT-${Date.now().toString().slice(-4)}`;

  try {
    db.prepare(`
      INSERT INTO member_mutations (id, mutation_no, member_id, member_name, mutation_type, from_rayon_id, to_rayon_id, from_church, to_church, request_date, effective_date, reason, status, approved_by, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, mutNo, data.memberId, data.memberName, data.mutationType, data.fromRayonId || null,
      data.toRayonId || null, data.fromChurch || 'GMIT Betel Fuimelang', data.toChurch || '',
      data.requestDate, data.effectiveDate, data.reason || '', 'Disetujui',
      data.approvedBy || '', data.notes || ''
    );

    // Update member life status if Pindah or Meninggal
    if (data.mutationType === 'Pindah Keluar') {
      db.prepare("UPDATE members SET status = 'Pindah' WHERE id = ?").run(data.memberId);
    } else if (data.mutationType === 'Meninggal Dunia') {
      db.prepare("UPDATE members SET status = 'Meninggal' WHERE id = ?").run(data.memberId);
    } else if (data.mutationType === 'Pindah Rayon' && data.toRayonId) {
      db.prepare("UPDATE members SET rayon_id = ? WHERE id = ?").run(data.toRayonId, data.memberId);
    }

    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Catat Mutasi Anggota', 'Mutasi Jemaat', `Mencatat mutasi ${data.mutationType} untuk: ${data.memberName}`);
    res.json({ success: true, message: 'Mutasi jemaat berhasil dicatat dan diproses' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.put('/mutations/:id', staffOnly, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const data = req.body || {};
  const old = db.prepare('SELECT * FROM member_mutations WHERE id = ?').get(id) as any;
  if (!old) return res.status(404).json({ success: false, message: 'Catatan mutasi tidak ditemukan' });
  try {
    db.prepare(`UPDATE member_mutations SET mutation_no = ?, member_id = ?, member_name = ?, mutation_type = ?,
      from_rayon_id = ?, to_rayon_id = ?, from_church = ?, to_church = ?, request_date = ?, effective_date = ?,
      reason = ?, status = ?, approved_by = ?, notes = ? WHERE id = ?`).run(
      pick(data, 'mutationNo', old, 'mutation_no'), pick(data, 'memberId', old, 'member_id'), pick(data, 'memberName', old, 'member_name'),
      pick(data, 'mutationType', old, 'mutation_type'), pick(data, 'fromRayonId', old, 'from_rayon_id', null) || null,
      pick(data, 'toRayonId', old, 'to_rayon_id', null) || null, pick(data, 'fromChurch', old, 'from_church'),
      pick(data, 'toChurch', old, 'to_church'), pick(data, 'requestDate', old, 'request_date'), pick(data, 'effectiveDate', old, 'effective_date'),
      pick(data, 'reason', old, 'reason'), pick(data, 'status', old, 'status'), pick(data, 'approvedBy', old, 'approved_by'),
      pick(data, 'notes', old, 'notes'), id
    );
    // Terapkan dampak mutasi terkini ke data anggota (sama seperti saat dibuat).
    const memberId = pick(data, 'memberId', old, 'member_id');
    const type = pick(data, 'mutationType', old, 'mutation_type');
    if (memberId && type === 'Pindah Keluar') db.prepare("UPDATE members SET status = 'Pindah' WHERE id = ?").run(memberId);
    else if (memberId && type === 'Meninggal Dunia') db.prepare("UPDATE members SET status = 'Meninggal' WHERE id = ?").run(memberId);
    else if (memberId && type === 'Pindah Rayon' && pick(data, 'toRayonId', old, 'to_rayon_id', null)) {
      db.prepare('UPDATE members SET rayon_id = ? WHERE id = ?').run(pick(data, 'toRayonId', old, 'to_rayon_id', null), memberId);
    }
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Ubah Catatan Mutasi', 'Mutasi Jemaat', `Mengubah mutasi ${type} untuk: ${pick(data, 'memberName', old, 'member_name')}`);
    return res.json({ success: true, message: 'Catatan mutasi berhasil diperbarui' });
  } catch (err: any) {
    return writeErr(res, err);
  }
});

apiRouter.delete('/mutations/:id', staffOnly, handleDelete('member_mutations', 'Catatan Mutasi', 'Mutasi Jemaat', 'member_name'));

// 8. Events & Service Schedules
apiRouter.get('/events', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM events ORDER BY start_time ASC').all() as any[];
  res.json({
    success: true,
    events: rows.map(e => ({
      id: e.id,
      title: e.title,
      category: e.category,
      startTime: e.start_time,
      endTime: e.end_time,
      location: e.location,
      picName: e.pic_name,
      description: e.description || '',
      status: e.status,
    })),
  });
});

apiRouter.post('/events', staffOnly, (req, res) => {
  const db = getDb();
  const data = req.body;
  const id = 'ev-' + Date.now();
  try {
    db.prepare(`
      INSERT INTO events (id, title, category, start_time, end_time, location, pic_name, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.title, data.category, data.startTime, data.endTime, data.location, data.picName, data.description || '', data.status || 'Terjadwal');
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Tambah Jadwal Kegiatan', 'Ibadah & Kegiatan', `Membuat kegiatan baru: ${data.title}`);
    res.json({ success: true, message: 'Kegiatan berhasil dijadwalkan' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.get('/schedules', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM service_schedules ORDER BY id DESC').all() as any[];
  res.json({
    success: true,
    schedules: rows.map(s => ({
      id: s.id,
      serviceDate: s.service_date,
      serviceName: s.service_name,
      preacher: s.preacher,
      liturgist: s.liturgist,
      elderDuty: s.elder_duty,
      deaconDuty: s.deacon_duty,
      songLeader: s.song_leader,
      musicians: s.musicians,
      multimediaOperator: s.multimedia_operator,
      usher: s.usher,
      bibleReader: s.bible_reader,
      notes: s.notes || '',
    })),
  });
});

apiRouter.post('/schedules', staffOnly, (req, res) => {
  const db = getDb();
  const data = req.body;
  const id = 'sch-' + Date.now();
  try {
    db.prepare(`
      INSERT INTO service_schedules (id, service_date, service_name, preacher, liturgist, elder_duty, deacon_duty, song_leader, musicians, multimedia_operator, usher, bible_reader, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, data.serviceDate, data.serviceName, data.preacher, data.liturgist, data.elderDuty,
      data.deaconDuty, data.songLeader, data.musicians, data.multimediaOperator, data.usher,
      data.bibleReader, data.notes || ''
    );
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Buat Jadwal Petugas Ibadah', 'Jadwal Pelayanan', `Membuat jadwal petugas kebaktian: ${data.serviceName} (${data.serviceDate})`);
    res.json({ success: true, message: 'Jadwal petugas ibadah berhasil disimpan' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.put('/events/:id', staffOnly, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const data = req.body || {};
  const old = db.prepare('SELECT * FROM events WHERE id = ?').get(id) as any;
  if (!old) return res.status(404).json({ success: false, message: 'Kegiatan tidak ditemukan' });
  try {
    db.prepare(`UPDATE events SET title = ?, category = ?, start_time = ?, end_time = ?, location = ?,
      pic_name = ?, description = ?, status = ? WHERE id = ?`).run(
      pick(data, 'title', old, 'title'), pick(data, 'category', old, 'category'), pick(data, 'startTime', old, 'start_time'),
      pick(data, 'endTime', old, 'end_time'), pick(data, 'location', old, 'location'), pick(data, 'picName', old, 'pic_name'),
      pick(data, 'description', old, 'description'), pick(data, 'status', old, 'status'), id
    );
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Ubah Kegiatan', 'Ibadah & Kegiatan', `Mengubah kegiatan: ${pick(data, 'title', old, 'title')}`);
    return res.json({ success: true, message: 'Kegiatan berhasil diperbarui' });
  } catch (err: any) {
    return writeErr(res, err);
  }
});

apiRouter.delete('/events/:id', staffOnly, handleDelete('events', 'Kegiatan', 'Ibadah & Kegiatan', 'title'));

apiRouter.put('/schedules/:id', staffOnly, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const data = req.body || {};
  const old = db.prepare('SELECT * FROM service_schedules WHERE id = ?').get(id) as any;
  if (!old) return res.status(404).json({ success: false, message: 'Jadwal petugas ibadah tidak ditemukan' });
  try {
    db.prepare(`UPDATE service_schedules SET service_date = ?, service_name = ?, preacher = ?, liturgist = ?,
      elder_duty = ?, deacon_duty = ?, song_leader = ?, musicians = ?, multimedia_operator = ?, usher = ?,
      bible_reader = ?, notes = ? WHERE id = ?`).run(
      pick(data, 'serviceDate', old, 'service_date'), pick(data, 'serviceName', old, 'service_name'), pick(data, 'preacher', old, 'preacher'),
      pick(data, 'liturgist', old, 'liturgist'), pick(data, 'elderDuty', old, 'elder_duty'), pick(data, 'deaconDuty', old, 'deacon_duty'),
      pick(data, 'songLeader', old, 'song_leader'), pick(data, 'musicians', old, 'musicians'),
      pick(data, 'multimediaOperator', old, 'multimedia_operator'), pick(data, 'usher', old, 'usher'),
      pick(data, 'bibleReader', old, 'bible_reader'), pick(data, 'notes', old, 'notes'), id
    );
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Ubah Jadwal Petugas Ibadah', 'Jadwal Pelayanan', `Mengubah jadwal: ${pick(data, 'serviceName', old, 'service_name')}`);
    return res.json({ success: true, message: 'Jadwal petugas ibadah berhasil diperbarui' });
  } catch (err: any) {
    return writeErr(res, err);
  }
});

apiRouter.delete('/schedules/:id', staffOnly, handleDelete('service_schedules', 'Jadwal Petugas Ibadah', 'Jadwal Pelayanan', 'service_name'));

// 9. Attendance
apiRouter.get('/attendance', staffOnly, (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM attendance_records ORDER BY date DESC').all() as any[];
  res.json({
    success: true,
    attendance: rows.map(a => ({
      id: a.id,
      eventId: a.event_id,
      eventTitle: a.event_title,
      date: a.date,
      maleCount: a.male_count,
      femaleCount: a.female_count,
      childrenCount: a.children_count,
      totalCount: a.total_count,
      notes: a.notes || '',
      recordedBy: a.recorded_by,
    })),
  });
});

apiRouter.post('/attendance', staffOnly, (req, res) => {
  const db = getDb();
  const data = req.body;
  const id = 'att-' + Date.now();
  const male = Number(data.maleCount) || 0;
  const female = Number(data.femaleCount) || 0;
  const children = Number(data.childrenCount) || 0;
  const total = male + female + children;

  try {
    db.prepare(`
      INSERT INTO attendance_records (id, event_id, event_title, date, male_count, female_count, children_count, total_count, notes, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.eventId || null, data.eventTitle, data.date, male, female, children, total, data.notes || '', data.recordedBy || 'Tata Usaha');
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Catat Absensi Ibadah', 'Absensi & Kehadiran', `Mencatat kehadiran ${total} jiwa pada ${data.eventTitle}`);
    res.json({ success: true, message: 'Absensi ibadah berhasil dicatat' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.put('/attendance/:id', staffOnly, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const data = req.body || {};
  const old = db.prepare('SELECT * FROM attendance_records WHERE id = ?').get(id) as any;
  if (!old) return res.status(404).json({ success: false, message: 'Catatan absensi tidak ditemukan' });
  const male = Number(pick(data, 'maleCount', old, 'male_count')) || 0;
  const female = Number(pick(data, 'femaleCount', old, 'female_count')) || 0;
  const children = Number(pick(data, 'childrenCount', old, 'children_count')) || 0;
  try {
    db.prepare(`UPDATE attendance_records SET event_id = ?, event_title = ?, date = ?, male_count = ?,
      female_count = ?, children_count = ?, total_count = ?, notes = ?, recorded_by = ? WHERE id = ?`).run(
      pick(data, 'eventId', old, 'event_id', null) || null, pick(data, 'eventTitle', old, 'event_title'),
      pick(data, 'date', old, 'date'), male, female, children, male + female + children,
      pick(data, 'notes', old, 'notes'), pick(data, 'recordedBy', old, 'recorded_by'), id
    );
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Ubah Absensi Ibadah', 'Absensi & Kehadiran', `Mengubah absensi: ${pick(data, 'eventTitle', old, 'event_title')} (${male + female + children} jiwa)`);
    return res.json({ success: true, message: 'Absensi ibadah berhasil diperbarui' });
  } catch (err: any) {
    return writeErr(res, err);
  }
});

apiRouter.delete('/attendance/:id', staffOnly, handleDelete('attendance_records', 'Catatan Absensi', 'Absensi & Kehadiran', 'event_title'));

// 10. Financial Transactions
apiRouter.get('/finance', staffOnly, (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM financial_transactions ORDER BY tx_date DESC, id DESC').all() as any[];
  const transactions: FinancialTransaction[] = rows.map(t => ({
    id: t.id,
    txNo: t.tx_no,
    txDate: t.tx_date,
    type: t.type,
    category: t.category,
    amount: t.amount,
    description: t.description,
    recordedBy: t.recorded_by,
  }));

  let totalIncome = 0;
  let totalExpense = 0;
  for (const t of transactions) {
    if (t.type === 'Pemasukan') totalIncome += t.amount;
    else if (t.type === 'Pengeluaran') totalExpense += t.amount;
  }

  res.json({
    success: true,
    summary: {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      count: transactions.length,
    },
    transactions,
  });
});

apiRouter.post('/finance', staffOnly, (req, res) => {
  const db = getDb();
  const data = req.body;
  const id = 'tx-' + Date.now();
  const txNo = data.txNo || `TX-${Date.now().toString().slice(-6)}`;
  const amount = Number(data.amount) || 0;

  try {
    db.prepare(`
      INSERT INTO financial_transactions (id, tx_no, tx_date, type, category, amount, description, recorded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, txNo, data.txDate, data.type, data.category, amount, data.description, data.recordedBy || 'Bendahara Jemaat');

    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Catat Transaksi Keuangan', 'Keuangan Kas Gereja', `Mencatat ${data.type} sebesar Rp ${amount.toLocaleString('id-ID')} untuk ${data.category}`);
    res.json({ success: true, message: 'Transaksi kas gereja berhasil dicatat' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.put('/finance/:id', staffOnly, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const data = req.body || {};
  const old = db.prepare('SELECT * FROM financial_transactions WHERE id = ?').get(id) as any;
  if (!old) return res.status(404).json({ success: false, message: 'Transaksi keuangan tidak ditemukan' });
  const amount = Number(pick(data, 'amount', old, 'amount')) || 0;
  try {
    db.prepare(`UPDATE financial_transactions SET tx_no = ?, tx_date = ?, type = ?, category = ?,
      amount = ?, description = ?, recorded_by = ? WHERE id = ?`).run(
      pick(data, 'txNo', old, 'tx_no'), pick(data, 'txDate', old, 'tx_date'), pick(data, 'type', old, 'type'),
      pick(data, 'category', old, 'category'), amount, pick(data, 'description', old, 'description'),
      pick(data, 'recordedBy', old, 'recorded_by'), id
    );
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Ubah Transaksi Keuangan', 'Keuangan Kas Gereja', `Mengubah transaksi Rp ${amount.toLocaleString('id-ID')} untuk ${pick(data, 'category', old, 'category')}`);
    return res.json({ success: true, message: 'Transaksi kas gereja berhasil diperbarui' });
  } catch (err: any) {
    return writeErr(res, err);
  }
});

apiRouter.delete('/finance/:id', staffOnly, handleDelete('financial_transactions', 'Transaksi Keuangan', 'Keuangan Kas Gereja', 'tx_no'));

// 11. Digital Documents
apiRouter.get('/documents', staffOnly, (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM documents ORDER BY upload_date DESC').all() as any[];
  res.json({
    success: true,
    documents: rows.map(d => ({
      id: d.id,
      docNo: d.doc_no,
      title: d.title,
      category: d.category,
      memberId: d.member_id,
      fileName: d.file_name,
      fileSize: d.file_size,
      uploadDate: d.upload_date,
      accessLevel: d.access_level,
    })),
  });
});

apiRouter.post('/documents', staffOnly, (req, res) => {
  const db = getDb();
  const data = req.body;
  const id = 'doc-' + Date.now();
  const docNo = data.docNo || `DOC-BF-${Date.now().toString().slice(-4)}`;
  const now = new Date().toISOString().substring(0, 10);

  try {
    db.prepare(`
      INSERT INTO documents (id, doc_no, title, category, member_id, file_name, file_size, upload_date, access_level)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, docNo, data.title, data.category, data.memberId || null, data.fileName || `${data.title.replace(/\s+/g, '_')}.pdf`, data.fileSize || '1.2 MB', now, data.accessLevel || 'Publik');

    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Unggah Dokumen Digital', 'Dokumen & Arsip', `Menyimpan arsip dokumen: ${data.title}`);
    res.json({ success: true, message: 'Dokumen digital berhasil diarsipkan' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.put('/documents/:id', staffOnly, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const data = req.body || {};
  const old = db.prepare('SELECT * FROM documents WHERE id = ?').get(id) as any;
  if (!old) return res.status(404).json({ success: false, message: 'Dokumen tidak ditemukan' });
  try {
    db.prepare(`UPDATE documents SET doc_no = ?, title = ?, category = ?, member_id = ?, file_name = ?,
      file_size = ?, upload_date = ?, access_level = ? WHERE id = ?`).run(
      pick(data, 'docNo', old, 'doc_no'), pick(data, 'title', old, 'title'), pick(data, 'category', old, 'category'),
      pick(data, 'memberId', old, 'member_id', null) || null, pick(data, 'fileName', old, 'file_name'),
      pick(data, 'fileSize', old, 'file_size'), pick(data, 'uploadDate', old, 'upload_date'),
      pick(data, 'accessLevel', old, 'access_level'), id
    );
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Ubah Dokumen Digital', 'Dokumen & Arsip', `Mengubah arsip dokumen: ${pick(data, 'title', old, 'title')}`);
    return res.json({ success: true, message: 'Dokumen digital berhasil diperbarui' });
  } catch (err: any) {
    return writeErr(res, err);
  }
});

apiRouter.delete('/documents/:id', staffOnly, handleDelete('documents', 'Dokumen Digital', 'Dokumen & Arsip', 'title'));

// 12. Announcements (Warta Jemaat)
apiRouter.get('/announcements', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM announcements ORDER BY date DESC').all() as any[];
  res.json({
    success: true,
    announcements: rows.map(a => ({
      id: a.id,
      title: a.title,
      date: a.date,
      category: a.category,
      content: a.content,
      author: a.author,
      isImportant: Boolean(a.is_important),
    })),
  });
});

apiRouter.post('/announcements', staffOnly, (req, res) => {
  const db = getDb();
  const data = req.body;
  const id = 'an-' + Date.now();
  const now = formatDateDMY(new Date().toISOString().substring(0, 10));

  try {
    db.prepare(`
      INSERT INTO announcements (id, title, date, category, content, author, is_important)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.title, data.date || now, data.category || 'Warta Ibadah', data.content, data.author || 'Sekretariat Majelis', data.isImportant ? 1 : 0);

    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Terbitkan Warta', 'Warta & Pengumuman', `Menerbitkan warta jemaat: ${data.title}`);
    res.json({ success: true, message: 'Warta jemaat berhasil diterbitkan' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.put('/announcements/:id', staffOnly, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const data = req.body || {};
  const old = db.prepare('SELECT * FROM announcements WHERE id = ?').get(id) as any;
  if (!old) return res.status(404).json({ success: false, message: 'Warta jemaat tidak ditemukan' });
  try {
    db.prepare(`UPDATE announcements SET title = ?, date = ?, category = ?, content = ?, author = ?,
      is_important = ? WHERE id = ?`).run(
      pick(data, 'title', old, 'title'), pick(data, 'date', old, 'date'), pick(data, 'category', old, 'category'),
      pick(data, 'content', old, 'content'), pick(data, 'author', old, 'author'),
      (data.isImportant !== undefined ? data.isImportant : Boolean(old.is_important)) ? 1 : 0, id
    );
    addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Ubah Warta', 'Warta & Pengumuman', `Mengubah warta jemaat: ${pick(data, 'title', old, 'title')}`);
    return res.json({ success: true, message: 'Warta jemaat berhasil diperbarui' });
  } catch (err: any) {
    return writeErr(res, err);
  }
});

apiRouter.delete('/announcements/:id', staffOnly, handleDelete('announcements', 'Warta Jemaat', 'Warta & Pengumuman', 'title'));

// 13. Data Correction Requests (from Jemaat Portal)
apiRouter.get('/corrections', (req, res) => {
  const db = getDb();
  // Akun Jemaat hanya melihat pengajuan koreksi datanya sendiri.
  const ownMemberId = req.user?.role === 'Jemaat' ? getOwnMemberId(req.user.id) : null;
  const rows = (req.user?.role === 'Jemaat'
    ? db.prepare('SELECT * FROM data_correction_requests WHERE member_id = ? ORDER BY request_date DESC').all(ownMemberId || '')
    : db.prepare('SELECT * FROM data_correction_requests ORDER BY request_date DESC').all()) as any[];
  res.json({
    success: true,
    corrections: rows.map(c => ({
      id: c.id,
      memberId: c.member_id,
      memberName: c.member_name,
      requestDate: c.request_date,
      details: c.details,
      status: c.status,
      adminNotes: c.admin_notes || '',
    })),
  });
});

apiRouter.post('/corrections', (req, res) => {
  const db = getDb();
  const data = req.body;
  // Akun Jemaat hanya boleh mengajukan koreksi untuk dirinya sendiri.
  if (req.user?.role === 'Jemaat') {
    const ownMemberId = getOwnMemberId(req.user.id);
    if (!ownMemberId) {
      return res.status(403).json({ success: false, message: 'Akun Anda belum terhubung dengan data anggota jemaat.' });
    }
    data.memberId = ownMemberId;
    const own = db.prepare('SELECT full_name FROM members WHERE id = ?').get(ownMemberId) as any;
    data.memberName = own?.full_name || req.user.name;
  }
  const id = 'cr-' + Date.now();
  const now = new Date().toISOString().substring(0, 10);

  try {
    db.prepare(`
      INSERT INTO data_correction_requests (id, member_id, member_name, request_date, details, status, admin_notes)
      VALUES (?, ?, ?, ?, ?, 'Menunggu', '')
    `).run(id, data.memberId, data.memberName, now, data.details);

    addAuditLog(data.memberId, data.memberName, 'Ajukan Pembaruan Data', 'Portal Jemaat', `Warga jemaat ${data.memberName} mengajukan koreksi biodata`);
    res.json({ success: true, message: 'Pengajuan koreksi biodata berhasil dikirimkan ke tata usaha gereja' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.put('/corrections/:id', staffOnly, (req, res) => {
  const db = getDb();
  const { id } = req.params;
  const { status, adminNotes, details } = req.body || {};
  const old = db.prepare('SELECT * FROM data_correction_requests WHERE id = ?').get(id) as any;
  if (!old) return res.status(404).json({ success: false, message: 'Pengajuan koreksi tidak ditemukan' });
  try {
    db.prepare('UPDATE data_correction_requests SET status = ?, admin_notes = ?, details = ? WHERE id = ?')
      .run(status ?? old.status, adminNotes ?? old.admin_notes ?? '', details ?? old.details, id);
    res.json({ success: true, message: 'Status pengajuan berhasil diperbarui' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Perbarui status/catatan ISIAN pengajuan koreksi (detail dapat ikut diubah admin)
apiRouter.delete('/corrections/:id', staffOnly, handleDelete('data_correction_requests', 'Pengajuan Koreksi Data', 'Portal Jemaat', 'member_name'));

// 14. Dashboard Statistics
apiRouter.get('/stats', staffOnly, (req, res) => {
  const db = getDb();

  const membersRows = db.prepare(`
    SELECT m.*, r.name as rayon_name, c.name as categorial_group_name
    FROM members m
    LEFT JOIN rayons r ON m.rayon_id = r.id
    LEFT JOIN categorial_groups c ON m.categorial_group_id = c.id
  `).all() as any[];

  const members: Member[] = membersRows.map(r => ({
    id: r.id,
    memberNo: r.member_no,
    fullName: r.full_name,
    nickname: r.nickname || '',
    nik: r.nik || '',
    familyCardNo: r.family_card_no || '',
    familyId: r.family_id || '',
    familyRole: r.family_role,
    gender: r.gender,
    birthPlace: r.birth_place || '',
    birthDate: r.birth_date,
    address: r.address,
    kelurahan: r.kelurahan || '',
    kecamatan: r.kecamatan || '',
    kabupaten: r.kabupaten || '',
    phone: r.phone || '',
    email: r.email || '',
    maritalStatus: r.marital_status,
    spouseName: r.spouse_name || '',
    rayonId: r.rayon_id,
    rayonName: r.rayon_name || '',
    categorialGroupId: r.categorial_group_id,
    categorialGroupName: r.categorial_group_name || '',
    membershipStatus: r.membership_status,
    baptismStatus: r.baptism_status,
    confirmationStatus: r.confirmation_status,
    marriageChurchStatus: r.marriage_church_status,
    education: r.education || '',
    occupation: r.occupation || '',
    joinDate: r.join_date,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  const familiesRows = db.prepare('SELECT * FROM families').all() as any[];
  const families: Family[] = familiesRows.map(f => ({
    id: f.id,
    familyNo: f.family_no,
    headOfFamilyName: f.head_of_family_name,
    address: f.address,
    rayonId: f.rayon_id,
    phone: f.phone || '',
    memberCount: 0,
    createdAt: f.created_at,
  }));

  const txRows = db.prepare('SELECT * FROM financial_transactions').all() as any[];
  const transactions: FinancialTransaction[] = txRows.map(t => ({
    id: t.id,
    txNo: t.tx_no,
    txDate: t.tx_date,
    type: t.type,
    category: t.category,
    amount: t.amount,
    description: t.description,
    recordedBy: t.recorded_by,
  }));

  const stats = calculateChurchStats(members, families, transactions);
  const birthdayMembers = getUpcomingBirthdays(members);

  // Upcoming events
  const upcomingEvents = db.prepare('SELECT * FROM events WHERE status = \'Terjadwal\' ORDER BY start_time ASC LIMIT 5').all();
  const nextService = db.prepare('SELECT * FROM service_schedules ORDER BY id DESC LIMIT 1').get();

  res.json({
    success: true,
    stats: {
      ...stats,
      upcomingEvents,
      nextService,
      birthdayMembers,
    },
  });
});

// 14b. Birthday Members List
apiRouter.get('/members/birthdays', staffOnly, (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT m.*, r.name as rayon_name, c.name as categorial_group_name
    FROM members m
    LEFT JOIN rayons r ON m.rayon_id = r.id
    LEFT JOIN categorial_groups c ON m.categorial_group_id = c.id
    WHERE m.status = 'Aktif'
  `).all() as any[];

  const members: Member[] = rows.map((r) => ({
    id: r.id,
    memberNo: r.member_no,
    fullName: r.full_name,
    nickname: r.nickname || '',
    nik: r.nik || '',
    familyCardNo: r.family_card_no || '',
    familyId: r.family_id || '',
    familyRole: r.family_role,
    gender: r.gender,
    birthPlace: r.birth_place || '',
    birthDate: r.birth_date,
    address: r.address || '',
    kelurahan: r.kelurahan || '',
    kecamatan: r.kecamatan || '',
    kabupaten: r.kabupaten || '',
    phone: r.phone || '',
    email: r.email || '',
    maritalStatus: r.marital_status,
    spouseName: r.spouse_name || '',
    rayonId: r.rayon_id,
    rayonName: r.rayon_name || '',
    categorialGroupId: r.categorial_group_id,
    categorialGroupName: r.categorial_group_name || '',
    membershipStatus: r.membership_status,
    baptismStatus: r.baptism_status,
    confirmationStatus: r.confirmation_status,
    marriageChurchStatus: r.marriage_church_status,
    education: r.education || '',
    occupation: r.occupation || '',
    joinDate: r.join_date,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));

  const birthdays = getUpcomingBirthdays(members);
  res.json({ success: true, birthdays });
});

// 15. Audit Logs
apiRouter.get('/audit-logs', requireRole('Super Admin', 'Admin Gereja', 'Ketua Majelis/Pendeta'), (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50').all() as any[];
  res.json({
    success: true,
    logs: rows.map((r) => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      action: r.action,
      module: r.module,
      details: r.details,
      timestamp: r.timestamp,
    })),
  });
});

// 16. Import Batch
apiRouter.post('/import/members', adminOnly, (req, res) => {
  const db = getDb();
  const { members } = req.body;

  if (!Array.isArray(members) || members.length === 0) {
    return res.status(400).json({ success: false, message: 'Tidak ada data jemaat yang diimpor' });
  }

  let successCount = 0;
  const errors: string[] = [];
  const now = new Date().toISOString().substring(0, 10);

  const insertMember = db.prepare(`
    INSERT INTO members (
      id, member_no, full_name, nickname, nik, family_card_no, family_id, family_role, gender,
      birth_place, birth_date, address, kelurahan, kecamatan, kabupaten, phone, email,
      marital_status, spouse_name, rayon_id, categorial_group_id, membership_status,
      baptism_status, baptism_date, confirmation_status, confirmation_date,
      marriage_church_status, marriage_date, education, occupation, join_date, status,
      notes, photo_url, created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, NULL, ?, ?
    )
  `);

  for (let i = 0; i < members.length; i++) {
    const item = members[i];
    try {
      const v = validateMemberInput(item);
      if (!v.valid) {
        errors.push(`Baris ${i + 1} (${item.fullName || 'Tanpa Nama'}): ${v.errors.join(', ')}`);
        continue;
      }

      const id = 'm-imp-' + Date.now() + '-' + i;
      const count = (db.prepare('SELECT count(*) as count FROM members').get() as { count: number }).count;
      const memberNo = item.memberNo || generateMemberNo(count + 1);

      insertMember.run(
        id, memberNo, item.fullName, item.nickname || '', item.nik || '', item.familyCardNo || '',
        item.familyId || '', item.familyRole || 'Anggota', item.gender, item.birthPlace || '',
        item.birthDate, item.address || 'Fuimelang', item.kelurahan || 'Fuimelang',
        item.kecamatan || 'Alor Tengah Utara', item.kabupaten || 'Alor', item.phone || '', item.email || '',
        item.maritalStatus || 'Belum Menikah', item.spouseName || '', item.rayonId || 'r1',
        item.categorialGroupId || 'c1', item.membershipStatus || 'Tetap',
        item.baptismStatus || 'Belum', item.baptismDate || '', item.confirmationStatus || 'Belum',
        item.confirmationDate || '', item.marriageChurchStatus || 'Belum', item.marriageDate || '',
        item.education || '', item.occupation || '', item.joinDate || now, item.status || 'Aktif',
        item.notes || 'Diimpor via Excel/CSV', now, now
      );

      successCount++;
    } catch (err: any) {
      errors.push(`Baris ${i + 1} gagal: ${err.message}`);
    }
  }

  addAuditLog(req.user?.id || 'admin', req.user?.name || 'Admin', 'Impor Data Jemaat', 'Impor & Ekspor', `Berhasil mengimpor ${successCount} data jemaat. Gagal: ${errors.length}`);

  res.json({
    success: true,
    imported: successCount,
    failed: errors.length,
    errors,
  });
});

// 17. Backup Database (Snapshot) — khusus Super Admin & Admin Gereja
apiRouter.get('/backup', adminOnly, (req, res) => {
  const db = getDb();
  const tables = [
    'users', 'rayons', 'categorial_groups', 'families', 'members',
    'church_staff', 'baptisms', 'confirmations', 'marriages', 'member_mutations',
    'events', 'service_schedules', 'attendance_records', 'financial_transactions',
    'documents', 'announcements', 'data_correction_requests', 'audit_logs'
  ];

  const backupData: Record<string, any[]> = {};
  for (const t of tables) {
    backupData[t] = db.prepare(`SELECT * FROM ${t}`).all() as any[];
  }
  // Jangan pernah menyertakan hash kata sandi pada berkas cadangan.
  backupData.users = (backupData.users || []).map(({ password_hash: _ignored, ...safeUser }: any) => safeUser);

  addAuditLog(req.user!.id, req.user!.name, 'Pencadangan Database', 'Backup & Restore', `Mengunduh berkas cadangan database SYSJEGER GMIT Betel Fuimelang`);

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename=sysjeger_backup_gmit_betel_${new Date().toISOString().substring(0, 10)}.json`);
  res.json({
    version: '2.0',
    church: 'GMIT BETEL FUIMELANG',
    backupTime: new Date().toISOString(),
    tables: backupData,
  });
});

// 18. Empty Database Tables (Super Admin Only — peran diverifikasi dari token sesi)
apiRouter.post('/database/empty', requireRole('Super Admin'), (req, res) => {
  const { keepAdmin = true } = req.body || {};
  try {
    emptyAllDatabaseTables(keepAdmin);
    addAuditLog(req.user!.id, req.user!.name, 'Kosongkan Database', 'Pemeliharaan', 'Super Admin telah mengosongkan seluruh data jemaat, keluarga, dan transaksi.');
    res.json({
      success: true,
      message: 'Seluruh data jemaat, keluarga, sakramen, kegiatan, dan keuangan telah berhasil dikosongkan dari database oleh Super Admin.',
    });
  } catch (err: any) {
    console.error('Failed to empty database:', err);
    res.status(500).json({ success: false, message: 'Gagal mengosongkan database: ' + err.message });
  }
});

// 19. Reset Database to Initial Seed (Super Admin Only — peran diverifikasi dari token sesi)
apiRouter.post('/database/reset-seed', requireRole('Super Admin'), (req, res) => {
  try {
    resetToSeedData();
    addAuditLog(req.user!.id, req.user!.name, 'Reset Data Awal', 'Pemeliharaan', 'Super Admin mereset database ke keadaan bersih (hanya akun awal Super Admin).');
    res.json({
      success: true,
      message: 'Database berhasil di-reset ke keadaan bersih oleh Super Admin. Seluruh data terhapus; silakan masuk kembali dengan akun awal Super Admin.',
    });
  } catch (err: any) {
    console.error('Failed to reset seed data:', err);
    res.status(500).json({ success: false, message: 'Gagal mereset data: ' + err.message });
  }
});

