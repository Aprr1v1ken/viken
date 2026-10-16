import type {
  Member,
  Family,
  Rayon,
  CategorialGroup,
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
  DataCorrectionRequest,
  AuditLog,
  User,
} from '../types/index.ts';

const API_BASE = '/api';

export async function loginApi(username: string, password: string): Promise<{ success: boolean; user?: User; token?: string; message?: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function fetchStatsApi() {
  const res = await fetch(`${API_BASE}/stats`);
  return res.json();
}

export async function fetchMembersApi(params?: { query?: string; rayonId?: string; categorialId?: string; status?: string }) {
  const query = new URLSearchParams();
  if (params?.query) query.set('query', params.query);
  if (params?.rayonId) query.set('rayonId', params.rayonId);
  if (params?.categorialId) query.set('categorialId', params.categorialId);
  if (params?.status) query.set('status', params.status);

  const res = await fetch(`${API_BASE}/members?${query.toString()}`);
  return res.json();
}

export async function createMemberApi(data: Partial<Member>) {
  const res = await fetch(`${API_BASE}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateMemberApi(id: string, data: Partial<Member>) {
  const res = await fetch(`${API_BASE}/members/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteMemberApi(id: string) {
  const res = await fetch(`${API_BASE}/members/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function fetchFamiliesApi() {
  const res = await fetch(`${API_BASE}/families`);
  return res.json();
}

export async function createFamilyApi(data: Partial<Family>) {
  const res = await fetch(`${API_BASE}/families`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteFamilyApi(id: string) {
  const res = await fetch(`${API_BASE}/families/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function fetchRayonsApi() {
  const res = await fetch(`${API_BASE}/rayons`);
  return res.json();
}

export async function fetchCategorialsApi() {
  const res = await fetch(`${API_BASE}/categorials`);
  return res.json();
}

export async function fetchStaffApi() {
  const res = await fetch(`${API_BASE}/staff`);
  return res.json();
}

export async function createStaffApi(data: Partial<ChurchStaff>) {
  const res = await fetch(`${API_BASE}/staff`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchSacramentsApi() {
  const res = await fetch(`${API_BASE}/sacraments`);
  return res.json();
}

export async function createBaptismApi(data: Partial<BaptismRecord>) {
  const res = await fetch(`${API_BASE}/sacraments/baptisms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createConfirmationApi(data: Partial<ConfirmationRecord>) {
  const res = await fetch(`${API_BASE}/sacraments/confirmations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function createMarriageApi(data: Partial<MarriageRecord>) {
  const res = await fetch(`${API_BASE}/sacraments/marriages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchMutationsApi() {
  const res = await fetch(`${API_BASE}/mutations`);
  return res.json();
}

export async function createMutationApi(data: Partial<MutationRecord>) {
  const res = await fetch(`${API_BASE}/mutations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchEventsApi() {
  const res = await fetch(`${API_BASE}/events`);
  return res.json();
}

export async function createEventApi(data: Partial<ChurchEvent>) {
  const res = await fetch(`${API_BASE}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchSchedulesApi() {
  const res = await fetch(`${API_BASE}/schedules`);
  return res.json();
}

export async function createScheduleApi(data: Partial<ServiceSchedule>) {
  const res = await fetch(`${API_BASE}/schedules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchAttendanceApi() {
  const res = await fetch(`${API_BASE}/attendance`);
  return res.json();
}

export async function createAttendanceApi(data: Partial<AttendanceRecord>) {
  const res = await fetch(`${API_BASE}/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchFinanceApi() {
  const res = await fetch(`${API_BASE}/finance`);
  return res.json();
}

export async function createFinanceApi(data: Partial<FinancialTransaction>) {
  const res = await fetch(`${API_BASE}/finance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchDocumentsApi() {
  const res = await fetch(`${API_BASE}/documents`);
  return res.json();
}

export async function createDocumentApi(data: Partial<DocumentRecord>) {
  const res = await fetch(`${API_BASE}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchAnnouncementsApi() {
  const res = await fetch(`${API_BASE}/announcements`);
  return res.json();
}

export async function createAnnouncementApi(data: Partial<Announcement>) {
  const res = await fetch(`${API_BASE}/announcements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchCorrectionsApi() {
  const res = await fetch(`${API_BASE}/corrections`);
  return res.json();
}

export async function createCorrectionApi(data: { memberId: string; memberName: string; details: string }) {
  const res = await fetch(`${API_BASE}/corrections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateCorrectionStatusApi(id: string, status: string, adminNotes: string) {
  const res = await fetch(`${API_BASE}/corrections/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, adminNotes }),
  });
  return res.json();
}

export async function fetchAuditLogsApi() {
  const res = await fetch(`${API_BASE}/audit-logs`);
  return res.json();
}

export async function importMembersApi(members: Partial<Member>[]) {
  const res = await fetch(`${API_BASE}/import/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ members }),
  });
  return res.json();
}

export async function fetchBirthdaysApi() {
  const res = await fetch(`${API_BASE}/members/birthdays`);
  return res.json();
}

export async function emptyDatabaseApi(keepAdmin: boolean = true, userRole: string = 'Super Admin') {
  const res = await fetch(`${API_BASE}/database/empty`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': userRole,
    },
    body: JSON.stringify({ keepAdmin, userRole }),
  });
  return res.json();
}

export async function resetSeedDataApi(userRole: string = 'Super Admin') {
  const res = await fetch(`${API_BASE}/database/reset-seed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': userRole,
    },
    body: JSON.stringify({ userRole }),
  });
  return res.json();
}


