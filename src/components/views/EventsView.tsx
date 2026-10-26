import React, { useState } from 'react';
import { Calendar, Plus, Clock, MapPin, User, CheckCircle, Music, Mic, Pencil, Trash2 } from 'lucide-react';
import { formatDateDMY } from '../../utils/church-logic.ts';
import type { ChurchEvent, ServiceSchedule } from '../../types/index.ts';

interface EventsViewProps {
  events: ChurchEvent[];
  schedules: ServiceSchedule[];
  onSaveEvent: (data: Partial<ChurchEvent>, id?: string) => Promise<any>;
  onDeleteEvent: (id: string) => Promise<any>;
  onSaveSchedule: (data: Partial<ServiceSchedule>, id?: string) => Promise<any>;
  onDeleteSchedule: (id: string) => Promise<any>;
}

const todayIso = () => new Date().toISOString().substring(0, 10);

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  schedules,
  onSaveEvent,
  onDeleteEvent,
  onSaveSchedule,
  onDeleteSchedule,
}) => {
  const [activeTab, setActiveTab] = useState<'schedules' | 'events'>('schedules');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);

  // Schedule form states
  const [editingSchedule, setEditingSchedule] = useState<ServiceSchedule | null>(null);
  const [serviceDate, setServiceDate] = useState(todayIso());
  const [serviceName, setServiceName] = useState('');
  const [preacher, setPreacher] = useState('');
  const [liturgist, setLiturgist] = useState('');
  const [elderDuty, setElderDuty] = useState('');
  const [deaconDuty, setDeaconDuty] = useState('');
  const [songLeader, setSongLeader] = useState('');
  const [musicians, setMusicians] = useState('');
  const [multimedia, setMultimedia] = useState('');
  const [usher, setUsher] = useState('');
  const [bibleReader, setBibleReader] = useState('');
  const [savingSchedule, setSavingSchedule] = useState(false);

  const openAddSchedule = () => {
    setEditingSchedule(null);
    setServiceDate(todayIso());
    setServiceName('Kebaktian Minggu Pagi I (06.30 WITA)');
    setPreacher('');
    setLiturgist('');
    setElderDuty('');
    setDeaconDuty('');
    setSongLeader('');
    setMusicians('');
    setMultimedia('');
    setUsher('');
    setBibleReader('');
    setShowScheduleModal(true);
  };

  const openEditSchedule = (sch: ServiceSchedule) => {
    setEditingSchedule(sch);
    setServiceDate(sch.serviceDate || '');
    setServiceName(sch.serviceName || '');
    setPreacher(sch.preacher || '');
    setLiturgist(sch.liturgist || '');
    setElderDuty(sch.elderDuty || '');
    setDeaconDuty(sch.deaconDuty || '');
    setSongLeader(sch.songLeader || '');
    setMusicians(sch.musicians || '');
    setMultimedia(sch.multimediaOperator || '');
    setUsher(sch.usher || '');
    setBibleReader(sch.bibleReader || '');
    setShowScheduleModal(true);
  };

  const handleDeleteSchedule = async (sch: ServiceSchedule) => {
    if (!window.confirm(`Hapus jadwal petugas "${sch.serviceName}" (${formatDateDMY(sch.serviceDate)})?`)) return;
    try {
      const res = await onDeleteSchedule(sch.id);
      if (res && res.success === false) alert(res.message || 'Gagal menghapus jadwal');
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus. Periksa koneksi lalu coba lagi.');
    }
  };

  // Event form states
  const [editingEvent, setEditingEvent] = useState<ChurchEvent | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventCat, setEventCat] = useState<any>('Ibadah Minggu');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventPic, setEventPic] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventStatus, setEventStatus] = useState<any>('Terjadwal');
  const [savingEvent, setSavingEvent] = useState(false);

  const openAddEvent = () => {
    setEditingEvent(null);
    setEventTitle('');
    setEventCat('Ibadah Minggu');
    setEventStart(`${todayIso()} 06:30:00`);
    setEventEnd(`${todayIso()} 08:00:00`);
    setEventLocation('Gedung Kebaktian GMIT Betel Fuimelang');
    setEventPic('');
    setEventDesc('');
    setEventStatus('Terjadwal');
    setShowEventModal(true);
  };

  const openEditEvent = (ev: ChurchEvent) => {
    setEditingEvent(ev);
    setEventTitle(ev.title || '');
    setEventCat(ev.category);
    setEventStart(ev.startTime || '');
    setEventEnd(ev.endTime || '');
    setEventLocation(ev.location || '');
    setEventPic(ev.picName || '');
    setEventDesc(ev.description || '');
    setEventStatus(ev.status || 'Terjadwal');
    setShowEventModal(true);
  };

  const handleDeleteEvent = async (ev: ChurchEvent) => {
    if (!window.confirm(`Hapus kegiatan "${ev.title}"?`)) return;
    try {
      const res = await onDeleteEvent(ev.id);
      if (res && res.success === false) alert(res.message || 'Gagal menghapus kegiatan');
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus. Periksa koneksi lalu coba lagi.');
    }
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSchedule(true);
    try {
      const res = await onSaveSchedule(
        {
          serviceDate,
          serviceName,
          preacher,
          liturgist,
          elderDuty,
          deaconDuty,
          songLeader,
          musicians,
          multimediaOperator: multimedia,
          usher,
          bibleReader,
          notes: editingSchedule?.notes || '',
        },
        editingSchedule?.id
      );
      if (res && res.success === false) {
        alert(res.message || 'Gagal menyimpan jadwal');
        return;
      }
      setShowScheduleModal(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan. Periksa koneksi lalu coba lagi.');
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;
    setSavingEvent(true);
    try {
      const res = await onSaveEvent(
        {
          title: eventTitle,
          category: eventCat,
          startTime: eventStart,
          endTime: eventEnd,
          location: eventLocation,
          picName: eventPic,
          description: eventDesc,
          status: eventStatus,
        },
        editingEvent?.id
      );
      if (res && res.success === false) {
        alert(res.message || 'Gagal menyimpan kegiatan');
        return;
      }
      setShowEventModal(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan. Periksa koneksi lalu coba lagi.');
    } finally {
      setSavingEvent(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 shadow-md">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <span>Ibadah, Petugas Pelayanan & Kalender Kegiatan</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pengaturan jadwal presbiter bertugas dan seluruh kalender pelayanan gereja
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'schedules' ? (
            <button
              onClick={openAddSchedule}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Jadwal Petugas Ibadah</span>
            </button>
          ) : (
            <button
              onClick={openAddEvent}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Acara Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 bg-[#090e1e] p-1 rounded-xl text-xs gap-1">
        <button
          onClick={() => setActiveTab('schedules')}
          className={`flex-1 py-2.5 px-4 font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'schedules'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4 text-amber-400" />
          <span>Jadwal Petugas Pelayanan ({schedules.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`flex-1 py-2.5 px-4 font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
            activeTab === 'events'
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-400" />
          <span>Kalender Acara & Kegiatan ({events.length})</span>
        </button>
      </div>

      {activeTab === 'schedules' ? (
        <div className="space-y-4">
          {schedules.map((sch) => (
            <div
              key={sch.id}
              className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 hover:border-amber-400/40 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 gap-2">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/30">
                    {formatDateDMY(sch.serviceDate)}
                  </span>
                  <h3 className="text-base font-bold text-white mt-1.5">{sch.serviceName}</h3>
                </div>
                <div className="text-xs text-slate-400">
                  GMIT BETEL FUIMELANG · TATA IBADAH RESMI
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-amber-400 flex items-center gap-1">
                    <Mic className="w-3 h-3" />
                    <span>Pelayan Firman & Liturgi:</span>
                  </span>
                  <div className="font-bold text-white">{sch.preacher}</div>
                  <div className="text-slate-400 text-[11px]">Liturgos: {sch.liturgist}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-cyan-400 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>Presbiter Bertugas:</span>
                  </span>
                  <div className="text-white font-medium text-[11px]">Pnt: {sch.elderDuty}</div>
                  <div className="text-slate-400 text-[11px]">Dkn: {sch.deaconDuty}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                    <Music className="w-3 h-3" />
                    <span>Pujian & Musik:</span>
                  </span>
                  <div className="font-medium text-white">{sch.songLeader}</div>
                  <div className="text-slate-400 text-[11px]">{sch.musicians}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-semibold text-purple-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Multimedia & Penerima:</span>
                  </span>
                  <div className="text-white font-medium text-[11px]">{sch.multimediaOperator}</div>
                  <div className="text-slate-400 text-[11px]">Penyambut: {sch.usher}</div>
                </div>
              </div>

              <div className="flex justify-end gap-1.5 pt-1 border-t border-slate-800">
                <button
                  onClick={() => openEditSchedule(sch)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" /> Ubah Jadwal
                </button>
                <button
                  onClick={() => handleDeleteSchedule(sch)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-[11px] font-semibold hover:bg-red-900/50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </button>
              </div>
            </div>
          ))}
          {schedules.length === 0 && (
            <div className="p-8 rounded-2xl bg-[#0c1329] border border-dashed border-slate-700 text-center text-sm text-slate-400">
              Belum ada jadwal petugas ibadah.
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="p-5 rounded-2xl bg-[#0c1329] border border-amber-500/20 hover:border-amber-400/40 transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 text-[10px]">
                    {ev.category}
                  </span>
                  <span className="text-emerald-400 font-semibold text-[11px]">
                    {ev.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{ev.title}</h3>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                  {ev.description || 'Kegiatan pelayanan jemaat terpadu.'}
                </p>

                <div className="space-y-1.5 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{ev.startTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{ev.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>PJ: {ev.picName}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-1.5 pt-2 border-t border-slate-800">
                <button
                  onClick={() => openEditEvent(ev)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" /> Ubah
                </button>
                <button
                  onClick={() => handleDeleteEvent(ev)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-[11px] font-semibold hover:bg-red-900/50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Hapus
                </button>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 p-8 rounded-2xl bg-[#0c1329] border border-dashed border-slate-700 text-center text-sm text-slate-400">
              Belum ada kegiatan terjadwal.
            </div>
          )}
        </div>
      )}

      {/* Add Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0b1226] border border-amber-500/30 rounded-3xl shadow-2xl p-6 space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-amber-300">
              {editingSchedule ? 'Ubah Jadwal Petugas Kebaktian' : 'Jadwal Petugas Kebaktian Minggu'}
            </h3>

            <form onSubmit={handleSaveSchedule} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tanggal Ibadah</label>
                  <input
                    type="date"
                    required
                    value={serviceDate}
                    onChange={(e) => setServiceDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nama Kebaktian</label>
                  <input
                    type="text"
                    required
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Pengkhotbah (Pendeta)</label>
                <input
                  type="text"
                  required
                  value={preacher}
                  onChange={(e) => setPreacher(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Liturgos</label>
                <input
                  type="text"
                  required
                  value={liturgist}
                  onChange={(e) => setLiturgist(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Penatua Bertugas</label>
                <input
                  type="text"
                  value={elderDuty}
                  onChange={(e) => setElderDuty(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Diaken Bertugas</label>
                <input
                  type="text"
                  value={deaconDuty}
                  onChange={(e) => setDeaconDuty(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Pemandu Pujian</label>
                  <input
                    type="text"
                    value={songLeader}
                    onChange={(e) => setSongLeader(e.target.value)}
                    className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Pemain Musik</label>
                  <input
                    type="text"
                    value={musicians}
                    onChange={(e) => setMusicians(e.target.value)}
                    className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingSchedule}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {savingSchedule ? 'Menyimpan...' : editingSchedule ? 'Simpan Perubahan' : 'Simpan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#0b1226] border border-amber-500/30 rounded-3xl shadow-2xl p-6 space-y-4 text-xs">
            <h3 className="text-base font-bold text-amber-300">
              {editingEvent ? 'Ubah Kegiatan / Acara Gerejawi' : 'Tambah Kegiatan / Acara Gerejawi'}
            </h3>

            <form onSubmit={handleSaveEvent} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nama Kegiatan *</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Nama kegiatan"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Kategori Kegiatan</label>
                <select
                  value={eventCat}
                  onChange={(e) => setEventCat(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                >
                  <option value="Ibadah Minggu">Ibadah Minggu</option>
                  <option value="Ibadah Rayon">Ibadah Rayon</option>
                  <option value="Ibadah Kategorial">Ibadah Kategorial</option>
                  <option value="Katekisasi Sidi">Katekisasi Sidi</option>
                  <option value="Sidang Majelis">Sidang Majelis</option>
                  <option value="Rapat Panitia">Rapat Panitia</option>
                  <option value="Pelayanan Diakonia">Pelayanan Diakonia</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Waktu Mulai</label>
                  <input
                    type="text"
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    placeholder="YYYY-MM-DD HH:mm:ss"
                    className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Waktu Selesai</label>
                  <input
                    type="text"
                    value={eventEnd}
                    onChange={(e) => setEventEnd(e.target.value)}
                    placeholder="YYYY-MM-DD HH:mm:ss"
                    className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Lokasi</label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Penanggung Jawab</label>
                <input
                  type="text"
                  value={eventPic}
                  onChange={(e) => setEventPic(e.target.value)}
                  placeholder="Nama penanggung jawab kegiatan"
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Keterangan / Deskripsi</label>
                <textarea
                  rows={2}
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="Keterangan singkat kegiatan..."
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Status Kegiatan</label>
                <select
                  value={eventStatus}
                  onChange={(e) => setEventStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-[#050811] border border-slate-700 rounded-lg text-white outline-none"
                >
                  <option value="Terjadwal">Terjadwal</option>
                  <option value="Berlangsung">Berlangsung</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEvent}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  {savingEvent ? 'Menyimpan...' : editingEvent ? 'Simpan Perubahan' : 'Simpan Acara'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
