import React, { useState } from 'react';
import { IMAGES } from '../assets/images.ts';
import { Lock, User, ArrowRight, Shield, AlertCircle, X, Check } from 'lucide-react';
import { loginApi } from '../services/api.ts';
import type { User as UserType } from '../types/index.ts';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserType) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginApi(username, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setError(res.message || 'Nama pengguna atau kata sandi tidak valid');
      }
    } catch (err: any) {
      setError('Gagal terhubung ke server autentikasi');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0b1226] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-b from-[#131d3b] to-[#0b1226] border-b border-amber-500/20 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 mx-auto mb-3 rounded-full border-2 border-amber-400/60 overflow-hidden bg-slate-900 shadow-lg">
            <img
              src={IMAGES.crest}
              alt="GMIT Betel Fuimelang"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <h3 className="text-lg font-bold text-amber-300">
            Masuk Sistem SYSJEGER V2.0
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            GMIT BETEL FUIMELANG · SISTEM INFORMASI GEREJA
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nama Pengguna (Username)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="Contoh: admingereja"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#070c1b] border border-slate-700 focus:border-amber-400 rounded-xl text-white outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#070c1b] border border-slate-700 focus:border-amber-400 rounded-xl text-white outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Memverifikasi...</span>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Preset Selector */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              Akun Demo — klik untuk mengisi formulir:
            </div>
            <p className="text-[10px] text-amber-500/90 text-center leading-relaxed">
              Kata sandi demo wajib diganti sebelum situs dipakai resmi (lihat README).
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickSelect('superadmin', 'admin123')}
                className="p-2 text-left rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white"
              >
                <div className="font-bold text-amber-400">Super Admin</div>
                <div className="text-[10px] text-slate-400">admin / full control</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('admingereja', 'admin123')}
                className="p-2 text-left rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white"
              >
                <div className="font-bold text-amber-400">Admin Gereja</div>
                <div className="text-[10px] text-slate-400">Tata Usaha Jemaat</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('pendeta', 'pendeta123')}
                className="p-2 text-left rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white"
              >
                <div className="font-bold text-amber-400">Ketua Majelis</div>
                <div className="text-[10px] text-slate-400">Pdt. Abraham M. Tefa</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('majelisrayon1', 'rayon123')}
                className="p-2 text-left rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white"
              >
                <div className="font-bold text-amber-400">Majelis Rayon 1</div>
                <div className="text-[10px] text-slate-400">Pnt. Yulius B.</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect('jemaat1', 'jemaat123')}
                className="col-span-2 p-2 text-left rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white"
              >
                <div className="font-bold text-amber-400">Warga Jemaat (Yohanis Tefa)</div>
                <div className="text-[10px] text-slate-400">Akses Portal Jemaat & Kartu Anggota Digital</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
