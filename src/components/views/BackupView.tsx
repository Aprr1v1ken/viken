import React, { useState } from 'react';
import {
  Database,
  Download,
  Upload,
  Shield,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  RotateCcw,
  X,
  AlertOctagon,
  Lock,
  ShieldCheck,
  Key,
} from 'lucide-react';
import { emptyDatabaseApi, resetSeedDataApi } from '../../services/api.ts';
import type { User } from '../../types/index.ts';

interface BackupViewProps {
  onOpenImport: () => void;
  onDatabaseModified?: () => void;
  currentUser?: User | null;
}

export const BackupView: React.FC<BackupViewProps> = ({
  onOpenImport,
  onDatabaseModified,
  currentUser,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [backedUp, setBackedUp] = useState(false);
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [showResetSeedModal, setShowResetSeedModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [keepAdmin, setKeepAdmin] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isSuperAdmin = currentUser?.role === 'Super Admin';

  const handleDownloadBackup = async () => {
    setDownloading(true);
    try {
      const res = await fetch('/api/backup');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sysjeger_backup_gmit_betel_${new Date().toISOString().substring(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setBackedUp(true);
      setTimeout(() => setBackedUp(false), 6000);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const handleEmptyDatabase = async () => {
    if (!isSuperAdmin) {
      setAlertMessage({ type: 'error', text: 'Akses ditolak: Hanya Super Admin yang berhak mereset seluruh database.' });
      return;
    }
    if (confirmText.trim().toUpperCase() !== 'RESET TOTAL') return;

    setProcessing(true);
    try {
      const res = await emptyDatabaseApi(keepAdmin, currentUser?.role || 'Super Admin');
      if (res.success) {
        setAlertMessage({ type: 'success', text: res.message || 'Database berhasil dikosongkan oleh Super Admin.' });
        setShowEmptyModal(false);
        setConfirmText('');
        if (onDatabaseModified) onDatabaseModified();
      } else {
        setAlertMessage({ type: 'error', text: res.message || 'Gagal mengosongkan database.' });
      }
    } catch (err: any) {
      setAlertMessage({ type: 'error', text: 'Terjadi kesalahan sistem: ' + err.message });
    } finally {
      setProcessing(false);
    }
  };

  const handleResetSeedData = async () => {
    if (!isSuperAdmin) {
      setAlertMessage({ type: 'error', text: 'Akses ditolak: Hanya Super Admin yang berhak mereset seluruh data.' });
      return;
    }

    setProcessing(true);
    try {
      const res = await resetSeedDataApi(currentUser?.role || 'Super Admin');
      if (res.success) {
        setAlertMessage({ type: 'success', text: res.message || 'Data awal percontohan berhasil dipulihkan oleh Super Admin.' });
        setShowResetSeedModal(false);
        if (onDatabaseModified) onDatabaseModified();
      } else {
        setAlertMessage({ type: 'error', text: res.message || 'Gagal mereset data percontohan.' });
      }
    } catch (err: any) {
      setAlertMessage({ type: 'error', text: 'Terjadi kesalahan: ' + err.message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 shadow-md">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-400" />
          <span>Pencadangan, Pemulihan & Pemeliharaan Database</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Fasilitas backup berkala, ekspor JSON, pengosongan database, dan migrasi data GMIT Betel Fuimelang
        </p>
      </div>

      {alertMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
            alertMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
              : 'bg-red-950/60 border-red-500/50 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {alertMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{alertMessage.text}</span>
          </div>
          <button
            onClick={() => setAlertMessage(null)}
            className="p-1 rounded-md text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Routine Backup & Import Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Backup Card */}
        <div className="p-6 rounded-2xl bg-[#0c1329] border border-amber-500/20 space-y-4 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3">
              <Download className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              Unduh Cadangan Database Lengkap (JSON Snapshot)
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Menghasilkan berkas arsip lengkap seluruh tabel: data jemaat, kartu keluarga, rayon, sakramen baptis/sidi/nikah, mutasi, kas keuangan, dan catatan audit trail.
            </p>
            {backedUp && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Berkas backup database berhasil diunduh ke komputer Anda.</span>
              </div>
            )}
          </div>

          <button
            onClick={handleDownloadBackup}
            disabled={downloading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Membuat Cadangan...' : 'Unduh Berkas Backup (.json)'}</span>
          </button>
        </div>

        {/* Import & Restore Card */}
        <div className="p-6 rounded-2xl bg-[#0c1329] border border-amber-500/20 space-y-4 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">
              Impor Data Jemaat dari Format CSV / Excel
            </h3>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              Fasilitas migrasi massal dari arsip Microsoft Excel gereja lama atau formulir pendaftaran jemaat baru dengan validasi otomatis dan deteksi kemungkinan data ganda.
            </p>
          </div>

          <button
            onClick={onOpenImport}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Buka Wizard Impor CSV</span>
          </button>
        </div>
      </div>

      {/* SUPER ADMIN EXCLUSIVE AREA: RESET SELURUH DATA SISTEM */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isSuperAdmin
          ? 'bg-gradient-to-br from-[#1c0e18] via-[#0e162d] to-[#0c1329] border-red-500/40 shadow-xl'
          : 'bg-[#090e1f] border-slate-800 opacity-90'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
              isSuperAdmin
                ? 'bg-red-500/20 text-red-400 border-red-500/40 shadow-inner'
                : 'bg-slate-800 text-slate-500 border-slate-700'
            }`}>
              {isSuperAdmin ? <ShieldCheck className="w-6 h-6 text-red-400" /> : <Lock className="w-6 h-6 text-amber-400" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white">
                  Reset Seluruh Data Sistem
                </h3>
                <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${
                  isSuperAdmin
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {isSuperAdmin ? 'Hak Akses: Super Admin Aktif' : 'Khusus Super Admin'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Otoritas tingkat tertinggi untuk mereset seluruh database, pengosongan modul jemaat, atau memulihkan data percontohan.
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 self-start sm:self-auto">
            Peran Anda: <span className="font-bold text-amber-300">{currentUser?.role || 'Guest'}</span>
          </div>
        </div>

        {isSuperAdmin ? (
          /* ACTIVE SUPER ADMIN CONTROLS */
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-200 flex items-start gap-3">
              <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-red-300">
                  Perhatian Super Admin: Operasi ini bersifat permanen
                </p>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Reset seluruh data akan menghapus semua catatan jemaat, kartu keluarga, kas keuangan, absensi, dokumen, dan sakramen dari database SQLite. Gunakan fitur ini dengan bijak saat hendak memulai masa pendataan jemaat riil yang baru atau saat mereset lingkungan uji coba.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Button 1: Reset & Kosongkan Seluruh Data */}
              <div className="p-4 rounded-xl bg-[#090f22] border border-red-500/30 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-red-400 font-bold text-xs">
                    <Trash2 className="w-4 h-4" />
                    <span>Reset & Kosongkan Seluruh Data</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    Menghapus seluruh baris data jemaat, keluarga, sakramen, dan kas. Struktur akun login Super Admin tetap dipertahankan agar Anda tidak terkunci dari sistem.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmText('');
                    setShowEmptyModal(true);
                  }}
                  disabled={processing}
                  className="w-full py-2.5 px-4 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Reset & Kosongkan Database</span>
                </button>
              </div>

              {/* Button 2: Reset & Muat Ulang Data Awal Percontohan */}
              <div className="p-4 rounded-xl bg-[#090f22] border border-amber-500/30 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset & Muat Ulang Data Contoh</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    Mereset total dan memulihkan 15 data jemaat contoh, 5 KK, 4 rayon, sakramen, warta, kas, dan jadwal ibadah GMIT Betel Fuimelang untuk keperluan demonstrasi.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetSeedModal(true)}
                  disabled={processing}
                  className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset & Muat Data Contoh GMIT</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* LOCKED STATE FOR NON-SUPER-ADMIN */
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">
                  Akses Terkunci — Fitur Hanya Tersedia untuk Super Admin
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Pengguna dengan peran <span className="text-amber-300 font-semibold">{currentUser?.role || 'Pengguna'}</span> tidak memiliki izin untuk mereset atau mengosongkan database sistem demi menjaga keamanan arsip gereja.
                </p>
                <p className="text-[11px] text-slate-500 pt-1">
                  💡 Untuk keperluan pengujian atau demonstrasi, Anda dapat beralih ke peran <span className="text-amber-400 font-mono font-medium">Super Admin</span> melalui menu alih peran di bilah atas (Header).
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-500 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <Lock className="w-4 h-4 text-slate-500" />
              <span>Tombol Reset Terkunci (Hanya Dapat Diakses Oleh Super Admin)</span>
            </button>
          </div>
        )}
      </div>

      {/* Database Security Info Box */}
      <div className="p-5 rounded-2xl bg-[#090e1e] border border-slate-800 flex items-start gap-3.5 text-xs">
        <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-white">
            Keamanan Data & Prinsip Perlindungan Data Pribadi (PDP)
          </h4>
          <p className="text-slate-400 leading-relaxed">
            Database tersimpan secara persisten pada server lokal/cloud gereja dengan proteksi ACID SQLite. Data NIK, kontak, catatan pastoral, dan arsip dokumen dilindungi oleh Role-Based Access Control (RBAC). Lakukan pencadangan database secara berkala setiap akhir bulan atau setelah ibadah raya.
          </p>
        </div>
      </div>

      {/* CONFIRM EMPTY MODAL (SUPER ADMIN ONLY) */}
      {showEmptyModal && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1329] border border-red-500/60 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-400 border-b border-red-500/20 pb-3">
              <AlertOctagon className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-white">
                  Konfirmasi Reset & Kosongkan Database
                </h3>
                <p className="text-[11px] text-red-300">Otorisasi Super Admin Dibutuhkan</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Anda akan mereset dan mengosongkan seluruh data anggota jemaat, kartu keluarga, sakramen baptis/sidi/nikah, mutasi, kas keuangan, absensi, dokumen, dan warta gereja GMIT Betel Fuimelang.
            </p>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepAdmin}
                  onChange={(e) => setKeepAdmin(e.target.checked)}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>Tetap simpan akun Super Admin & Admin Gereja</span>
              </label>
              <p className="text-[10px] text-slate-400 pl-5">
                (Disarankan tetap tercentang agar akun Super Admin tetap dapat login ke sistem)
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-slate-300 block">
                Ketik <span className="font-mono font-bold text-red-400">RESET TOTAL</span> untuk konfirmasi:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="RESET TOTAL"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-slate-900 border border-red-500/40 text-white focus:outline-none focus:border-red-400"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setShowEmptyModal(false);
                  setConfirmText('');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={confirmText.trim().toUpperCase() !== 'RESET TOTAL' || processing}
                onClick={handleEmptyDatabase}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-500 text-white disabled:opacity-40 transition-colors cursor-pointer"
              >
                {processing ? 'Mereset Database...' : 'Ya, Reset & Kosongkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM RESET SEED MODAL (SUPER ADMIN ONLY) */}
      {showResetSeedModal && isSuperAdmin && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1329] border border-amber-500/50 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-400 border-b border-amber-500/20 pb-3">
              <RotateCcw className="w-6 h-6 shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-white">
                  Reset & Muat Ulang Data Percontohan
                </h3>
                <p className="text-[11px] text-amber-300">Konfirmasi Otorisasi Super Admin</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tindakan ini akan mengganti seluruh data yang ada saat ini dengan 15 data jemaat contoh, 5 kartu keluarga, 4 rayon resmi, sakramen, warta, transaksi kas, dan jadwal kebaktian GMIT Betel Fuimelang.
            </p>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center gap-2">
              <Key className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Diotorisasi oleh akun Super Admin: {currentUser?.name}</span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowResetSeedModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleResetSeedData}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
              >
                {processing ? 'Memproses Reset...' : 'Ya, Reset & Muat Data Contoh'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
