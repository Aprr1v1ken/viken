import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import type { Member, Rayon, CategorialGroup } from '../types/index.ts';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (members: Partial<Member>[]) => Promise<{ success: boolean; imported: number; failed: number; errors: string[] }>;
  rayons: Rayon[];
  categorials: CategorialGroup[];
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  rayons,
  categorials,
}) => {
  const [csvText, setCsvText] = useState('');
  const [previewData, setPreviewData] = useState<Partial<Member>[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; failed: number; errors: string[] } | null>(null);

  if (!isOpen) return null;

  const handleLoadSample = () => {
    const sample = `fullName,gender,birthDate,birthPlace,address,rayonId,categorialGroupId,phone
Yulius Doko,Laki-laki,1992-03-14,Fuimelang,Jl. Timor Raya RT 01,r1,c4,081239887711
Marta Doko-Kolly,Perempuan,1995-08-22,Kalabahi,Jl. Timor Raya RT 01,r1,c3,081239887712
Samuel Doko,Laki-laki,2018-11-05,Fuimelang,Jl. Timor Raya RT 01,r1,c1,`;
    setCsvText(sample);
    parseCSV(sample);
  };

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      setPreviewData([]);
      return;
    }
    const headers = lines[0].split(',').map((h) => h.trim());
    const parsed: Partial<Member>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      if (cols.length >= 3 && cols[0]) {
        const item: any = {
          fullName: cols[0],
          gender: cols[1] || 'Laki-laki',
          birthDate: cols[2] || '1990-01-01',
          birthPlace: cols[3] || 'Fuimelang',
          address: cols[4] || 'Fuimelang',
          rayonId: cols[5] || rayons[0]?.id || 'r1',
          categorialGroupId: cols[6] || categorials[0]?.id || 'c1',
          phone: cols[7] || '',
          familyRole: 'Anggota',
          maritalStatus: 'Belum Menikah',
          membershipStatus: 'Tetap',
          baptismStatus: 'Sudah',
          confirmationStatus: 'Belum',
          marriageChurchStatus: 'Belum',
          status: 'Aktif',
        };
        parsed.push(item);
      }
    }
    setPreviewData(parsed);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCsvText(e.target.value);
    parseCSV(e.target.value);
  };

  const handleStartImport = async () => {
    if (previewData.length === 0) return;
    setImporting(true);
    setResult(null);
    try {
      const res = await onImport(previewData);
      setResult({
        imported: res.imported,
        failed: res.failed,
        errors: res.errors || [],
      });
    } catch (err: any) {
      setResult({ imported: 0, failed: previewData.length, errors: [err.message] });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-[#0b1226] border border-amber-500/30 rounded-3xl shadow-2xl p-6 text-xs text-slate-100 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/20 mb-4">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Impor Data Jemaat dari Format CSV / Excel
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-slate-300">
              Tempelkan data CSV berformat: <code className="text-amber-400 font-mono text-[11px]">fullName,gender,birthDate,birthPlace,address,rayonId,categorialGroupId,phone</code>
            </p>
            <button
              onClick={handleLoadSample}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-semibold transition-colors shrink-0"
            >
              Muat Contoh CSV
            </button>
          </div>

          <textarea
            rows={5}
            value={csvText}
            onChange={handleTextChange}
            placeholder="Paste teks CSV disini..."
            className="w-full p-3 bg-[#050811] border border-slate-700 rounded-xl text-white font-mono text-[11px] outline-none focus:border-amber-400"
          />

          {previewData.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-200">
                <span>Pratinjau Data ({previewData.length} baris siap diimpor):</span>
              </div>
              <div className="rounded-xl border border-slate-800 overflow-hidden max-h-40 overflow-y-auto">
                <table className="w-full text-left text-[11px] text-slate-300">
                  <thead className="bg-[#070b18] text-amber-400 border-b border-slate-800">
                    <tr>
                      <th className="p-2">Nama</th>
                      <th className="p-2">Gender</th>
                      <th className="p-2">Tgl Lahir</th>
                      <th className="p-2">Rayon</th>
                      <th className="p-2">No HP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {previewData.map((d, i) => (
                      <tr key={i}>
                        <td className="p-2 font-semibold text-white">{d.fullName}</td>
                        <td className="p-2">{d.gender}</td>
                        <td className="p-2 font-mono">{d.birthDate}</td>
                        <td className="p-2">{d.rayonId}</td>
                        <td className="p-2 font-mono">{d.phone || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                result.failed === 0
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Hasil Impor: {result.imported} data berhasil disimpan ke database.</span>
              </div>
              {result.failed > 0 && (
                <div className="text-amber-400">
                  {result.failed} baris gagal:
                  <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[11px]">
                    {result.errors.map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-800 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            Tutup
          </button>
          <button
            type="button"
            disabled={importing || previewData.length === 0}
            onClick={handleStartImport}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            {importing ? 'Mengimpor...' : `Mulai Impor (${previewData.length} Data)`}
          </button>
        </div>
      </div>
    </div>
  );
};
