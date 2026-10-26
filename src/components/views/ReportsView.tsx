import React from 'react';
import { Printer, FileText, Users, Home, BookOpen, Wallet, Download, CheckSquare } from 'lucide-react';
import type { Member, Family, FinancialTransaction, Rayon } from '../../types/index.ts';

interface ReportsViewProps {
  onOpenPrintReport: (type: 'members' | 'rayons' | 'finance' | 'sacraments' | 'attendance') => void;
  members: Member[];
  families: Family[];
  rayons: Rayon[];
  transactions: FinancialTransaction[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  onOpenPrintReport,
  members,
  families,
  rayons,
  transactions,
}) => {
  const reportCards = [
    {
      id: 'members' as const,
      title: 'Buku Induk Database Jemaat',
      desc: 'Daftar seluruh jemaat terdaftar dengan rincian biodata, usia, status sakramen, dan keluarga.',
      icon: Users,
      badge: `${members.length} Jiwa`,
      color: 'text-amber-400',
    },
    {
      id: 'rayons' as const,
      title: 'Laporan Rekapitulasi per Rayon (1 - 5)',
      desc: 'Laporan statistik jiwa, jumlah Kepala Keluarga (KK), dan penanggung jawab di masing-masing rayon.',
      icon: Home,
      badge: `${rayons.length} Rayon Pelayanan`,
      color: 'text-cyan-400',
    },
    {
      id: 'finance' as const,
      title: 'Laporan Buku Kas Keuangan Gereja',
      desc: 'Rekapitulasi kas masuk (kolekte kebaktian, persembahan syukur, perpuluhan) dan kas keluar operasional.',
      icon: Wallet,
      badge: `${transactions.length} Transaksi`,
      color: 'text-emerald-400',
    },
    {
      id: 'sacraments' as const,
      title: 'Buku Register Sakramen Gerejawi',
      desc: 'Daftar arsip registrasi Baptisan Kudus, Peneguhan Sidi, dan Pernikahan Kudus dengan nomor akta resmi.',
      icon: BookOpen,
      badge: 'Buku Register Resmi',
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 shadow-md">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Printer className="w-5 h-5 text-amber-400" />
          <span>Pusat Laporan & Format Cetak Resmi A4</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Seluruh laporan dilengkapi Kop Resmi Sinode GMIT Klasis Alor Tengah Utara, stempel tanggal WITA, dan lembar tanda tangan Ketua Majelis Jemaat & Sekretaris
        </p>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reportCards.map((rc) => {
          const Icon = rc.icon;
          return (
            <div
              key={rc.id}
              className="p-6 rounded-2xl bg-[#0c1329] border border-amber-500/20 hover:border-amber-400/40 transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 ${rc.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-[11px] font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {rc.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{rc.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {rc.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Format Cetak: Kertas A4 Resmi</span>
                <button
                  onClick={() => onOpenPrintReport(rc.id)}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Buka & Cetak Dokumen</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
