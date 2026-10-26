import React from 'react';
import {
  Users,
  Home,
  BookOpen,
  CheckCircle2,
  Wallet,
  AlertTriangle,
  UserPlus,
  Sparkles,
  Calendar,
  Clock,
  Award,
} from 'lucide-react';
import { formatRupiah } from '../../utils/church-logic.ts';
import { BirthdayTracker } from '../BirthdayTracker.tsx';
import type { BirthdayMemberItem } from '../../utils/church-logic.ts';
import type { User } from '../../types/index.ts';

interface DashboardViewProps {
  stats: any;
  onNavigate: (view: string) => void;
  onOpenAddMember: () => void;
  onOpenAddFamily: () => void;
  onOpenAddFinance: () => void;
  onOpenAddAttendance: () => void;
  currentUser?: User | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  onNavigate,
  onOpenAddMember,
  onOpenAddFamily,
  onOpenAddFinance,
  onOpenAddAttendance,
  currentUser,
}) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 text-xs">
        Memuat data statistik GMIT Betel Fuimelang...
      </div>
    );
  }

  const {
    totalSoul = 0,
    totalFamily = 0,
    maleCount = 0,
    femaleCount = 0,
    ageGroups = { anak: 0, remaja: 0, pemuda: 0, dewasa: 0, lansia: 0 },
    sacraments = { baptized: 0, confirmed: 0, marriedInChurch: 0 },
    lifeStatus = { active: 0, moved: 0, deceased: 0 },
    rayonCounts = {},
    finance = { totalIncome: 0, totalExpense: 0, balance: 0 },
    upcomingEvents = [],
    nextService,
    birthdayMembers = [] as BirthdayMemberItem[],
  } = stats;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#0c142b] via-[#111c3d] to-[#0c142b] border border-amber-500/25 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>SISTEM INFORMASI MANAJEMEN GEREJA (SYSJEGER)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            GMIT Jemaat Betel Fuimelang
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Klasis Alor Tengah Utara · Nusa Tenggara Timur · Zona Waktu Asia / Nusa Tenggara Timur (WITA, UTC+8)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAddMember}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer shadow-sm"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Jemaat Baru</span>
          </button>
          <button
            onClick={onOpenAddFamily}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[#142042] border border-amber-500/30 text-amber-300 hover:bg-[#1b2b5a] transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>+ Kartu Keluarga</span>
          </button>
          <button
            onClick={onOpenAddFinance}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 transition-colors cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>+ Kas Gereja</span>
          </button>
        </div>
      </div>

      {/* 6 Key KPI Statistic Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Jiwa */}
        <div
          onClick={() => onNavigate('members')}
          className="p-4 rounded-xl bg-[#0c1329] border border-amber-500/20 hover:border-amber-400/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase">Total Jiwa</span>
            <Users className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {totalSoul}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
            <span>{maleCount} L</span>
            <span>·</span>
            <span>{femaleCount} P</span>
          </div>
        </div>

        {/* Total KK */}
        <div
          onClick={() => onNavigate('families')}
          className="p-4 rounded-xl bg-[#0c1329] border border-amber-500/20 hover:border-amber-400/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase">Kepala Keluarga</span>
            <Home className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {totalFamily}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            4 Rayon Pelayanan (Rayon I - IV)
          </div>
        </div>

        {/* Baptis */}
        <div
          onClick={() => onNavigate('sacraments')}
          className="p-4 rounded-xl bg-[#0c1329] border border-amber-500/20 hover:border-amber-400/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase">Baptis Kudus</span>
            <BookOpen className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300 tabular-nums">
            {sacraments.baptized}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {totalSoul > 0 ? Math.round((sacraments.baptized / totalSoul) * 100) : 0}% Terbaptis
          </div>
        </div>

        {/* Sidi */}
        <div
          onClick={() => onNavigate('sacraments')}
          className="p-4 rounded-xl bg-[#0c1329] border border-amber-500/20 hover:border-amber-400/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase">Peneguhan Sidi</span>
            <CheckCircle2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-300 tabular-nums">
            {sacraments.confirmed}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {totalSoul > 0 ? Math.round((sacraments.confirmed / totalSoul) * 100) : 0}% Mengaku Iman
          </div>
        </div>

        {/* Saldo Kas */}
        <div
          onClick={() => onNavigate('finance')}
          className="p-4 rounded-xl bg-[#0c1329] border border-amber-500/20 hover:border-amber-400/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase">Saldo Kas</span>
            <Wallet className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-sm xl:text-base font-bold font-mono text-emerald-400 tabular-nums truncate" title={formatRupiah(finance.balance)}>
            {formatRupiah(finance.balance)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 truncate" title={`In: ${formatRupiah(finance.totalIncome)}`}>
            In: {formatRupiah(finance.totalIncome)}
          </div>
        </div>

        {/* Peristiwa Lain */}
        <div
          onClick={() => onNavigate('mutations')}
          className="p-4 rounded-xl bg-[#0c1329] border border-amber-500/20 hover:border-amber-400/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-semibold uppercase">Mutasi & Wafat</span>
            <AlertTriangle className="w-4 h-4 text-yellow-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {lifeStatus.moved + lifeStatus.deceased}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            {lifeStatus.moved} Pindah · {lifeStatus.deceased} Wafat
          </div>
        </div>
      </div>

      {/* BIRTHDAY TRACKER COMPONENT */}
      <BirthdayTracker
        birthdayMembers={birthdayMembers}
        onOpenAddMember={onOpenAddMember}
        totalSoul={totalSoul}
      />

      {/* Main Charts & Demographics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rayon Distribution */}
        <div className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span>Komposisi Jemaat Berdasarkan Rayon</span>
            </h3>
            <button
              onClick={() => onNavigate('rayons')}
              className="text-[11px] font-medium text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              Lihat Detail
            </button>
          </div>

          <div className="space-y-3">
            {Object.entries(rayonCounts).map(([name, count]: [string, any]) => {
              const pct = totalSoul > 0 ? Math.round((count / totalSoul) * 100) : 0;
              return (
                <div key={name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 truncate">{name}</span>
                    <span className="text-amber-300 font-mono font-semibold">
                      {count} jiwa ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Age Ministry Groups (PAR, Pemuda, Dewasa, Lansia) */}
        <div className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Kelompok Usia & Kategorial GMIT</span>
            </h3>
            <button
              onClick={() => onNavigate('categorials')}
              className="text-[11px] font-medium text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              Lihat Kategorial
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">PAR (Anak 0-12 thn)</span>
              <span className="text-lg font-mono font-bold text-cyan-300">
                {ageGroups.anak} Jiwa
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Remaja (13-17 thn)</span>
              <span className="text-lg font-mono font-bold text-blue-300">
                {ageGroups.remaja} Jiwa
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Pemuda (18-29 thn)</span>
              <span className="text-lg font-mono font-bold text-amber-300">
                {ageGroups.pemuda} Jiwa
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Dewasa (30-59 thn)</span>
              <span className="text-lg font-mono font-bold text-emerald-300">
                {ageGroups.dewasa} Jiwa
              </span>
            </div>
            <div className="col-span-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[11px]">Usia Indah / Lansia (≥ 60 thn)</span>
                <span className="text-xs text-amber-400/80">Perhatian Pastoral Khusus</span>
              </div>
              <span className="text-xl font-mono font-bold text-purple-300">
                {ageGroups.lansia} Jiwa
              </span>
            </div>
          </div>
        </div>

        {/* Next Service & Petugas Ibadah Widget */}
        <div className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Petugas Ibadah Minggu Terdekat</span>
            </h3>
            <button
              onClick={() => onNavigate('events')}
              className="text-[11px] font-medium text-amber-400 hover:text-amber-300 cursor-pointer"
            >
              Jadwal Lengkap
            </button>
          </div>

          {nextService ? (
            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="font-bold text-amber-300">{nextService.service_name}</div>
                <div className="text-[11px] text-slate-300 mt-0.5">Tanggal: {nextService.service_date}</div>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-start justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Pengkhotbah:</span>
                  <span className="font-semibold text-white text-right">{nextService.preacher}</span>
                </div>
                <div className="flex items-start justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Liturgos:</span>
                  <span className="font-semibold text-slate-200 text-right">{nextService.liturgist}</span>
                </div>
                <div className="flex items-start justify-between border-b border-slate-800/80 pb-1.5">
                  <span className="text-slate-400">Penatua Tugas:</span>
                  <span className="font-medium text-slate-300 text-right">{nextService.elder_duty}</span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-slate-400">Pemandu Pujian:</span>
                  <span className="font-medium text-slate-300 text-right">{nextService.song_leader}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 text-center py-6">
              Belum ada jadwal ibadah yang disimpan.
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Activities & Notifications strip */}
      <div className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Kegiatan Gereja Mendatang</span>
          </h3>
          <button
            onClick={() => onNavigate('events')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
          >
            Buka Kalender Kegiatan →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingEvents.slice(0, 3).map((ev: any) => (
            <div
              key={ev.id}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-amber-400 font-semibold">{ev.category}</span>
                <span className="text-slate-400">{ev.start_time?.substring(0, 10)}</span>
              </div>
              <div className="text-xs font-bold text-white truncate">{ev.title}</div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>Lokasi:</span>
                <span className="text-slate-300 truncate">{ev.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
