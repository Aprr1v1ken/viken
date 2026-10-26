import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Printer,
  Download,
  Upload,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Award,
  IdCard,
  User,
  MessageSquare,
  RotateCcw,
} from 'lucide-react';
import { calculateAge, formatDateDMY } from '../../utils/church-logic.ts';
import type { Member, Rayon, CategorialGroup, DataCorrectionRequest } from '../../types/index.ts';

interface MembersViewProps {
  members: Member[];
  rayons: Rayon[];
  categorials: CategorialGroup[];
  onOpenAddModal: () => void;
  onOpenEditModal: (member: Member) => void;
  onOpenDetailModal: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  corrections?: DataCorrectionRequest[];
  onUpdateCorrection?: (id: string, status: string, adminNotes: string) => Promise<any>;
  onDeleteCorrection?: (id: string) => Promise<any>;
  onOpenImportModal: () => void;
  onOpenPrintReport: () => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  members,
  rayons,
  categorials,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDetailModal,
  onDeleteMember,
  corrections = [],
  onUpdateCorrection,
  onDeleteCorrection,
  onOpenImportModal,
  onOpenPrintReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [correctionNotes, setCorrectionNotes] = useState<Record<string, string>>({});

  const sortedCorrections = [...corrections].sort((a, b) =>
    a.status === 'Menunggu' && b.status !== 'Menunggu' ? -1 : b.status === 'Menunggu' && a.status !== 'Menunggu' ? 1 : 0
  );
  const pendingCorrections = corrections.filter((c) => c.status === 'Menunggu').length;

  const handleCorrectionStatus = async (c: DataCorrectionRequest, status: string) => {
    if (!onUpdateCorrection) return;
    try {
      const res = await onUpdateCorrection(c.id, status, correctionNotes[c.id] ?? c.adminNotes ?? '');
      if (res && res.success === false) alert(res.message || 'Gagal memperbarui permintaan koreksi');
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui. Periksa koneksi lalu coba lagi.');
    }
  };

