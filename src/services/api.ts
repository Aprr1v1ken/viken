import type {
  Member,
  Family,
  ChurchStaff,
  BaptismRecord,
  ConfirmationRecord,
  MarriageRecord,
  MutationRecord,
  ChurchEvent,
  ServiceSchedule,
  AttendanceRecord,
  FinancialTransaction,
  DocumentRecord,
  Announcement,
  User,
} from '../types/index.ts';

const API_BASE = '/api';

/* ------------------------------------------------------------------ */
/* Token sesi                                                          */
/* ------------------------------------------------------------------ */

const TOKEN_KEY = 'sysjeger_token';
const USER_KEY = 'sysjeger_user';

/*
 * Sesi disimpan UTAMA di memori modul ini, dan dicerminkan ke localStorage
 * sebisa mungkin (agar bertahan saat halaman dimuat ulang).
 *
 * Mengapa tidak localStorage saja? Di dalam iframe lintas-situs (mis. panel
 * pratinjau yang menyematkan situs dari domain lain) sebagian peramban
 * MEMBLOKIR localStorage. Akibatnya token hasil login hilang: server sudah
 * menerima login (200) tetapi semua permintaan data sesudahnya terkirim
 * tanpa token dan ditolak 401 — pengguna tampak "tidak bisa masuk".
 * Dengan cadangan memori ini, login tetap berfungsi selama halaman dibuka
 * walaupun penyimpanan peramban diblokir total.
 */
let memoryToken: string | null = null;
let memoryUser: User | null = null;

export function getAuthToken(): string | null {
  if (memoryToken) return memoryToken;
  try {
    memoryToken = localStorage.getItem(TOKEN_KEY);
  } catch {
    /* penyimpanan diblokir — andalkan memori */
  }
  return memoryToken;
}

export function setAuthSession(token: string, user: User) {
  memoryToken = token;
  memoryUser = user;
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {
    /* penyimpanan diblokir — sesi tetap hidup dari memori */
  }
}

export function getStoredUser(): User | null {
  if (memoryUser) return memoryUser;
  try {
    const raw = localStorage.getItem(USER_KEY);
    memoryUser = raw ? (JSON.parse(raw) as User) : null;
  } catch {
    /* penyimpanan diblokir — andalkan memori */
  }
  return memoryUser;
}

export function clearAuthSession() {
  memoryToken = null;
  memoryUser = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    /* abaikan */
  }
}

/** Dipanggil App saat server menolak sesi (401) agar pengguna diarahkan login ulang. */
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

async function apiFetch(path: string, init: RequestInit = {}): Promise<any> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
  };
  if (init.body) headers['Content-Type'] = 'application/json';
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    // Sebagian proxy/pratinjau membuang header Authorization (dipakai untuk
    // autentikasi proxy itu sendiri). Kirim juga token lewat header khusus
    // agar sesi tetap terbawa; server menerima salah satu.
    headers['X-SYSJEGER-Token'] = token;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (res.status === 401 && !path.startsWith('/auth/login')) {
    clearAuthSession();
    onUnauthorized?.();
  }

  const text = await res.text();
  try {
    return text ? JSON.parse(text) : { success: res.ok };
  } catch {
    return { success: false, message: text || `Permintaan gagal (${res.status})` };
  }
}

function postJson(path: string, data: unknown) {
  return apiFetch(path, { method: 'POST', body: JSON.stringify(data ?? {}) });
}

/* ------------------------------------------------------------------ */
/* Autentikasi & data publik                                           */
/* ------------------------------------------------------------------ */

export async function loginApi(
  username: string,
  password: string
): Promise<{ success: boolean; user?: User; token?: string; message?: string }> {
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: username.trim(), password }),
  });
  if (res?.success && res.token && res.user) {
    setAuthSession(res.token, res.user);
  }
  return res;
}

export async function fetchMeApi() {
  return apiFetch('/auth/me');
}

export async function changePasswordApi(currentPassword: string, newPassword: string) {
  return postJson('/auth/change-password', { currentPassword, newPassword });
}

export interface PublicStats {
  totalMembers: number;
  totalFamilies: number;
  totalRayons: number;
  totalStaff: number;
}

export async function fetchPublicStatsApi(): Promise<{ success: boolean; stats?: PublicStats }> {
  return apiFetch('/public/stats');
}

/* ------------------------------------------------------------------ */
/* Data gereja (wajib login, kecuali warta & kegiatan)                 */
/* ------------------------------------------------------------------ */

export async function fetchStatsApi() {
  return apiFetch('/stats');
}

