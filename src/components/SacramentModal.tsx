import React, { useState, useEffect } from 'react';
import { X, BookOpen, Award, Heart, Save, AlertCircle } from 'lucide-react';
import type { Member } from '../types/index.ts';

interface SacramentModalProps {
  isOpen: boolean;
  type: 'baptis' | 'sidi' | 'nikah';
  record?: any | null;
  onClose: () => void;
  members: Member[];
  onSaveBaptism: (data: any) => Promise<void>;
  onSaveConfirmation: (data: any) => Promise<void>;
  onSaveMarriage: (data: any) => Promise<void>;
}

export const SacramentModal: React.FC<SacramentModalProps> = ({
  isOpen,
  type,
  record,
  onClose,
  members,
  onSaveBaptism,
  onSaveConfirmation,
  onSaveMarriage,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [minister, setMinister] = useState('');
  const [churchPlace, setChurchPlace] = useState('Gedung Kebaktian GMIT Betel Fuimelang');
  const [certificateNo, setCertificateNo] = useState('');
  const [extraField1, setExtraField1] = useState(''); // Parent names or bible verse or groom
  const [extraField2, setExtraField2] = useState(''); // Witnesses or bride
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Isi ulang formulir setiap modal dibuka (mode tambah / ubah)
  useEffect(() => {
    if (!isOpen) return;
    setError('');
    if (record) {
      setSelectedMemberId(record.memberId || '');
      setMinister(record.ministerName || '');
      setChurchPlace(record.churchPlace || 'Gedung Kebaktian GMIT Betel Fuimelang');
      setCertificateNo(record.certificateNo || '');
      if (type === 'baptis') {
        setDate(record.baptismDate || new Date().toISOString().substring(0, 10));
        setExtraField1(record.parentNames || '');
        setExtraField2(record.witnesses || '');
      } else if (type === 'sidi') {
        setDate(record.confirmationDate || new Date().toISOString().substring(0, 10));
        setExtraField1(record.bibleVerse || '');
        setExtraField2('');
      } else {
        setDate(record.blessingDate || new Date().toISOString().substring(0, 10));
        setExtraField1(record.groomName || '');
        setExtraField2(record.brideName || '');
      }
    } else {
      setSelectedMemberId('');
      setDate(new Date().toISOString().substring(0, 10));
      setMinister('');
      setChurchPlace('Gedung Kebaktian GMIT Betel Fuimelang');
      setCertificateNo('');
      setExtraField1('');
      setExtraField2('');
    }
  }, [isOpen, record, type]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (type === 'baptis') {
        const mem = members.find((m) => m.id === selectedMemberId);
        if (!mem) throw new Error('Silakan pilih anggota jemaat');
        await onSaveBaptism({
          memberId: mem.id,
          memberName: mem.fullName,
          birthDate: mem.birthDate,
          parentNames: extraField1 || mem.spouseName || 'Orang Tua Jemaat',
          baptismDate: date,
          churchPlace,
          ministerName: minister,
          certificateNo: certificateNo || `SB-GMIT-BF/${new Date().getFullYear()}/${Date.now().toString().slice(-3)}`,
          witnesses: extraField2,
        });
      } else if (type === 'sidi') {
        const mem = members.find((m) => m.id === selectedMemberId);
        if (!mem) throw new Error('Silakan pilih anggota jemaat');
        await onSaveConfirmation({
          memberId: mem.id,
          memberName: mem.fullName,
          confirmationDate: date,
          churchPlace,
          ministerName: minister,
          certificateNo: certificateNo || `SS-GMIT-BF/${new Date().getFullYear()}/${Date.now().toString().slice(-3)}`,
          bibleVerse: extraField1 || 'Yosua 1:9',
        });
      } else if (type === 'nikah') {
        if (!extraField1 || !extraField2) throw new Error('Nama pengantin pria dan wanita wajib diisi');
        await onSaveMarriage({
          groomName: extraField1,
          brideName: extraField2,
          blessingDate: date,
          churchPlace,
          ministerName: minister,
          certificateNo: certificateNo || `SN-GMIT-BF/${new Date().getFullYear()}/${Date.now().toString().slice(-3)}`,
          witnessNames: record?.witnessNames || '',
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan sakramen');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0b1226] border border-amber-500/30 rounded-3xl shadow-2xl p-6 text-xs text-slate-100 flex flex-col">
        <div className="flex items-center justify-between pb-4 border-b border-amber-500/20 mb-4">
          <div className="flex items-center gap-2">
            {type === 'baptis' && <BookOpen className="w-5 h-5 text-cyan-400" />}
            {type === 'sidi' && <Award className="w-5 h-5 text-amber-400" />}
            {type === 'nikah' && <Heart className="w-5 h-5 text-emerald-400" />}
            <h3 className="text-base font-bold text-white">
              {record ? 'Ubah ' : ''}
              {type === 'baptis' && 'Pencatatan Sakramen Baptisan Kudus'}
              {type === 'sidi' && 'Pencatatan Peneguhan Sidi (Pengakuan Iman)'}
              {type === 'nikah' && 'Pencatatan Pemberkatan Nikah Kudus'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {type !== 'nikah' ? (
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Pilih Anggota Jemaat *
              </label>
              <select
                required
                value={selectedMemberId}
                onChange={(e) => setSelectedMemberId(e.target.value)}
                className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
              >
                <option value="">-- Pilih Anggota Jemaat --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.fullName} ({m.memberNo}) - {m.rayonName || 'Rayon'}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nama Pengantin Pria *
                </label>
                <input
                  type="text"
                  required
                  value={extraField1}
                  onChange={(e) => setExtraField1(e.target.value)}
                  placeholder="Nama Lengkap Pengantin Pria"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nama Pengantin Wanita *
                </label>
                <input
                  type="text"
                  required
                  value={extraField2}
                  onChange={(e) => setExtraField2(e.target.value)}
                  placeholder="Nama Lengkap Pengantin Wanita"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>
            </>
          )}

          {type === 'baptis' && (
            <>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nama Orang Tua Kandung
                </label>
                <input
                  type="text"
                  value={extraField1}
                  onChange={(e) => setExtraField1(e.target.value)}
                  placeholder="Ayah & Ibu Kandung"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Saksi-saksi Baptis
                </label>
                <input
                  type="text"
                  value={extraField2}
                  onChange={(e) => setExtraField2(e.target.value)}
                  placeholder="Nama Saksi Baptis"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>
            </>
          )}

          {type === 'sidi' && (
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Ayat Bimbingan Alkitab (Nas Peneguhan)
              </label>
              <input
                type="text"
                value={extraField1}
                onChange={(e) => setExtraField1(e.target.value)}
                placeholder="Contoh: Yosua 1:9 / Mazmur 23:1"
                className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Tanggal Peristiwa *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Nomor Surat / Sertifikat
              </label>
              <input
                type="text"
                value={certificateNo}
                onChange={(e) => setCertificateNo(e.target.value)}
                placeholder="Otomatis jika kosong"
                className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none font-mono text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Pendeta / Pelayan Firman
            </label>
            <input
              type="text"
              value={minister}
              onChange={(e) => setMinister(e.target.value)}
              className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Tempat Penyelenggaraan
            </label>
            <input
              type="text"
              value={churchPlace}
              onChange={(e) => setChurchPlace(e.target.value)}
              className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
            >
              {saving ? 'Menyimpan...' : 'Catat Sakramen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
