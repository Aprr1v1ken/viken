import type { Member, Family, FinancialTransaction } from '../types/index.ts';

/**
 * Calculates current age in years given a YYYY-MM-DD birth date string
 */
export function calculateAge(birthDate: string, referenceDateStr?: string): number {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return 0;
  
  const ref = referenceDateStr ? new Date(referenceDateStr) : new Date();
  let age = ref.getFullYear() - birth.getFullYear();
  const m = ref.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && ref.getDate() < birth.getDate())) {
    age--;
  }
  return age < 0 ? 0 : age;
}

/**
 * Categorizes age according to GMIT church ministry conventions:
 * - Anak: 0 - 12 tahun (Pelayanan Anak dan Remaja - PAR)
 * - Remaja: 13 - 17 tahun
 * - Pemuda: 18 - 29 tahun
 * - Dewasa: 30 - 59 tahun
 * - Lansia (Usia Indah): >= 60 tahun
 */
export function getAgeCategory(age: number): 'Anak' | 'Remaja' | 'Pemuda' | 'Dewasa' | 'Lansia' {
  if (age <= 12) return 'Anak';
  if (age <= 17) return 'Remaja';
  if (age <= 29) return 'Pemuda';
  if (age <= 59) return 'Dewasa';
  return 'Lansia';
}

/**
 * Formats integer or number to Indonesian Rupiah representation
 */
export function formatRupiah(amount: number): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formatted = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absVal);

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Formats YYYY-MM-DD to standard DD-MM-YYYY format
 */
