import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAge,
  getAgeCategory,
  formatRupiah,
  formatDateDMY,
  generateMemberNo,
  generateFamilyNo,
  validateMemberInput,
  calculateChurchStats,
  filterMembers,
} from './church-logic.ts';
import type { Member, Family, FinancialTransaction } from '../types/index.ts';

test('calculateAge calculates correct age based on date', () => {
  const age = calculateAge('1990-05-10', '2026-10-15');
  assert.equal(age, 36);

  const infant = calculateAge('2025-11-20', '2026-10-15');
  assert.equal(infant, 0);
});

test('getAgeCategory correctly classifies GMIT age ministry brackets', () => {
  assert.equal(getAgeCategory(8), 'Anak');
  assert.equal(getAgeCategory(12), 'Anak');
  assert.equal(getAgeCategory(15), 'Remaja');
  assert.equal(getAgeCategory(24), 'Pemuda');
  assert.equal(getAgeCategory(45), 'Dewasa');
  assert.equal(getAgeCategory(65), 'Lansia');
});

test('formatRupiah correctly formats currency', () => {
  const formatted = formatRupiah(1500000);
  assert.ok(formatted.includes('1.500.000'));
});

test('formatDateDMY formats ISO dates to DD-MM-YYYY', () => {
  assert.equal(formatDateDMY('2026-10-15'), '15-10-2026');
  assert.equal(formatDateDMY(''), '-');
});

test('generateMemberNo and generateFamilyNo pad sequences properly', () => {
  assert.equal(generateMemberNo(1, 2026), 'GMIT-BF-2026-001');
  assert.equal(generateMemberNo(42, 2026), 'GMIT-BF-2026-042');
  assert.equal(generateFamilyNo(5), 'KK-BF-005');
});

test('validateMemberInput checks mandatory fields and exactly 16-digit NIK', () => {
  const invalid = validateMemberInput({});
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.length >= 3);

  // Short NIK (15 digits) should fail
  const invalidShortNik = validateMemberInput({
    fullName: 'Markus Doko',
    gender: 'Laki-laki',
    birthDate: '1985-04-12',
    rayonId: 'rayon-1',
    nik: '530501100578000', // 15 digits
  });
  assert.equal(invalidShortNik.valid, false);
  assert.ok(invalidShortNik.errors.some(e => e.includes('16 angka')));

  // Long NIK (17 digits) should fail
  const invalidLongNik = validateMemberInput({
    fullName: 'Markus Doko',
    gender: 'Laki-laki',
    birthDate: '1985-04-12',
    rayonId: 'rayon-1',
    nik: '53050110057800001', // 17 digits
  });
  assert.equal(invalidLongNik.valid, false);
  assert.ok(invalidLongNik.errors.some(e => e.includes('16 angka')));

  // Valid 16-digit NIK should pass
  const valid = validateMemberInput({
    fullName: 'Markus Doko',
    gender: 'Laki-laki',
    birthDate: '1985-04-12',
    rayonId: 'rayon-1',
    nik: '5305011005780001', // Exactly 16 digits
  });
  assert.equal(valid.valid, true);
  assert.equal(valid.errors.length, 0);
});

