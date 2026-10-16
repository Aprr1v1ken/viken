import React, { useState } from 'react';
import { Home, Plus, Search, Eye, Trash2, Printer, Users } from 'lucide-react';
import { formatDateDMY } from '../../utils/church-logic.ts';
import type { Family, Member, Rayon } from '../../types/index.ts';

interface FamiliesViewProps {
  families: Family[];
  members: Member[];
  rayons: Rayon[];
  onOpenAddModal: () => void;
  onDeleteFamily: (id: string) => void;
  onOpenPrintReport: () => void;
}

export const FamiliesView: React.FC<FamiliesViewProps> = ({
  families,
  members,
  rayons,
  onOpenAddModal,
  onDeleteFamily,
  onOpenPrintReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRayon, setSelectedRayon] = useState('all');
  const [activeFamily, setActiveFamily] = useState<Family | null>(null);

  const filteredFamilies = families.filter((f) => {
    if (selectedRayon !== 'all' && f.rayonId !== selectedRayon) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      f.familyNo.toLowerCase().includes(q) ||
      f.headOfFamilyName.toLowerCase().includes(q) ||
      f.address.toLowerCase().includes(q) ||
      f.phone.includes(q)
    );
  });

  const familyMembers = activeFamily
    ? members.filter((m) => m.familyId === activeFamily.id)
    : [];

  return (
    <div className="space-y-5">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 shadow-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Home className="w-5 h-5 text-amber-400" />
            <span>Database Kartu Keluarga (KK) Jemaat</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pengelolaan {families.length} Kepala Keluarga terdaftar di GMIT Betel Fuimelang
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat KK Baru</span>
          </button>
          <button
            onClick={onOpenPrintReport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Cetak Buku KK</span>
          </button>
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
            placeholder="Cari Nomor KK, Nama Kepala Keluarga, Alamat..."
            className="w-full pl-9 pr-3 py-2 bg-[#050811] border border-slate-700 focus:border-amber-400 rounded-lg text-white outline-none"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedRayon}
            onChange={(e) => setSelectedRayon(e.target.value)}
            className="w-full px-3 py-2 bg-[#050811] border border-slate-700 focus:border-amber-400 rounded-lg text-slate-200 outline-none"
          >
            <option value="all">Semua Rayon Pelayanan</option>
            {rayons.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Family Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFamilies.map((fam) => {
          const membersInFam = members.filter((m) => m.familyId === fam.id);
          const rayon = rayons.find((r) => r.id === fam.rayonId);

          return (
            <div
              key={fam.id}
              className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 hover:border-amber-400/40 transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    {fam.familyNo}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {rayon?.name || 'Rayon 1'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">
                  Kel. {fam.headOfFamilyName}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                  {fam.address}
                </p>
                <div className="text-[11px] text-slate-400 mt-1">
                  Telepon: <span className="font-mono text-slate-200">{fam.phone || '-'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-amber-300 font-semibold">
                  <Users className="w-3.5 h-3.5" />
                  <span>{membersInFam.length} Jiwa Terdaftar</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveFamily(fam)}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Anggota KK</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Hapus Kartu Keluarga Kel. ${fam.headOfFamilyName}?`)) {
                        onDeleteFamily(fam.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal View Detail Anggota Kartu Keluarga */}
      {activeFamily && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-[#0b1226] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-amber-500/20 bg-[#070b18]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Home className="w-5 h-5 text-amber-400" />
                  <span>Susunan Kartu Keluarga — Kel. {activeFamily.headOfFamilyName}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Nomor KK: <span className="font-mono text-amber-400">{activeFamily.familyNo}</span> · {activeFamily.address}
                </p>
              </div>
              <button
                onClick={() => setActiveFamily(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#070b18] text-[11px] uppercase tracking-wider text-amber-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Nama Anggota</th>
                      <th className="py-2.5 px-3">Hubungan</th>
                      <th className="py-2.5 px-3">L/P</th>
                      <th className="py-2.5 px-3">Tgl Lahir</th>
                      <th className="py-2.5 px-3">Pekerjaan</th>
                      <th className="py-2.5 px-3 text-center">Baptis/Sidi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {familyMembers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-500">
                          Belum ada anggota yang dihubungkan ke KK ini.
                        </td>
                      </tr>
                    ) : (
                      familyMembers.map((m, idx) => (
                        <tr key={m.id} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-white">{m.fullName}</td>
                          <td className="py-2.5 px-3 font-medium text-amber-300">{m.familyRole}</td>
                          <td className="py-2.5 px-3">{m.gender === 'Laki-laki' ? 'L' : 'P'}</td>
                          <td className="py-2.5 px-3">{formatDateDMY(m.birthDate)}</td>
                          <td className="py-2.5 px-3">{m.occupation || '-'}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-[10px]">
                            <span className="text-cyan-400">B: {m.baptismStatus}</span> · <span className="text-amber-400">S: {m.confirmationStatus}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-[#070b18] flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Total {familyMembers.length} anggota keluarga aktif
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak KK Ini</span>
                </button>
                <button
                  onClick={() => setActiveFamily(null)}
                  className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