export function formatDateDMY(dateStr: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

/**
 * Generates official GMIT Betel Fuimelang member registration number
 */
export function generateMemberNo(sequence: number, year: number = 2026): string {
  const padded = String(sequence).padStart(3, '0');
  return `GMIT-BF-${year}-${padded}`;
}

/**
 * Generates official Family Card / KK number
 */
export function generateFamilyNo(sequence: number): string {
  const padded = String(sequence).padStart(3, '0');
  return `KK-BF-${padded}`;
}

/**
 * Validates member payload ensuring data integrity
 */
export function validateMemberInput(data: Partial<Member>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.push('Nama lengkap wajib diisi minimal 2 karakter');
  }
  if (!data.gender || (data.gender !== 'Laki-laki' && data.gender !== 'Perempuan')) {
    errors.push('Jenis kelamin wajib dipilih (Laki-laki atau Perempuan)');
  }
  if (!data.birthDate) {
    errors.push('Tanggal lahir wajib diisi');
  }
  if (!data.rayonId) {
    errors.push('Rayon pelayanan wajib dipilih');
  }
  if (data.nik !== undefined && data.nik !== null && data.nik.trim().length > 0) {
    const cleanNik = data.nik.trim();
    if (!/^\d{16}$/.test(cleanNik)) {
      errors.push('Nomor Induk Kependudukan (NIK) tidak boleh kurang atau lebih dari 16 angka (harus tepat 16 digit)');
    }
  }
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Format email tidak valid');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Aggregates complete live church statistics from members, families, and finance
 */
export function calculateChurchStats(
  members: Member[],
  families: Family[],
  transactions: FinancialTransaction[] = []
) {
  const activeMembers = members.filter((m) => m.status === 'Aktif');
  const totalSoul = activeMembers.length;
  const totalFamily = families.length;

  let maleCount = 0;
  let femaleCount = 0;
  let baptized = 0;
  let confirmed = 0;
  let marriedInChurch = 0;

  const ageGroups = {
    anak: 0,
    remaja: 0,
    pemuda: 0,
    dewasa: 0,
    lansia: 0,
  };

  const rayonCounts: Record<string, number> = {};
  const categorialCounts: Record<string, number> = {};

  for (const m of activeMembers) {
    if (m.gender === 'Laki-laki') maleCount++;
    else if (m.gender === 'Perempuan') femaleCount++;

    if (m.baptismStatus === 'Sudah') baptized++;
    if (m.confirmationStatus === 'Sudah') confirmed++;
    if (m.marriageChurchStatus === 'Sudah') marriedInChurch++;

    const age = calculateAge(m.birthDate);
    const cat = getAgeCategory(age);
    if (cat === 'Anak') ageGroups.anak++;
    else if (cat === 'Remaja') ageGroups.remaja++;
    else if (cat === 'Pemuda') ageGroups.pemuda++;
    else if (cat === 'Dewasa') ageGroups.dewasa++;
    else if (cat === 'Lansia') ageGroups.lansia++;

    const rName = m.rayonName || 'Rayon Lain';
    rayonCounts[rName] = (rayonCounts[rName] || 0) + 1;

    const cName = m.categorialGroupName || 'Lainnya';
    categorialCounts[cName] = (categorialCounts[cName] || 0) + 1;
  }

  const movedCount = members.filter((m) => m.status === 'Pindah').length;
  const deceasedCount = members.filter((m) => m.status === 'Meninggal').length;

  let totalIncome = 0;
  let totalExpense = 0;

  for (const tx of transactions) {
    if (tx.type === 'Pemasukan') {
      totalIncome += tx.amount;
    } else if (tx.type === 'Pengeluaran') {
      totalExpense += tx.amount;
    }
  }

  const balance = totalIncome - totalExpense;

  return {
    totalSoul,
    totalFamily,
    maleCount,
    femaleCount,
    ageGroups,
    sacraments: {
      baptized,
      confirmed,
      marriedInChurch,
    },
    lifeStatus: {
      active: totalSoul,
      moved: movedCount,
      deceased: deceasedCount,
    },
    rayonCounts,
    categorialCounts,
    finance: {
      totalIncome,
      totalExpense,
      balance,
    },
  };
}

/**
 * Filter members by search text, rayon, categorial group, and membership status
 */
export function filterMembers(
  members: Member[],
  query: string = '',
  rayonId: string = 'all',
  categorialId: string = 'all',
  status: string = 'all'
): Member[] {
  const q = query.trim().toLowerCase();

  return members.filter((m) => {
    if (rayonId !== 'all' && m.rayonId !== rayonId) return false;
    if (categorialId !== 'all' && m.categorialGroupId !== categorialId) return false;
    if (status !== 'all' && m.status !== status) return false;

    if (!q) return true;

    return (
      m.fullName.toLowerCase().includes(q) ||
      m.memberNo.toLowerCase().includes(q) ||
      (m.nickname && m.nickname.toLowerCase().includes(q)) ||
      (m.nik && m.nik.includes(q)) ||
      (m.phone && m.phone.includes(q)) ||
      (m.address && m.address.toLowerCase().includes(q)) ||
      (m.familyName && m.familyName.toLowerCase().includes(q))
    );
  });
}

export interface BirthdayMemberItem {
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

/**
 * Finds all active members whose birthday falls in the current month (or referenced date)
 * Sorted by: Today first, then upcoming days in ascending order, then passed days
 */
export function getUpcomingBirthdays(members: Member[], referenceDateStr?: string): BirthdayMemberItem[] {
  const ref = referenceDateStr ? new Date(referenceDateStr) : new Date();
  const currentMonth = ref.getMonth(); // 0-indexed (9 for October)
  const currentDay = ref.getDate();
  const currentYear = ref.getFullYear();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const list: BirthdayMemberItem[] = [];

  for (const m of members) {
    if (m.status !== 'Aktif' || !m.birthDate) continue;

    let bYear = 0;
    let bMonth = -1;
    let bDay = 0;
    const parts = m.birthDate.split('T')[0].split('-');

    if (parts.length === 3) {
      if (parts[0].length === 4) {
        bYear = parseInt(parts[0], 10);
        bMonth = parseInt(parts[1], 10) - 1;
        bDay = parseInt(parts[2], 10);
      } else if (parts[2].length === 4) {
        bDay = parseInt(parts[0], 10);
        bMonth = parseInt(parts[1], 10) - 1;
        bYear = parseInt(parts[2], 10);
      }
    }

    if (bMonth === currentMonth && bDay > 0) {
      const turningAge = currentYear - bYear;
      const daysUntil = bDay - currentDay;
      const isToday = bDay === currentDay;

      list.push({
        id: m.id,
        fullName: m.fullName,
        nickname: m.nickname,
        phone: m.phone,
        birthDate: m.birthDate,
        dayOfMonth: bDay,
        month: bMonth + 1,
        turningAge: turningAge > 0 ? turningAge : 1,
        isToday,
        daysUntil,
        rayonName: m.rayonName,
        familyRole: m.familyRole,
        formattedDate: `${bDay} ${monthNames[bMonth]}`,
      });
    }
  }

  // Sort: Today first, then upcoming days (0, 1, 2...), then already passed this month
  list.sort((a, b) => {
    if (a.isToday && !b.isToday) return -1;
    if (!a.isToday && b.isToday) return 1;
    if (a.daysUntil >= 0 && b.daysUntil < 0) return -1;
    if (a.daysUntil < 0 && b.daysUntil >= 0) return 1;
    return a.dayOfMonth - b.dayOfMonth;
  });

  return list;
}

/**
 * Generates official pastoral birthday greeting message for WhatsApp
 */
export function generatePastoralBirthdayGreeting(b: BirthdayMemberItem, churchName: string = 'GMIT Betel Fuimelang'): string {
  const greetingName = b.nickname || b.fullName;
  return `Syalom Saudara/i ${greetingName}! 🎂💐\n\nMajelis Jemaat ${churchName} mengucapkan Selamat Ulang Tahun yang ke-${b.turningAge} (${b.formattedDate}).\n\n"TUHAN memberkati engkau dan melindungi engkau; TUHAN menyinari engkau dengan wajah-Nya dan memberi engkau kasih karunia." (Bilangan 6:24-25)\n\nKiranya berkat kesehatan, sukacita, kedamaian, dan penyertaan Kristus senantiasa melimpah dalam kehidupan Saudara dan seluruh keluarga.\n\nSalam Kasih,\nMajelis Jemaat GMIT Betel Fuimelang ✝️🕊️`;
}

export type BirthdayTemplateType = 'berkat_imamat' | 'sukacita_mazmur' | 'rancangan_damai' | 'umur_panjang' | 'hangat_singkat';

export interface BirthdayTemplateOption {
  id: BirthdayTemplateType;
  title: string;
  verse: string;
  description: string;
}

export const BIRTHDAY_TEMPLATES: BirthdayTemplateOption[] = [
  {
    id: 'berkat_imamat',
    title: 'Doa Berkat Imamat',
    verse: 'Bilangan 6:24-26',
    description: 'Doa resmi berkat, perlindungan, dan kasih karunia TUHAN',
  },
  {
    id: 'sukacita_mazmur',
    title: 'Sukacita Mazmur',
    verse: 'Mazmur 118:24',
    description: 'Pujian syukur atas hari anugerah yang telah dijadikan TUHAN',
  },
  {
    id: 'rancangan_damai',
    title: 'Masa Depan Harapan',
    verse: 'Yeremia 29:11',
    description: 'Doa rancangan damai sejahtera dan masa depan penuh harapan',
  },
  {
    id: 'umur_panjang',
    title: 'Hikmat & Umur Panjang',
    verse: 'Amsal 3:1-2',
    description: 'Doa kesehatan tubuh, umur panjang, dan hikmat sorgawi',
  },
  {
    id: 'hangat_singkat',
    title: 'Kasih & Sukacita Kristus',
    verse: 'Filipi 1:3',
    description: 'Ucapan hangat dan penuh sukacita persaudaraan jemaat',
  },
];

export function generateCustomBirthdayTemplate(
  b: BirthdayMemberItem,
  templateId: BirthdayTemplateType = 'berkat_imamat',
  churchName: string = 'GMIT Betel Fuimelang',
  senderTitle: string = 'Majelis Jemaat'
): string {
  const greetingName = b.nickname || b.fullName;

  switch (templateId) {
    case 'sukacita_mazmur':
      return `Syalom Saudara/i ${greetingName}! 🎂🎉\n\n${senderTitle} ${churchName} mengucapkan Selamat Ulang Tahun yang ke-${b.turningAge} (${b.formattedDate}).\n\n"Inilah hari yang dijadikan TUHAN, marilah kita bersorak-sorak dan bersukacita karenanya!" (Mazmur 118:24)\n\nTerpujilah Allah atas anugerah satu tahun pertambahan usia. Kiranya kasih setia Kristus memimpin setiap langkah hidup Saudara dalam damai dan keberhasilan.\n\nSalam Kasih & Doa,\n${senderTitle} ${churchName} ✝️🕊️`;

    case 'rancangan_damai':
      return `Syalom Saudara/i ${greetingName}! 🎂✨\n\n${senderTitle} ${churchName} mengucapkan Selamat Ulang Tahun yang ke-${b.turningAge} (${b.formattedDate}).\n\n"Sebab Aku ini mengetahui rancangan-rancangan apa yang ada pada-Ku mengenai kamu, demikianlah firman TUHAN, yaitu rancangan damai sejahtera dan bukan rancangan kecelakaan, untuk memberikan kepadamu hari depan yang penuh harapan." (Yeremia 29:11)\n\nKiranya tangan TUHAN yang kuat senantiasa menuntun, membuka pintu berkat, dan meneguhkan pengharapan Saudara di usia baru ini.\n\nSalam Damai Kristus,\n${senderTitle} ${churchName} ✝️🕊️`;

    case 'umur_panjang':
      return `Syalom Saudara/i ${greetingName}! 🎂🌿\n\n${senderTitle} ${churchName} mengucapkan Selamat Ulang Tahun yang ke-${b.turningAge} (${b.formattedDate}).\n\n"Hai anakku, janganlah engkau melupakan ajaranku, dan biarlah hatimu memelihara perintahku, karena panjang umur dan lanjut usia serta kesejahteraan akan ditambahkannya kepadamu." (Amsal 3:1-2)\n\nKiranya Allah menganugerahkan tubuh yang sehat, jiwa yang tenang, umur yang panjang, dan hikmat sorgawi dalam menjalani hari-hari hidup Saudara.\n\nSalam Doa Restu,\n${senderTitle} ${churchName} ✝️🕊️`;

    case 'hangat_singkat':
      return `Syalom Saudara/i ${greetingName}! 🎂❤️\n\nSelamat Ulang Tahun yang ke-${b.turningAge}! (${b.formattedDate})\n\n"Aku mengucap syukur kepada Allahku setiap kali aku mengingat kamu." (Filipi 1:3)\n\nKiranya damai sejahtera, kesehatan yang prima, dan berkat Tuhan Yesus senantiasa memenuhi hati serta keluarga Saudara.\n\nSalam Hangat,\n${senderTitle} ${churchName} ✝️🕊️`;

    case 'berkat_imamat':
    default:
      return `Syalom Saudara/i ${greetingName}! 🎂💐\n\n${senderTitle} ${churchName} mengucapkan Selamat Ulang Tahun yang ke-${b.turningAge} (${b.formattedDate}).\n\n"TUHAN memberkati engkau dan melindungi engkau; TUHAN menyinari engkau dengan wajah-Nya dan memberi engkau kasih karunia; TUHAN menghadapkan wajah-Nya kepadamu dan memberi engkau damai sejahtera." (Bilangan 6:24-26)\n\nKiranya berkat kesehatan, sukacita, kedamaian, dan penyertaan Kristus senantiasa melimpah dalam kehidupan Saudara dan seluruh keluarga.\n\nSalam Kasih,\n${senderTitle} ${churchName} ✝️🕊️`;
  }
}

/**
 * Generates direct WhatsApp chat URL with prefilled pastoral message
 */
export function getWhatsAppBirthdayUrl(phone: string, greetingText: string): string {
  if (!phone) return '';
  let clean = phone.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  }
  return `https://wa.me/${clean}?text=${encodeURIComponent(greetingText)}`;
}


