import React, { useRef } from 'react';
import { IMAGES } from '../assets/images.ts';
import { X, Printer, Download, BookOpen } from 'lucide-react';
import { formatRupiah, formatDateDMY, formatHariIniPanjangID } from '../utils/church-logic.ts';
import type { Member, Family, FinancialTransaction, Rayon, CategorialGroup } from '../types/index.ts';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'members' | 'rayons' | 'finance' | 'sacraments' | 'attendance';
  members: Member[];
  families: Family[];
  rayons: Rayon[];
  transactions: FinancialTransaction[];
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  reportType,
  members,
  families,
  rayons,
  transactions,
}) => {
  const [selectedType, setSelectedType] = React.useState(reportType);

  if (!isOpen) return null;

  const todayStr = formatHariIniPanjangID();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm print:p-0 print:bg-white">
      <div className="w-full max-w-4xl bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Modal Toolbar (hidden on print) */}
        <div className="flex items-center justify-between p-4 bg-[#0b1226] text-white border-b border-amber-500/30 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Pilih Laporan:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="px-2.5 py-1 text-xs bg-[#070c1b] border border-amber-500/40 rounded-lg text-amber-300 outline-none font-semibold"
            >
              <option value="members">1. Daftar Induk Anggota Jemaat</option>
              <option value="rayons">2. Rekapitulasi per Rayon Pelayanan</option>
              <option value="finance">3. Buku Laporan Kas Keuangan</option>
              <option value="sacraments">4. Buku Register Sakramen Kudus</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Dokumen A4</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document A4 Body */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 print:p-0 font-serif text-slate-900 leading-relaxed bg-white">
          {/* Official Kop Surat GMIT BETEL FUIMELANG */}
          <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
            <div className="w-20 h-20 shrink-0">
              <img
                src={IMAGES.crest}
                alt="Logo GMIT"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="text-center flex-1 px-4">
              <div className="text-sm font-bold uppercase tracking-wider font-sans">
                GEREJA MASEHI INJILI DI TIMOR (GMIT)
              </div>
              <div className="text-xs uppercase font-sans tracking-wide">
                (Gereja Anggota PGI) · SINODE GMIT KUPANG
              </div>
              <div className="text-base font-extrabold uppercase tracking-wide font-sans mt-0.5">
                KLASIS ALOR BARAT DAYA — MAJELIS JEMAAT BETEL FUIMELANG
              </div>
              <div className="text-[11px] font-sans text-slate-600 mt-0.5">
                Alamat: Jl. Raya Fuimelang - Moru, Desa Fuimelang, Kec. Alor Tengah Utara, Kab. Alor, Nusa Tenggara Timur
              </div>
            </div>

            <div className="w-20 shrink-0 text-right text-[10px] font-mono font-sans text-slate-500">
              SYSJEGER V2.0
            </div>
          </div>

          {/* Document Title */}
          <div className="text-center mb-6">
            <h2 className="text-base font-bold uppercase tracking-wide underline underline-offset-4">
              {selectedType === 'members' && 'LAPORAN INDUK DATA WARGA JEMAAT'}
              {selectedType === 'rayons' && 'LAPORAN REKAPITULASI PELAYANAN RAYON 1 - 5'}
              {selectedType === 'finance' && 'LAPORAN ADMINISTRASI BUKU KAS GEREJA'}
              {selectedType === 'sacraments' && 'LAPORAN REGISTER SAKRAMEN GEREJAWI'}
            </h2>
            <div className="text-xs font-sans text-slate-600 mt-1">
              GMIT Jemaat Betel Fuimelang · Klasis Alor Tengah Utara
            </div>
          </div>

          {/* Tables based on report type */}
          {selectedType === 'members' && (
            <div className="space-y-4">
              <table className="w-full text-left text-xs font-sans border-collapse border border-slate-300">
                <thead className="bg-slate-100 font-bold border-b border-slate-400">
                  <tr>
                    <th className="p-2 border border-slate-300">No</th>
                    <th className="p-2 border border-slate-300">No. Induk</th>
                    <th className="p-2 border border-slate-300">Nama Lengkap</th>
                    <th className="p-2 border border-slate-300">L/P</th>
                    <th className="p-2 border border-slate-300">Tgl Lahir</th>
                    <th className="p-2 border border-slate-300">Rayon</th>
                    <th className="p-2 border border-slate-300">Kategorial</th>
                    <th className="p-2 border border-slate-300">Baptis/Sidi</th>
                    <th className="p-2 border border-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m, i) => (
                    <tr key={m.id} className="border-b border-slate-200">
                      <td className="p-2 border border-slate-300 font-mono">{i + 1}</td>
                      <td className="p-2 border border-slate-300 font-mono text-[11px]">{m.memberNo}</td>
                      <td className="p-2 border border-slate-300 font-semibold">{m.fullName}</td>
                      <td className="p-2 border border-slate-300 text-center">{m.gender === 'Laki-laki' ? 'L' : 'P'}</td>
                      <td className="p-2 border border-slate-300">{formatDateDMY(m.birthDate)}</td>
                      <td className="p-2 border border-slate-300">{m.rayonName || 'Rayon 1'}</td>
                      <td className="p-2 border border-slate-300">{m.categorialGroupName || 'PAR'}</td>
                      <td className="p-2 border border-slate-300 text-center text-[10px]">
                        B: {m.baptismStatus} / S: {m.confirmationStatus}
                      </td>
                      <td className="p-2 border border-slate-300">{m.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="text-xs font-sans text-slate-600">
                Total Jemaat Tercatat: <span className="font-bold">{members.length} Jiwa</span>
              </div>
            </div>
          )}

          {selectedType === 'rayons' && (
            <div className="space-y-4">
              <table className="w-full text-left text-xs font-sans border-collapse border border-slate-300">
                <thead className="bg-slate-100 font-bold border-b border-slate-400">
                  <tr>
                    <th className="p-2 border border-slate-300">Kode</th>
                    <th className="p-2 border border-slate-300">Nama Rayon</th>
                    <th className="p-2 border border-slate-300">Penatua Koordinator</th>
                    <th className="p-2 border border-slate-300">Wilayah Cakupan</th>
                    <th className="p-2 border border-slate-300 text-right">Kepala Keluarga</th>
                    <th className="p-2 border border-slate-300 text-right">Total Jiwa</th>
                  </tr>
                </thead>
                <tbody>
                  {rayons.map((r) => {
                    const count = members.filter((m) => m.rayonId === r.id).length;
                    const famCount = families.filter((f) => f.rayonId === r.id).length;
                    return (
                      <tr key={r.id}>
                        <td className="p-2 border border-slate-300 font-mono font-bold">{r.code}</td>
                        <td className="p-2 border border-slate-300 font-semibold">{r.name}</td>
                        <td className="p-2 border border-slate-300">{r.leaderName}</td>
                        <td className="p-2 border border-slate-300">{r.coverageArea}</td>
                        <td className="p-2 border border-slate-300 text-right font-mono">{famCount} KK</td>
                        <td className="p-2 border border-slate-300 text-right font-mono font-bold">{count} Jiwa</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {selectedType === 'finance' && (
            <div className="space-y-4">
              <table className="w-full text-left text-xs font-sans border-collapse border border-slate-300">
                <thead className="bg-slate-100 font-bold border-b border-slate-400">
                  <tr>
                    <th className="p-2 border border-slate-300">No. Transaksi</th>
                    <th className="p-2 border border-slate-300">Tanggal</th>
                    <th className="p-2 border border-slate-300">Jenis</th>
                    <th className="p-2 border border-slate-300">Kategori Akun</th>
                    <th className="p-2 border border-slate-300">Uraian</th>
                    <th className="p-2 border border-slate-300 text-right">Jumlah (IDR)</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td className="p-2 border border-slate-300 font-mono text-[11px]">{t.txNo}</td>
                      <td className="p-2 border border-slate-300 font-mono">{t.txDate}</td>
                      <td className="p-2 border border-slate-300 font-semibold">{t.type}</td>
                      <td className="p-2 border border-slate-300">{t.category}</td>
                      <td className="p-2 border border-slate-300 text-slate-700">{t.description}</td>
                      <td className="p-2 border border-slate-300 text-right font-mono font-bold">
                        {formatRupiah(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedType === 'sacraments' && (
            <div className="space-y-4">
              <h3 className="font-bold text-xs font-sans uppercase">A. Rekapitulasi Status Sakramen</h3>
              <p className="text-xs font-sans text-slate-700 leading-relaxed">
                Seluruh pencatatan sakramen Baptisan Kudus, Peneguhan Sidi, dan Pernikahan Gerejawi telah disahkan dalam register resmi Jemaat Betel Fuimelang Klasis Alor Tengah Utara.
              </p>
            </div>
          )}

          {/* Official Signatures Section */}
          <div className="mt-12 pt-8 font-sans text-xs">
            <div className="text-right mb-6 text-slate-700">
              Fuimelang, {todayStr}
            </div>

            <div className="text-center font-bold text-slate-800 mb-8">
              MAJELIS JEMAAT GMIT BETEL FUIMELANG
            </div>

            <div className="grid grid-cols-2 gap-12 text-center">
              <div>
                <div className="text-slate-600 mb-16">
                  Ketua Majelis Jemaat / Pendeta
                </div>
                <div className="font-bold underline text-sm">
                  ( .................................... )
                </div>
                <div className="text-[11px] text-slate-600">
                  Nama jelas & tanda tangan
                </div>
              </div>

              <div>
                <div className="text-slate-600 mb-16">
                  Sekretaris Majelis Jemaat
                </div>
                <div className="font-bold underline text-sm">
                  ( .................................... )
                </div>
                <div className="text-[11px] text-slate-600">
                  Nama jelas & tanda tangan
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