export async function fetchMembersApi(params?: { query?: string; rayonId?: string; categorialId?: string; status?: string }) {
  const query = new URLSearchParams();
  if (params?.query) query.set('query', params.query);
  if (params?.rayonId) query.set('rayonId', params.rayonId);
  if (params?.categorialId) query.set('categorialId', params.categorialId);
  if (params?.status) query.set('status', params.status);
  return apiFetch(`/members?${query.toString()}`);
}

export async function createMemberApi(data: Partial<Member>) {
  return postJson('/members', data);
}

export async function updateMemberApi(id: string, data: Partial<Member>) {
  return apiFetch(`/members/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteMemberApi(id: string) {
  return apiFetch(`/members/${id}`, { method: 'DELETE' });
}

export async function fetchFamiliesApi() {
  return apiFetch('/families');
}

export async function createFamilyApi(data: Partial<Family>) {
  return postJson('/families', data);
}

export async function deleteFamilyApi(id: string) {
  return apiFetch(`/families/${id}`, { method: 'DELETE' });
}

export async function fetchRayonsApi() {
  return apiFetch('/rayons');
}

export async function fetchCategorialsApi() {
  return apiFetch('/categorials');
}

export async function fetchStaffApi() {
  return apiFetch('/staff');
}

export async function createStaffApi(data: Partial<ChurchStaff>) {
  return postJson('/staff', data);
}

export async function fetchSacramentsApi() {
  return apiFetch('/sacraments');
}

export async function createBaptismApi(data: Partial<BaptismRecord>) {
  return postJson('/sacraments/baptisms', data);
}

export async function createConfirmationApi(data: Partial<ConfirmationRecord>) {
  return postJson('/sacraments/confirmations', data);
}

export async function createMarriageApi(data: Partial<MarriageRecord>) {
  return postJson('/sacraments/marriages', data);
}

export async function fetchMutationsApi() {
  return apiFetch('/mutations');
}

export async function createMutationApi(data: Partial<MutationRecord>) {
  return postJson('/mutations', data);
}

export async function fetchEventsApi() {
  return apiFetch('/events');
}

export async function createEventApi(data: Partial<ChurchEvent>) {
  return postJson('/events', data);
}

export async function fetchSchedulesApi() {
  return apiFetch('/schedules');
}

export async function createScheduleApi(data: Partial<ServiceSchedule>) {
  return postJson('/schedules', data);
}

export async function fetchAttendanceApi() {
  return apiFetch('/attendance');
}

export async function createAttendanceApi(data: Partial<AttendanceRecord>) {
  return postJson('/attendance', data);
}

export async function fetchFinanceApi() {
  return apiFetch('/finance');
}

export async function createFinanceApi(data: Partial<FinancialTransaction>) {
  return postJson('/finance', data);
}

export async function fetchDocumentsApi() {
  return apiFetch('/documents');
}

export async function createDocumentApi(data: Partial<DocumentRecord>) {
  return postJson('/documents', data);
}

export async function fetchAnnouncementsApi() {
  return apiFetch('/announcements');
}

export async function createAnnouncementApi(data: Partial<Announcement>) {
  return postJson('/announcements', data);
}

export async function fetchCorrectionsApi() {
  return apiFetch('/corrections');
}

export async function createCorrectionApi(data: { memberId: string; memberName: string; details: string }) {
  return postJson('/corrections', data);
}

export async function updateCorrectionStatusApi(id: string, status: string, adminNotes: string) {
  return apiFetch(`/corrections/${id}`, { method: 'PUT', body: JSON.stringify({ status, adminNotes }) });
}

export async function fetchAuditLogsApi() {
  return apiFetch('/audit-logs');
}

export async function importMembersApi(members: Partial<Member>[]) {
  return postJson('/import/members', { members });
}

export async function fetchBirthdaysApi() {
  return apiFetch('/members/birthdays');
}

/** Unduh berkas cadangan database (khusus Super Admin & Admin Gereja). */
export async function downloadBackupApi(): Promise<void> {
  const token = getAuthToken();
  const res = await fetch(`${API_BASE}/backup`, {
    headers: token ? { Authorization: `Bearer ${token}`, 'X-SYSJEGER-Token': token } : {},
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message || `Gagal mengunduh cadangan (${res.status})`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sysjeger_backup_gmit_betel_${new Date().toISOString().substring(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Kosongkan database. Peran Super Admin diverifikasi server dari token sesi;
 * parameter userRole dipertahankan hanya demi kompatibilitas pemanggil lama.
 */
export async function emptyDatabaseApi(keepAdmin: boolean = true, _userRole: string = 'Super Admin') {
  return postJson('/database/empty', { keepAdmin });
}

export async function resetSeedDataApi(_userRole: string = 'Super Admin') {
  return postJson('/database/reset-seed', {});
}
