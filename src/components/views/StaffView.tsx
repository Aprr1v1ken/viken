import React, { useState } from 'react';
import { Award, UserCheck, Plus, Phone, Mail, CheckCircle2 } from 'lucide-react';
import type { ChurchStaff } from '../../types/index.ts';

interface StaffViewProps {
  staff: ChurchStaff[];
  onAddStaff: (data: Partial<ChurchStaff>) => Promise<void>;
}

export const StaffView: React.FC<StaffViewProps> = ({ staff, onAddStaff }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [position, setPosition] = useState<any>('Penatua Rayon');
  const [period, setPeriod] = useState('2024 - 2027');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onAddStaff({
        name,
        position,
        period,
        phone,
        email,
        status: 'Aktif',
      });
      setShowAddModal(false);
      setName('');
      setPhone('');
      setEmail('');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 shadow-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Presbiter Majelis Jemaat & Pendeta</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pelayan Firman dan Tata Kelola Gerejawi GMIT Betel Fuimelang Periode 2024 - 2027
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Pelayan Majelis</span>
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map((s) => (
          <div
            key={s.id}
            className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 hover:border-amber-400/40 transition-all space-y-3 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 text-[10px] uppercase">
                  {s.position}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {s.period}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mt-1">{s.name}</h3>
              <div className="text-xs text-slate-400 mt-2 space-y-1">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-mono">{s.phone || '0812-xxxx-xxxx'}</span>
                </div>
                {s.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{s.email}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                <span>{s.status}</span>
              </span>
              <span className="text-[10px] text-slate-400">Klasis Alor Barat Daya</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0b1226] border border-amber-500/30 rounded-3xl shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-amber-300">
              Tambah Pelayan Majelis Jemaat
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nama Lengkap beserta Gelar *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Pnt. Daniel Malaipada"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Jabatan Pelayanan *
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                >
                  <option value="Ketua Majelis Jemaat / Pendeta">Ketua Majelis Jemaat / Pendeta</option>
                  <option value="Pendeta Pelayan">Pendeta Pelayan</option>
                  <option value="Wakil Ketua Majelis">Wakil Ketua Majelis</option>
                  <option value="Sekretaris">Sekretaris</option>
                  <option value="Bendahara">Bendahara</option>
                  <option value="Penatua Rayon">Penatua Rayon</option>
                  <option value="Diaken Rayon">Diaken Rayon</option>
                  <option value="Pengajar / Katekis">Pengajar / Katekis</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Periode Pelayanan
                </label>
                <input
                  type="text"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  placeholder="2024 - 2027"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nomor HP / WhatsApp
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Majelis'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
