import React from 'react';
import { IMAGES } from '../assets/images.ts';
import {
  LayoutDashboard,
  Users,
  Home,
  MapPin,
  Layers,
  Award,
  BookOpen,
  ArrowRightLeft,
  Calendar,
  CheckSquare,
  Wallet,
  FileText,
  FolderArchive,
  Printer,
  UserCheck,
  Database,
  History,
  LogOut,
  Globe,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import type { User } from '../types/index.ts';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  onOpenPublicSite: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  currentUser,
  onLogout,
  onOpenPublicSite,
  isOpenMobile,
  onCloseMobile,
}) => {
  // Menu disesuaikan dengan hak akses peran yang sedang masuk.
  const role = currentUser?.role;
  const canSeeBackup = role === 'Super Admin' || role === 'Admin Gereja';
  const canSeeAudit = canSeeBackup || role === 'Ketua Majelis/Pendeta';
  const isJemaat = role === 'Jemaat';

  const menuSections = [
    {
      title: 'UTAMA',
      items: [
        { id: 'dashboard', label: 'Dashboard Statistik', icon: LayoutDashboard },
        { id: 'members', label: 'Database Jemaat', icon: Users },
        { id: 'families', label: 'Kartu Keluarga (KK)', icon: Home },
      ],
    },
    {
      title: 'PELAYANAN & STRUKTUR',
      items: [
        { id: 'rayons', label: 'Rayon Pelayanan', icon: MapPin },
        { id: 'categorials', label: 'Kategorial GMIT', icon: Layers },
        { id: 'staff', label: 'Majelis & Pendeta', icon: Award },
        { id: 'sacraments', label: 'Sakramen (Baptis/Sidi/Nikah)', icon: BookOpen },
        { id: 'mutations', label: 'Mutasi & Peristiwa', icon: ArrowRightLeft },
      ],
    },
    {
      title: 'IBADAH & ADMINISTRASI',
      items: [
        { id: 'events', label: 'Jadwal Ibadah & Kegiatan', icon: Calendar },
        { id: 'attendance', label: 'Absensi Kehadiran', icon: CheckSquare },
        { id: 'finance', label: 'Keuangan Kas Gereja', icon: Wallet },
        { id: 'announcements', label: 'Warta Jemaat', icon: FileText },
        { id: 'documents', label: 'Dokumen Digital', icon: FolderArchive },
        { id: 'reports', label: 'Laporan & Cetak A4', icon: Printer },
      ],
    },
    {
      title: 'PORTAL & SISTEM',
      items: [
        { id: 'portal', label: 'Portal Khusus Jemaat', icon: UserCheck },
        { id: 'backup', label: 'Impor & Backup Data', icon: Database },
        { id: 'audit', label: 'Log Aktivitas Sistem', icon: History },
      ],
    },
  ];

  const visibleSections = (isJemaat
    ? [
        {
          title: 'PORTAL & SISTEM',
          items: [{ id: 'portal', label: 'Portal Khusus Jemaat', icon: UserCheck }],
        },
      ]
    : menuSections.map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (item.id === 'backup') return canSeeBackup;
          if (item.id === 'audit') return canSeeAudit;
          return true;
        }),
      }))).filter((section) => section.items.length > 0);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-72 bg-[#090e1d] border-r border-amber-500/20 text-slate-300 transition-transform duration-200 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Lockup */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-amber-500/20 bg-[#060a16]">
          <div className="relative w-11 h-11 shrink-0 rounded-full overflow-hidden border border-amber-400/40 bg-slate-900 shadow-md">
            <img
              src={IMAGES.crest}
              alt="GMIT Betel Fuimelang"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-extrabold tracking-wide text-amber-300 uppercase truncate">
              SYSJEGER V2.0
            </div>
            <div className="text-xs text-slate-400 font-medium truncate">
              GMIT BETEL FUIMELANG
            </div>
            <div className="text-[10px] text-amber-400/70 truncate">
              Klasis Alor Tengah Utara
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {visibleSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 text-[10px] font-bold tracking-wider text-amber-500/80 uppercase">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectView(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-all ${
                        isActive
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold shadow-xs'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Card & Footer */}
        <div className="p-3 border-t border-amber-500/20 bg-[#060a16] space-y-2">
          {currentUser && (
            <div className="p-2.5 rounded-lg bg-[#0e162d] border border-amber-500/20">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                <span className="font-semibold truncate">{currentUser.name}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-amber-400/90 font-mono text-[10px] uppercase">
                  {currentUser.role}
                </span>
                <span className="text-slate-400 text-[10px]">Aktif</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={onOpenPublicSite}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 rounded-md border border-slate-700 transition-colors"
              title="Kunjungi Website Publik GMIT Betel Fuimelang"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Web Publik</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center justify-center p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md border border-slate-800 transition-colors"
              title="Keluar / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
