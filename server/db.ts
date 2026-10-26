import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { hashPassword, isHashedPassword } from './auth.ts';

// Lokasi berkas database dapat diubah lewat variabel lingkungan,
// misalnya untuk pemisahan data produksi/pengujian.
const DB_PATH = process.env.SYSJEGER_DB_PATH
  ? path.resolve(process.env.SYSJEGER_DB_PATH)
  : path.resolve(process.cwd(), 'sysjeger.sqlite');

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  // Execute database schema creation
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      rayon_id TEXT,
      member_id TEXT,
      phone TEXT,
      email TEXT,
      status TEXT DEFAULT 'Aktif',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rayons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      leader_name TEXT NOT NULL,
      leader_phone TEXT,
      coverage_area TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS categorial_groups (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      target_age_desc TEXT,
      coordinator TEXT
    );

    CREATE TABLE IF NOT EXISTS families (
      id TEXT PRIMARY KEY,
      family_no TEXT UNIQUE NOT NULL,
      head_of_family_name TEXT NOT NULL,
      head_of_family_id TEXT,
      address TEXT NOT NULL,
      rayon_id TEXT NOT NULL,
      phone TEXT,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      member_no TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      nickname TEXT,
      nik TEXT,
      family_card_no TEXT,
      family_id TEXT,
      family_role TEXT NOT NULL,
      gender TEXT NOT NULL,
      birth_place TEXT,
      birth_date TEXT NOT NULL,
      address TEXT NOT NULL,
      kelurahan TEXT,
      kecamatan TEXT,
      kabupaten TEXT,
      phone TEXT,
      email TEXT,
      marital_status TEXT NOT NULL,
      spouse_name TEXT,
      rayon_id TEXT NOT NULL,
      categorial_group_id TEXT NOT NULL,
      membership_status TEXT NOT NULL,
      baptism_status TEXT NOT NULL,
      baptism_date TEXT,
      confirmation_status TEXT NOT NULL,
      confirmation_date TEXT,
      marriage_church_status TEXT NOT NULL,
      marriage_date TEXT,
      education TEXT,
      occupation TEXT,
      join_date TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      photo_url TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS church_staff (
      id TEXT PRIMARY KEY,
      member_id TEXT,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      period TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS baptisms (
      id TEXT PRIMARY KEY,
      register_no TEXT UNIQUE NOT NULL,
      member_id TEXT NOT NULL,
      member_name TEXT NOT NULL,
      birth_date TEXT,
      parent_names TEXT,
      baptism_date TEXT NOT NULL,
      church_place TEXT NOT NULL,
      minister_name TEXT NOT NULL,
      certificate_no TEXT NOT NULL,
      witnesses TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS confirmations (
      id TEXT PRIMARY KEY,
      register_no TEXT UNIQUE NOT NULL,
      member_id TEXT NOT NULL,
      member_name TEXT NOT NULL,
      confirmation_date TEXT NOT NULL,
      church_place TEXT NOT NULL,
      minister_name TEXT NOT NULL,
      certificate_no TEXT NOT NULL,
      bible_verse TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS marriages (
      id TEXT PRIMARY KEY,
      register_no TEXT UNIQUE NOT NULL,
      groom_id TEXT,
      groom_name TEXT NOT NULL,
      bride_id TEXT,
      bride_name TEXT NOT NULL,
      blessing_date TEXT NOT NULL,
      church_place TEXT NOT NULL,
      minister_name TEXT NOT NULL,
      certificate_no TEXT NOT NULL,
      witness_names TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS member_mutations (
      id TEXT PRIMARY KEY,
      mutation_no TEXT UNIQUE NOT NULL,
      member_id TEXT NOT NULL,
      member_name TEXT NOT NULL,
      mutation_type TEXT NOT NULL,
      from_rayon_id TEXT,
      to_rayon_id TEXT,
      from_church TEXT,
      to_church TEXT,
      request_date TEXT NOT NULL,
      effective_date TEXT NOT NULL,
      reason TEXT,
      status TEXT NOT NULL,
      approved_by TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      location TEXT NOT NULL,
      pic_name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS service_schedules (
      id TEXT PRIMARY KEY,
      service_date TEXT NOT NULL,
      service_name TEXT NOT NULL,
      preacher TEXT NOT NULL,
      liturgist TEXT NOT NULL,
      elder_duty TEXT NOT NULL,
      deacon_duty TEXT NOT NULL,
      song_leader TEXT NOT NULL,
      musicians TEXT NOT NULL,
      multimedia_operator TEXT NOT NULL,
      usher TEXT NOT NULL,
      bible_reader TEXT NOT NULL,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      event_id TEXT,
      event_title TEXT NOT NULL,
      date TEXT NOT NULL,
      male_count INTEGER NOT NULL,
      female_count INTEGER NOT NULL,
      children_count INTEGER NOT NULL,
      total_count INTEGER NOT NULL,
      notes TEXT,
      recorded_by TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS financial_transactions (
      id TEXT PRIMARY KEY,
      tx_no TEXT UNIQUE NOT NULL,
      tx_date TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      recorded_by TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      doc_no TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      member_id TEXT,
      file_name TEXT NOT NULL,
      file_size TEXT NOT NULL,
      upload_date TEXT NOT NULL,
      access_level TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      is_important INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS data_correction_requests (
      id TEXT PRIMARY KEY,
      member_id TEXT NOT NULL,
      member_name TEXT NOT NULL,
      request_date TEXT NOT NULL,
      details TEXT NOT NULL,
      status TEXT NOT NULL,
      admin_notes TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      action TEXT NOT NULL,
      module TEXT NOT NULL,
      details TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `);

  seedInitialData(db);
  migrateLegacyPasswords(db);
}

/**
 * Database versi awal menyimpan kata sandi sebagai teks polos.
 * Fungsi ini meningkatkannya menjadi hash scrypt pada saat server pertama
 * kali berjalan, tanpa mengubah kata sandi yang sudah diketahui pengguna.
 */
function migrateLegacyPasswords(db: DatabaseSync) {
  try {
    const rows = db.prepare('SELECT id, password_hash FROM users').all() as Array<{ id: string; password_hash: string }>;
    const update = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?');
    for (const row of rows) {
      if (row.password_hash && !isHashedPassword(row.password_hash)) {
        update.run(hashPassword(row.password_hash), row.id);
      }
    }
  } catch (err) {
    console.error('Migrasi kata sandi gagal:', err);
  }
}

export function emptyAllDatabaseTables(keepAdminUsers: boolean = true) {
  const db = getDb();
  db.exec(`
    DELETE FROM baptisms;
    DELETE FROM confirmations;
    DELETE FROM marriages;
    DELETE FROM member_mutations;
    DELETE FROM data_correction_requests;
    DELETE FROM attendance_records;
    DELETE FROM financial_transactions;
    DELETE FROM documents;
    DELETE FROM announcements;
    DELETE FROM events;
    DELETE FROM service_schedules;
    DELETE FROM members;
    DELETE FROM families;
  `);

  if (!keepAdminUsers) {
    db.exec(`
      DELETE FROM church_staff;
      DELETE FROM users;
      DELETE FROM audit_logs;
      DELETE FROM rayons;
      DELETE FROM categorial_groups;
    `);
  } else {
    // Keep users table so administrators can still log in, but clear member links
    db.exec(`
      UPDATE users SET member_id = NULL;
      UPDATE church_staff SET member_id = NULL;
      INSERT INTO audit_logs (id, user_id, user_name, action, module, details, timestamp)
      VALUES ('aud-empty-' || hex(randomblob(4)), 'admin', 'Admin', 'Kosongkan Database', 'Sistem', 'Seluruh data jemaat, keluarga, sakramen, kas, dan kegiatan telah dikosongkan.', datetime('now', 'localtime'));
    `);
  }
}

export function resetToSeedData() {
  const db = getDb();
  db.exec(`
    DELETE FROM baptisms;
    DELETE FROM confirmations;
    DELETE FROM marriages;
    DELETE FROM member_mutations;
    DELETE FROM data_correction_requests;
    DELETE FROM attendance_records;
    DELETE FROM financial_transactions;
    DELETE FROM documents;
    DELETE FROM announcements;
    DELETE FROM events;
    DELETE FROM service_schedules;
    DELETE FROM members;
    DELETE FROM families;
    DELETE FROM church_staff;
    DELETE FROM users;
    DELETE FROM rayons;
    DELETE FROM categorial_groups;
    DELETE FROM audit_logs;
  `);
  seedInitialData(db, true);
}

/**
 * Keadaan awal database SYSJEGER: BERSIH, tanpa data contoh apa pun.
 *
 * Hanya satu akun awal yang dibuat agar pemilik dapat masuk pertama kali:
 *   username : superadmin
 *   kata sandi: admin123   (WAJIB segera diganti lewat tombol Ganti Kata Sandi)
 *
 * Seluruh data gereja (rayon, kategorial, keluarga, jemaat, majelis,
 * sakramen, jadwal, keuangan, warta, akun pengguna lain, dst.) dimulai
 * dari kosong dan diisi sendiri oleh Super Admin melalui aplikasi.
 */
function seedInitialData(db: DatabaseSync, force: boolean = false) {
  if (!force) {
    const userCheck = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
    if (userCheck && userCheck.count > 0) {
      return;
    }
  }

  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  db.prepare(`INSERT INTO users (id, username, password_hash, name, role, rayon_id, member_id, phone, email, status, created_at)
    VALUES ('u1', 'superadmin', ?, 'Super Admin SYSJEGER', 'Super Admin', NULL, NULL, '', '', 'Aktif', ?)`
  ).run(hashPassword('admin123'), now);
}
