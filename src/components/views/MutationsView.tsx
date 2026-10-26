import React, { useState } from 'react';
import { ArrowRightLeft, Plus, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { formatDateDMY } from '../../utils/church-logic.ts';
import type { MutationRecord, Member, Rayon } from '../../types/index.ts';

interface MutationsViewProps {
  mutations: MutationRecord[];
  members: Member[];
  rayons: Rayon[];
  onSaveMutation: (data: Partial<MutationRecord>, id?: string) => Promise<any>;
  onDeleteMutation: (id: string) => Promise<any>;
}

export const MutationsView: React.FC<MutationsViewProps> = ({
  mutations,
  members,
  rayons,
  onSaveMutation,
  onDeleteMutation,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MutationRecord | null>(null);
  const [status, setStatusField] = useState<any>('Disetujui');
  const [approvedBy, setApprovedBy] = useState('');

  const openAdd = () => {
    setEditing(null);
    setMemberId('');
    setMutationType('Pindah Keluar');
    setToChurch('');
    setToRayonId('');
    setEffectiveDate(new Date().toISOString().substring(0, 10));
    setReason('');
    setStatusField('Disetujui');
    setApprovedBy('');
    setShowModal(true);
  };

  const openEdit = (m: MutationRecord) => {
    setEditing(m);
    setMemberId(m.memberId);
    setMutationType(m.mutationType);
    setToChurch(m.toChurch || '');
    setToRayonId(m.toRayonId || '');
    setEffectiveDate(m.effectiveDate || '');
    setReason(m.reason || '');
    setStatusField(m.status || 'Disetujui');
    setApprovedBy(m.approvedBy || '');
    setShowModal(true);
  };

  const handleDelete = async (m: MutationRecord) => {
    if (!window.confirm(`Hapus catatan mutasi ${m.mutationNo} untuk "${m.memberName}" (${m.mutationType})?\n\nPerhatian: status/rayon jemaat yang sudah berubah akibat mutasi ini TIDAK otomatis dikembalikan. Ubah data jemaat secara manual bila perlu.`)) return;
    try {
      const res = await onDeleteMutation(m.id);
      if (res && res.success === false) alert(res.message || 'Gagal menghapus catatan mutasi');
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus. Periksa koneksi lalu coba lagi.');
    }
  };
  const [memberId, setMemberId] = useState('');
  const [mutationType, setMutationType] = useState<any>('Pindah Keluar');
  const [toChurch, setToChurch] = useState('');
  const [toRayonId, setToRayonId] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().substring(0, 10));
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mem = members.find((m) => m.id === memberId);
    if (!mem) return;

    setSaving(true);
    try {
      const res = await onSaveMutation(
        {
          memberId: mem.id,
          memberName: mem.fullName,
          mutationType,
          fromRayonId: editing?.fromRayonId || mem.rayonId,
          toRayonId: mutationType === 'Pindah Rayon' ? toRayonId : undefined,
          fromChurch: editing?.fromChurch || 'GMIT Betel Fuimelang',
          toChurch: mutationType === 'Pindah Keluar' ? toChurch : undefined,
          requestDate: editing?.requestDate || new Date().toISOString().substring(0, 10),
          effectiveDate,
          reason,
          status,
          approvedBy,
        },
        editing?.id
      );
      if (res && res.success === false) {
        alert(res.message || 'Gagal menyimpan mutasi');
        return;
      }
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan. Periksa koneksi lalu coba lagi.');
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
            <ArrowRightLeft className="w-5 h-5 text-amber-400" />
            <span>Buku Register Mutasi & Peristiwa Jemaat</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pencatatan perpindahan jemaat (masuk/keluar/rayon) dan peristiwa kedukaan
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Catat Mutasi / Peristiwa</span>
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-[#0c1329] border border-amber-500/20 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#070b18] text-[11px] uppercase tracking-wider text-amber-400 border-b border-amber-500/20">
              <tr>
                <th className="py-3 px-4">No. Mutasi</th>
                <th className="py-3 px-4">Nama Anggota Jemaat</th>
                <th className="py-3 px-4">Jenis Peristiwa</th>
                <th className="py-3 px-4">Gereja / Rayon Tujuan</th>
                <th className="py-3 px-4">Tgl Efektif</th>
                <th className="py-3 px-4">Alasan & Dokumen</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {mutations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-500">
                    Belum ada riwayat mutasi anggota tercatat.
                  </td>
                </tr>
              ) : (
                mutations.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono font-medium text-amber-300">{m.mutationNo}</td>
                    <td className="py-3 px-4 font-bold text-white">{m.memberName}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                          m.mutationType === 'Pindah Masuk'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : m.mutationType === 'Pindah Keluar'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : m.mutationType === 'Pindah Rayon'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-red-950 text-red-300 border border-red-800'
                        }`}
                      >
                        {m.mutationType}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium">
                      {m.toChurch || (m.toRayonId ? rayons.find((r) => r.id === m.toRayonId)?.name : '-')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">{formatDateDMY(m.effectiveDate)}</td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{m.reason || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${m.status === 'Disetujui' ? 'text-emerald-400' : m.status === 'Ditolak' ? 'text-red-400' : 'text-amber-400'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{m.status}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openEdit(m)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold mr-1.5 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Ubah
                      </button>
                      <button
                        onClick={() => handleDelete(m)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-[11px] font-semibold hover:bg-red-900/50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Mutation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0b1226] border border-amber-500/30 rounded-3xl shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-amber-300">
              {editing ? 'Ubah Catatan Mutasi & Peristiwa' : 'Pencatatan Mutasi & Peristiwa Gerejawi'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Pilih Anggota Jemaat *
                </label>
                <select
                  required
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                >
                  <option value="">-- Pilih Anggota Jemaat --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberNo}) - {m.rayonName || 'Rayon'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Jenis Peristiwa Mutasi *
                </label>
                <select
                  value={mutationType}
                  onChange={(e) => setMutationType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                >
                  <option value="Pindah Keluar">Pindah Keluar (Atestasi Keluar)</option>
                  <option value="Pindah Masuk">Pindah Masuk (Atestasi Masuk)</option>
                  <option value="Pindah Rayon">Pindah Rayon Pelayanan</option>
                  <option value="Meninggal Dunia">Meninggal Dunia</option>
                </select>
              </div>

              {mutationType === 'Pindah Keluar' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Gereja Tujuan *
                  </label>
                  <input
                    type="text"
                    required
                    value={toChurch}
                    onChange={(e) => setToChurch(e.target.value)}
                    placeholder="Nama gereja tujuan"
                    className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                  />
                </div>
              )}

              {mutationType === 'Pindah Rayon' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Pilih Rayon Tujuan *
                  </label>
                  <select
                    required
                    value={toRayonId}
                    onChange={(e) => setToRayonId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                  >
                    <option value="">-- Pilih Rayon Baru --</option>
                    {rayons.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Tanggal Efektif *
                </label>
                <input
                  type="date"
                  required
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Alasan / Keterangan Mutasi
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Keterangan kepindahan tugas atau surat keterangan..."
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Status Persetujuan
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatusField(e.target.value)}
                    className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                  >
                    <option value="Disetujui">Disetujui</option>
                    <option value="Diajukan">Diajukan (menunggu)</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Disetujui Oleh
                  </label>
                  <input
                    type="text"
                    value={approvedBy}
                    onChange={(e) => setApprovedBy(e.target.value)}
                    placeholder="Nama Ketua Majelis/Pendeta"
                    className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                  />
                </div>
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
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Simpan Mutasi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
