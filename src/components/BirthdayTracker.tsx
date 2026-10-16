import React, { useState, useMemo, useEffect } from 'react';
import {
  Cake,
  Gift,
  Calendar,
  Sparkles,
  MessageCircle,
  Copy,
  Check,
  Send,
  Search,
  Filter,
  UserPlus,
  RotateCcw,
  X,
  Clock,
  ArrowUpDown,
  Phone,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Edit3,
  AlertTriangle,
} from 'lucide-react';
import {
  generatePastoralBirthdayGreeting,
  generateCustomBirthdayTemplate,
  getWhatsAppBirthdayUrl,
  BIRTHDAY_TEMPLATES,
  type BirthdayMemberItem,
  type BirthdayTemplateType,
} from '../utils/church-logic.ts';

interface BirthdayTrackerProps {
  birthdayMembers: BirthdayMemberItem[];
  onOpenAddMember: () => void;
  onSeedDemoData?: () => void;
  totalSoul?: number;
  isSuperAdmin?: boolean;
}

export const BirthdayTracker: React.FC<BirthdayTrackerProps> = ({
  birthdayMembers = [],
  onOpenAddMember,
  onSeedDemoData,
  totalSoul = 0,
  isSuperAdmin = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRayon, setFilterRayon] = useState<string>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'upcoming'>('all');
  const [sortOrder, setSortOrder] = useState<'date_asc' | 'upcoming_first'>('date_asc');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // WhatsApp Message Generator Modal State
  const [greetingModalMember, setGreetingModalMember] = useState<BirthdayMemberItem | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<BirthdayTemplateType>('berkat_imamat');
  const [senderTitle, setSenderTitle] = useState('Majelis Jemaat');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [customGreetingText, setCustomGreetingText] = useState('');
  const [modalCopied, setModalCopied] = useState(false);

  // Month information
  const today = new Date();
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const currentMonthName = monthNames[today.getMonth()];
  const currentYear = today.getFullYear();

  // Extract distinct rayons from birthday list for filter dropdown
  const rayons = useMemo(() => {
    const set = new Set<string>();
    birthdayMembers.forEach((b) => {
      if (b.rayonName) set.add(b.rayonName);
    });
    return Array.from(set).sort();
  }, [birthdayMembers]);

  // Key metrics
  const todayCount = useMemo(() => birthdayMembers.filter((b) => b.isToday).length, [birthdayMembers]);
  const upcomingCount = useMemo(() => birthdayMembers.filter((b) => b.daysUntil > 0).length, [birthdayMembers]);

  // Process list: filter and sort by date
  const processedMembers = useMemo(() => {
    let list = [...birthdayMembers];

    // Filter mode
    if (filterMode === 'upcoming') {
      list = list.filter((b) => b.isToday || b.daysUntil > 0);
    }

    // Rayon filter
    if (filterRayon !== 'all') {
      list = list.filter((b) => b.rayonName === filterRayon);
    }

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (b) =>
          b.fullName.toLowerCase().includes(q) ||
          (b.nickname && b.nickname.toLowerCase().includes(q)) ||
          (b.rayonName && b.rayonName.toLowerCase().includes(q)) ||
          (b.phone && b.phone.includes(q))
      );
    }

    // Sorting: strictly sorted by date (day of month ascending 1..31) by default
    if (sortOrder === 'date_asc') {
      list.sort((a, b) => a.dayOfMonth - b.dayOfMonth);
    } else {
      // Upcoming & today first
      list.sort((a, b) => {
        if (a.isToday && !b.isToday) return -1;
        if (!a.isToday && b.isToday) return 1;
        if (a.daysUntil >= 0 && b.daysUntil < 0) return -1;
        if (a.daysUntil < 0 && b.daysUntil >= 0) return 1;
        return a.dayOfMonth - b.dayOfMonth;
      });
    }

    return list;
  }, [birthdayMembers, filterMode, filterRayon, searchQuery, sortOrder]);

  // Open Greeting Generator Modal with initialized template
  const handleOpenGreetingModal = (member: BirthdayMemberItem) => {
    setGreetingModalMember(member);
    setRecipientPhone(member.phone || '');
    setPhoneError(null);
    setSelectedTemplateId('berkat_imamat');
    setSenderTitle('Majelis Jemaat');
    const initialText = generateCustomBirthdayTemplate(member, 'berkat_imamat', 'GMIT Betel Fuimelang', 'Majelis Jemaat');
    setCustomGreetingText(initialText);
    setModalCopied(false);
  };

  // Re-generate message text when template or sender changes in modal
  const handleSelectTemplate = (templateId: BirthdayTemplateType) => {
    setSelectedTemplateId(templateId);
    if (greetingModalMember) {
      const text = generateCustomBirthdayTemplate(greetingModalMember, templateId, 'GMIT Betel Fuimelang', senderTitle);
      setCustomGreetingText(text);
    }
  };

  const handleSenderTitleChange = (newTitle: string) => {
    setSenderTitle(newTitle);
    if (greetingModalMember) {
      const text = generateCustomBirthdayTemplate(greetingModalMember, selectedTemplateId, 'GMIT Betel Fuimelang', newTitle);
      setCustomGreetingText(text);
    }
  };

  // Quick Copy on Card
  const handleQuickCopyGreeting = (b: BirthdayMemberItem) => {
    const text = generatePastoralBirthdayGreeting(b);
    navigator.clipboard.writeText(text);
    setCopiedId(b.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Copy in Modal
  const handleCopyInModal = () => {
    navigator.clipboard.writeText(customGreetingText);
    setModalCopied(true);
    setTimeout(() => setModalCopied(false), 2500);
  };

  // WhatsApp Destination URL (safe link, no window.open or window.alert)
  const currentWhatsAppUrl = recipientPhone.trim()
    ? getWhatsAppBirthdayUrl(recipientPhone, customGreetingText)
    : '';

  const handleSendClickValidation = (e: React.MouseEvent) => {
    if (!recipientPhone.trim()) {
      e.preventDefault();
      setPhoneError('Silakan masukkan nomor telepon / WhatsApp penerima terlebih dahulu.');
      return;
    }
    setPhoneError(null);
  };

  return (
    <section className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0c142b] via-[#101b3d] to-[#0c142b] border border-amber-500/30 shadow-xl space-y-5">
      {/* Tracker Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
            <Cake className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Birthday Tracker</span>
                <span className="text-xs font-normal text-slate-400">|</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300">
                  {currentMonthName} {currentYear}
                </span>
              </h3>
              {todayCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{todayCount} Hari Ini!</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Daftar anggota jemaat yang berulang tahun bulan ini, diurutkan berdasarkan tanggal kalender untuk pelayanan pastoral & doa ucapan syukur.
            </p>
          </div>
        </div>

        {/* Quick Month Statistic Badges */}
        <div className="flex items-center gap-2 text-xs self-start lg:self-auto">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Bulan Ini</div>
            <div className="text-sm font-bold font-mono text-amber-300">{birthdayMembers.length}</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Hari Ini</div>
            <div className={`text-sm font-bold font-mono ${todayCount > 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
              {todayCount}
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Mendatang</div>
            <div className="text-sm font-bold font-mono text-cyan-300">{upcomingCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter: All vs Upcoming */}
          <div className="inline-flex p-1 rounded-lg bg-slate-900/90 border border-slate-800">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-md transition-colors font-medium cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua ({birthdayMembers.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('upcoming')}
              className={`px-3 py-1 rounded-md transition-colors font-medium cursor-pointer ${
                filterMode === 'upcoming'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hari Ini & Mendatang ({todayCount + upcomingCount})
            </button>
          </div>

          {/* Rayon Filter */}
          {rayons.length > 0 && (
            <select
              value={filterRayon}
              onChange={(e) => setFilterRayon(e.target.value)}
              aria-label="Filter berdasarkan Rayon"
              className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all">Semua Rayon ({birthdayMembers.length})</option>
              {rayons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          )}

          {/* Sort Order Selector */}
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'date_asc' ? 'upcoming_first' : 'date_asc')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 text-slate-300 font-medium transition-colors cursor-pointer"
            title="Ubah urutan tampilan"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {sortOrder === 'date_asc' ? 'Urut Tanggal (1 - 31)' : 'Hari Ini & Mendatang Dahulu'}
            </span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau telepon..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200 text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Birthday List: Sorted by Date */}
      {processedMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {processedMembers.map((b) => {
            return (
              <div
                key={b.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between relative overflow-hidden group ${
                  b.isToday
                    ? 'bg-gradient-to-br from-amber-950/40 via-[#162244] to-[#0d1630] border-amber-400/70 shadow-lg shadow-amber-500/10'
                    : b.daysUntil > 0
                    ? 'bg-[#0a1024] border-slate-800 hover:border-amber-500/40'
                    : 'bg-[#070b18]/70 border-slate-800/60 opacity-80'
                }`}
              >
                {/* Top Corner Ribbon if today */}
                {b.isToday && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-bl-lg shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>HARI INI</span>
                  </div>
                )}

                <div>
                  {/* Date Flag & Member Header */}
                  <div className="flex items-start gap-3">
                    {/* Big Calendar Date Tag for date-sorted view */}
                    <div
                      className={`w-12 h-13 rounded-xl flex flex-col items-center justify-center shrink-0 border shadow-sm ${
                        b.isToday
                          ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 border-amber-300'
                          : b.daysUntil > 0
                          ? 'bg-slate-800/90 text-slate-200 border-slate-700'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      <span className="text-[10px] uppercase font-bold tracking-wider leading-none">
                        {currentMonthName.substring(0, 3)}
                      </span>
                      <span className="text-lg font-mono font-extrabold leading-tight">
                        {b.dayOfMonth}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                          {b.fullName}
                        </h4>
                        {b.nickname && (
                          <span className="text-xs text-amber-400/90 font-medium">
                            "{b.nickname}"
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                          {b.rayonName || 'Rayon Gereja'}
                        </span>
                        <span>·</span>
                        <span>{b.familyRole || 'Anggota'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Birthday details and countdown */}
                  <div className="mt-3.5 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Ulang Tahun</div>
                      <div className="font-bold text-amber-300">
                        Ke-{b.turningAge} Tahun
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                          b.isToday
                            ? 'bg-amber-500 text-slate-950 animate-bounce'
                            : b.daysUntil === 1
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : b.daysUntil > 1
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {b.isToday
                          ? '🎉 Hari Ini!'
                          : b.daysUntil === 1
                          ? '🎂 Besok'
                          : b.daysUntil > 1
                          ? `🎈 ${b.daysUntil} Hari Lagi`
                          : 'Telah Lewat'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 'SEND GREETING' ACTION BUTTON & UTILITIES */}
                <div className="mt-3.5 pt-3 border-t border-slate-800 flex items-center gap-2">
                  {/* Primary 'Send Greeting' Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenGreetingModal(b)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-950/40 cursor-pointer"
                    title={`Generate pesan ucapan WhatsApp untuk ${b.fullName}`}
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-200 shrink-0" />
                    <span>Send Greeting</span>
                  </button>

                  {/* Quick Copy Action Button */}
                  <button
                    type="button"
                    onClick={() => handleQuickCopyGreeting(b)}
                    className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                      copiedId === b.id
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800/90 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                    title="Salin cepat doa berkat ke clipboard"
                  >
                    {copiedId === b.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 rounded-xl bg-[#090f20] border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Gift className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">
              {searchQuery
                ? `Tidak ada anggota jemaat yang cocok dengan pencarian "${searchQuery}"`
                : filterMode === 'upcoming'
                ? 'Tidak ada ulang tahun mendatang di sisa hari bulan ini'
                : `Belum ada anggota jemaat yang berulang tahun di bulan ${currentMonthName}`}
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {totalSoul === 0
                ? 'Database jemaat saat ini kosong. Anda dapat menambahkan anggota jemaat baru atau memuat data contoh untuk menguji Birthday Tracker.'
                : 'Data tanggal lahir anggota jemaat akan otomatis disinkronkan dan diurutkan berdasarkan tanggal kalender.'}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenAddMember}
              className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Tambah Anggota Jemaat</span>
            </button>
            {onSeedDemoData && totalSoul === 0 && isSuperAdmin && (
              <button
                onClick={onSeedDemoData}
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                title="Hanya Super Admin yang memiliki wewenang untuk memuat data awal percontohan"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Muat Contoh Data Jemaat (Super Admin)</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* WHATSAPP MESSAGE TEMPLATE GENERATOR MODAL */}
      {greetingModalMember && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#0c1329] border border-amber-500/40 rounded-2xl w-full max-w-2xl p-5 sm:p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                    <span>WhatsApp Greeting Generator</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase font-mono">
                      Template WA
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Kustomisasi pesan doa berkat ulang tahun sebelum dikirim via WhatsApp
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setGreetingModalMember(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                title="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Member Summary Pill */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-[#111c3d] to-[#0c142b] border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <div className="text-[11px] text-slate-400">Penerima Ucapan:</div>
                <div className="font-bold text-white text-sm">
                  {greetingModalMember.fullName}
                  {greetingModalMember.nickname ? ` ("${greetingModalMember.nickname}")` : ''}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-amber-300 font-medium">
                  {greetingModalMember.rayonName || 'Rayon Gereja'}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-200">
                  Ulang Tahun ke-{greetingModalMember.turningAge} ({greetingModalMember.formattedDate})
                </span>
              </div>
            </div>

            {/* Step 1: Select Biblical Template */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span>Pilih Template Doa Berkat Firman Tuhan:</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {BIRTHDAY_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedTemplateId === tmpl.id
                        ? 'bg-amber-500/15 border-amber-400 text-white shadow-sm'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-bold ${selectedTemplateId === tmpl.id ? 'text-amber-300' : 'text-slate-200'}`}>
                        {tmpl.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800/80 text-amber-400/90 border border-amber-500/20">
                        {tmpl.verse}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                      {tmpl.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Sign-off & Phone Number configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">
                  Atas Nama Pengirim (Penutup):
                </label>
                <select
                  value={senderTitle}
                  onChange={(e) => handleSenderTitleChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="Majelis Jemaat">Majelis Jemaat GMIT Betel Fuimelang</option>
                  <option value="Ketua Majelis & Majelis Jemaat">Ketua Majelis & Majelis Jemaat</option>
                  <option value="Presbiter (Penatua & Diaken) Rayon">Presbiter (Penatua & Diaken) Rayon</option>
                  <option value="BPH Majelis Jemaat">BPH Majelis Jemaat</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">
                  Nomor WhatsApp Tujuan:
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={recipientPhone}
                    onChange={(e) => {
                      setRecipientPhone(e.target.value);
                      if (phoneError) setPhoneError(null);
                    }}
                    placeholder="Contoh: 081234567890"
                    className={`w-full pl-8 pr-3 py-2 rounded-lg bg-slate-900 border font-mono text-xs focus:outline-none ${
                      phoneError
                        ? 'border-red-500 text-red-200 focus:border-red-400'
                        : 'border-slate-800 text-slate-200 focus:border-emerald-500'
                    }`}
                  />
                </div>
                {phoneError && (
                  <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1.5 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{phoneError}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Step 3: Live Editable Message Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Naskah Pesan WhatsApp (Dapat Diedit / Dipersonalisasi):</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  {customGreetingText.length} karakter
                </span>
              </div>

              <textarea
                value={customGreetingText}
                onChange={(e) => setCustomGreetingText(e.target.value)}
                rows={7}
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs leading-relaxed font-sans focus:outline-none focus:border-emerald-500"
                placeholder="Tuliskan naskah doa ucapan selamat ulang tahun..."
              />
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleCopyInModal}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {modalCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">Pesan Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Pesan ke Clipboard</span>
                  </>
                )}
              </button>

              {currentWhatsAppUrl ? (
                <a
                  href={currentWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleSendClickValidation}
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Buka WhatsApp & Kirim Pesan</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleSendClickValidation}
                  className="py-2.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Buka WhatsApp & Kirim Pesan</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
