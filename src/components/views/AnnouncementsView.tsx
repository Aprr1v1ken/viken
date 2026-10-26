import React, { useState } from 'react';
import { FileText, Plus, Pin, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import type { Announcement } from '../../types/index.ts';

interface AnnouncementsViewProps {
  announcements: Announcement[];
  onSaveAnnouncement: (data: Partial<Announcement>, id?: string) => Promise<any>;
  onDeleteAnnouncement: (id: string) => Promise<any>;
}

export const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({
  announcements,
  onSaveAnnouncement,
  onDeleteAnnouncement,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [author, setAuthor] = useState('');

  const openAdd = () => {
    setEditing(null);
    setTitle('');
    setCategory('Warta Ibadah');
    setContent('');
    setIsImportant(false);
    setAuthor('');
    setShowModal(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    setTitle(a.title);
    setCategory(a.category);
    setContent(a.content);
    setIsImportant(!!a.isImportant);
    setAuthor(a.author || '');
    setShowModal(true);
  };

  const handleDelete = async (a: Announcement) => {
    if (!window.confirm(`Hapus warta "${a.title}"? Warta ini tidak lagi tampil untuk jemaat.`)) return;
    try {
      const res = await onDeleteAnnouncement(a.id);
      if (res && res.success === false) alert(res.message || 'Gagal menghapus warta');
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus. Periksa koneksi lalu coba lagi.');
    }
  };
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<any>('Warta Ibadah');
  const [content, setContent] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    try {
      const res = await onSaveAnnouncement(
        {
          title,
          category,
          content,
          isImportant,
          author: author || 'Majelis Jemaat',
        },
        editing?.id
      );
      if (res && res.success === false) {
        alert(res.message || 'Gagal menyimpan warta');
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
            <FileText className="w-5 h-5 text-amber-400" />
            <span>Penerbitan Warta Jemaat & Informasi Pelayanan</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Publikasi warta mingguan, pengumuman pernikahan gereja, berita sukacita dan dukacita
          </p>
        </div>

        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Terbitkan Warta Baru</span>
        </button>
      </div>

      {announcements.length === 0 && (
        <div className="p-8 rounded-2xl bg-[#0c1329] border border-dashed border-slate-700 text-center text-sm text-slate-400">
          Belum ada warta jemaat yang diterbitkan.
        </div>
      )}

      {/* Announcements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {announcements.map((a) => (
          <div
            key={a.id}
            className={`p-5 rounded-2xl bg-[#0c1329] border transition-all space-y-3 flex flex-col justify-between ${
              a.isImportant ? 'border-amber-400 shadow-amber-500/10 shadow-lg' : 'border-amber-500/20'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30 text-[10px]">
                  {a.category}
                </span>
                <span className="text-slate-400 text-[11px] font-mono">{a.date}</span>
              </div>

              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {a.isImportant && <Pin className="w-4 h-4 text-amber-400 shrink-0" />}
                <span>{a.title}</span>
              </h3>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                {a.content}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between gap-2">
              <div>
                Oleh: <span className="text-slate-200 font-medium">{a.author}</span>
                <span className="text-emerald-400 inline-flex items-center gap-1 font-semibold ml-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Terbit</span>
                </span>
              </div>
              <span className="flex items-center gap-1.5">
                <button
                  onClick={() => openEdit(a)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" /> Ubah
                </button>
                <button
                  onClick={() => handleDelete(a)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-[11px] font-semibold hover:bg-red-900/50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </button>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0b1226] border border-amber-500/30 rounded-3xl shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-amber-300">
              {editing ? 'Ubah Warta Jemaat' : 'Terbitkan Warta Jemaat Baru'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Judul Warta *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Judul warta"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Kategori Warta</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                >
                  <option value="Warta Ibadah">Warta Ibadah</option>
                  <option value="Pengumuman Nikah">Pengumuman Nikah (Pernikahan Kudus)</option>
                  <option value="Berita Sukacita">Berita Sukacita (Kelahiran/Kelulusan)</option>
                  <option value="Berita Dukacita">Berita Dukacita (Kedukaan)</option>
                  <option value="Keuangan">Warta Keuangan & Kolekte</option>
                  <option value="Umum">Umum</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Isi Warta / Pengumuman *</label>
                <textarea
                  rows={4}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tuliskan isi pengumuman secara rinci..."
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Ditulis Oleh</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Nama/jabatan penulis warta"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="imp"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="rounded border-slate-700"
                />
                <label htmlFor="imp" className="text-slate-300 cursor-pointer">
                  Tandai sebagai pengumuman penting (disematkan di atas)
                </label>
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
                  {saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Terbitkan Warta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
