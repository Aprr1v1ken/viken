import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const DB_PATH = path.resolve(process.cwd(), 'sysjeger.sqlite');

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

function seedInitialData(db: DatabaseSync, force: boolean = false) {
  // Check if users already seeded
  if (!force) {
    const userCheck = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
    if (userCheck && userCheck.count > 0) {
      return;
    }
  }


  // 1. Rayons (Tepat 4 Rayon: Rayon I, II, III, IV)
  const rayons = [
    { id: 'r1', code: 'RY-01', name: 'Rayon I', leader_name: 'Pnt. Yulius Banamtuan', leader_phone: '0812-3901-4411', coverage_area: 'Fuimelang Pusat & Pasar Lama', notes: 'Wilayah pelayanan sektor I' },
    { id: 'r2', code: 'RY-02', name: 'Rayon II', leader_name: 'Pnt. Sarah Lopo-Mone', leader_phone: '0813-5322-8877', coverage_area: 'Kompleks SD Betel & Liku', notes: 'Wilayah pelayanan sektor II' },
    { id: 'r3', code: 'RY-03', name: 'Rayon III', leader_name: 'Pnt. Soleman Malaikosa', leader_phone: '0852-3911-0022', coverage_area: 'Fuimelang Atas & Kebun Sirih', notes: 'Wilayah pelayanan sektor III' },
    { id: 'r4', code: 'RY-04', name: 'Rayon IV', leader_name: 'Pnt. Martha Doko-Lobo', leader_phone: '0821-4455-6677', coverage_area: 'Pesisir Pantai, Dermaga & Moru', notes: 'Wilayah pelayanan sektor IV' },
  ];
  const insertRayon = db.prepare('INSERT INTO rayons (id, code, name, leader_name, leader_phone, coverage_area, notes) VALUES (?, ?, ?, ?, ?, ?, ?)');
  for (const r of rayons) {
    insertRayon.run(r.id, r.code, r.name, r.leader_name, r.leader_phone, r.coverage_area, r.notes);
  }

  // 2. Kategorial
  const categorials = [
    { id: 'c1', code: 'PAR', name: 'Pelayanan Anak dan Remaja (PAR)', target_age_desc: '0 - 15 Tahun', coordinator: 'Pnt. Maria Salukh' },
    { id: 'c2', code: 'PEMUDA', name: 'Gerakan Pemuda GMIT (GP GMIT)', target_age_desc: '16 - 30 Tahun', coordinator: 'Sdr. Johanis Lopo' },
    { id: 'c3', code: 'PKP', name: 'Persekutuan Kaum Perempuan GMIT (PKP)', target_age_desc: 'Ibu-ibu Jemaat', coordinator: 'Pnt. Debora Kase-Blegur' },
    { id: 'c4', code: 'PKB', name: 'Persekutuan Kaum Bapak GMIT (PKB)', target_age_desc: 'Bapak-bapak Jemaat', coordinator: 'Pnt. Simon Malaipada' },
    { id: 'c5', code: 'LANSIA', name: 'Persekutuan Usia Indah (Lansia)', target_age_desc: 'Usia 60 Tahun ke atas', coordinator: 'Pnt. Kornelius Tefa' },
  ];
  const insertCat = db.prepare('INSERT INTO categorial_groups (id, code, name, target_age_desc, coordinator) VALUES (?, ?, ?, ?, ?)');
  for (const c of categorials) {
    insertCat.run(c.id, c.code, c.name, c.target_age_desc, c.coordinator);
  }

  // 3. Church Staff / Majelis
  const staff = [
    { id: 'st1', name: 'Pdt. Abraham M. Tefa, S.Th', position: 'Ketua Majelis Jemaat / Pendeta', period: '2024 - 2027', phone: '0851-7309-5482', email: 'pdt.abraham@gmitbetel.id', status: 'Aktif' },
    { id: 'st2', name: 'Pdt. Yohana E. Kolly, S.Th', position: 'Pendeta Pelayan', period: '2024 - 2027', phone: '0813-5311-2233', email: 'pdt.yohana@gmitbetel.id', status: 'Aktif' },
    { id: 'st3', name: 'Pnt. Daniel Malaipada', position: 'Wakil Ketua Majelis', period: '2024 - 2027', phone: '0852-3988-7766', email: 'daniel.malaipada@gmitbetel.id', status: 'Aktif' },
    { id: 'st4', name: 'Dkn. Elisabeth Lopo', position: 'Sekretaris', period: '2024 - 2027', phone: '0812-3877-4455', email: 'elisabeth.lopo@gmitbetel.id', status: 'Aktif' },
    { id: 'st5', name: 'Dkn. Samuel Blegur', position: 'Bendahara', period: '2024 - 2027', phone: '0821-4466-9988', email: 'samuel.blegur@gmitbetel.id', status: 'Aktif' },
    { id: 'st6', name: 'Pnt. Yulius Banamtuan', position: 'Penatua Rayon I', period: '2024 - 2027', phone: '0812-3901-4411', email: 'yulius.b@gmitbetel.id', status: 'Aktif' },
    { id: 'st7', name: 'Pnt. Sarah Lopo-Mone', position: 'Penatua Rayon II', period: '2024 - 2027', phone: '0813-5322-8877', email: 'sarah.l@gmitbetel.id', status: 'Aktif' },
  ];
  const insertStaff = db.prepare('INSERT INTO church_staff (id, member_id, name, position, period, phone, email, status) VALUES (?, NULL, ?, ?, ?, ?, ?, ?)');
  for (const s of staff) {
    insertStaff.run(s.id, s.name, s.position, s.period, s.phone, s.email, s.status);
  }

  // 4. Users (Initial Accounts)
  const users = [
    { id: 'u1', username: 'superadmin', password_hash: 'admin123', name: 'Super Admin SYSJEGER', role: 'Super Admin', rayon_id: null, phone: '0811-0001-0001', email: 'admin@gmitbetel.id' },
    { id: 'u2', username: 'admingereja', password_hash: 'admin123', name: 'Dkn. Elisabeth Lopo (Tata Usaha)', role: 'Admin Gereja', rayon_id: null, phone: '0812-3877-4455', email: 'elisabeth.lopo@gmitbetel.id' },
    { id: 'u3', username: 'pendeta', password_hash: 'pendeta123', name: 'Pdt. Abraham M. Tefa, S.Th (Ketua Majelis)', role: 'Ketua Majelis/Pendeta', rayon_id: null, phone: '0851-7309-5482', email: 'pdt.abraham@gmitbetel.id' },
    { id: 'u4', username: 'majelisrayon1', password_hash: 'rayon123', name: 'Pnt. Yulius Banamtuan (Penatua Rayon I)', role: 'Majelis/Rayon', rayon_id: 'r1', phone: '0812-3901-4411', email: 'yulius.b@gmitbetel.id' },
    { id: 'u5', username: 'jemaat1', password_hash: 'jemaat123', name: 'Yohanis Tefa (Kepala Keluarga)', role: 'Jemaat', rayon_id: 'r1', phone: '0812-3944-1122', email: 'yohanis.tefa@gmail.com' },
  ];
  const insertUser = db.prepare('INSERT INTO users (id, username, password_hash, name, role, rayon_id, member_id, phone, email, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, \'Aktif\', \'2026-01-01 08:00:00\')');
  for (const u of users) {
    insertUser.run(u.id, u.username, u.password_hash, u.name, u.role, u.rayon_id, u.phone, u.email);
  }

  // 5. Families (5 Kepala Keluarga dalam 4 Rayon)
  const families = [
    { id: 'f1', family_no: 'KK-BF-001', head: 'Yohanis Tefa', address: 'Jl. Timor Raya No. 12, Fuimelang', rayon_id: 'r1', phone: '0812-3944-1122', notes: 'Keluarga Bapak Yohanis Tefa' },
    { id: 'f2', family_no: 'KK-BF-002', head: 'Markus Doko', address: 'Kompleks SD Betel RT 03/RW 01', rayon_id: 'r2', phone: '0813-4422-9900', notes: 'Keluarga Bapak Markus Doko' },
    { id: 'f3', family_no: 'KK-BF-003', head: 'Simon Malaipada', address: 'Jl. Fuimelang Atas No. 45', rayon_id: 'r3', phone: '0852-3311-5566', notes: 'Keluarga Bapak Simon Malaipada' },
    { id: 'f4', family_no: 'KK-BF-004', head: 'Soleman Blegur', address: 'Pesisir Dermaga Baru RT 05', rayon_id: 'r4', phone: '0821-4499-1122', notes: 'Keluarga Bapak Soleman Blegur' },
    { id: 'f5', family_no: 'KK-BF-005', head: 'Kornelius Tefa', address: 'Jl. Raya Moru No. 88', rayon_id: 'r4', phone: '0812-3844-0011', notes: 'Keluarga Bapak Kornelius Tefa (Purna Majelis)' },
  ];
  const insertFamily = db.prepare('INSERT INTO families (id, family_no, head_of_family_name, head_of_family_id, address, rayon_id, phone, notes, created_at) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, \'2026-01-01\')');
  for (const f of families) {
    insertFamily.run(f.id, f.family_no, f.head, f.address, f.rayon_id, f.phone, f.notes);
  }

  // 6. Members (15 Anggota Terdaftar, 16 Digit NIK, Pendidikan & Pekerjaan Standar RI, Kecamatan Alor Tengah Utara)
  const members = [
    // Family 1 (Rayon I)
    {
      id: 'm1', member_no: 'GMIT-BF-2026-001', full_name: 'Yohanis Tefa', nickname: 'Anis', nik: '5305011204800001',
      family_card_no: '5305011902080001', family_id: 'f1', family_role: 'Kepala Keluarga', gender: 'Laki-laki',
      birth_place: 'Fuimelang', birth_date: '1980-04-12', address: 'Jl. Timor Raya No. 12', kelurahan: 'Fuimelang', kecamatan: 'Alor Tengah Utara', kabupaten: 'Alor',
      phone: '0812-3944-1122', email: 'yohanis.tefa@gmail.com', marital_status: 'Menikah', spouse_name: 'Maria Tefa-Bello',
      rayon_id: 'r1', categorial_group_id: 'c4', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '1980-08-10', confirmation_status: 'Sudah', confirmation_date: '1998-04-05', marriage_church_status: 'Sudah', marriage_date: '2008-07-15',
      education: 'Diploma IV / Strata I (D4 / S1)', occupation: 'Pegawai Negeri Sipil (PNS / ASN)', join_date: '1998-04-05', status: 'Aktif', notes: 'Anggota PKB aktif Rayon I'
    },
    {
      id: 'm2', member_no: 'GMIT-BF-2026-002', full_name: 'Maria Tefa-Bello', nickname: 'Ria', nik: '5305014508840002',
      family_card_no: '5305011902080001', family_id: 'f1', family_role: 'Istri', gender: 'Perempuan',
      birth_place: 'Kalabahi', birth_date: '1984-10-24', address: 'Jl. Timor Raya No. 12', kelurahan: 'Fuimelang', kecamatan: 'Alor Tengah Utara', kabupaten: 'Alor',
      phone: '0812-3944-1123', email: 'maria.bello@gmail.com', marital_status: 'Menikah', spouse_name: 'Yohanis Tefa',
      rayon_id: 'r1', categorial_group_id: 'c3', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '1984-11-20', confirmation_status: 'Sudah', confirmation_date: '2001-04-08', marriage_church_status: 'Sudah', marriage_date: '2008-07-15',
      education: 'Diploma III (D3)', occupation: 'Tenaga Medis (Dokter / Perawat / Bidan)', join_date: '2008-07-15', status: 'Aktif', notes: 'Pengurus PKP Rayon I'
    },
    {
      id: 'm3', member_no: 'GMIT-BF-2026-003', full_name: 'Daniel Christian Tefa', nickname: 'Dani', nik: '5305011502120003',
      family_card_no: '5305011902080001', family_id: 'f1', family_role: 'Anak', gender: 'Laki-laki',
      birth_place: 'Fuimelang', birth_date: '2012-02-15', address: 'Jl. Timor Raya No. 12', kelurahan: 'Fuimelang', kecamatan: 'Alor Tengah Utara', kabupaten: 'Alor',
      phone: '', email: '', marital_status: 'Belum Menikah', spouse_name: '',
      rayon_id: 'r1', categorial_group_id: 'c1', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '2012-05-20', confirmation_status: 'Belum', confirmation_date: '', marriage_church_status: 'Belum', marriage_date: '',
      education: 'SLTP / SMP / MTs / Sederajat', occupation: 'Pelajar / Mahasiswa', join_date: '2012-05-20', status: 'Aktif', notes: 'Anak Sekolah Minggu PAR'
    },
    {
      id: 'm4', member_no: 'GMIT-BF-2026-004', full_name: 'Grace Naomi Tefa', nickname: 'Grace', nik: '5305015509170004',
      family_card_no: '5305011902080001', family_id: 'f1', family_role: 'Anak', gender: 'Perempuan',
      birth_place: 'Fuimelang', birth_date: '2017-10-18', address: 'Jl. Timor Raya No. 12', kelurahan: 'Fuimelang', kecamatan: 'Alor Tengah Utara', kabupaten: 'Alor',
      phone: '0812-3944-1122', email: '', marital_status: 'Belum Menikah', spouse_name: '',
      rayon_id: 'r1', categorial_group_id: 'c1', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '2017-12-25', confirmation_status: 'Belum', confirmation_date: '', marriage_church_status: 'Belum', marriage_date: '',
      education: 'Belum Tamat SD / Sederajat', occupation: 'Pelajar / Mahasiswa', join_date: '2017-12-25', status: 'Aktif', notes: 'Peserta PAR'
    },
    // Family 2 (Rayon II)
    {
      id: 'm5', member_no: 'GMIT-BF-2026-005', full_name: 'Markus Doko', nickname: 'Markus', nik: '5305011005780001',
      family_card_no: '5305011902080002', family_id: 'f2', family_role: 'Kepala Keluarga', gender: 'Laki-laki',
      birth_place: 'Moru', birth_date: '1978-05-10', address: 'Kompleks SD Betel RT 03/RW 01', kelurahan: 'Fuimelang', kecamatan: 'Alor Tengah Utara', kabupaten: 'Alor',
      phone: '0813-4422-9900', email: 'markus.doko@gmail.com', marital_status: 'Menikah', spouse_name: 'Ruth Doko-Lobo',
      rayon_id: 'r2', categorial_group_id: 'c4', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '1978-08-15', confirmation_status: 'Sudah', confirmation_date: '1995-04-12', marriage_church_status: 'Sudah', marriage_date: '2005-06-20',
      education: 'SLTA / SMA / SMK / MA / Sederajat', occupation: 'Wiraswasta / Pedagang', join_date: '1995-04-12', status: 'Aktif', notes: 'Anggota Majelis Jemaat'
    },
    {
      id: 'm6', member_no: 'GMIT-BF-2026-006', full_name: 'Ruth Doko-Lobo', nickname: 'Ruth', nik: '5305015011810002',
      family_card_no: '5305011902080002', family_id: 'f2', family_role: 'Istri', gender: 'Perempuan',
      birth_place: 'Fuimelang', birth_date: '1981-11-10', address: 'Kompleks SD Betel RT 03/RW 01', kelurahan: 'Fuimelang', kecamatan: 'Alor Tengah Utara', kabupaten: 'Alor',
      phone: '0813-4422-9901', email: 'ruth.doko@gmail.com', marital_status: 'Menikah', spouse_name: 'Markus Doko',
      rayon_id: 'r2', categorial_group_id: 'c3', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '1982-02-14', confirmation_status: 'Sudah', confirmation_date: '1998-04-05', marriage_church_status: 'Sudah', marriage_date: '2005-06-20',
      education: 'Diploma IV / Strata I (D4 / S1)', occupation: 'Pegawai Negeri Sipil (PNS / ASN)', join_date: '2005-06-20', status: 'Aktif', notes: 'Pemandu Pujian / Singer'
    },
    {
      id: 'm7', member_no: 'GMIT-BF-2026-007', full_name: 'Andreas Doko', nickname: 'Andre', nik: '5305012003020003',
      family_card_no: '5305011902080002', family_id: 'f2', family_role: 'Anak', gender: 'Laki-laki',
      birth_place: 'Fuimelang', birth_date: '2002-10-16', address: 'Kompleks SD Betel RT 03/RW 01', kelurahan: 'Fuimelang', kecamatan: 'Alor Tengah Utara', kabupaten: 'Alor',
      phone: '0813-4422-9902', email: 'andreas.doko@gmail.com', marital_status: 'Belum Menikah', spouse_name: '',
      rayon_id: 'r2', categorial_group_id: 'c2', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '2002-06-16', confirmation_status: 'Sudah', confirmation_date: '2020-04-12', marriage_church_status: 'Belum', marriage_date: '',
      education: 'Diploma IV / Strata I (D4 / S1)', occupation: 'Pelajar / Mahasiswa', join_date: '2020-04-12', status: 'Aktif', notes: 'Organis & Operator Sound'
    },
    // Family 3 (Rayon III)
    {
      id: 'm8', member_no: 'GMIT-BF-2026-008', full_name: 'Simon Malaipada', nickname: 'Simon', nik: '5305011202750001',
      family_card_no: '5305011902080003', family_id: 'f3', family_role: 'Kepala Keluarga', gender: 'Laki-laki',
      birth_place: 'Fuimelang', birth_date: '1975-02-12', address: 'Jl. Fuimelang Atas No. 45', kelurahan: 'Fuimelang', kecamatan: 'Alor Tengah Utara', kabupaten: 'Alor',
      phone: '0852-3311-5566', email: 'simon.malaipada@gmail.com', marital_status: 'Menikah', spouse_name: 'Martha Malaipada-Kase',
      rayon_id: 'r3', categorial_group_id: 'c4', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '1975-05-18', confirmation_status: 'Sudah', confirmation_date: '1992-04-19', marriage_church_status: 'Sudah', marriage_date: '2001-09-08',
      education: 'SLTA / SMA / SMK / MA / Sederajat', occupation: 'Petani / Pekebun', join_date: '1992-04-19', status: 'Aktif', notes: 'Koordinator PKB Jemaat'
    },
    {
      id: 'm9', member_no: 'GMIT-BF-2026-009', full_name: 'Martha Malaipada-Kase', nickname: 'Martha', nik: '5305015206770002',
      family_card_no: '5305011902080003', family_id: 'f3', family_role: 'Istri', gender: 'Perempuan',
      birth_place: 'Kalabahi', birth_date: '1977-06-12', address: 'Jl. Fuimelang Atas No. 45', kelurahan: 'Fuimelang', kecamatan: 'Alor Tengah Utara', kabupaten: 'Alor',
      phone: '0852-3311-5567', email: 'martha.kase@gmail.com', marital_status: 'Menikah', spouse_name: 'Simon Malaipada',
      rayon_id: 'r3', categorial_group_id: 'c3', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '1977-09-25', confirmation_status: 'Sudah', confirmation_date: '1994-04-03', marriage_church_status: 'Sudah', marriage_date: '2001-09-08',
      education: 'SLTA / SMA / SMK / MA / Sederajat', occupation: 'Mengurus Rumah Tangga', join_date: '2001-09-08', status: 'Aktif', notes: 'Pengurus Kaum Perempuan'
    },
    // Family 4 (Rayon IV)
    {
      id: 'm10', member_no: 'GMIT-BF-2026-010', full_name: 'Soleman Blegur', nickname: 'Sole', nik: '5305011409820001',
      family_card_no: '5305011902080004', family_id: 'f4', family_role: 'Kepala Keluarga', gender: 'Laki-laki',
      birth_place: 'Fuimelang', birth_date: '1982-09-14', address: 'Pesisir Dermaga Baru RT 05', kelurahan: 'Fuimelang', kecamatan: 'Alor Tengah Utara', kabupaten: 'Alor',
      phone: '0821-4499-1122', email: 'soleman.blegur@gmail.com', marital_status: 'Menikah', spouse_name: 'Debora Blegur-Mone',
      rayon_id: 'r4', categorial_group_id: 'c4', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '1982-12-19', confirmation_status: 'Sudah', confirmation_date: '2000-04-23', marriage_church_status: 'Sudah', marriage_date: '2010-11-20',
      education: 'SLTA / SMA / SMK / MA / Sederajat', occupation: 'Nelayan / Perikanan', join_date: '2000-04-23', status: 'Aktif', notes: 'Diaken Pelayanan'
    },
    {
      id: 'm11', member_no: 'GMIT-BF-2026-011', full_name: 'Debora Blegur-Mone', nickname: 'Debora', nik: '5305014810860002',
      family_card_no: '5305011902080004', family_id: 'f4', family_role: 'Istri', gender: 'Perempuan',
      birth_place: 'Kupang', birth_date: '1986-10-08', address: 'Pesisir Dermaga Baru RT 05', kelurahan: 'Fuimelang', kecamatan: 'Alor Tengah Utara', kabupaten: 'Alor',
      phone: '0821-4499-1123', email: 'debora.mone@gmail.com', marital_status: 'Menikah', spouse_name: 'Soleman Blegur',
      rayon_id: 'r4', categorial_group_id: 'c3', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '1987-01-11', confirmation_status: 'Sudah', confirmation_date: '2004-04-11', marriage_church_status: 'Sudah', marriage_date: '2010-11-20',
      education: 'Diploma III (D3)', occupation: 'Wiraswasta / Pedagang', join_date: '2010-11-20', status: 'Aktif', notes: 'Anggota Paduan Suara'
    },
    // Family 5 (Rayon IV - Lansia)
    {
      id: 'm12', member_no: 'GMIT-BF-2026-012', full_name: 'Kornelius Tefa', nickname: 'Opa Kornel', nik: '5305010101520001',
      family_card_no: '5305011902080005', family_id: 'f5', family_role: 'Kepala Keluarga', gender: 'Laki-laki',
      birth_place: 'Fuimelang', birth_date: '1952-01-01', address: 'Jl. Raya Moru No. 88', kelurahan: 'Fuimelang', kecamatan: 'Alor Tengah Utara', kabupaten: 'Alor',
      phone: '0812-3844-0011', email: '', marital_status: 'Menikah', spouse_name: 'Oma Sarah Tefa-Lobo',
      rayon_id: 'r4', categorial_group_id: 'c5', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '1952-04-13', confirmation_status: 'Sudah', confirmation_date: '1970-03-29', marriage_church_status: 'Sudah', marriage_date: '1976-08-14',
      education: 'SLTA / SMA / SMK / MA / Sederajat', occupation: 'Pensiunan', join_date: '1970-03-29', status: 'Aktif', notes: 'Penasehat Majelis Jemaat'
    },
    {
      id: 'm13', member_no: 'GMIT-BF-2026-013', full_name: 'Sarah Tefa-Lobo', nickname: 'Oma Sarah', nik: '5305014304550002',
      family_card_no: '5305011902080005', family_id: 'f5', family_role: 'Istri', gender: 'Perempuan',
      birth_place: 'Fuimelang', birth_date: '1955-04-03', address: 'Jl. Raya Moru No. 88', kelurahan: 'Fuimelang', kecamatan: 'Alor Tengah Utara', kabupaten: 'Alor',
      phone: '0812-3844-0012', email: '', marital_status: 'Menikah', spouse_name: 'Kornelius Tefa',
      rayon_id: 'r4', categorial_group_id: 'c5', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '1955-07-10', confirmation_status: 'Sudah', confirmation_date: '1972-04-02', marriage_church_status: 'Sudah', marriage_date: '1976-08-14',
      education: 'SLTA / SMA / SMK / MA / Sederajat', occupation: 'Pensiunan', join_date: '1976-08-14', status: 'Aktif', notes: 'Pengurus Lansia Usia Indah'
    },
    // Member Pindah & Meninggal for records
    {
      id: 'm14', member_no: 'GMIT-BF-2026-014', full_name: 'Paulus Salukh', nickname: 'Paul', nik: '5305011807950001',
      family_card_no: '', family_id: '', family_role: 'Kepala Keluarga', gender: 'Laki-laki',
      birth_place: 'Fuimelang', birth_date: '1995-07-18', address: 'Kupang (Pindah Tugas)', kelurahan: 'Oebobo', kecamatan: 'Oebobo', kabupaten: 'Kota Kupang',
      phone: '0812-3322-1144', email: 'paulus.salukh@gmail.com', marital_status: 'Belum Menikah', spouse_name: '',
      rayon_id: 'r1', categorial_group_id: 'c2', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '1995-10-22', confirmation_status: 'Sudah', confirmation_date: '2013-03-31', marriage_church_status: 'Belum', marriage_date: '',
      education: 'Diploma IV / Strata I (D4 / S1)', occupation: 'Pegawai Negeri Sipil (PNS / ASN)', join_date: '2013-03-31', status: 'Pindah', notes: 'Mutasi jemaat ke GMIT Ebenhaezer Kupang'
    },
    {
      id: 'm15', member_no: 'GMIT-BF-2026-015', full_name: 'Alm. Jacob Oematan', nickname: 'Bapa Jacob', nik: '5305010505400001',
      family_card_no: '', family_id: '', family_role: 'Kepala Keluarga', gender: 'Laki-laki',
      birth_place: 'Fuimelang', birth_date: '1940-05-05', address: 'Rayon IV Fuimelang', kelurahan: 'Fuimelang', kecamatan: 'Alor Tengah Utara', kabupaten: 'Alor',
      phone: '', email: '', marital_status: 'Menikah', spouse_name: 'Almh. Martha Oematan',
      rayon_id: 'r4', categorial_group_id: 'c5', membership_status: 'Tetap',
      baptism_status: 'Sudah', baptism_date: '1940-08-11', confirmation_status: 'Sudah', confirmation_date: '1958-04-06', marriage_church_status: 'Sudah', marriage_date: '1965-09-12',
      education: 'Tamat SD / Sederajat', occupation: 'Pensiunan', join_date: '1958-04-06', status: 'Meninggal', notes: 'Meninggal dunia tanggal 14 Januari 2026 dalam damai Tuhan'
    }
  ];

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
      ?, NULL, '2026-01-01', '2026-01-01'
    )
  `);

  for (const m of members) {
    insertMember.run(
      m.id, m.member_no, m.full_name, m.nickname, m.nik, m.family_card_no, m.family_id, m.family_role, m.gender,
      m.birth_place, m.birth_date, m.address, m.kelurahan, m.kecamatan, m.kabupaten, m.phone, m.email,
      m.marital_status, m.spouse_name, m.rayon_id, m.categorial_group_id, m.membership_status,
      m.baptism_status, m.baptism_date, m.confirmation_status, m.confirmation_date,
      m.marriage_church_status, m.marriage_date, m.education, m.occupation, m.join_date, m.status,
      m.notes
    );
  }

  // Update head_of_family_id
  db.prepare("UPDATE families SET head_of_family_id = 'm1' WHERE id = 'f1'").run();
  db.prepare("UPDATE families SET head_of_family_id = 'm5' WHERE id = 'f2'").run();
  db.prepare("UPDATE families SET head_of_family_id = 'm8' WHERE id = 'f3'").run();
  db.prepare("UPDATE families SET head_of_family_id = 'm10' WHERE id = 'f4'").run();
  db.prepare("UPDATE families SET head_of_family_id = 'm12' WHERE id = 'f5'").run();

  // 7. Sacraments
  const insertBaptism = db.prepare(`
    INSERT INTO baptisms (id, register_no, member_id, member_name, birth_date, parent_names, baptism_date, church_place, minister_name, certificate_no, witnesses, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertBaptism.run(
    'bp1', 'REG-BAP-2017-004', 'm4', 'Grace Naomi Tefa', '2017-09-15', 'Yohanis Tefa & Maria Tefa-Bello',
    '2017-12-25', 'Gedung Kebaktian GMIT Betel Fuimelang', 'Pdt. Abraham M. Tefa, S.Th',
    'SB-GMIT-BF/2017/12/045', 'Dkn. Samuel Blegur, Pnt. Sarah Lopo', 'Baptisan Kudus Natal'
  );
  insertBaptism.run(
    'bp2', 'REG-BAP-2012-002', 'm3', 'Daniel Christian Tefa', '2012-02-15', 'Yohanis Tefa & Maria Tefa-Bello',
    '2012-05-20', 'Gedung Kebaktian GMIT Betel Fuimelang', 'Pdt. Abraham M. Tefa, S.Th',
    'SB-GMIT-BF/2012/05/012', 'Pnt. Yulius Banamtuan', 'Baptisan Anak'
  );

  const insertConfirmation = db.prepare(`
    INSERT INTO confirmations (id, register_no, member_id, member_name, confirmation_date, church_place, minister_name, certificate_no, bible_verse, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertConfirmation.run(
    'cf1', 'REG-SD-2020-008', 'm7', 'Andreas Doko', '2020-04-12', 'Gedung Kebaktian GMIT Betel Fuimelang',
    'Pdt. Abraham M. Tefa, S.Th', 'SS-GMIT-BF/2020/04/008', 'Yosua 1:9', 'Peneguhan Sidi Paskah'
  );

  const insertMarriage = db.prepare(`
    INSERT INTO marriages (id, register_no, groom_id, groom_name, bride_id, bride_name, blessing_date, church_place, minister_name, certificate_no, witness_names, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertMarriage.run(
    'mr1', 'REG-NK-2010-003', 'm10', 'Soleman Blegur', 'm11', 'Debora Blegur-Mone',
    '2010-11-20', 'Gedung Kebaktian GMIT Betel Fuimelang', 'Pdt. Abraham M. Tefa, S.Th',
    'SN-GMIT-BF/2010/11/003', 'Pnt. Daniel Malaipada, Dkn. Elisabeth Lopo', 'Pemberkatan Nikah Kudus'
  );

  // 8. Mutations
  const insertMutation = db.prepare(`
    INSERT INTO member_mutations (id, mutation_no, member_id, member_name, mutation_type, from_rayon_id, to_rayon_id, from_church, to_church, request_date, effective_date, reason, status, approved_by, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertMutation.run(
    'mut1', 'MUT-2026-001', 'm14', 'Paulus Salukh', 'Pindah Keluar', 'r1', null,
    'GMIT Betel Fuimelang', 'GMIT Ebenhaezer Oebobo Kupang', '2026-01-10', '2026-02-01',
    'Mutasi Penempatan Kerja PNS di Kantor Gubernur NTT', 'Disetujui', 'Pdt. Abraham M. Tefa, S.Th',
    'Surat Atestasi Pindah telah diterbitkan'
  );

  // 9. Events & Schedules
  const insertEvent = db.prepare(`
    INSERT INTO events (id, title, category, start_time, end_time, location, pic_name, description, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertEvent.run(
    'ev1', 'Kebaktian Minggu Pagi I (Bahasa Indonesia)', 'Ibadah Minggu', '2026-10-18 06:30:00', '2026-10-18 08:00:00',
    'Gedung Kebaktian Utama GMIT Betel', 'Pdt. Abraham M. Tefa, S.Th', 'Ibadah Minggu Minggu XXI Setelah Pentakosta', 'Terjadwal'
  );
  insertEvent.run(
    'ev2', 'Kebaktian Minggu Pagi II & Sekolah Minggu PAR', 'Ibadah Minggu', '2026-10-18 09:00:00', '2026-10-18 10:30:00',
    'Gedung Kebaktian Utama & Gedung Serbaguna PAR', 'Pdt. Yohana E. Kolly, S.Th', 'Ibadah bersama anak dan remaja', 'Terjadwal'
  );
  insertEvent.run(
    'ev3', 'Ibadah Rayon I', 'Ibadah Rayon', '2026-10-21 17:00:00', '2026-10-21 18:30:00',
    'Rumah Keluarga Bpk. Yohanis Tefa', 'Pnt. Yulius Banamtuan', 'Persekutuan doa dan PA Rayon I', 'Terjadwal'
  );

  const insertSchedule = db.prepare(`
    INSERT INTO service_schedules (id, service_date, service_name, preacher, liturgist, elder_duty, deacon_duty, song_leader, musicians, multimedia_operator, usher, bible_reader, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertSchedule.run(
    'sch1', '18-10-2026', 'Kebaktian Minggu Pagi I (06.30 WITA)',
    'Pdt. Abraham M. Tefa, S.Th', 'Pnt. Daniel Malaipada', 'Pnt. Yulius Banamtuan, Pnt. Markus Oematan',
    'Dkn. Elisabeth Lopo, Dkn. Samuel Blegur', 'Ruth Doko-Lobo', 'Andreas Doko (Organis)',
    'Tim Multimedia Pemuda GMIT', 'Dkn. Soleman Blegur & Ibu Maria Tefa', 'Sdri. Rachel Mone',
    'Liturgi GMIT Minggu XXI Stl Pentakosta'
  );
  insertSchedule.run(
    'sch2', '18-10-2026', 'Kebaktian Minggu Pagi II (09.00 WITA)',
    'Pdt. Yohana E. Kolly, S.Th', 'Pnt. Sarah Lopo-Mone', 'Pnt. Soleman Malaikosa, Pnt. Martha Doko',
    'Dkn. Kornelius Tefa, Dkn. Johanis Lopo', 'Debora Blegur-Mone', 'Sdri. Febe Tefa (Piano)',
    'Tim Multimedia Pemuda GMIT', 'Pengurus Pemuda GMIT', 'Sdr. David Banamtuan',
    'Ibadah gabungan bersama Remaja PAR'
  );

  // 10. Attendance Records
  const insertAttendance = db.prepare(`
    INSERT INTO attendance_records (id, event_id, event_title, date, male_count, female_count, children_count, total_count, notes, recorded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertAttendance.run('att1', 'ev1', 'Kebaktian Minggu Pagi I (11 Okt 2026)', '11-10-2026', 115, 142, 28, 285, 'Ibadah berjalan khidmat dan tertib', 'Tata Usaha / Dkn. Elisabeth Lopo');
  insertAttendance.run('att2', 'ev2', 'Kebaktian Minggu Pagi II & PAR (11 Okt 2026)', '11-10-2026', 98, 130, 84, 312, 'Kehadiran PAR meningkat', 'Tata Usaha / Dkn. Elisabeth Lopo');
  insertAttendance.run('att3', 'ev1', 'Kebaktian Minggu Pagi I (04 Okt 2026)', '04-10-2026', 110, 138, 25, 273, 'Ibadah Perjamuan Kudus Triwulan', 'Dkn. Samuel Blegur');

  // 11. Financial Transactions
  const insertTx = db.prepare(`
    INSERT INTO financial_transactions (id, tx_no, tx_date, type, category, amount, description, recorded_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertTx.run('tx1', 'TX-2026-10-001', '11-10-2026', 'Pemasukan', 'Kolekte Ibadah Minggu', 3850000, 'Kolekte Kantong I & II Kebaktian Minggu Pagi I', 'Dkn. Samuel Blegur (Bendahara)');
  insertTx.run('tx2', 'TX-2026-10-002', '11-10-2026', 'Pemasukan', 'Kolekte Ibadah Minggu', 4120000, 'Kolekte Kantong I & II Kebaktian Minggu Pagi II', 'Dkn. Samuel Blegur (Bendahara)');
  insertTx.run('tx3', 'TX-2026-10-003', '11-10-2026', 'Pemasukan', 'Persembahan Syukur', 2500000, 'Persembahan Syukur Keluarga HUT & Kelulusan', 'Dkn. Samuel Blegur (Bendahara)');
  insertTx.run('tx4', 'TX-2026-10-004', '11-10-2026', 'Pemasukan', 'Persepuluhan', 5200000, 'Persepuluhan Anggota Jemaat Bulan Oktober', 'Dkn. Samuel Blegur (Bendahara)');
  insertTx.run('tx5', 'TX-2026-10-005', '12-10-2026', 'Pengeluaran', 'Operasional Gereja', 1450000, 'Pembayaran Tagihan Listrik PLN & Air Bersih Gereja', 'Dkn. Samuel Blegur (Bendahara)');
  insertTx.run('tx6', 'TX-2026-10-006', '12-10-2026', 'Pengeluaran', 'Diakonia / Kasih', 1800000, 'Bantuan Kasih bagi Warga Jemaat Sakit di RS Kalabahi', 'Dkn. Samuel Blegur (Bendahara)');
  insertTx.run('tx7', 'TX-2026-10-007', '13-10-2026', 'Pengeluaran', 'Kegiatan Pelayanan', 950000, 'Pengadaan Buku Pelajaran PAR & Bahan Katekisasi', 'Dkn. Samuel Blegur (Bendahara)');

  // 12. Announcements (Warta Jemaat)
  const insertAnnounce = db.prepare(`
    INSERT INTO announcements (id, title, date, category, content, author, is_important)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertAnnounce.run(
    'an1', 'Jadwal Ibadah Hari Minggu XXI Setelah Pentakosta', '15-10-2026', 'Warta Ibadah',
    'Majelis Jemaat GMIT Betel Fuimelang mengundang seluruh jemaat bersekutu dalam Kebaktian Minggu tgl 18 Oktober 2026. Sesi I pukul 06.30 WITA dilayani Pdt. Abraham M. Tefa, S.Th. Sesi II pukul 09.00 WITA dilayani Pdt. Yohana E. Kolly, S.Th.',
    'Sekretaris Majelis Jemaat', 1
  );
  insertAnnounce.run(
    'an2', 'Pemberitahuan Kelas Katekisasi Calon Anggota Sidi Baru', '14-10-2026', 'Umum',
    'Diberitahukan kepada pemuda-pemudi yang berusia minimal 16 tahun dan berkehendak mengaku iman (Sidi), pendaftaran katekisasi angkatan 2026/2027 telah dibuka di ruang tata usaha gereja.',
    'Pdt. Abraham M. Tefa, S.Th', 1
  );
  insertAnnounce.run(
    'an3', 'Aksi Diakonia dan Kunjungan Kasih Rayon III', '13-10-2026', 'Umum',
    'Rayon III akan mengadakan kunjungan pastoral dan pembagian sembako kasih kepada opa-oma lansia pada hari Sabtu 17 Oktober 2026.',
    'Pnt. Soleman Malaikosa', 0
  );

  // 13. Digital Documents
  const insertDoc = db.prepare(`
    INSERT INTO documents (id, doc_no, title, category, member_id, file_name, file_size, upload_date, access_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertDoc.run('dc1', 'DOC-BF-2026-001', 'Buku Tata Ibadah GMIT Tahun 2026', 'Warta Gereja', null, 'Tata_Ibadah_GMIT_2026.pdf', '2.4 MB', '2026-01-05', 'Publik');
  insertDoc.run('dc2', 'DOC-BF-2026-002', 'Surat Keputusan Susunan Majelis Jemaat 2024-2027', 'SK Majelis', null, 'SK_Majelis_Betel_Fuimelang_2024_2027.pdf', '1.8 MB', '2026-01-10', 'Majelis');
  insertDoc.run('dc3', 'DOC-BF-2026-003', 'Laporan Pertanggungjawaban Keuangan Triwulan III 2026', 'Laporan Keuangan', null, 'LPJ_Keuangan_TW3_2026.pdf', '3.1 MB', '2026-10-05', 'Majelis');
  insertDoc.run('dc4', 'DOC-BF-2026-004', 'Surat Baptis - Grace Naomi Tefa', 'Surat Baptis', 'm4', 'SB_Grace_Naomi_Tefa.pdf', '750 KB', '2026-02-14', 'Admin');

  // 14. Audit Log
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, user_id, user_name, action, module, details, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertAudit.run('aud1', 'u1', 'Super Admin', 'Inisialisasi Sistem', 'Sistem', 'Database SYSJEGER V2.0 GMIT Betel Fuimelang berhasil dimigrasi dan diinisialisasi', '2026-10-15 08:00:00');
  insertAudit.run('aud2', 'u2', 'Dkn. Elisabeth Lopo', 'Pemutakhiran Data', 'Jemaat', 'Verifikasi data anggota jemaat Rayon 1 & 2', '2026-10-15 09:30:00');
}
