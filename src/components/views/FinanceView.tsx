import React, { useState } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownRight, Printer, Download, Search, CheckCircle2 } from 'lucide-react';
import { formatRupiah, formatDateDMY } from '../../utils/church-logic.ts';
import type { FinancialTransaction } from '../../types/index.ts';

interface FinanceViewProps {
  transactions: FinancialTransaction[];
  onAddTransaction: (data: Partial<FinancialTransaction>) => Promise<void>;
  onOpenPrintReport: () => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({
  transactions,
  onAddTransaction,
  onOpenPrintReport,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [txDate, setTxDate] = useState('18-10-2026');
  const [type, setType] = useState<'Pemasukan' | 'Pengeluaran'>('Pemasukan');
  const [category, setCategory] = useState<any>('Kolekte Ibadah Minggu');
  const [amount, setAmount] = useState<number>(1000000);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  let totalIncome = 0;
  let totalExpense = 0;
  for (const t of transactions) {
    if (t.type === 'Pemasukan') totalIncome += t.amount;
    else if (t.type === 'Pengeluaran') totalExpense += t.amount;
  }
  const balance = totalIncome - totalExpense;

  const filtered = transactions.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      t.txNo.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
    );
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    setSaving(true);
    try {
      await onAddTransaction({
        txDate,
        type,
        category,
        amount: Number(amount),
        description: description || `${type} ${category}`,
        recordedBy: 'Bendahara Jemaat / Dkn. Samuel Blegur',
      });
      setShowModal(false);
      setDescription('');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    const headers = ['No Transaksi', 'Tanggal', 'Jenis', 'Kategori', 'Jumlah (IDR)', 'Keterangan', 'Petugas'];
    const rows = filtered.map((t) => [
      `"${t.txNo}"`,
      `"${t.txDate}"`,
      `"${t.type}"`,
      `"${t.category}"`,
      `"${t.amount}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.recordedBy}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Kas_GMIT_Betel_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 shadow-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-amber-400" />
            <span>Administrasi Keuangan & Kas Gereja</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pencatatan kas masuk persembahan, kolekte kebaktian, dan operasional pelayanan jemaat
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Transaksi Kas</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={onOpenPrintReport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Cetak Buku Kas</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0c1329] border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Total Kas Masuk</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-400 tabular-nums">
            {formatRupiah(totalIncome)}
          </div>
          <div className="text-[11px] text-slate-400">Kolekte, syukur, perpuluhan</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c1329] border border-red-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Total Kas Keluar</span>
            <ArrowDownRight className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-red-400 tabular-nums">
            {formatRupiah(totalExpense)}
          </div>
          <div className="text-[11px] text-slate-400">Operasional, diakonia & kegiatan</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/30 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold uppercase tracking-wider">Saldo Kas Berjalan</span>
            <Wallet className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-amber-300 tabular-nums">
            {formatRupiah(balance)}
          </div>
          <div className="text-[11px] text-amber-400/80 font-medium">Rekening Bendahara GMIT Betel</div>
        </div>
      </div>

      {/* Filter strip */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-[#090e1e] border border-amber-500/20 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari transaksi, kategori, atau uraian..."
            className="w-full pl-9 pr-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none focus:border-amber-400"
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none focus:border-amber-400"
          >
            <option value="all">Semua Jenis Transaksi</option>
            <option value="Pemasukan">Pemasukan (Kas Masuk)</option>
            <option value="Pengeluaran">Pengeluaran (Kas Keluar)</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl bg-[#0c1329] border border-amber-500/20 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#070b18] text-[11px] uppercase tracking-wider text-amber-400 border-b border-amber-500/20">
              <tr>
                <th className="py-3 px-4">No. Transaksi</th>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Kategori Akun</th>
                <th className="py-3 px-4">Uraian / Deskripsi</th>
                <th className="py-3 px-4 text-right">Jumlah (Rp)</th>
                <th className="py-3 px-4">Pencatat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-medium text-amber-300">{t.txNo}</td>
                  <td className="py-3 px-4 whitespace-nowrap">{t.txDate}</td>
                  <td className="py-3 px-4 font-semibold text-white">{t.category}</td>
                  <td className="py-3 px-4 text-slate-300 max-w-sm">{t.description}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap tabular-nums">
                    {t.type === 'Pemasukan' ? (
                      <span className="text-emerald-400">+{formatRupiah(t.amount)}</span>
                    ) : (
                      <span className="text-red-400">-{formatRupiah(t.amount)}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">{t.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0b1226] border border-amber-500/30 rounded-3xl shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-amber-300">
              Input Transaksi Kas Gereja
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tanggal Transaksi (DD-MM-YYYY) *</label>
                <input
                  type="text"
                  required
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Jenis Transaksi *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setType('Pemasukan');
                      setCategory('Kolekte Ibadah Minggu');
                    }}
                    className={`py-2 rounded-lg font-bold border transition-colors ${
                      type === 'Pemasukan'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Pemasukan (Kas Masuk)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setType('Pengeluaran');
                      setCategory('Operasional Gereja');
                    }}
                    className={`py-2 rounded-lg font-bold border transition-colors ${
                      type === 'Pengeluaran'
                        ? 'bg-red-950 text-red-300 border-red-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Pengeluaran (Kas Keluar)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Kategori Akun *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                >
                  {type === 'Pemasukan' ? (
                    <>
                      <option value="Kolekte Ibadah Minggu">Kolekte Ibadah Minggu</option>
                      <option value="Persembahan Syukur">Persembahan Syukur</option>
                      <option value="Persepuluhan">Persepuluhan</option>
                      <option value="Kolekte Rayon">Kolekte Rayon</option>
                      <option value="Dana Pembangunan">Dana Pembangunan</option>
                      <option value="Lainnya">Lainnya</option>
                    </>
                  ) : (
                    <>
                      <option value="Operasional Gereja">Operasional Gereja (Listrik/Air/Alat)</option>
                      <option value="Diakonia / Kasih">Diakonia Kasih / Bantuan Warga Sakit</option>
                      <option value="Gaji & Honorarium">Honorarium / Tunjangan</option>
                      <option value="Kegiatan Pelayanan">Bahan Pelajaran PAR & Katekisasi</option>
                      <option value="Pemeliharaan Gedung">Pemeliharaan & Pembangunan Gedung</option>
                      <option value="Lainnya">Lainnya</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nilai Transaksi (Rupiah) *</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white font-mono text-sm outline-none font-bold text-amber-300"
                />
                <div className="text-[11px] text-slate-400 mt-1">
                  Format: {formatRupiah(amount)}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Uraian / Keterangan Transaksi</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan rincian kas..."
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
