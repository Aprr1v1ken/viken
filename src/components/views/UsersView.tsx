import React, { useState } from 'react';
import { Users, Plus, Pencil, Trash2, ShieldCheck, X, Save, AlertCircle, KeyRound } from 'lucide-react';
import type { Member, Rayon, User, UserRole } from '../../types/index.ts';
import type { ManagedUser, UserInput } from '../../services/api.ts';

interface UsersViewProps {
  users: ManagedUser[];
  rayons: Rayon[];
  members: Member[];
  currentUser: User;
  onSaveUser: (data: UserInput, id?: string) => Promise<any>;
  onDeleteUser: (id: string) => Promise<any>;
}

const ROLE_OPTIONS: UserRole[] = [
  'Super Admin',
  'Admin Gereja',
  'Ketua Majelis/Pendeta',
  'Majelis/Rayon',
  'Jemaat',
];

const ROLE_BADGE: Record<string, string> = {
  'Super Admin': 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  'Admin Gereja': 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
  'Ketua Majelis/Pendeta': 'bg-violet-500/15 text-violet-300 border-violet-500/40',
  'Majelis/Rayon': 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  Jemaat: 'bg-slate-500/15 text-slate-300 border-slate-500/40',
};

export const UsersView: React.FC<UsersViewProps> = ({
  users,
  rayons,
  members,
  currentUser,
  onSaveUser,
  onDeleteUser,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ManagedUser | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Admin Gereja');
  const [rayonId, setRayonId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const openAdd = () => {
    setEditing(null);
    setName('');
    setUsername('');
    setPassword('');
    setRole('Admin Gereja');
    setRayonId('');
    setMemberId('');
    setPhone('');
    setEmail('');
    setStatus('Aktif');
    setError('');
    setShowModal(true);
  };

  const openEdit = (u: ManagedUser) => {
    setEditing(u);
    setName(u.name);
    setUsername(u.username);
    setPassword('');
    setRole(u.role);
    setRayonId(u.rayonId || '');
    setMemberId(u.memberId || '');
    setPhone(u.phone || '');
    setEmail(u.email || '');
    setStatus(u.status || 'Aktif');
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim()) {
      setError('Nama lengkap dan username wajib diisi.');
      return;
    }
    if (!editing && password.length < 8) {
      setError('Kata sandi pengguna baru minimal 8 karakter.');
      return;
    }
    if (editing && password && password.length < 8) {
      setError('Kata sandi baru minimal 8 karakter (atau kosongkan bila tidak diubah).');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const data: UserInput = {
        username: username.trim(),
        name: name.trim(),
        role,
        rayonId: role === 'Majelis/Rayon' ? rayonId : '',
        memberId: role === 'Jemaat' ? memberId : '',
        phone,
        email,
        status,
      };
      if (password) data.password = password;
      const res = await onSaveUser(data, editing?.id);
      if (res && res.success === false) throw new Error(res.message || 'Gagal menyimpan pengguna');
      setShowModal(false);
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan pengguna');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: ManagedUser) => {
    if (!window.confirm(`Hapus akun pengguna "${u.name}" (${u.username})?\n\nAkun ini tidak lagi dapat masuk ke aplikasi. Tindakan ini tidak dapat dibatalkan.`)) return;
    try {
      const res = await onDeleteUser(u.id);
      if (res && res.success === false) alert(res.message || 'Gagal menghapus pengguna');
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus pengguna. Periksa koneksi lalu coba lagi.');
    }
  };

  const isSelf = (u: ManagedUser) => u.id === currentUser.id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 shadow-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <span>Manajemen Pengguna &amp; Hak Akses</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Buat, ubah, nonaktifkan, dan hapus akun yang dapat masuk ke aplikasi SYSJEGER. Menu ini hanya tampil untuk Super Admin.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengguna</span>
        </button>
      </div>

      {/* Tabel pengguna */}
      <div className="rounded-2xl bg-[#0c1329] border border-amber-500/20 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-slate-400 uppercase tracking-wide text-[10px] border-b border-slate-800 bg-[#070b18]">
                <th className="px-4 py-3 font-semibold">Pengguna</th>
                <th className="px-4 py-3 font-semibold">Username</th>
                <th className="px-4 py-3 font-semibold">Peran / Hak Akses</th>
                <th className="px-4 py-3 font-semibold">Kaitan</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const rayonName = rayons.find((r) => r.id === u.rayonId)?.name;
                const member = members.find((m) => m.id === u.memberId);
                return (
                  <tr key={u.id} className="border-b border-slate-800/60 hover:bg-slate-800/20">
                    <td className="px-4 py-3">
                      <p className="font-bold text-white text-[13px]">
                        {u.name}
                        {isSelf(u) && <span className="ml-2 text-[10px] font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded px-1.5 py-0.5">AKUN ANDA</span>}
                      </p>
                      <p className="text-slate-500 text-[11px]">{u.email || u.phone || '—'}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-200">{u.username}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold uppercase ${ROLE_BADGE[u.role] || ROLE_BADGE.Jemaat}`}>
                        <ShieldCheck className="w-3 h-3" /> {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {rayonName ? rayonName : member ? `${member.fullName} (${member.memberNo})` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={u.status === 'Aktif' ? 'text-emerald-400 font-semibold' : 'text-red-400 font-semibold'}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => openEdit(u)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold mr-1.5 cursor-pointer"
                        title="Ubah pengguna"
                      >
                        <Pencil className="w-3.5 h-3.5" /> Ubah
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={isSelf(u)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-[11px] font-semibold hover:bg-red-900/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        title={isSelf(u) ? 'Anda tidak dapat menghapus akun sendiri' : 'Hapus pengguna'}
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Belum ada data pengguna.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="px-4 py-3 text-[11px] text-slate-500 border-t border-slate-800">
          Super Admin &amp; Admin Gereja dapat mengelola seluruh data; Majelis/Rayon terikat pada rayonnya; akun Jemaat hanya melihat Portal Jemaat miliknya.
          Kata sandi disimpan terenkripsi (scrypt) dan tidak pernah ditampilkan.
        </p>
      </div>

      {/* Modal tambah/ubah */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0b1226] border border-amber-500/30 rounded-3xl shadow-2xl p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                <KeyRound className="w-5 h-5" />
                {editing ? 'Ubah Pengguna' : 'Tambah Pengguna Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama pengguna"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Username (untuk masuk) *</label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="minimal 3 karakter, tanpa spasi"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none focus:border-amber-400 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  {editing ? 'Kata Sandi Baru (kosongkan bila tidak diubah)' : 'Kata Sandi *'}
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  required={!editing}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Peran / Hak Akses *</label>
                <select
                  value={role}
                  disabled={!!editing && isSelf(editing)}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none focus:border-amber-400 disabled:opacity-50"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                {editing && isSelf(editing) && (
                  <p className="text-[10px] text-slate-500 mt-1">Peran akun Anda sendiri tidak dapat diubah demi keamanan.</p>
                )}
              </div>

              {role === 'Majelis/Rayon' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Rayon yang Diasuh</label>
                  <select
                    value={rayonId}
                    onChange={(e) => setRayonId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none focus:border-amber-400"
                  >
                    <option value="">— Belum terikat rayon —</option>
                    {rayons.map((r) => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {role === 'Jemaat' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Data Jemaat Terkait (untuk Portal Jemaat)</label>
                  <select
                    value={memberId}
                    onChange={(e) => setMemberId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none focus:border-amber-400"
                  >
                    <option value="">— Belum terhubung —</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.fullName} ({m.memberNo})</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">No. HP / WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08xx-xxxx-xxxx"
                    className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {editing && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Status Akun</label>
                  <select
                    value={status}
                    disabled={isSelf(editing)}
                    onChange={(e) => setStatus(e.target.value as 'Aktif' | 'Nonaktif')}
                    className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none focus:border-amber-400 disabled:opacity-50"
                  >
                    <option value="Aktif">Aktif (dapat masuk)</option>
                    <option value="Nonaktif">Nonaktif (tidak dapat masuk)</option>
                  </select>
                </div>
              )}

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
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Menyimpan...' : editing ? 'Simpan Perubahan' : 'Buat Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