  const handleDeleteCorrection = async (c: DataCorrectionRequest) => {
    if (!onDeleteCorrection) return;
    if (!window.confirm(`Hapus permintaan koreksi data dari "${c.memberName}"?`)) return;
    try {
      const res = await onDeleteCorrection(c.id);
      if (res && res.success === false) alert(res.message || 'Gagal menghapus permintaan koreksi');
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus. Periksa koneksi lalu coba lagi.');
    }
  };
  const [selectedRayon, setSelectedRayon] = useState('all');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const filteredMembers = members.filter((m) => {
    if (selectedRayon !== 'all' && m.rayonId !== selectedRayon) return false;
    if (selectedCat !== 'all' && m.categorialGroupId !== selectedCat) return false;
    if (selectedStatus !== 'all' && m.status !== selectedStatus) return false;

    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.memberNo.toLowerCase().includes(q) ||
      (m.nik && m.nik.includes(q)) ||
      (m.phone && m.phone.includes(q)) ||
      (m.address && m.address.toLowerCase().includes(q))
    );
  });

  const exportToCSV = () => {
    const headers = [
      'No Induk',
      'Nama Lengkap',
      'NIK',
      'Gender',
      'Tempat Lahir',
      'Tanggal Lahir',
      'Rayon',
      'Kategorial',
      'Baptis',
      'Sidi',
      'Nikah Gereja',
      'No HP',
      'Alamat',
      'Status',
    ];
    const rows = filteredMembers.map((m) => [
      `"${m.memberNo}"`,
      `"${m.fullName}"`,
      `"${m.nik || ''}"`,
      `"${m.gender}"`,
      `"${m.birthPlace}"`,
      `"${m.birthDate}"`,
      `"${m.rayonName || m.rayonId}"`,
      `"${m.categorialGroupName || m.categorialGroupId}"`,
      `"${m.baptismStatus}"`,
      `"${m.confirmationStatus}"`,
      `"${m.marriageChurchStatus}"`,
      `"${m.phone}"`,
      `"${m.address.replace(/"/g, '""')}"`,
      `"${m.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daftar_Jemaat_GMIT_Betel_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 shadow-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Database Administrasi Jemaat</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Total {filteredMembers.length} jemaat ditemukan dari {members.length} anggota terdaftar
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Tambah Jemaat</span>
          </button>

          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
            title="Impor dari Excel / CSV"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span>Impor Data</span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
            title="Unduh format CSV"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={onOpenPrintReport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
            title="Cetak format A4 resmi"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Cetak A4</span>
          </button>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-xl bg-[#090e1e] border border-amber-500/20 text-xs">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari Nama, No Induk, NIK..."
            className="w-full pl-9 pr-3 py-2 bg-[#050811] border border-slate-700 focus:border-amber-400 rounded-lg text-white outline-none transition-colors"
          />
        </div>

        {/* Filter Rayon */}
        <div>
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

        {/* Filter Kategorial */}
        <div>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full px-3 py-2 bg-[#050811] border border-slate-700 focus:border-amber-400 rounded-lg text-slate-200 outline-none"
          >
            <option value="all">Semua Kategorial GMIT</option>
            {categorials.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Status */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-[#050811] border border-slate-700 focus:border-amber-400 rounded-lg text-slate-200 outline-none"
          >
            <option value="all">Semua Status Keanggotaan</option>
            <option value="Aktif">Aktif</option>
            <option value="Pindah">Pindah Keluar</option>
            <option value="Meninggal">Meninggal Dunia</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl bg-[#0c1329] border border-amber-500/20 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#070b18] text-[11px] uppercase tracking-wider text-amber-400/90 border-b border-amber-500/20">
              <tr>
                <th className="py-3 px-4">No. Induk</th>
                <th className="py-3 px-4">Nama Lengkap & Panggilan</th>
                <th className="py-3 px-3">L/P</th>
                <th className="py-3 px-4">Usia / Tgl Lahir</th>
                <th className="py-3 px-4">Rayon & Kategorial</th>
                <th className="py-3 px-4 text-center">Sakramen</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Tidak ada data jemaat yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const age = calculateAge(member.birthDate);
                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-amber-300 whitespace-nowrap">
                        {member.memberNo}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {member.photoUrl ? (
                            <img
                              src={member.photoUrl}
                              alt={`Foto ${member.fullName}`}
                              className="w-10 h-12 object-cover rounded-md border border-amber-500/30 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-12 rounded-md border border-slate-700 bg-slate-900 flex items-center justify-center shrink-0" title="Belum ada foto — tambahkan lewat tombol Ubah">
                              <User className="w-5 h-5 text-slate-500" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-white">
                              {member.fullName}
                            </div>
                            {member.nickname && (
                              <div className="text-[11px] text-slate-400">
                                Panggilan: {member.nickname}
                              </div>
                            )}
                            {!member.photoUrl && (
                              <div className="text-[10px] text-amber-400/80">Belum ada foto</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-300">
                        {member.gender === 'Laki-laki' ? 'L' : 'P'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-white font-medium">{age} Tahun</div>
                        <div className="text-[11px] text-slate-400">
                          {formatDateDMY(member.birthDate)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-amber-400/90 font-medium truncate max-w-[140px]">
                          {member.rayonName || member.rayonId}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          {member.categorialGroupName || member.categorialGroupId}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5 text-[11px]">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              member.baptismStatus === 'Sudah'
                                ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                            title={`Baptis: ${member.baptismStatus}`}
                          >
                            B
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              member.confirmationStatus === 'Sudah'
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                            title={`Sidi: ${member.confirmationStatus}`}
                          >
                            S
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              member.marriageChurchStatus === 'Sudah'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                            title={`Nikah Kudus: ${member.marriageChurchStatus}`}
                          >
                            N
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            member.status === 'Aktif'
                              ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-700/50'
                              : member.status === 'Pindah'
                              ? 'bg-yellow-950/70 text-yellow-300 border border-yellow-700/50'
                              : 'bg-red-950/70 text-red-300 border border-red-700/50'
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenDetailModal(member)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-amber-300 hover:bg-slate-800 transition-colors"
                            title="Lihat Biodata & Kartu Jemaat"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenEditModal(member)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-blue-300 hover:bg-slate-800 transition-colors"
                            title="Ubah Data"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Apakah Anda yakin ingin menghapus data anggota ${member.fullName}?`)) {
                                onDeleteMember(member.id);
                              }
                            }}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                            title="Hapus / Arsipkan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="p-3 bg-[#070b18] border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span>Keterangan Sakramen:</span>
            <span className="text-cyan-300 font-semibold">B = Baptis</span>
            <span className="text-amber-300 font-semibold">S = Sidi</span>
            <span className="text-emerald-300 font-semibold">N = Nikah Kudus</span>
          </div>
          <div className="text-slate-400">
            Total {filteredMembers.length} Jemaat Tercatat
          </div>
        </div>
      </div>

      {/* Panel Permintaan Koreksi Data dari Portal Jemaat */}
      {onUpdateCorrection && (
        <div className="rounded-2xl bg-[#0c1329] border border-amber-500/20 overflow-hidden shadow-lg">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#070b18]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              Permintaan Koreksi Data Jemaat
            </h3>
            {pendingCorrections > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-bold">
                {pendingCorrections} menunggu ditindaklanjuti
              </span>
            )}
          </div>

          {sortedCorrections.length === 0 ? (
            <p className="px-5 py-6 text-center text-xs text-slate-500">
              Belum ada permintaan koreksi data dari jemaat melalui Portal Jemaat.
            </p>
          ) : (
            <div className="divide-y divide-slate-800">
              {sortedCorrections.map((c) => (
                <div key={c.id} className="px-5 py-4 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs">
                      <span className="font-bold text-white">{c.memberName}</span>
                      <span className="text-slate-500 ml-2">{formatDateDMY(c.requestDate)}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${
                        c.status === 'Disetujui'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                          : c.status === 'Ditolak'
                          ? 'bg-red-500/15 text-red-300 border-red-500/40'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/50 border border-slate-800 rounded-xl px-3 py-2.5">
                    {c.details}
                  </p>

                  {c.adminNotes && c.status !== 'Menunggu' && (
                    <p className="text-[11px] text-slate-400">
                      Catatan admin: <span className="text-slate-200 italic">{c.adminNotes}</span>
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={correctionNotes[c.id] ?? c.adminNotes ?? ''}
                      onChange={(e) => setCorrectionNotes((prev) => ({ ...prev, [c.id]: e.target.value }))}
                      placeholder="Catatan admin untuk jemaat (mis. data sudah diperbarui)"
                      className="flex-1 px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white text-xs outline-none focus:border-amber-400"
                    />
                    <div className="flex gap-1.5 shrink-0">
                      {c.status !== 'Disetujui' && (
                        <button
                          onClick={() => handleCorrectionStatus(c, 'Disetujui')}
                          className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-bold cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Setujui
                        </button>
                      )}
                      {c.status !== 'Ditolak' && (
                        <button
                          onClick={() => handleCorrectionStatus(c, 'Ditolak')}
                          className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-300 text-[11px] font-bold cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Tolak
                        </button>
                      )}
                      {c.status !== 'Menunggu' && (
                        <button
                          onClick={() => handleCorrectionStatus(c, 'Menunggu')}
                          className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold cursor-pointer"
                          title="Kembalikan status ke Menunggu"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Menunggu
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCorrection(c)}
                        className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-[11px] font-bold hover:bg-red-900/50 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="px-5 py-3 text-[11px] text-slate-500 border-t border-slate-800">
            Setelah menyetujui, perbarui data jemaat yang bersangkutan lewat tombol Ubah pada daftar di atas.
          </p>
        </div>
      )}
    </div>
  );
};
