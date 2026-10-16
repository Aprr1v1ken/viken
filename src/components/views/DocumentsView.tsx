import React, { useState } from 'react';
import { FolderArchive, Plus, Search, FileText, Download, ShieldCheck, Lock } from 'lucide-react';
import type { DocumentRecord } from '../../types/index.ts';

interface DocumentsViewProps {
  documents: DocumentRecord[];
  onAddDocument: (data: Partial<DocumentRecord>) => Promise<void>;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  onAddDocument,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<any>('Warta Gereja');
  const [accessLevel, setAccessLevel] = useState<any>('Publik');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('1.5 MB');
  const [saving, setSaving] = useState(false);

  const filtered = documents.filter((d) => {
    if (selectedCategory !== 'all' && d.category !== selectedCategory) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.docNo.toLowerCase().includes(q) ||
      d.fileName.toLowerCase().includes(q)
    );
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onAddDocument({
        title,
        category,
        accessLevel,
        fileName: fileName || `${title.replace(/\s+/g, '_')}.pdf`,
        fileSize,
      });
      setShowModal(false);
      setTitle('');
      setFileName('');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = (doc: DocumentRecord) => {
    // Generate a simple client downloadable text blob representation of the church document
    const content = `GEREJA MASEHI INJILI DI TIMOR (GMIT)\nKLASIS ALOR BARAT DAYA - JEMAAT BETEL FUIMELANG\n\nDOKUMEN RESMI GEREJA\nNomor: ${doc.docNo}\nJudul: ${doc.title}\nKategori: ${doc.category}\nTingkat Akses: ${doc.accessLevel}\nTanggal Unggah: ${doc.uploadDate}\n\nDokumen ini merupakan arsip terverifikasi dalam Sistem Informasi Manajemen Jemaat dan Gereja (SYSJEGER V2.0).`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 shadow-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-amber-400" />
            <span>Penyimpanan Dokumen Digital & Arsip Gereja</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Arsip digital surat sakramen, warta jemaat, surat keputusan, dan dokumen kepengurusan
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Unggah Dokumen Baru</span>
        </button>
      </div>

      {/* Filter strip */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl bg-[#090e1e] border border-amber-500/20 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari judul dokumen, nomor dokumen, nama file..."
            className="w-full pl-9 pr-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none focus:border-amber-400"
          />
        </div>

        <div className="w-full sm:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none focus:border-amber-400"
          >
            <option value="all">Semua Kategori Dokumen</option>
            <option value="Surat Baptis">Surat Baptis</option>
            <option value="Surat Sidi">Surat Sidi</option>
            <option value="Surat Nikah Gerejawi">Surat Nikah Gerejawi</option>
            <option value="Surat Pindah">Surat Pindah (Atestasi)</option>
            <option value="Warta Gereja">Warta Gereja</option>
            <option value="SK Majelis">SK Majelis</option>
            <option value="Laporan Keuangan">Laporan Keuangan</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="rounded-2xl bg-[#0c1329] border border-amber-500/20 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#070b18] text-[11px] uppercase tracking-wider text-amber-400 border-b border-amber-500/20">
              <tr>
                <th className="py-3 px-4">No. Dokumen</th>
                <th className="py-3 px-4">Nama Dokumen / Berkas</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Ukuran</th>
                <th className="py-3 px-4">Tgl Unggah</th>
                <th className="py-3 px-4 text-center">Hak Akses</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-mono font-medium text-amber-300">{d.docNo}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{d.title}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {d.fileName}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {d.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{d.fileSize}</td>
                  <td className="py-3 px-4 text-slate-300">{d.uploadDate}</td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        d.accessLevel === 'Publik'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : d.accessLevel === 'Majelis'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-purple-950 text-purple-300 border border-purple-800'
                      }`}
                    >
                      {d.accessLevel === 'Publik' ? (
                        <ShieldCheck className="w-3 h-3" />
                      ) : (
                        <Lock className="w-3 h-3" />
                      )}
                      <span>{d.accessLevel}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDownload(d)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                      title="Unduh Berkas"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Unduh</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Document Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0b1226] border border-amber-500/30 rounded-3xl shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-amber-300">
              Registrasi Dokumen Digital
            </h3>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Judul Dokumen *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Tata Ibadah Bulan Keluarga 2026"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Kategori Dokumen</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                >
                  <option value="Warta Gereja">Warta Gereja</option>
                  <option value="SK Majelis">SK Majelis</option>
                  <option value="Laporan Keuangan">Laporan Keuangan</option>
                  <option value="Surat Baptis">Surat Baptis</option>
                  <option value="Surat Sidi">Surat Sidi</option>
                  <option value="Surat Nikah Gerejawi">Surat Nikah Gerejawi</option>
                  <option value="Surat Pindah">Surat Pindah</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tingkat Hak Akses</label>
                <select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                >
                  <option value="Publik">Publik (Dapat diunduh seluruh jemaat)</option>
                  <option value="Majelis">Majelis (Khusus Presbiter Majelis Jemaat)</option>
                  <option value="Admin">Admin (Terbatas Tata Usaha)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama File Lampiran</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Contoh: Dokumen_Tata_Ibadah_2026.pdf"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none font-mono"
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
                  {saving ? 'Menyimpan...' : 'Simpan Dokumen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
