import React, { useState } from 'react';
import { X, Home, Save, AlertCircle } from 'lucide-react';
import type { Family, Rayon } from '../types/index.ts';

interface FamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Family>) => Promise<void>;
  rayons: Rayon[];
}

export const FamilyModal: React.FC<FamilyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  rayons,
}) => {
  const [headName, setHeadName] = useState('');
  const [address, setAddress] = useState('Desa Fuimelang');
  const [rayonId, setRayonId] = useState(rayons[0]?.id || 'r1');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headName.trim()) {
      setError('Nama Kepala Keluarga wajib diisi');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await onSave({
        headOfFamilyName: headName,
        address,
        rayonId,
        phone,
        notes,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan KK');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0b1226] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-amber-500/20 bg-[#070b18]">
          <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
            <Home className="w-5 h-5 text-amber-400" />
            <span>Tambah Kartu Keluarga (KK) Baru</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Nama Kepala Keluarga *
            </label>
            <input
              type="text"
              required
              value={headName}
              onChange={(e) => setHeadName(e.target.value)}
              placeholder="Contoh: Markus Doko"
              className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Rayon Wilayah Pelayanan *
            </label>
            <select
              value={rayonId}
              onChange={(e) => setRayonId(e.target.value)}
              className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
            >
              {rayons.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Alamat Keluarga
            </label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Contoh: Kompleks SD Betel RT 03/RW 01"
              className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Nomor Telepon / WhatsApp
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0812-xxxx-xxxx"
              className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Catatan Keluarga
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Keterangan tambahan..."
              className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Kartu Keluarga'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