test('calculateChurchStats aggregates member and financial metrics accurately', () => {
  const mockMembers: Member[] = [
    {
      id: 'm1',
      memberNo: 'GMIT-BF-2026-001',
      fullName: 'Yohanis Tefa',
      familyRole: 'Kepala Keluarga',
      gender: 'Laki-laki',
      birthPlace: 'Kupang',
      birthDate: '1980-01-01',
      address: 'Jl. Timor Raya No. 12',
      kelurahan: 'Fuimelang',
      kecamatan: 'Alor Tengah Utara',
      kabupaten: 'Alor',
      phone: '081234567890',
      maritalStatus: 'Menikah',
      rayonId: 'r1',
      rayonName: 'Rayon 1 - Betlehem',
      categorialGroupId: 'c4',
      categorialGroupName: 'Kaum Bapak',
      membershipStatus: 'Tetap',
      baptismStatus: 'Sudah',
      confirmationStatus: 'Sudah',
      marriageChurchStatus: 'Sudah',
      joinDate: '2010-01-01',
      status: 'Aktif',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'm2',
      memberNo: 'GMIT-BF-2026-002',
      fullName: 'Maria Tefa-Bello',
      familyRole: 'Istri',
      gender: 'Perempuan',
      birthPlace: 'Kalabahi',
      birthDate: '1983-05-15',
      address: 'Jl. Timor Raya No. 12',
      kelurahan: 'Fuimelang',
      kecamatan: 'Alor Tengah Utara',
      kabupaten: 'Alor',
      phone: '081234567891',
      maritalStatus: 'Menikah',
      rayonId: 'r1',
      rayonName: 'Rayon 1 - Betlehem',
      categorialGroupId: 'c3',
      categorialGroupName: 'Kaum Perempuan',
      membershipStatus: 'Tetap',
      baptismStatus: 'Sudah',
      confirmationStatus: 'Sudah',
      marriageChurchStatus: 'Sudah',
      joinDate: '2010-01-01',
      status: 'Aktif',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'm3',
      memberNo: 'GMIT-BF-2026-003',
      fullName: 'Daniel Tefa',
      familyRole: 'Anak',
      gender: 'Laki-laki',
      birthPlace: 'Kalabahi',
      birthDate: '2015-08-20',
      address: 'Jl. Timor Raya No. 12',
      kelurahan: 'Fuimelang',
      kecamatan: 'Alor Tengah Utara',
      kabupaten: 'Alor',
      phone: '',
      maritalStatus: 'Belum Menikah',
      rayonId: 'r1',
      rayonName: 'Rayon 1 - Betlehem',
      categorialGroupId: 'c1',
      categorialGroupName: 'PAR / Anak',
      membershipStatus: 'Tetap',
      baptismStatus: 'Sudah',
      confirmationStatus: 'Belum',
      marriageChurchStatus: 'Belum',
      joinDate: '2015-08-20',
      status: 'Aktif',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: 'm4',
      memberNo: 'GMIT-BF-2026-004',
      fullName: 'Paulus Lopo',
      familyRole: 'Kepala Keluarga',
      gender: 'Laki-laki',
      birthPlace: 'Kupang',
      birthDate: '1960-03-10',
      address: 'Jl. Mawar No. 4',
      kelurahan: 'Fuimelang',
      kecamatan: 'Alor Tengah Utara',
      kabupaten: 'Alor',
      phone: '081234567899',
      maritalStatus: 'Menikah',
      rayonId: 'r2',
      rayonName: 'Rayon 2 - Nazaret',
      categorialGroupId: 'c5',
      categorialGroupName: 'Lansia',
      membershipStatus: 'Tetap',
      baptismStatus: 'Sudah',
      confirmationStatus: 'Sudah',
      marriageChurchStatus: 'Sudah',
      joinDate: '2005-01-01',
      status: 'Pindah',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ];

  const mockFamilies: Family[] = [
    {
      id: 'f1',
      familyNo: 'KK-BF-001',
      headOfFamilyName: 'Yohanis Tefa',
      address: 'Jl. Timor Raya No. 12',
      rayonId: 'r1',
      phone: '081234567890',
      memberCount: 3,
      createdAt: '2026-01-01',
    },
  ];

  const mockTx: FinancialTransaction[] = [
    {
      id: 'tx1',
      txNo: 'TX-2026-001',
      txDate: '2026-10-11',
      type: 'Pemasukan',
      category: 'Kolekte Ibadah Minggu',
      amount: 4500000,
      description: 'Kolekte Ibadah Minggu Pagi',
      recordedBy: 'Bendahara',
    },
    {
      id: 'tx2',
      txNo: 'TX-2026-002',
      txDate: '2026-10-12',
      type: 'Pengeluaran',
      category: 'Operasional Gereja',
      amount: 1200000,
      description: 'Listrik dan Kebersihan',
      recordedBy: 'Bendahara',
    },
  ];

  const stats = calculateChurchStats(mockMembers, mockFamilies, mockTx);

  assert.equal(stats.totalSoul, 3); // 3 active members
  assert.equal(stats.totalFamily, 1);
  assert.equal(stats.maleCount, 2);
  assert.equal(stats.femaleCount, 1);
  assert.equal(stats.sacraments.baptized, 3);
  assert.equal(stats.sacraments.confirmed, 2);
  assert.equal(stats.lifeStatus.moved, 1);
  assert.equal(stats.finance.totalIncome, 4500000);
  assert.equal(stats.finance.totalExpense, 1200000);
  assert.equal(stats.finance.balance, 3300000);
});

test('filterMembers filters by search keyword and criteria correctly', () => {
  const members: Member[] = [
    {
      id: '1',
      memberNo: 'GMIT-BF-2026-001',
      fullName: 'Yulius Banamtuan',
      familyRole: 'Kepala Keluarga',
      gender: 'Laki-laki',
      birthPlace: 'Kupang',
      birthDate: '1985-02-14',
      address: 'Rayon 1 Fuimelang',
      kelurahan: 'Fuimelang',
      kecamatan: 'Alor Tengah Utara',
      kabupaten: 'Alor',
      phone: '08121212',
      maritalStatus: 'Menikah',
      rayonId: 'r1',
      categorialGroupId: 'c4',
      membershipStatus: 'Tetap',
      baptismStatus: 'Sudah',
      confirmationStatus: 'Sudah',
      marriageChurchStatus: 'Sudah',
      joinDate: '2010-01-01',
      status: 'Aktif',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
    {
      id: '2',
      memberNo: 'GMIT-BF-2026-002',
      fullName: 'Debora Kase',
      familyRole: 'Kepala Keluarga',
      gender: 'Perempuan',
      birthPlace: 'Kalabahi',
      birthDate: '1992-07-21',
      address: 'Rayon 2 Fuimelang',
      kelurahan: 'Fuimelang',
      kecamatan: 'Alor Tengah Utara',
      kabupaten: 'Alor',
      phone: '08131313',
      maritalStatus: 'Belum Menikah',
      rayonId: 'r2',
      categorialGroupId: 'c3',
      membershipStatus: 'Tetap',
      baptismStatus: 'Sudah',
      confirmationStatus: 'Sudah',
      marriageChurchStatus: 'Belum',
      joinDate: '2012-01-01',
      status: 'Aktif',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
    },
  ];

  const res1 = filterMembers(members, 'Yulius');
  assert.equal(res1.length, 1);
  assert.equal(res1[0].fullName, 'Yulius Banamtuan');

  const resRayon = filterMembers(members, '', 'r2');
  assert.equal(resRayon.length, 1);
  assert.equal(resRayon[0].fullName, 'Debora Kase');
});
