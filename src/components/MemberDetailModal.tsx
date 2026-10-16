import React, { useRef, useState } from 'react';
import { X, Printer, IdCard, Calendar, MapPin, Award, BookOpen, User, Phone, Mail, Palette, Check } from 'lucide-react';
import { calculateAge, formatDateDMY } from '../utils/church-logic.ts';
import type { Member, CardColorThemeId } from '../types/index.ts';

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

interface ThemeDefinition {
  id: CardColorThemeId;
  name: string;
  dotColor: string;
  bgClass: string;
  borderClass: string;
  titleColor: string;
  headerSub: string;
  accentText: string;
  badgeClass: string;
  photoBg: string;
  textColor: string;
  labelColor: string;
  dividerColor: string;
  footerText: string;
  isLight?: boolean;
}

const THEMES: Record<string, ThemeDefinition> = {
  gold: {
    id: 'gold',
    name: 'Midnight Gold',
    dotColor: '#D4AF37',
    bgClass: 'bg-gradient-to-br from-[#0c1630] via-[#101b3b] to-[#070d1e]',
    borderClass: 'border-2 border-amber-400/60 shadow-amber-500/10',
    titleColor: 'text-white',
    headerSub: 'text-amber-400',
    accentText: 'text-amber-300',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    photoBg: 'bg-slate-900 border-amber-400/40',
    textColor: 'text-slate-100',
    labelColor: 'text-slate-400',
    dividerColor: 'border-amber-500/30',
    footerText: 'text-amber-400/80',
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Grace',
    dotColor: '#10B981',
    bgClass: 'bg-gradient-to-br from-[#062c20] via-[#0d3f2f] to-[#041912]',
    borderClass: 'border-2 border-emerald-400/60 shadow-emerald-500/10',
    titleColor: 'text-white',
    headerSub: 'text-emerald-400',
    accentText: 'text-emerald-300',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    photoBg: 'bg-emerald-950/80 border-emerald-400/40',
    textColor: 'text-slate-100',
    labelColor: 'text-emerald-200/70',
    dividerColor: 'border-emerald-500/30',
    footerText: 'text-emerald-400/80',
  },
  sapphire: {
    id: 'sapphire',
    name: 'Sapphire Royal',
    dotColor: '#38BDF8',
    bgClass: 'bg-gradient-to-br from-[#0a1c3f] via-[#112d61] to-[#06122b]',
    borderClass: 'border-2 border-sky-400/60 shadow-sky-500/10',
    titleColor: 'text-white',
    headerSub: 'text-sky-400',
    accentText: 'text-sky-300',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    photoBg: 'bg-slate-900 border-sky-400/40',
    textColor: 'text-slate-100',
    labelColor: 'text-sky-200/70',
    dividerColor: 'border-sky-500/30',
    footerText: 'text-sky-400/80',
  },
  burgundy: {
    id: 'burgundy',
    name: 'Burgundy Crimson',
    dotColor: '#F43F5E',
    bgClass: 'bg-gradient-to-br from-[#330c17] via-[#4a1223] to-[#1f060d]',
    borderClass: 'border-2 border-rose-400/60 shadow-rose-500/10',
    titleColor: 'text-white',
    headerSub: 'text-rose-400',
    accentText: 'text-rose-300',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    photoBg: 'bg-rose-950/80 border-rose-400/40',
    textColor: 'text-slate-100',
    labelColor: 'text-rose-200/70',
    dividerColor: 'border-rose-500/30',
    footerText: 'text-rose-400/80',
  },
  amethyst: {
    id: 'amethyst',
    name: 'Amethyst Regal',
    dotColor: '#C084FC',
    bgClass: 'bg-gradient-to-br from-[#230d36] via-[#351451] to-[#140620]',
    borderClass: 'border-2 border-purple-400/60 shadow-purple-500/10',
    titleColor: 'text-white',
    headerSub: 'text-purple-400',
    accentText: 'text-purple-300',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    photoBg: 'bg-purple-950/80 border-purple-400/40',
    textColor: 'text-slate-100',
    labelColor: 'text-purple-200/70',
    dividerColor: 'border-purple-500/30',
    footerText: 'text-purple-400/80',
  },
  ivory: {
    id: 'ivory',
    name: 'Putih Gading (Cetak Hemat)',
    dotColor: '#D97706',
    bgClass: 'bg-gradient-to-br from-[#fcfbf7] via-[#f7f4ea] to-[#eee8d9]',
    borderClass: 'border-2 border-amber-600/70 shadow-amber-900/10',
    titleColor: 'text-slate-950',
    headerSub: 'text-amber-800',
    accentText: 'text-amber-800',
    badgeClass: 'bg-amber-100 text-amber-950 border-amber-400 font-bold',
    photoBg: 'bg-amber-50 border-amber-600/40',
    textColor: 'text-slate-900',
    labelColor: 'text-slate-600',
    dividerColor: 'border-amber-600/30',
    footerText: 'text-amber-800',
    isLight: true,
  },
};

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [activeThemeId, setActiveThemeId] = useState<CardColorThemeId>('gold');

  if (!isOpen || !member) return null;

  const age = calculateAge(member.birthDate);

  // Auto theme by Rayon resolution
  const getResolvedTheme = (): ThemeDefinition => {
    if (activeThemeId === 'rayon_auto') {
      const rayonStr = (member.rayonName || member.rayonId || '').toLowerCase();
      if (rayonStr.includes('rayon 1') || rayonStr.includes('rayon i -') || rayonStr.includes('betlehem')) {
        return THEMES.gold;
      } else if (rayonStr.includes('rayon 2') || rayonStr.includes('rayon ii') || rayonStr.includes('nazaret')) {
        return THEMES.emerald;
      } else if (rayonStr.includes('rayon 3') || rayonStr.includes('rayon iii') || rayonStr.includes('yerusalem')) {
        return THEMES.sapphire;
      } else if (rayonStr.includes('rayon 4') || rayonStr.includes('rayon iv') || rayonStr.includes('galilea')) {
        return THEMES.burgundy;
      }
      return THEMES.gold;
    }
    return THEMES[activeThemeId] || THEMES.gold;
  };

  const currentTheme = getResolvedTheme();

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#0b1226] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-amber-500/20 bg-[#070b18]">
          <div className="flex items-center gap-2.5">
            <IdCard className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white">
                Profil & Kartu Anggota Jemaat
              </h3>
              <p className="text-xs text-slate-400">
                {member.memberNo} · GMIT Betel Fuimelang
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintCard}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-lg shadow-amber-500/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Kartu ({currentTheme.name})</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Color Variation Palette Selector */}
          <div className="p-3 bg-[#070b18] border border-amber-500/20 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Palette className="w-4 h-4 text-amber-400" />
                <span>Pilih Variasi Warna Kartu Anggota (Siap Cetak):</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Tema Aktif: <strong className="text-amber-400">{currentTheme.name}</strong>
              </span>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {Object.values(THEMES).map((theme) => {
                const isSelected = activeThemeId === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => setActiveThemeId(theme.id)}
                    type="button"
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-300 shadow-md'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: theme.dotColor }}
                    />
                    <span>{theme.name}</span>
                    {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                  </button>
                );
              })}

              {/* Auto Rayon theme option */}
              <button
                type="button"
                onClick={() => setActiveThemeId('rayon_auto')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeThemeId === 'rayon_auto'
                    ? 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-300 shadow-md'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
              >
                <span>🗂️ Sesuai Rayon (I-IV)</span>
                {activeThemeId === 'rayon_auto' && <Check className="w-3 h-3 ml-0.5" />}
              </button>
            </div>
          </div>

          {/* Digital Member Card Visual (Printable ID Card with chosen theme) */}
          <div
            ref={cardRef}
            className={`p-6 rounded-2xl ${currentTheme.bgClass} ${currentTheme.borderClass} shadow-2xl relative overflow-hidden print:m-0 print:shadow-none print:[print-color-adjust:exact] print:[-webkit-print-color-adjust:exact] transition-all duration-300`}
          >
            {/* Watermark Crest */}
            <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none w-48 h-48">
              <img
                src="/src/assets/images/gmit_church_crest_1792129266798.jpg"
                alt="GMIT"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Top Card Bar */}
            <div className={`flex items-center justify-between border-b ${currentTheme.dividerColor} pb-3 mb-4`}>
              <div className="flex items-center gap-3">
                <img
                  src="/src/assets/images/gmit_church_crest_1792129266798.jpg"
                  alt="GMIT Logo"
                  className="w-10 h-10 rounded-full border border-amber-400/60 object-cover shadow-sm shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className={`text-[10px] font-bold tracking-wider ${currentTheme.headerSub} uppercase`}>
                    Gereja Masehi Injili di Timor
                  </div>
                  <div className={`text-sm font-extrabold tracking-wide ${currentTheme.titleColor}`}>
                    GMIT BETEL FUIMELANG
                  </div>
                  <div className={`text-[9px] ${currentTheme.labelColor}`}>
                    Klasis Alor Tengah Utara · Nusa Tenggara Timur
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${currentTheme.badgeClass}`}>
                  KARTU JEMAAT
                </span>
                <div className={`text-[10px] font-mono mt-1 ${currentTheme.labelColor}`}>
                  {member.memberNo}
                </div>
              </div>
            </div>

            {/* Middle Card Details */}
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Photo box */}
              <div
                className={`w-24 h-28 rounded-xl ${currentTheme.photoBg} border-2 overflow-hidden flex flex-col items-center justify-center shrink-0 shadow-inner`}
              >
                {member.photoUrl ? (
                  <img
                    src={member.photoUrl}
                    alt={member.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-2">
                    <User className={`w-8 h-8 mx-auto mb-1 ${currentTheme.isLight ? 'text-slate-500' : 'text-amber-400 opacity-70'}`} />
                    <span className={`text-[9px] font-medium ${currentTheme.labelColor}`}>Foto 3x4</span>
                  </div>
                )}
              </div>

              {/* Data Grid */}
              <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div className="col-span-2">
                  <span className={`text-[10px] block ${currentTheme.labelColor}`}>
                    Nama Anggota Jemaat:
                  </span>
                  <span className={`text-base font-bold tracking-wide ${currentTheme.titleColor}`}>
                    {member.fullName}
                  </span>
                </div>

                <div>
                  <span className={`text-[10px] block ${currentTheme.labelColor}`}>
                    Tempat, Tgl Lahir:
                  </span>
                  <span className={`font-medium ${currentTheme.textColor}`}>
                    {member.birthPlace}, {formatDateDMY(member.birthDate)} ({age} thn)
                  </span>
                </div>

                <div>
                  <span className={`text-[10px] block ${currentTheme.labelColor}`}>
                    Jenis Kelamin:
                  </span>
                  <span className={`font-medium ${currentTheme.textColor}`}>
                    {member.gender}
                  </span>
                </div>

                <div>
                  <span className={`text-[10px] block ${currentTheme.labelColor}`}>
                    Wilayah Pelayanan:
                  </span>
                  <span className={`font-bold ${currentTheme.accentText}`}>
                    {member.rayonName || member.rayonId}
                  </span>
                </div>

                <div>
                  <span className={`text-[10px] block ${currentTheme.labelColor}`}>
                    Kelompok Kategorial:
                  </span>
                  <span className={`font-medium ${currentTheme.textColor}`}>
                    {member.categorialGroupName || member.categorialGroupId}
                  </span>
                </div>

                <div>
                  <span className={`text-[10px] block ${currentTheme.labelColor}`}>
                    Status Sakramen:
                  </span>
                  <span className={`font-medium ${currentTheme.isLight ? 'text-blue-900 font-semibold' : 'text-cyan-300'}`}>
                    Baptis: {member.baptismStatus} · Sidi: {member.confirmationStatus}
                  </span>
                </div>

                <div>
                  <span className={`text-[10px] block ${currentTheme.labelColor}`}>
                    Hubungan Keluarga:
                  </span>
                  <span className={`font-medium ${currentTheme.textColor}`}>
                    {member.familyRole}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className={`mt-4 pt-3 border-t ${currentTheme.dividerColor} flex items-center justify-between text-[10px]`}>
              <div className={currentTheme.labelColor}>
                <span>Alamat: {member.address}, Fuimelang</span>
              </div>
              <div className={`text-right font-mono text-[9px] font-semibold ${currentTheme.footerText}`}>
                TERDAFTAR SEJAK: {formatDateDMY(member.joinDate)}
              </div>
            </div>
          </div>

          {/* Full Detailed Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-300 border-b border-slate-800 pb-1">
                Data Kependudukan & Kontak
              </h4>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">NIK:</span>
                  <span className="font-mono font-semibold text-amber-300">{member.nik || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">No Kartu Keluarga:</span>
                  <span className="font-mono">{member.familyCardNo || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status Nikah:</span>
                  <span>{member.maritalStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nama Pasangan:</span>
                  <span>{member.spouseName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pendidikan:</span>
                  <span>{member.education || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pekerjaan:</span>
                  <span>{member.occupation || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">No. Telepon / WA:</span>
                  <span className="font-mono">{member.phone || '-'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
              <h4 className="font-bold text-amber-300 border-b border-slate-800 pb-1">
                Riwayat Sakramen & Catatan
              </h4>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status Baptis:</span>
                  <span className="font-semibold text-cyan-300">
                    {member.baptismStatus} {member.baptismDate ? `(${formatDateDMY(member.baptismDate)})` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status Sidi:</span>
                  <span className="font-semibold text-amber-300">
                    {member.confirmationStatus} {member.confirmationDate ? `(${formatDateDMY(member.confirmationDate)})` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pernikahan Gereja:</span>
                  <span className="font-semibold text-emerald-300">
                    {member.marriageChurchStatus} {member.marriageDate ? `(${formatDateDMY(member.marriageDate)})` : ''}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status Keanggotaan:</span>
                  <span>{member.membershipStatus} ({member.status})</span>
                </div>
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400 block text-[11px] mb-1">Catatan Khusus:</span>
                  <p className="text-xs text-slate-300 italic bg-slate-950 p-2 rounded border border-slate-800">
                    {member.notes || 'Tidak ada catatan administrasi khusus.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#070b18] text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
