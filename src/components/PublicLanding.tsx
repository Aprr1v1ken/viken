import React from 'react';
import { IMAGES } from '../assets/images.ts';
import {
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Heart,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { Announcement, ChurchEvent } from '../types/index.ts';
import type { PublicStats } from '../services/api.ts';
import { formatTanggalWaktuID } from '../utils/church-logic.ts';

interface PublicLandingProps {
  onEnterApp: () => void;
  isLoggedIn?: boolean;
  announcements: Announcement[];
  events: ChurchEvent[];
  publicStats?: PublicStats | null;
}

export const PublicLanding: React.FC<PublicLandingProps> = ({
  onEnterApp,
  isLoggedIn = false,
  announcements,
  events,
  publicStats,
}) => {
  // Tampilkan kegiatan terdekat yang akan datang; bila belum ada jadwal baru
  // yang diterbitkan, tampilkan jadwal terakhir sebagai rujukan pola ibadah.
  const sortedEvents = [...events].sort((a, b) => a.startTime.localeCompare(b.startTime));
  const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const upcomingEvents = sortedEvents.filter((e) => e.startTime >= nowIso).slice(0, 4);
  const displayedEvents = upcomingEvents.length > 0 ? upcomingEvents : sortedEvents.slice(-4).reverse();
  const enterLabel = isLoggedIn ? 'Buka Dashboard' : 'Masuk SYSJEGER';

  return (
    <div className="min-h-screen bg-[#060a16] text-slate-100 flex flex-col font-sans">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-40 bg-[#060a16]/95 backdrop-blur-md border-b border-amber-500/20 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={IMAGES.crest}
            alt="Emblem GMIT"
            className="w-10 h-10 rounded-full border border-amber-400/50 object-cover shadow-md"
            referrerPolicy="no-referrer"
          />
          <div>
            <h1 className="text-sm md:text-base font-extrabold tracking-wide text-amber-300 uppercase">
              GMIT BETEL FUIMELANG
            </h1>
            <p className="text-[11px] text-slate-400">
              Klasis Alor Tengah Utara · Nusa Tenggara Timur
            </p>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-5 text-xs font-semibold text-slate-300">
          <a href="#jadwal" className="hover:text-amber-300 transition-colors">Jadwal Ibadah</a>
          <a href="#kegiatan" className="hover:text-amber-300 transition-colors">Kegiatan</a>
          <a href="#warta" className="hover:text-amber-300 transition-colors">Warta Jemaat</a>
          <a href="#kontak" className="hover:text-amber-300 transition-colors">Kontak</a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/6285173095482"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WA Sekretariat</span>
          </a>

          <button
            onClick={onEnterApp}
            className="flex items-center gap-2 px-4 py-2 text-xs md:text-sm font-bold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <span>{enterLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-amber-500/20">
        <div className="absolute inset-0 z-0">
          <img
            src={IMAGES.churchExterior}
            alt="Gedung Kebaktian GMIT Betel Fuimelang"
            className="w-full h-full object-cover opacity-35"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060a16] via-[#060a16]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Soli Deo Gloria — Hanya Bagi Kemuliaan Allah</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
            Gereja Masehi Injili di Timor
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 mt-2">
              Jemaat Betel Fuimelang
            </span>
          </h2>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed mb-8">
            Membangun persekutuan jemaat yang berakar dalam Firman Allah, bertumbuh dalam kasih persaudaraan, dan berbuah dalam pelayanan kasih di tengah masyarakat Alor Barat Daya.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onEnterApp}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 flex items-center gap-2 transition-transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>{isLoggedIn ? 'Buka Dashboard & Portal Jemaat' : 'Akses Portal SYSJEGER & Kartu Jemaat'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#jadwal"
              className="px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-amber-500/30 font-semibold text-sm transition-colors"
            >
              Lihat Jadwal Ibadah Minggu
            </a>
          </div>

          {publicStats && (
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto text-center">
              {[
                { value: publicStats.totalMembers, label: 'Warga Jemaat Aktif' },
                { value: publicStats.totalFamilies, label: 'Kartu Keluarga' },
                { value: publicStats.totalRayons, label: 'Rayon Pelayanan' },
                { value: publicStats.totalStaff, label: 'Majelis & Pelayan' },
              ].map((item) => (
                <div key={item.label} className="px-4 py-4 rounded-2xl bg-[#0c1329]/85 border border-amber-500/20">
                  <div className="text-2xl font-extrabold text-amber-300">{item.value}</div>
                  <div className="text-[11px] text-slate-400 font-medium mt-0.5">{item.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 flex-1">
        {/* Jadwal Ibadah Section */}
        <section id="jadwal" className="space-y-6">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                <Clock className="w-6 h-6 text-amber-400" />
                <span>Jadwal Kebaktian & Ibadah Jemaat</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Waktu Pelayanan berdasarkan Zona WITA (UTC+8) / Asia Nusa Tenggara Timur
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/30">
              Gedung Utama Betel
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#0c1329] border border-amber-500/20 relative overflow-hidden">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                Ibadah Minggu I
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                Kebaktian Minggu Pagi I
              </h4>
              <div className="text-2xl font-mono font-bold text-amber-300 mb-4">
                06.30 WITA
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bahasa Indonesia · Dilayani oleh Pendeta Ketua Majelis Jemaat / Pendeta Pelayan bersama Presbiter bertugas.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0c1329] border border-amber-500/20 relative overflow-hidden">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                Ibadah Minggu II & PAR
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                Kebaktian Minggu Pagi II
              </h4>
              <div className="text-2xl font-mono font-bold text-amber-300 mb-4">
                09.00 WITA
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ibadah Umum Jemaat dirangkaikan dengan Sekolah Minggu Pelayanan Anak & Remaja (PAR) di Gedung Serbaguna.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0c1329] border border-amber-500/20 relative overflow-hidden">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-2">
                Ibadah Rumah Tangga
              </div>
              <h4 className="text-lg font-bold text-white mb-2">
                Persekutuan Doa Rayon 1 - 5
              </h4>
              <div className="text-2xl font-mono font-bold text-amber-300 mb-4">
                Rabu & Kamis 17.00 WITA
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ibadah persekutuan di rumah-rumah warga jemaat bergilir sesuai jadwal masing-masing wilayah pelayanan rayon.
              </p>
            </div>
          </div>
        </section>

        {/* Pastor & Majelis Section */}
        <section id="sambutan" className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center p-8 rounded-3xl bg-[#0c1329]/80 border border-amber-500/20">
          <div className="md:col-span-1 flex flex-col items-center text-center">
            <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-xl mb-4">
              <img
                src={IMAGES.pastor}
                alt="Pdt. Abraham M. Tefa, S.Th"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <h4 className="font-bold text-white text-base">
              Pdt. Abraham M. Tefa, S.Th
            </h4>
            <p className="text-xs text-amber-400 font-medium">
              Ketua Majelis Jemaat GMIT Betel Fuimelang
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Periode Pelayanan 2024 - 2027
            </p>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="inline-block px-3 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              Sambutan Gembala Jemaat
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Selamat Datang di Sistem Informasi GMIT Betel Fuimelang
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              "Kasih karunia dan damai sejahtera dari Allah Bapa kita dan dari Tuhan Yesus Kristus menyertai saudara-saudari sekalian. SYSJEGER V2.0 dihadirkan untuk meningkatkan transparansi tata kelola pelayanan, keteraturan data administrasi jemaat dan keluarga, serta mempermudah komunikasi gerejawi demi kemuliaan nama Tuhan."
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>Desa Fuimelang, Alor Barat Daya, NTT</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>085173095482</span>
              </div>
            </div>
          </div>
        </section>

        {/* Kegiatan & Ibadah Terdekat */}
        <section id="kegiatan" className="space-y-6">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                <Calendar className="w-6 h-6 text-amber-400" />
                <span>Kegiatan & Ibadah Terdekat</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {upcomingEvents.length > 0
                  ? 'Jadwal pelayanan yang akan datang — mari bersekutu bersama'
                  : 'Jadwal pelayanan terakhir yang diterbitkan sekretariat'}
              </p>
            </div>
          </div>

          {displayedEvents.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#0c1329] border border-amber-500/20 text-xs text-slate-400 text-center">
              Jadwal kegiatan belum diterbitkan. Silakan hubungi Sekretariat Majelis Jemaat.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedEvents.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 space-y-2.5 hover:border-amber-400/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      {item.category}
                    </span>
                    <span className="text-slate-400">{item.status}</span>
                  </div>
                  <h4 className="text-base font-bold text-white">{item.title}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-amber-200">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{formatTanggalWaktuID(item.startTime)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{item.location}</span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{item.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Warta Jemaat Terkini */}
        <section id="warta" className="space-y-6">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
                <BookOpen className="w-6 h-6 text-amber-400" />
                <span>Warta & Pengumuman Jemaat</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Informasi resmi pelayanan dan kegiatan sepekan GMIT Betel Fuimelang
              </p>
            </div>
          </div>

          {announcements.length === 0 && (
            <div className="p-6 rounded-2xl bg-[#0c1329] border border-amber-500/20 text-xs text-slate-400 text-center">
              Warta jemaat pekan ini belum diterbitkan.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {announcements.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 space-y-2.5 hover:border-amber-400/40 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {item.category}
                  </span>
                  <span className="text-slate-400">{item.date}</span>
                </div>
                <h4 className="text-base font-bold text-white hover:text-amber-300 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {item.content}
                </p>
                <div className="text-[11px] text-slate-400 pt-1">
                  Diumumkan oleh: <span className="text-slate-200">{item.author}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="kontak" className="border-t border-amber-500/20 bg-[#040710] py-8 px-4 text-center text-xs text-slate-400 space-y-2">
        <p className="font-medium text-slate-300">
          © {new Date().getFullYear()} SYSJEGER V2.0 — Sistem Informasi Jemaat dan Gereja GMIT BETEL FUIMELANG
        </p>
        <p className="text-slate-500">
          Sekretariat: Desa Fuimelang, Kec. Alor Tengah Utara, Kab. Alor, NTT ·{' '}
          <a href="https://wa.me/6285173095482" target="_blank" rel="noreferrer" className="text-emerald-300 hover:text-emerald-200 font-semibold">
            WhatsApp 0851-7309-5482
          </a>
        </p>
        <p className="text-slate-500">
          Gereja Masehi Injili di Timor (GMIT) · Klasis Alor Tengah Utara · Kabupaten Alor, Nusa Tenggara Timur
        </p>
        <p className="text-[11px] text-amber-500/80">
          Zona Waktu: WITA (UTC+8) / Nusa Tenggara Timur · Format DD-MM-YYYY · Mata Uang: IDR (Rupiah)
        </p>
      </footer>
    </div>
  );
};
