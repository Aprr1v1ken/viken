import React, { useState } from 'react';
import { BookOpen, Award, Heart, Plus, Search, Printer, CheckCircle2 } from 'lucide-react';
import { formatDateDMY } from '../../utils/church-logic.ts';
import type { BaptismRecord, ConfirmationRecord, MarriageRecord, Member } from '../../types/index.ts';

interface SacramentsViewProps {
  baptisms: BaptismRecord[];
  confirmations: ConfirmationRecord[];
  marriages: MarriageRecord[];
  members: Member[];
  onOpenAddBaptism: () => void;
  onOpenAddConfirmation: () => void;
  onOpenAddMarriage: () => void;
  onPrintCertificate: (type: string, record: any) => void;
}

export const SacramentsView: React.FC<SacramentsViewProps> = ({
  baptisms,
  confirmations,
  marriages,
  members,
  onOpenAddBaptism,
  onOpenAddConfirmation,
  onOpenAddMarriage,
  onPrintCertificate,
}) => {
  const [activeTab, setActiveTab] = useState<'baptis' | 'sidi' | 'nikah'>('baptis');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 shadow-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>Buku Registrasi Sakramen Kudus & Peristiwa Iman</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pencatatan sakramen Baptisan Kudus, Peneguhan Sidi, dan Pernikahan Gerejawi GMIT Betel Fuimelang
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'baptis' && (
            <button
              onClick={onOpenAddBaptism}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Baptisan</span>
            </button>
          )}
          {activeTab === 'sidi' && (
            <button
              onClick={onOpenAddConfirmation}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Peneguhan Sidi</span>
            </button>
          )}
          {activeTab === 'nikah' && (
            <button
              onClick={onOpenAddMarriage}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Pernikahan Kudus</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-[#090e1e] p-1 rounded-xl text-xs gap-1">
        <button
          onClick={() => setActiveTab('baptis')}
          className={`flex-1 py-2.5 px-4 font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'baptis'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>1. Baptisan Kudus ({baptisms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sidi')}
          className={`flex-1 py-2.5 px-4 font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'sidi'
              ? 'bg-amber-950 text-amber-300 border border-amber-800/80 shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>2. Peneguhan Sidi ({confirmations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('nikah')}
          className={`flex-1 py-2.5 px-4 font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'nikah'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>3. Pernikahan Gerejawi ({marriages.length})</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Cari berdasarkan nama, nomor registrasi, sertifikat..."
          className="w-full pl-9 pr-3 py-2 text-xs bg-[#090e1e] border border-slate-800 rounded-xl text-white outline-none focus:border-amber-400"
        />
      </div>

      {/* Tables based on active tab */}
      {activeTab === 'baptis' && (
        <div className="rounded-2xl bg-[#0c1329] border border-slate-800 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#070b18] text-[11px] uppercase tracking-wider text-cyan-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">No. Register</th>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">Tanggal & Tempat Baptis</th>
                  <th className="py-3 px-4">Orang Tua / Saksi</th>
                  <th className="py-3 px-4">Pelayan / Pendeta</th>
                  <th className="py-3 px-4">No. Sertifikat</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {baptisms.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-cyan-300 font-semibold">{b.registerNo}</td>
                    <td className="py-3 px-4 font-bold text-white">{b.memberName}</td>
                    <td className="py-3 px-4">
                      <div className="text-white font-medium">{formatDateDMY(b.baptismDate)}</div>
                      <div className="text-[11px] text-slate-400">{b.churchPlace}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{b.parentNames || b.witnesses || '-'}</td>
                    <td className="py-3 px-4 font-medium text-slate-200">{b.ministerName}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{b.certificateNo}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onPrintCertificate('baptis', b)}
                        className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold transition-colors"
                      >
                        Cetak Akta
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'sidi' && (
        <div className="rounded-2xl bg-[#0c1329] border border-slate-800 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#070b18] text-[11px] uppercase tracking-wider text-amber-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">No. Register</th>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-4">Tanggal Peneguhan Sidi</th>
                  <th className="py-3 px-4">Ayat Bimbingan / Alkitab</th>
                  <th className="py-3 px-4">Pelayan / Pendeta</th>
                  <th className="py-3 px-4">No. Surat Sidi</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {confirmations.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-amber-300 font-semibold">{c.registerNo}</td>
                    <td className="py-3 px-4 font-bold text-white">{c.memberName}</td>
                    <td className="py-3 px-4">
                      <div className="text-white font-medium">{formatDateDMY(c.confirmationDate)}</div>
                      <div className="text-[11px] text-slate-400">{c.churchPlace}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-amber-400">{c.bibleVerse || 'Matius 28:20'}</td>
                    <td className="py-3 px-4 font-medium text-slate-200">{c.ministerName}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{c.certificateNo}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onPrintCertificate('sidi', c)}
                        className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold transition-colors"
                      >
                        Cetak Akta
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'nikah' && (
        <div className="rounded-2xl bg-[#0c1329] border border-slate-800 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#070b18] text-[11px] uppercase tracking-wider text-emerald-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">No. Register</th>
                  <th className="py-3 px-4">Kedua Mempelai</th>
                  <th className="py-3 px-4">Tanggal Pemberkatan</th>
                  <th className="py-3 px-4">Saksi-saksi</th>
                  <th className="py-3 px-4">Pelayan / Pendeta</th>
                  <th className="py-3 px-4">No. Akta Nikah</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {marriages.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-emerald-300 font-semibold">{m.registerNo}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{m.groomName}</div>
                      <div className="text-[11px] text-emerald-400">& {m.brideName}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-white font-medium">{formatDateDMY(m.blessingDate)}</div>
                      <div className="text-[11px] text-slate-400">{m.churchPlace}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{m.witnessNames || '-'}</td>
                    <td className="py-3 px-4 font-medium text-slate-200">{m.ministerName}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{m.certificateNo}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onPrintCertificate('nikah', m)}
                        className="px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 font-semibold transition-colors"
                      >
                        Cetak Akta
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
