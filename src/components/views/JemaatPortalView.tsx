import React, { useState } from 'react';
import {
  UserCheck,
  IdCard,
  Home,
  Calendar,
  Send,
  Printer,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { calculateAge, formatDateDMY } from '../../utils/church-logic.ts';
import type { Member, Family, ServiceSchedule, DataCorrectionRequest } from '../../types/index.ts';

interface JemaatPortalViewProps {
  currentMember: Member;
  family: Family | null;
  familyMembers: Member[];
  schedules: ServiceSchedule[];
  corrections: DataCorrectionRequest[];
  onSubmitCorrection: (details: string) => Promise<void>;
  onPrintCard: () => void;
}

export const JemaatPortalView: React.FC<JemaatPortalViewProps> = ({
  currentMember,
  family,
  familyMembers,
  schedules,
  corrections,
  onSubmitCorrection,
  onPrintCard,
}) => {
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const age = calculateAge(currentMember.birthDate);

  const handleSubmitCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details.trim()) return;
    setSubmitting(true);
    try {
      await onSubmitCorrection(details);
      setDetails('');
      setSuccessMsg('Permohonan koreksi data berhasil dikirimkan ke tata usaha jemaat.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0c1630] via-[#101b3b] to-[#0c1630] border border-amber-500/25 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-amber-400">
            PORTAL PELAYANAN WARGA JEMAAT
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Syalom, {currentMember.fullName}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Nomor Anggota: <span className="font-mono text-amber-300">{currentMember.memberNo}</span> · {currentMember.rayonName || 'Rayon 1'}
          </p>
        </div>

        <button
          onClick={onPrintCard}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Kartu Jemaat Digital</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Digital Card & Biodata */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Visual */}
          <div className="p-6 rounded-2xl bg-[#0c1329] border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <IdCard className="w-4 h-4 text-amber-400" />
                <span>Kartu Anggota Jemaat Digital</span>
              </h3>
              <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-semibold">
                STATUS: {currentMember.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5 text-slate-300">
                <div>
                  <span className="text-slate-400 text-[11px] block">Nama Lengkap:</span>
                  <span className="font-bold text-white text-sm">{currentMember.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Tempat, Tgl Lahir:</span>
                  <span>{currentMember.birthPlace}, {formatDateDMY(currentMember.birthDate)} ({age} thn)</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">NIK:</span>
                  <span className="font-mono">{currentMember.nik || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Alamat Tinggal:</span>
                  <span>{currentMember.address}, Fuimelang</span>
                </div>
              </div>

              <div className="space-y-1.5 text-slate-300">
                <div>
                  <span className="text-slate-400 text-[11px] block">Wilayah Pelayanan:</span>
                  <span className="font-semibold text-amber-300">{currentMember.rayonName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Kelompok Kategorial:</span>
                  <span>{currentMember.categorialGroupName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Status Sakramen:</span>
                  <span className="text-cyan-300 font-medium">
                    Baptis: {currentMember.baptismStatus} · Sidi: {currentMember.confirmationStatus}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">No. Telepon:</span>
                  <span className="font-mono">{currentMember.phone || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Family Members in Household */}
          <div className="p-6 rounded-2xl bg-[#0c1329] border border-amber-500/20 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Home className="w-4 h-4 text-amber-400" />
                <span>Susunan Keluarga Terdaftar (KK)</span>
              </h3>
              <span className="text-xs font-mono text-amber-400">
                {family ? family.familyNo : 'Belum dihubungkan'}
              </span>
            </div>

            {familyMembers.length === 0 ? (
              <p className="text-xs text-slate-400">Belum ada data anggota keluarga lain dalam KK ini.</p>
            ) : (
              <div className="divide-y divide-slate-800">
                {familyMembers.map((fm) => (
                  <div key={fm.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">{fm.fullName}</span>
                      <span className="text-[11px] text-slate-400 ml-2">({fm.familyRole})</span>
                    </div>
                    <div className="text-slate-300 font-mono text-[11px]">
                      {fm.gender} · {calculateAge(fm.birthDate)} thn
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Correction Requests & Duty Schedules */}
        <div className="space-y-6">
          {/* Form Ajukan Koreksi Biodata */}
          <div className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Ajukan Pembaruan Data Jemaat</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Ada perubahan nomor HP, alamat, kelahiran anak baru, atau status sakramen? Kirimkan permohonan ke tata usaha gereja.
            </p>

            {successMsg && (
              <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitCorrection} className="space-y-3 text-xs">
              <textarea
                rows={3}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Jelaskan perubahan data yang ingin diperbarui..."
                className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Mengirim...' : 'Kirim Permohonan'}</span>
              </button>
            </form>

            {/* Riwayat Pengajuan */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Riwayat Pengajuan:
              </span>
              {corrections.length === 0 ? (
                <div className="text-[11px] text-slate-500">Belum ada pengajuan pembaruan data.</div>
              ) : (
                corrections.map((c) => (
                  <div key={c.id} className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">{c.requestDate}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          c.status === 'Disetujui'
                            ? 'bg-emerald-950 text-emerald-400'
                            : c.status === 'Menunggu'
                            ? 'bg-amber-950 text-amber-400'
                            : 'bg-red-950 text-red-400'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <div className="text-slate-300">{c.details}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Jadwal Pelayanan Terdekat */}
          <div className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Jadwal Ibadah Minggu Terdekat</span>
            </h3>
            {schedules.slice(0, 2).map((s) => (
              <div key={s.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-amber-400">{s.serviceName}</div>
                <div className="text-[11px] text-slate-400">Tanggal: {s.serviceDate}</div>
                <div className="text-[11px] text-slate-300">Pengkhotbah: {s.preacher}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
