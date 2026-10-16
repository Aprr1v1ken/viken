export type UserRole = 
  | 'Super Admin' 
  | 'Admin Gereja' 
  | 'Ketua Majelis/Pendeta' 
  | 'Majelis/Rayon' 
  | 'Jemaat';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  rayonId?: string;
  memberId?: string;
  phone?: string;
  email?: string;
  status: 'Aktif' | 'Nonaktif';
}

export type Gender = 'Laki-laki' | 'Perempuan';
export type FamilyRole = 'Kepala Keluarga' | 'Istri' | 'Anak' | 'Orang Tua' | 'Famili Lain';
export type MaritalStatus = 'Belum Menikah' | 'Menikah' | 'Duda' | 'Janda';
export type MembershipStatus = 'Tetap' | 'Tamu' | 'Titipan';
export type SacramentStatus = 'Sudah' | 'Belum';
export type LifeStatus = 'Aktif' | 'Pindah' | 'Meninggal';

export interface Member {
  id: string;
  memberNo: string;
  fullName: string;
  nickname?: string;
  nik?: string;
  familyCardNo?: string;
  familyId?: string;
  familyName?: string;
  familyRole: FamilyRole;
  gender: Gender;
  birthPlace: string;
  birthDate: string; // YYYY-MM-DD
  address: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  phone: string;
  email?: string;
  maritalStatus: MaritalStatus;
  spouseName?: string;
  rayonId: string;
  rayonName?: string;
  categorialGroupId: string;
  categorialGroupName?: string;
  membershipStatus: MembershipStatus;
  baptismStatus: SacramentStatus;
  baptismDate?: string;
  confirmationStatus: SacramentStatus; // Sidi
  confirmationDate?: string;
  marriageChurchStatus: SacramentStatus;
  marriageDate?: string;
  education?: string;
  occupation?: string;
  joinDate: string;
  status: LifeStatus;
  notes?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Family {
  id: string;
  familyNo: string;
  headOfFamilyName: string;
  headOfFamilyId?: string;
  address: string;
  rayonId: string;
  rayonName?: string;
  phone: string;
  memberCount: number;
  notes?: string;
  createdAt: string;
}

export interface Rayon {
  id: string;
  code: string;
  name: string;
  leaderName: string;
  leaderPhone: string;
  coverageArea: string;
  familyCount: number;
  memberCount: number;
  notes?: string;
}

export interface CategorialGroup {
  id: string;
  code: string;
  name: string;
  targetAgeDesc: string;
  coordinator: string;
  memberCount: number;
}

export interface ChurchStaff {
  id: string;
  memberId?: string;
  name: string;
  position: 
    | 'Ketua Majelis Jemaat / Pendeta' 
    | 'Pendeta Pelayan' 
    | 'Wakil Ketua Majelis' 
    | 'Sekretaris' 
    | 'Bendahara' 
    | 'Penatua Rayon' 
    | 'Diaken Rayon' 
    | 'Pengajar / Katekis';
  period: string;
  phone: string;
  email?: string;
  status: 'Aktif' | 'Purna Tugas';
}

export interface BaptismRecord {
  id: string;
  registerNo: string;
  memberId: string;
  memberName: string;
  birthDate: string;
  parentNames: string;
  baptismDate: string;
  churchPlace: string;
  ministerName: string;
  certificateNo: string;
  witnesses?: string;
  notes?: string;
}

export interface ConfirmationRecord {
  id: string;
  registerNo: string;
  memberId: string;
  memberName: string;
  confirmationDate: string;
  churchPlace: string;
  ministerName: string;
  certificateNo: string;
  bibleVerse?: string;
  notes?: string;
}

export interface MarriageRecord {
  id: string;
  registerNo: string;
  groomId?: string;
  groomName: string;
  brideId?: string;
  brideName: string;
  blessingDate: string;
  churchPlace: string;
  ministerName: string;
  certificateNo: string;
  witnessNames?: string;
  notes?: string;
}

export interface MutationRecord {
  id: string;
  mutationNo: string;
  memberId: string;
  memberName: string;
  mutationType: 'Pindah Masuk' | 'Pindah Keluar' | 'Pindah Rayon' | 'Meninggal Dunia';
  fromRayonId?: string;
  toRayonId?: string;
  fromChurch?: string;
  toChurch?: string;
  requestDate: string;
  effectiveDate: string;
  reason: string;
  status: 'Diajukan' | 'Disetujui' | 'Ditolak';
  approvedBy?: string;
  notes?: string;
}

export interface ChurchEvent {
  id: string;
  title: string;
  category: 
    | 'Ibadah Minggu' 
    | 'Ibadah Rayon' 
    | 'Ibadah Kategorial' 
    | 'Katekisasi Sidi' 
    | 'Sidang Majelis' 
    | 'Rapat Panitia' 
    | 'Pelayanan Diakonia' 
    | 'Lainnya';
  startTime: string;
  endTime: string;
  location: string;
  picName: string;
  description: string;
  status: 'Terjadwal' | 'Berlangsung' | 'Selesai' | 'Dibatalkan';
}

export interface ServiceSchedule {
  id: string;
  serviceDate: string;
  serviceName: string;
  preacher: string;
  liturgist: string;
  elderDuty: string;
  deaconDuty: string;
  songLeader: string;
  musicians: string;
  multimediaOperator: string;
  usher: string;
  bibleReader: string;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  date: string;
  maleCount: number;
  femaleCount: number;
  childrenCount: number;
  totalCount: number;
  notes?: string;
  recordedBy: string;
}

export interface FinancialTransaction {
  id: string;
  txNo: string;
  txDate: string;
  type: 'Pemasukan' | 'Pengeluaran';
  category: 
    | 'Kolekte Ibadah Minggu' 
    | 'Persembahan Syukur' 
    | 'Persepuluhan' 
    | 'Kolekte Rayon' 
    | 'Dana Pembangunan' 
    | 'Operasional Gereja' 
    | 'Diakonia / Kasih' 
    | 'Gaji & Honorarium' 
    | 'Kegiatan Pelayanan' 
    | 'Lainnya';
  amount: number;
  description: string;
  recordedBy: string;
}

export interface DocumentRecord {
  id: string;
  docNo: string;
  title: string;
  category: 
    | 'Surat Baptis' 
    | 'Surat Sidi' 
    | 'Surat Nikah Gerejawi' 
    | 'Surat Pindah' 
    | 'Kartu Keluarga' 
    | 'Warta Jemaat' 
    | 'SK Majelis' 
    | 'Laporan Keuangan' 
    | 'Lainnya';
  memberId?: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  accessLevel: 'Publik' | 'Majelis' | 'Admin';
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  category: 'Warta Ibadah' | 'Pengumuman Nikah' | 'Berita Sukacita' | 'Berita Dukacita' | 'Keuangan' | 'Umum';
  content: string;
  author: string;
  isImportant?: boolean;
}

export interface DataCorrectionRequest {
  id: string;
  memberId: string;
  memberName: string;
  requestDate: string;
  details: string;
  status: 'Menunggu' | 'Disetujui' | 'Ditolak';
  adminNotes?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
}

export const STANDARD_EDUCATION_OPTIONS = [
  'Tidak / Belum Sekolah',
  'Belum Tamat SD / Sederajat',
  'Tamat SD / Sederajat',
  'SLTP / SMP / MTs / Sederajat',
  'SLTA / SMA / SMK / MA / Sederajat',
  'Diploma I / II (D1 / D2)',
  'Diploma III (D3)',
  'Diploma IV / Strata I (D4 / S1)',
  'Strata II (S2 / Magister)',
  'Strata III (S3 / Doktor)',
] as const;

export type StandardEducation = typeof STANDARD_EDUCATION_OPTIONS[number];

export const STANDARD_OCCUPATION_OPTIONS = [
  'Belum / Tidak Bekerja',
  'Pelajar / Mahasiswa',
  'Mengurus Rumah Tangga',
  'Petani / Pekebun',
  'Nelayan / Perikanan',
  'Pegawai Negeri Sipil (PNS / ASN)',
  'Guru / Tenaga Pendidik',
  'Dosen',
  'Tenaga Medis (Dokter / Perawat / Bidan)',
  'Karyawan Swasta',
  'Karyawan BUMN / BUMD',
  'Wiraswasta / Pedagang',
  'Tukang Batu / Kayu / Bangunan',
  'Pendeta / Rohaniwan',
  'TNI / POLRI',
  'Pensiunan',
  'Lainnya',
] as const;

export type StandardOccupation = typeof STANDARD_OCCUPATION_OPTIONS[number];

export type CardColorThemeId = 
  | 'gold'
  | 'emerald'
  | 'sapphire'
  | 'burgundy'
  | 'amethyst'
  | 'ivory'
  | 'rayon_auto';

export interface CardThemeConfig {
  id: CardColorThemeId;
  name: string;
  bgGradient: string;
  borderColor: string;
  accentText: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  textColor: string;
  subtextColor: string;
  isLight?: boolean;
}

export interface BirthdayMember {
  id: string;
  fullName: string;
  nickname?: string;
  phone?: string;
  birthDate: string;
  dayOfMonth: number;
  month: number;
  turningAge: number;
  isToday: boolean;
  daysUntil: number;
  rayonName?: string;
  familyRole?: string;
  formattedDate: string;
}

