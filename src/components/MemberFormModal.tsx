import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { CalendarDatePicker } from './CalendarDatePicker.tsx';
import {
  STANDARD_EDUCATION_OPTIONS,
  STANDARD_OCCUPATION_OPTIONS,
  type Member,
  type Rayon,
  type CategorialGroup,
  type Family,
} from '../types/index.ts';

interface MemberFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Member>) => Promise<void>;
  member?: Member | null;
  rayons: Rayon[];
  categorials: CategorialGroup[];
  families: Family[];
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  member,
  rayons,
  categorials,
  families,
}) => {
  const [activeTab, setActiveTab] = useState<'diri' | 'alamat' | 'gereja' | 'sakramen' | 'keluarga' | 'catatan'>('diri');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Partial<Member>>({
    fullName: '',
    nickname: '',
    nik: '',
    familyCardNo: '',
    familyId: '',
    familyRole: 'Anggota' as any,
    gender: 'Laki-laki',
    birthPlace: 'Fuimelang',
    birthDate: '1995-01-01',
    address: 'Jl. Timor Raya No. 12',
    kelurahan: 'Fuimelang',
    kecamatan: 'Alor Tengah Utara',
    kabupaten: 'Alor',
    phone: '',
    email: '',
    maritalStatus: 'Belum Menikah',
    spouseName: '',
    rayonId: rayons[0]?.id || 'r1',
    categorialGroupId: categorials[0]?.id || 'c1',
    membershipStatus: 'Tetap',
    baptismStatus: 'Sudah',
    baptismDate: '',
    confirmationStatus: 'Belum',
    confirmationDate: '',
    marriageChurchStatus: 'Belum',
    marriageDate: '',
    education: 'SLTA / SMA / SMK / MA / Sederajat',
    occupation: 'Wiraswasta / Pedagang',
    status: 'Aktif',
    notes: '',
  });

  useEffect(() => {
    if (member) {
      setFormData({ ...member });
    } else {
      setFormData({
        fullName: '',
        nickname: '',
        nik: '',
        familyCardNo: '',
        familyId: families[0]?.id || '',
        familyRole: 'Anak',
        gender: 'Laki-laki',
        birthPlace: 'Fuimelang',
        birthDate: '1995-01-01',
        address: 'Desa Fuimelang RT 01',
        kelurahan: 'Fuimelang',
        kecamatan: 'Alor Tengah Utara',
        kabupaten: 'Alor',
        phone: '',
        email: '',
        maritalStatus: 'Belum Menikah',
        spouseName: '',
        rayonId: rayons[0]?.id || 'r1',
        categorialGroupId: categorials[0]?.id || 'c1',
        membershipStatus: 'Tetap',
        baptismStatus: 'Sudah',
        baptismDate: '',
        confirmationStatus: 'Belum',
        confirmationDate: '',
        marriageChurchStatus: 'Belum',
        marriageDate: '',
        education: 'SLTA / SMA / SMK / MA / Sederajat',
        occupation: 'Wiraswasta / Pedagang',
        status: 'Aktif',
        notes: '',
      });
    }
    setError('');
    setActiveTab('diri');
  }, [member, isOpen, rayons, categorials, families]);

  if (!isOpen) return null;

  const handleChange = (field: keyof Member, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      setError('Nama lengkap wajib diisi minimal 2 karakter');
      setActiveTab('diri');
      return;
    }
    if (!formData.birthDate) {
      setError('Tanggal lahir wajib diisi melalui sistem kalender');
      setActiveTab('diri');
      return;
    }
    if (formData.nik && formData.nik.trim().length > 0 && formData.nik.trim().length !== 16) {
      setError(`Nomor Induk Kependudukan (NIK) tidak boleh kurang atau lebih dari 16 angka (saat ini ${formData.nik.trim().length} angka)`);
      setActiveTab('diri');
      return;
    }

    setError('');
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-[#0b1226] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-amber-500/20 bg-[#070b18]">
          <div>
            <h3 className="text-base font-bold text-amber-300">
              {member ? 'Ubah Data Jemaat' : 'Pendaftaran Anggota Jemaat Baru'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              GMIT BETEL FUIMELANG · KLASIS ALOR TENGAH UTARA
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-800 bg-[#090e1e] px-4 overflow-x-auto text-xs">
          {[
            { id: 'diri', label: '1. Data Diri' },
            { id: 'alamat', label: '2. Tempat Tinggal' },
            { id: 'gereja', label: '3. Keanggotaan' },
            { id: 'sakramen', label: '4. Sakramen' },
            { id: 'keluarga', label: '5. Hub. Keluarga' },
            { id: 'catatan', label: '6. Catatan' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-3 px-4 font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === t.id
                  ? 'border-amber-400 text-amber-300 bg-amber-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tab 1: Data Diri */}
          {activeTab === 'diri' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">
                  Nama Lengkap (Sesuai Akta / KTP) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="Contoh: Daniel Christian Tefa"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nama Panggilan / Akrab
                </label>
                <input
                  type="text"
                  value={formData.nickname || ''}
                  onChange={(e) => handleChange('nickname', e.target.value)}
                  placeholder="Contoh: Dani"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-300">
                    Nomor Induk Kependudukan (NIK)
                  </label>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                    (formData.nik || '').length === 16 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                      : (formData.nik || '').length > 0 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-500'
                  }`}>
                    {(formData.nik || '').length}/16 angka
                  </span>
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={16}
                  value={formData.nik || ''}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 16);
                    handleChange('nik', digitsOnly);
                  }}
                  placeholder="Wajib tepat 16 digit angka (contoh: 530501xxxxxxxxxx)"
                  className={`w-full px-3 py-2 bg-[#050811] border rounded-lg text-white outline-none font-mono tracking-wider ${
                    (formData.nik || '').length === 16 
                      ? 'border-emerald-500 focus:border-emerald-400' 
                      : (formData.nik || '').length > 0 
                      ? 'border-amber-500 focus:border-amber-400'
                      : 'border-slate-700 focus:border-amber-400'
                  }`}
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  {(formData.nik || '').length === 16 ? (
                    <span className="text-emerald-400 font-medium">✓ NIK valid tepat 16 digit angka</span>
                  ) : (formData.nik || '').length > 0 ? (
                    <span className="text-amber-400">
                      {(formData.nik || '').length < 16 
                        ? `Kurang ${16 - (formData.nik || '').length} digit angka lagi` 
                        : 'Harus tepat 16 digit'}
                    </span>
                  ) : (
                    <span>16 digit angka sesuai e-KTP / Kartu Keluarga</span>
                  )}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Jenis Kelamin *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  value={formData.birthPlace || ''}
                  onChange={(e) => handleChange('birthPlace', e.target.value)}
                  placeholder="Contoh: Fuimelang / Kalabahi"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
                />
              </div>

              {/* Tanggal Lahir dengan Sistem Kalender Otomatis */}
              <div>
                <CalendarDatePicker
                  value={formData.birthDate || '1995-01-01'}
                  onChange={(val) => handleChange('birthDate', val)}
                  label="Tanggal Lahir (Sistem Kalender Otomatis)"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Status Perkawinan
                </label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => handleChange('maritalStatus', e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
                >
                  <option value="Belum Menikah">Belum Menikah</option>
                  <option value="Menikah">Menikah</option>
                  <option value="Duda">Duda</option>
                  <option value="Janda">Janda</option>
                </select>
              </div>

              {/* Pendidikan Terakhir - Standar Nasional RI */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Pendidikan Terakhir (Standar Kemendagri / BPS RI)
                </label>
                <select
                  value={formData.education || STANDARD_EDUCATION_OPTIONS[4]}
                  onChange={(e) => handleChange('education', e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none text-xs"
                >
                  {STANDARD_EDUCATION_OPTIONS.map((edu) => (
                    <option key={edu} value={edu}>
                      {edu}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pekerjaan / Profesi - Standar KTP RI */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Pekerjaan / Profesi (Standar KTP RI)
                </label>
                <select
                  value={formData.occupation || STANDARD_OCCUPATION_OPTIONS[11]}
                  onChange={(e) => handleChange('occupation', e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none text-xs"
                >
                  {STANDARD_OCCUPATION_OPTIONS.map((job) => (
                    <option key={job} value={job}>
                      {job}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Tab 2: Tempat Tinggal & Kontak */}
          {activeTab === 'alamat' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">
                  Alamat Lengkap (RT/RW / Jalan)
                </label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Contoh: Jl. Timor Raya No. 12 RT 02/RW 01"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Desa / Kelurahan
                </label>
                <input
                  type="text"
                  value={formData.kelurahan || ''}
                  onChange={(e) => handleChange('kelurahan', e.target.value)}
                  placeholder="Fuimelang"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Kecamatan
                </label>
                <input
                  type="text"
                  value={formData.kecamatan || ''}
                  onChange={(e) => handleChange('kecamatan', e.target.value)}
                  placeholder="Alor Tengah Utara"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Kabupaten
                </label>
                <input
                  type="text"
                  value={formData.kabupaten || ''}
                  onChange={(e) => handleChange('kabupaten', e.target.value)}
                  placeholder="Alor"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="nama@gmail.com"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
                />
              </div>
            </div>
          )}

          {/* Tab 3: Keanggotaan */}
          {activeTab === 'gereja' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Rayon Pelayanan GMIT Betel *
                </label>
                <select
                  value={formData.rayonId}
                  onChange={(e) => handleChange('rayonId', e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
                >
                  {rayons.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Kelompok Kategorial GMIT *
                </label>
                <select
                  value={formData.categorialGroupId}
                  onChange={(e) => handleChange('categorialGroupId', e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
                >
                  {categorials.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Status Keanggotaan Gerejawi
                </label>
                <select
                  value={formData.membershipStatus}
                  onChange={(e) => handleChange('membershipStatus', e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
                >
                  <option value="Tetap">Tetap</option>
                  <option value="Tamu">Tamu</option>
                  <option value="Titipan">Titipan (Atestasi Sementara)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Status Hidup / Keberadaan
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Pindah">Pindah Keluar</option>
                  <option value="Meninggal">Meninggal Dunia</option>
                </select>
              </div>
            </div>
          )}

          {/* Tab 4: Sakramen */}
          {activeTab === 'sakramen' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="font-bold text-cyan-300">Sakramen Baptisan Kudus</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Status Baptis</label>
                    <select
                      value={formData.baptismStatus}
                      onChange={(e) => handleChange('baptismStatus', e.target.value)}
                      className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                    >
                      <option value="Sudah">Sudah Dibaptis</option>
                      <option value="Belum">Belum Dibaptis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Tanggal Baptis</label>
                    <input
                      type="date"
                      value={formData.baptismDate || ''}
                      onChange={(e) => handleChange('baptismDate', e.target.value)}
                      className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="font-bold text-amber-300">Pengakuan Iman / Peneguhan Sidi</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Status Sidi</label>
                    <select
                      value={formData.confirmationStatus}
                      onChange={(e) => handleChange('confirmationStatus', e.target.value)}
                      className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                    >
                      <option value="Sudah">Sudah Mengaku Percaya (Sidi)</option>
                      <option value="Belum">Belum Sidi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Tanggal Peneguhan Sidi</label>
                    <input
                      type="date"
                      value={formData.confirmationDate || ''}
                      onChange={(e) => handleChange('confirmationDate', e.target.value)}
                      className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="font-bold text-emerald-300">Pemberkatan Pernikahan Kudus</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Pernikahan Gerejawi</label>
                    <select
                      value={formData.marriageChurchStatus}
                      onChange={(e) => handleChange('marriageChurchStatus', e.target.value)}
                      className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                    >
                      <option value="Sudah">Sudah Diberkati di Gereja</option>
                      <option value="Belum">Belum / Tidak</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-400 mb-1">Tanggal Pemberkatan Nikah</label>
                    <input
                      type="date"
                      value={formData.marriageDate || ''}
                      onChange={(e) => handleChange('marriageDate', e.target.value)}
                      className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Keluarga & Hubungan */}
          {activeTab === 'keluarga' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Pilih Kartu Keluarga (KK)
                </label>
                <select
                  value={formData.familyId || ''}
                  onChange={(e) => handleChange('familyId', e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
                >
                  <option value="">-- Belum Terdaftar di KK --</option>
                  {families.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.familyNo} - Kel. {f.headOfFamilyName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Hubungan dalam Keluarga
                </label>
                <select
                  value={formData.familyRole}
                  onChange={(e) => handleChange('familyRole', e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
                >
                  <option value="Kepala Keluarga">Kepala Keluarga</option>
                  <option value="Istri">Istri</option>
                  <option value="Anak">Anak</option>
                  <option value="Orang Tua">Orang Tua (Ayah / Ibu)</option>
                  <option value="Famili Lain">Famili Lain</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">
                  Nama Pasangan (Suami / Istri) jika ada
                </label>
                <input
                  type="text"
                  value={formData.spouseName || ''}
                  onChange={(e) => handleChange('spouseName', e.target.value)}
                  placeholder="Contoh: Maria Tefa-Bello"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
                />
              </div>
            </div>
          )}

          {/* Tab 6: Catatan */}
          {activeTab === 'catatan' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Catatan Pastoral & Administrasi (Akses Terbatas)
                </label>
                <textarea
                  rows={4}
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Catatan pelayanan, riwayat kunjungan pastoral, atau kebutuhan khusus jemaat..."
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white focus:border-amber-400 outline-none"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Menyimpan...' : 'Simpan Data Jemaat'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
