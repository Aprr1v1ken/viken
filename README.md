# SYSJEGER V2.0 — GMIT Betel Fuimelang

Situs web dan **Sistem Informasi Manajemen Jemaat & Gereja (SIM-Gereja)** untuk
**Gereja Masehi Injili di Timor (GMIT) Jemaat Betel Fuimelang**, Klasis Alor
Tengah Utara, Kabupaten Alor, Nusa Tenggara Timur.

Satu aplikasi berisi dua bagian:

1. **Situs web publik** — halaman depan gereja untuk semua pengunjung:
   profil & sambutan gembala, statistik jemaat, jadwal ibadah, kegiatan
   terdekat, warta jemaat, dan kontak sekretariat (WhatsApp).
2. **Dashboard SYSJEGER** — sistem administrasi untuk majelis & tata usaha
   (wajib login): data jemaat, kartu keluarga, rayon & kategorial,
   presbiter, sakramen (baptis/sidi/nikah), mutasi, jadwal & petugas ibadah,
   absensi, keuangan kas, dokumen, warta, laporan cetak A4 & kartu anggota,
   portal jemaat, pelacak ulang tahun, impor data, backup, dan log audit.

## Teknologi

| Bagian   | Teknologi                                             |
| -------- | ----------------------------------------------------- |
| Frontend | React 19 + TypeScript + Vite 8 + Tailwind CSS 4      |
| Backend  | Node.js ≥ 22.5 + Express 4 (API REST, token sesi)    |
| Database | SQLite bawaan Node (`node:sqlite`) — `sysjeger.sqlite` |
| Keamanan | Kata sandi ter-hash scrypt, token HMAC-SHA256, RBAC  |

## Menjalankan

Prasyarat: **Node.js versi 22.5 atau lebih baru**.

```bash
npm install
```

### Mode pengembangan

```bash
npm run dev        # http://localhost:3000 (frontend + API dalam satu server)
```

### Mode produksi

```bash
cp .env.example .env   # lalu isi SESSION_SECRET dengan teks acak yang panjang
npm run build
npm start              # http://localhost:3000
```

Perintah lain: `npm test` (tes logika gereja & autentikasi),
`npm run lint` (pemeriksaan tipe TypeScript).

## Akun awal

Database bawaan (`sysjeger.sqlite`) sudah berisi data percontohan jemaat
Betel Fuimelang dan akun-akun berikut. Akun yang sama dapat dipilih cepat
pada jendela login ("Akun Demo").

| Username        | Kata sandi awal | Peran                  |
| --------------- | --------------- | ---------------------- |
| `superadmin`    | `admin123`      | Super Admin            |
| `admingereja`   | `admin123`      | Admin Gereja (TU)      |
| `pendeta`       | `pendeta123`    | Ketua Majelis/Pendeta  |
| `majelisrayon1` | `rayon123`      | Majelis/Rayon I        |
| `jemaat1`       | `jemaat123`     | Jemaat (Portal Jemaat) |

> ⚠️ **Wajib sebelum dipakai resmi:**
> 1. Masuk dengan setiap akun lalu ganti kata sandinya melalui tombol
>    gembok **“Ganti Kata Sandi”** di kanan atas dashboard.
> 2. Atur `SESSION_SECRET` pada berkas `.env`.
> 3. Ganti data percontohan (jemaat, foto, nomor WhatsApp, jadwal ibadah
>    pada `src/components/PublicLanding.tsx`) dengan data gereja yang
>    sebenarnya bila berbeda.

## Keamanan (ringkasan)

- Semua rute API data gereja **wajib login**. Yang publik hanya: login,
  warta (`GET /api/announcements`), kegiatan (`GET /api/events`),
  statistik ringkas tanpa data pribadi (`GET /api/public/stats`), dan
  `GET /api/health`.
- Kata sandi tidak pernah disimpan polos; database lama yang masih
  berisi teks polos otomatis ditingkatkan menjadi hash scrypt saat server
  pertama kali berjalan.
- Unduhan backup database hanya untuk Super Admin & Admin Gereja, dan
  hash kata sandi tidak disertakan dalam berkas backup.
- Pengosongan/reset database hanya untuk Super Admin, diverifikasi dari
  token sesi (bukan lagi dari header yang dapat dipalsukan).
- Hak akses berbasis peran (RBAC): akun **Jemaat** hanya dapat melihat
  data keluarganya sendiri, jadwal petugas, warta, dan mengajukan
  koreksi biodata — tidak dapat membaca keuangan, daftar seluruh
  jemaat, atau mengubah data apa pun. Menu Backup khusus Super Admin &
  Admin Gereja; menu Log Aktivitas juga terbuka bagi Ketua Majelis.
- Sesi berlaku 12 jam; bila kedaluwarsa pengguna diarahkan kembali ke
  halaman login.

## Variabel lingkungan

| Nama               | Bawaan             | Keterangan                                  |
| ------------------ | ------------------ | ------------------------------------------- |
| `PORT`             | `3000`             | Port server produksi                        |
| `SESSION_SECRET`   | *(kunci dev + peringatan)* | Kunci token sesi — wajib diubah di produksi |
| `SYSJEGER_DB_PATH` | `./sysjeger.sqlite` | Lokasi berkas database SQLite              |
| `FRAME_ANCESTORS`  | *(tidak dibatasi)* | Domain yang boleh menyematkan situs sebagai iframe (kosongkan agar pratinjau semacam Arena Live Preview berfungsi; contoh ketat: `'self'`) |
| `ACCESS_LOG`       | nyala               | Atur `off` untuk mematikan log akses server |

## Struktur proyek

```
index.html              Titik masuk web (judul, meta, font)
public/favicon.svg      Ikon situs
server.ts               Server produksi (Express + berkas statis dist/)
server/
  api.ts                Seluruh rute API REST
  auth.ts               Hash kata sandi, token sesi, middleware RBAC
  db.ts                 Skema SQLite, migrasi, data awal (seed)
src/
  App.tsx               Rangka aplikasi: web publik ⇄ dashboard
  components/           Komponen UI (modal, sidebar, tiap menu di views/)
  components/PublicLanding.tsx   Situs web publik gereja
  services/api.ts       Lapisan pemanggil API + pengelolaan sesi
  types/index.ts        Definisi tipe data gereja
  utils/church-logic.ts Logika bisnis (umur, statistik, validasi, format)
sysjeger.sqlite         Database (berisi data percontohan siap pakai)
```

## Catatan data

- Zona waktu tampilan: **WITA (UTC+8) / Nusa Tenggara Timur**, format tanggal
  `DD-MM-YYYY`, mata uang Rupiah (IDR).
- Backup database secara berkala melalui menu **Impor & Backup Data**
  sebelum melakukan perubahan besar.

---

*Soli Deo Gloria — SYSJEGER V2.0 untuk kemuliaan nama Tuhan dan
keteraturan pelayanan GMIT Betel Fuimelang.*
