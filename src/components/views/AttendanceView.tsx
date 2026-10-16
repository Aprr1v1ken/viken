import React, { useState } from 'react';
import { CheckSquare, Plus, Users, Calendar, Printer } from 'lucide-react';
import type { AttendanceRecord } from '../../types/index.ts';

interface AttendanceViewProps {
  attendance: AttendanceRecord[];
  onAddAttendance: (data: Partial<AttendanceRecord>) => Promise<void>;
  onOpenPrintReport: () => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  attendance,
  onAddAttendance,
  onOpenPrintReport,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('Kebaktian Minggu Pagi I');
  const [date, setDate] = useState('18-10-2026');
  const [maleCount, setMaleCount] = useState<number>(115);
  const [femaleCount, setFemaleCount] = useState<number>(140);
  const [childrenCount, setChildrenCount] = useState<number>(30);
  const [notes, setNotes] = useState('Ibadah berlangsung tertib');
  const [saving, setSaving] = useState(false);

  const totalCalculated = Number(maleCount) + Number(femaleCount) + Number(childrenCount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onAddAttendance({
        eventTitle,
        date,
        maleCount: Number(maleCount),
        femaleCount: Number(femaleCount),
        childrenCount: Number(childrenCount),
        totalCount: totalCalculated,
        notes,
        recordedBy: 'Tata Usaha / Dkn. Elisabeth Lopo',
      });
      setShowModal(false);
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
            <CheckSquare className="w-5 h-5 text-amber-400" />
            <span>Pencatatan Absensi & Statistik Kehadiran Ibadah</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Merekam data kehadiran jemaat pria, wanita, dan anak-anak sekolah minggu PAR
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Catat Absensi Ibadah</span>
          </button>
          <button
            onClick={onOpenPrintReport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-blue-400" />
            <span>Cetak Rekap</span>
          </button>
        </div>
      </div>

      {/* Attendance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {attendance.map((att) => (
          <div
            key={att.id}
            className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 hover:border-amber-400/40 transition-all space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-mono text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                {att.date}
              </span>
              <span className="text-xs text-slate-400">GMIT Betel</span>
            </div>

            <h3 className="text-base font-bold text-white">{att.eventTitle}</h3>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">Total Kehadiran</span>
                <span className="text-2xl font-mono font-bold text-amber-300 tabular-nums">
                  {att.totalCount} Jiwa
                </span>
              </div>
              <div className="text-right text-xs space-y-0.5 text-slate-300">
                <div>Laki-laki: <span className="font-mono text-white">{att.maleCount}</span></div>
                <div>Perempuan: <span className="font-mono text-white">{att.femaleCount}</span></div>
                <div>Anak/PAR: <span className="font-mono text-cyan-300">{att.childrenCount}</span></div>
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-1">
              Catatan: <span className="text-slate-300 italic">{att.notes || '-'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0b1226] border border-amber-500/30 rounded-3xl shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-amber-300">
              Input Absensi Kehadiran Ibadah
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Ibadah / Kebaktian *</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Contoh: Kebaktian Minggu Pagi I"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tanggal Ibadah (DD-MM-YYYY) *</label>
                <input
                  type="text"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Pria (L)</label>
                  <input
                    type="number"
                    min="0"
                    value={maleCount}
                    onChange={(e) => setMaleCount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Wanita (P)</label>
                  <input
                    type="number"
                    min="0"
                    value={femaleCount}
                    onChange={(e) => setFemaleCount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Anak / PAR</label>
                  <input
                    type="number"
                    min="0"
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <span className="font-semibold text-slate-300">Total Jiwa Terhitung:</span>
                <span className="text-base font-bold font-mono text-amber-400">{totalCalculated} Orang</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Catatan Ibadah</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Keterangan cuaca, perjamuan kudus, dll..."
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
                  {saving ? 'Menyimpan...' : 'Simpan Absensi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
