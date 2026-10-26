import React from 'react';
import { Menu, Shield, Globe, LogOut, KeyRound, Lock } from 'lucide-react';
import type { User as UserType } from '../types/index.ts';

interface HeaderProps {
  currentView: string;
  currentUser: UserType | null;
  onOpenMobileSidebar: () => void;
  onOpenPublicSite: () => void;
  onLogout: () => void;
  onOpenLogin: () => void;
  onOpenChangePassword: () => void;
}

const VIEW_TITLES: Record<string, string> = {
  dashboard: 'Dashboard Statistik & Pelayanan',
  members: 'Database Jemaat Betel Fuimelang',
  families: 'Daftar Kartu Keluarga (KK)',
  rayons: 'Wilayah Pelayanan Rayon 1 - 5',
  categorials: 'Kelompok Kategorial GMIT',
  staff: 'Presbiter Majelis Jemaat & Pendeta',
  sacraments: 'Buku Registrasi Sakramen Kudus',
  mutations: 'Buku Mutasi & Peristiwa Gerejawi',
  events: 'Kalender Kegiatan & Ibadah',
  attendance: 'Pencatatan Absensi Kebaktian',
  finance: 'Administrasi Kas Keuangan Gereja',
  announcements: 'Penerbitan Warta Jemaat',
  documents: 'Arsip & Dokumen Digital Gereja',
  reports: 'Pusat Laporan & Format Cetak Resmi A4',
  portal: 'Portal Pelayanan Khusus Warga Jemaat',
  backup: 'Cadangan & Pemulihan Database',
  audit: 'Audit Trail Aktivitas Sistem',
};

export const Header: React.FC<HeaderProps> = ({
  currentView,
  currentUser,
  onOpenMobileSidebar,
  onOpenPublicSite,
  onLogout,
  onOpenLogin,
  onOpenChangePassword,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-[#070b18]/95 backdrop-blur-md border-b border-amber-500/20 text-slate-200">
      {/* Left zone: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-md lg:hidden"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium min-w-0">
          <span className="text-amber-400 font-bold tracking-wide">SYSJEGER</span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-200 font-semibold truncate max-w-[200px] sm:max-w-none">
            {VIEW_TITLES[currentView] || 'Sistem Informasi Gereja'}
          </span>
        </div>
      </div>

      {/* Right zone: akun aktif, web publik, ganti akun, keluar */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#0e162d] border border-amber-500/30 text-amber-300"
          title={currentUser ? `Masuk sebagai ${currentUser.name} (${currentUser.username})` : undefined}
        >
          <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="font-bold text-white whitespace-nowrap">{currentUser?.role || 'Tamu'}</span>
        </div>

        <button
          onClick={onOpenPublicSite}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>Halaman Warta Publik</span>
        </button>

        <button
          onClick={onOpenLogin}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          title="Masuk dengan akun lain"
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          <span>Ganti Akun</span>
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div
            className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white text-xs font-bold border border-amber-300/40 shadow-xs"
            title={currentUser?.name || 'Pengguna'}
          >
            {currentUser?.name?.substring(0, 2).toUpperCase() || 'AD'}
          </div>
          <button
            onClick={onOpenChangePassword}
            className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-md border border-slate-800 transition-colors"
            title="Ganti Kata Sandi"
            aria-label="Ganti Kata Sandi"
          >
            <Lock className="w-4 h-4" />
          </button>
          <button
            onClick={onLogout}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md border border-slate-800 transition-colors"
            title="Keluar / Logout"
            aria-label="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
