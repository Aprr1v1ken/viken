import React, { useState } from 'react';
import { Lock, X, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { changePasswordApi } from '../services/api.ts';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const resetAndClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setDone(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('Kata sandi baru minimal 8 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi kata sandi baru tidak sama.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('Kata sandi baru harus berbeda dari kata sandi saat ini.');
      return;
    }

    setLoading(true);
    try {
      const res = await changePasswordApi(currentPassword, newPassword);
      if (res?.success) {
        setDone(true);
      } else {
        setError(res?.message || 'Gagal memperbarui kata sandi.');
      }
    } catch {
      setError('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    autoComplete: string,
    hint?: string
  ) => (
    <div>
      <label className="block text-xs font-semibold text-slate-300 mb-1.5">{label}</label>
      <div className="relative">
        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          autoComplete={autoComplete}
          placeholder="••••••••"
          className="w-full pl-9 pr-3 py-2 text-xs bg-[#070c1b] border border-slate-700 focus:border-amber-400 rounded-xl text-white outline-none transition-colors"
        />
      </div>
      {hint && <p className="text-[10px] text-slate-500 mt-1">{hint}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0b1226] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        <div className="relative p-6 bg-gradient-to-b from-[#131d3b] to-[#0b1226] border-b border-amber-500/20 text-center">
          <button
            onClick={resetAndClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/15 border border-amber-400/40 flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-amber-300" />
          </div>
          <h3 className="text-lg font-bold text-amber-300">Ganti Kata Sandi</h3>
          <p className="text-xs text-slate-400 mt-1">SYSJEGER V2.0 · GMIT BETEL FUIMELANG</p>
        </div>

        <div className="p-6 space-y-5">
          {done ? (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-200 text-xs flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                <p className="leading-relaxed">
                  Kata sandi berhasil diperbarui. Gunakan kata sandi baru pada saat Anda masuk berikutnya.
                </p>
              </div>
              <button
                onClick={resetAndClose}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
              >
                Selesai
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {field('Kata Sandi Saat Ini', currentPassword, setCurrentPassword, 'current-password')}
                {field('Kata Sandi Baru', newPassword, setNewPassword, 'new-password', 'Minimal 8 karakter — gunakan gabungan huruf dan angka.')}
                {field('Konfirmasi Kata Sandi Baru', confirmPassword, setConfirmPassword, 'new-password')}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
