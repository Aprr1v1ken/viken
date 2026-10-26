/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { PublicLanding } from './components/PublicLanding.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// Komponen khusus dashboard dimuat secara lazy (code-splitting) agar
// pengunjung situs web publik tidak perlu mengunduh seluruh kode admin —
// halaman depan gereja tetap ringan pada jaringan yang lambat.
const lazyNamed = <T extends Record<string, React.ComponentType<any>>>(load: () => Promise<T>, name: keyof T) =>
  lazy(() => load().then((m) => ({ default: m[name] })));

const ChangePasswordModal = lazyNamed(() => import('./components/ChangePasswordModal.tsx'), 'ChangePasswordModal');
const MemberFormModal = lazyNamed(() => import('./components/MemberFormModal.tsx'), 'MemberFormModal');
const MemberDetailModal = lazyNamed(() => import('./components/MemberDetailModal.tsx'), 'MemberDetailModal');
const FamilyModal = lazyNamed(() => import('./components/FamilyModal.tsx'), 'FamilyModal');
const SacramentModal = lazyNamed(() => import('./components/SacramentModal.tsx'), 'SacramentModal');
const ImportModal = lazyNamed(() => import('./components/ImportModal.tsx'), 'ImportModal');
const PrintReportModal = lazyNamed(() => import('./components/PrintReportModal.tsx'), 'PrintReportModal');

// Views
const DashboardView = lazyNamed(() => import('./components/views/DashboardView.tsx'), 'DashboardView');
const MembersView = lazyNamed(() => import('./components/views/MembersView.tsx'), 'MembersView');
const FamiliesView = lazyNamed(() => import('./components/views/FamiliesView.tsx'), 'FamiliesView');
const RayonsView = lazyNamed(() => import('./components/views/RayonsView.tsx'), 'RayonsView');
const StaffView = lazyNamed(() => import('./components/views/StaffView.tsx'), 'StaffView');
const SacramentsView = lazyNamed(() => import('./components/views/SacramentsView.tsx'), 'SacramentsView');
const MutationsView = lazyNamed(() => import('./components/views/MutationsView.tsx'), 'MutationsView');
const EventsView = lazyNamed(() => import('./components/views/EventsView.tsx'), 'EventsView');
const AttendanceView = lazyNamed(() => import('./components/views/AttendanceView.tsx'), 'AttendanceView');
const FinanceView = lazyNamed(() => import('./components/views/FinanceView.tsx'), 'FinanceView');
const DocumentsView = lazyNamed(() => import('./components/views/DocumentsView.tsx'), 'DocumentsView');
const AnnouncementsView = lazyNamed(() => import('./components/views/AnnouncementsView.tsx'), 'AnnouncementsView');
const JemaatPortalView = lazyNamed(() => import('./components/views/JemaatPortalView.tsx'), 'JemaatPortalView');
const BackupView = lazyNamed(() => import('./components/views/BackupView.tsx'), 'BackupView');
const AuditLogsView = lazyNamed(() => import('./components/views/AuditLogsView.tsx'), 'AuditLogsView');
const ReportsView = lazyNamed(() => import('./components/views/ReportsView.tsx'), 'ReportsView');
const UsersView = lazyNamed(() => import('./components/views/UsersView.tsx'), 'UsersView');

const ViewLoading = () => (
  <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
    <span className="animate-pulse">Memuat halaman…</span>
  </div>
);

import * as api from './services/api.ts';
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
} from './types/index.ts';

export default function App() {
  // Sesi dipulihkan dari penyimpanan browser; pengunjung baru (belum login)
  // pertama-tama melihat situs web publik gereja, bukan dashboard admin.
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    api.getAuthToken() ? api.getStoredUser() : null
  );

  const [currentView, setCurrentView] = useState<string>(() =>
    api.getStoredUser()?.role === 'Jemaat' ? 'portal' : 'dashboard'
  );
  const [showPublicSite, setShowPublicSite] = useState<boolean>(
    () => !(api.getAuthToken() && api.getStoredUser())
  );
  const [isOpenMobileSidebar, setIsOpenMobileSidebar] = useState(false);

  // Modals state
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showMemberFormModal, setShowMemberFormModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showMemberDetailModal, setShowMemberDetailModal] = useState(false);
  const [detailMember, setDetailMember] = useState<Member | null>(null);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [editingFamily, setEditingFamily] = useState<Family | null>(null);
  const [showSacramentModal, setShowSacramentModal] = useState(false);
  const [sacramentType, setSacramentType] = useState<'baptis' | 'sidi' | 'nikah'>('baptis');
  const [editingSacrament, setEditingSacrament] = useState<any | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPrintReportModal, setShowPrintReportModal] = useState(false);
  const [reportType, setReportType] = useState<'members' | 'rayons' | 'finance' | 'sacraments' | 'attendance'>('members');

  // Server Data States
  const [members, setMembers] = useState<Member[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [rayons, setRayons] = useState<Rayon[]>([]);
  const [categorials, setCategorials] = useState<CategorialGroup[]>([]);
  const [staff, setStaff] = useState<ChurchStaff[]>([]);
  const [baptisms, setBaptisms] = useState<BaptismRecord[]>([]);
  const [confirmations, setConfirmations] = useState<ConfirmationRecord[]>([]);
  const [marriages, setMarriages] = useState<MarriageRecord[]>([]);
  const [mutations, setMutations] = useState<MutationRecord[]>([]);
  const [events, setEvents] = useState<ChurchEvent[]>([]);
  const [schedules, setSchedules] = useState<ServiceSchedule[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [corrections, setCorrections] = useState<DataCorrectionRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [publicStats, setPublicStats] = useState<api.PublicStats | null>(null);
  const [users, setUsers] = useState<api.ManagedUser[]>([]);

  // Load all data from API
  const loadAllData = async () => {
    try {
      const [
        statsRes,
        membersRes,
        familiesRes,
        rayonsRes,
        catRes,
        staffRes,
        sacramentsRes,
        mutationsRes,
        eventsRes,
        schedulesRes,
        attendanceRes,
        financeRes,
        docsRes,
        announcementsRes,
        correctionsRes,
        auditRes,
      ] = await Promise.all([
        api.fetchStatsApi(),
        api.fetchMembersApi(),
        api.fetchFamiliesApi(),
        api.fetchRayonsApi(),
        api.fetchCategorialsApi(),
        api.fetchStaffApi(),
        api.fetchSacramentsApi(),
        api.fetchMutationsApi(),
        api.fetchEventsApi(),
        api.fetchSchedulesApi(),
        api.fetchAttendanceApi(),
        api.fetchFinanceApi(),
        api.fetchDocumentsApi(),
        api.fetchAnnouncementsApi(),
        api.fetchCorrectionsApi(),
        api.fetchAuditLogsApi(),
      ]);

      if (statsRes?.stats) setStats(statsRes.stats);
      if (membersRes?.members) setMembers(membersRes.members);
      if (familiesRes?.families) setFamilies(familiesRes.families);
      if (rayonsRes?.rayons) setRayons(rayonsRes.rayons);
      if (catRes?.categorials) setCategorials(catRes.categorials);
      if (staffRes?.staff) setStaff(staffRes.staff);
      if (sacramentsRes) {
        setBaptisms(sacramentsRes.baptisms || []);
        setConfirmations(sacramentsRes.confirmations || []);
        setMarriages(sacramentsRes.marriages || []);
      }
      if (mutationsRes?.mutations) setMutations(mutationsRes.mutations);
      if (eventsRes?.events) setEvents(eventsRes.events);
      if (schedulesRes?.schedules) setSchedules(schedulesRes.schedules);
      if (attendanceRes?.attendance) setAttendance(attendanceRes.attendance);
      if (financeRes?.transactions) setTransactions(financeRes.transactions);
      if (docsRes?.documents) setDocuments(docsRes.documents);
      if (announcementsRes?.announcements) setAnnouncements(announcementsRes.announcements);
      if (correctionsRes?.corrections) setCorrections(correctionsRes.corrections);
      if (auditRes?.logs) setAuditLogs(auditRes.logs);
      if (currentUser?.role === 'Super Admin') {
        const usersRes = await api.fetchUsersApi();
        if (usersRes?.users) setUsers(usersRes.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error('Error fetching church data:', err);
    }
  };

  // Data publik (warta, kegiatan, statistik ringkas) dimuat untuk semua pengunjung.
  const loadPublicData = async () => {
    try {
      const [announcementsRes, eventsRes, publicStatsRes] = await Promise.all([
        api.fetchAnnouncementsApi(),
        api.fetchEventsApi(),
        api.fetchPublicStatsApi(),
      ]);
      if (announcementsRes?.announcements) setAnnouncements(announcementsRes.announcements);
      if (eventsRes?.events) setEvents(eventsRes.events);
      if (publicStatsRes?.stats) setPublicStats(publicStatsRes.stats);
    } catch (err) {
      console.error('Error fetching public data:', err);
    }
  };

  useEffect(() => {
    loadPublicData();
    // Segarkan profil dari server bila ada sesi tersimpan (mis. memberId terbaru).
    if (api.getAuthToken()) {
      api.fetchMeApi()
        .then((res) => {
          if (res?.success && res.user) {
            const token = api.getAuthToken();
            if (token) api.setAuthSession(token, res.user);
            setCurrentUser(res.user);
          }
        })
        .catch(() => undefined);
    }
    // Bila server menolak sesi (401), kembalikan pengguna ke web publik + login.
    api.setUnauthorizedHandler(() => {
      setCurrentUser(null);
      setShowPublicSite(true);
      setShowLoginModal(true);
    });
    return () => api.setUnauthorizedHandler(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Data lengkap gereja hanya dimuat setelah pengguna masuk.
  useEffect(() => {
    if (currentUser?.id) {
      loadAllData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  // Sesi & navigasi utama
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setShowPublicSite(false);
    setShowLoginModal(false);
    setCurrentView(user.role === 'Jemaat' ? 'portal' : 'dashboard');
  };

  const handleLogout = () => {
    api.clearAuthSession();
    setCurrentUser(null);
    setShowPublicSite(true);
    setCurrentView('dashboard');
    setIsOpenMobileSidebar(false);
    // Bersihkan data internal dari memori; warta & kegiatan publik dipertahankan.
    setMembers([]);
    setFamilies([]);
    setRayons([]);
    setCategorials([]);
    setStaff([]);
    setBaptisms([]);
    setConfirmations([]);
    setMarriages([]);
    setMutations([]);
    setSchedules([]);
    setAttendance([]);
    setTransactions([]);
    setDocuments([]);
    setCorrections([]);
    setAuditLogs([]);
    setUsers([]);
    setStats(null);
  };

  const handleEnterApp = () => {
    if (currentUser) {
      setShowPublicSite(false);
    } else {
      setShowLoginModal(true);
    }
  };

  // Member CRUD handlers
  const handleSaveMember = async (data: Partial<Member>) => {
    if (editingMember) {
      await api.updateMemberApi(editingMember.id, data);
    } else {
      await api.createMemberApi(data);
    }
    await loadAllData();
  };

  const handleDeleteMember = async (id: string) => {
    await api.deleteMemberApi(id);
    await loadAllData();
  };

  // Family CRUD handlers
  const handleSaveFamily = async (data: Partial<Family>) => {
    const r = editingFamily
      ? await api.updateFamilyApi(editingFamily.id, data)
      : await api.createFamilyApi(data);
    await loadAllData();
    return r;
  };

  const handleDeleteFamily = async (id: string) => {
    const r = await api.deleteFamilyApi(id);
    await loadAllData();
    return r;
  };

  // Helper: jalankan operasi tulis lalu muat ulang seluruh data
  const runAndReload = async (fn: () => Promise<any>) => {
    const r = await fn();
    await loadAllData();
    return r;
  };

  // Rayon & Kategorial
  const handleSaveRayon = (data: Partial<Rayon>, id?: string) =>
    runAndReload(() => (id ? api.updateRayonApi(id, data) : api.createRayonApi(data)));
  const handleDeleteRayon = (id: string) => runAndReload(() => api.deleteRayonApi(id));
  const handleSaveCategorial = (data: Partial<CategorialGroup>, id?: string) =>
    runAndReload(() => (id ? api.updateCategorialApi(id, data) : api.createCategorialApi(data)));
  const handleDeleteCategorial = (id: string) => runAndReload(() => api.deleteCategorialApi(id));

  // Staff handlers
  const handleSaveStaff = (data: Partial<ChurchStaff>, id?: string) =>
    runAndReload(() => (id ? api.updateStaffApi(id, data) : api.createStaffApi(data)));
  const handleDeleteStaff = (id: string) => runAndReload(() => api.deleteStaffApi(id));

  // Sacrament handlers (memakai editingSacrament untuk mode ubah)
  const handleSaveBaptism = (data: any) =>
    runAndReload(() => (editingSacrament ? api.updateBaptismApi(editingSacrament.id, { ...editingSacrament, ...data }) : api.createBaptismApi(data)));
  const handleSaveConfirmation = (data: any) =>
    runAndReload(() => (editingSacrament ? api.updateConfirmationApi(editingSacrament.id, { ...editingSacrament, ...data }) : api.createConfirmationApi(data)));
  const handleSaveMarriage = (data: any) =>
    runAndReload(() => (editingSacrament ? api.updateMarriageApi(editingSacrament.id, { ...editingSacrament, ...data }) : api.createMarriageApi(data)));
  const handleDeleteBaptism = (id: string) => runAndReload(() => api.deleteBaptismApi(id));
  const handleDeleteConfirmation = (id: string) => runAndReload(() => api.deleteConfirmationApi(id));
  const handleDeleteMarriage = (id: string) => runAndReload(() => api.deleteMarriageApi(id));

  // Mutation handlers
  const handleSaveMutation = (data: Partial<MutationRecord>, id?: string) =>
    runAndReload(() => (id ? api.updateMutationApi(id, data) : api.createMutationApi(data)));
  const handleDeleteMutation = (id: string) => runAndReload(() => api.deleteMutationApi(id));

  // Event & Schedule handlers
  const handleSaveEvent = (data: Partial<ChurchEvent>, id?: string) =>
    runAndReload(() => (id ? api.updateEventApi(id, data) : api.createEventApi(data)));
  const handleDeleteEvent = (id: string) => runAndReload(() => api.deleteEventApi(id));
  const handleSaveSchedule = (data: Partial<ServiceSchedule>, id?: string) =>
    runAndReload(() => (id ? api.updateScheduleApi(id, data) : api.createScheduleApi(data)));
  const handleDeleteSchedule = (id: string) => runAndReload(() => api.deleteScheduleApi(id));

  // Attendance handlers
  const handleSaveAttendance = (data: Partial<AttendanceRecord>, id?: string) =>
    runAndReload(() => (id ? api.updateAttendanceApi(id, data) : api.createAttendanceApi(data)));
  const handleDeleteAttendance = (id: string) => runAndReload(() => api.deleteAttendanceApi(id));

  // Finance handlers
  const handleSaveFinance = (data: Partial<FinancialTransaction>, id?: string) =>
    runAndReload(() => (id ? api.updateFinanceApi(id, data) : api.createFinanceApi(data)));
  const handleDeleteFinance = (id: string) => runAndReload(() => api.deleteFinanceApi(id));

  // Document handlers
  const handleSaveDocument = (data: Partial<DocumentRecord>, id?: string) =>
    runAndReload(() => (id ? api.updateDocumentApi(id, data) : api.createDocumentApi(data)));
  const handleDeleteDocument = (id: string) => runAndReload(() => api.deleteDocumentApi(id));

  // Announcement handlers
  const handleSaveAnnouncement = (data: Partial<Announcement>, id?: string) =>
    runAndReload(() => (id ? api.updateAnnouncementApi(id, data) : api.createAnnouncementApi(data)));
  const handleDeleteAnnouncement = (id: string) => runAndReload(() => api.deleteAnnouncementApi(id));

  // Correction admin handlers
  const handleUpdateCorrection = (id: string, status: string, adminNotes: string) =>
    runAndReload(() => api.updateCorrectionStatusApi(id, status, adminNotes));
  const handleDeleteCorrection = (id: string) => runAndReload(() => api.deleteCorrectionApi(id));

  // User management handlers (Super Admin)
  const handleSaveUser = (data: api.UserInput, id?: string) =>
    runAndReload(() => (id ? api.updateUserApi(id, data) : api.createUserApi(data)));
  const handleDeleteUser = (id: string) => runAndReload(() => api.deleteUserApi(id));

  // Correction request handler
  const handleSubmitCorrection = async (details: string) => {
    const mem = members.find((m) => m.id === currentUser?.memberId) || members[0];
    if (mem) {
      await api.createCorrectionApi({
        memberId: mem.id,
        memberName: mem.fullName,
        details,
      });
      await loadAllData();
    }
  };

  // Import handler
  const handleImportMembers = async (items: Partial<Member>[]) => {
    const res = await api.importMembersApi(items);
    await loadAllData();
    return res;
  };

  // Active member for Portal
  const activePortalMember = members.find((m) => m.id === currentUser?.memberId) || members[0] || null;
  const activePortalFamily = activePortalMember ? families.find((f) => f.id === activePortalMember.familyId) || null : null;
  const activePortalFamilyMembers = activePortalFamily ? members.filter((m) => m.familyId === activePortalFamily.id) : [];

  // Public website view — juga menjadi gerbang bila belum ada sesi login.
  if (showPublicSite || !currentUser) {
    return (
      <>
        <ErrorBoundary layarPenuh>
          <PublicLanding
            onEnterApp={handleEnterApp}
            isLoggedIn={!!currentUser}
            announcements={announcements}
            events={events}
            publicStats={publicStats}
          />
        </ErrorBoundary>
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={handleLoginSuccess}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b18] text-slate-100 flex flex-col font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={(v) => setCurrentView(v)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenPublicSite={() => setShowPublicSite(true)}
        isOpenMobile={isOpenMobileSidebar}
        onCloseMobile={() => setIsOpenMobileSidebar(false)}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        <Header
          currentView={currentView}
          currentUser={currentUser}
          onOpenMobileSidebar={() => setIsOpenMobileSidebar(true)}
          onOpenPublicSite={() => setShowPublicSite(true)}
          onLogout={handleLogout}
          onOpenLogin={() => setShowLoginModal(true)}
          onOpenChangePassword={() => setShowChangePasswordModal(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <ErrorBoundary key={currentView}>
          <Suspense fallback={<ViewLoading />}>
          {currentView === 'dashboard' && (
            <DashboardView
              stats={stats}
              currentUser={currentUser}
              onNavigate={(v) => setCurrentView(v)}
              onOpenAddMember={() => {
                setEditingMember(null);
                setShowMemberFormModal(true);
              }}
              onOpenAddFamily={() => { setEditingFamily(null); setShowFamilyModal(true); }}
              onOpenAddFinance={() => setCurrentView('finance')}
              onOpenAddAttendance={() => setCurrentView('attendance')}
            />
          )}

          {currentView === 'members' && (
            <MembersView
              members={members}
              rayons={rayons}
              categorials={categorials}
              onOpenAddModal={() => {
                setEditingMember(null);
                setShowMemberFormModal(true);
              }}
              onOpenEditModal={(m) => {
                setEditingMember(m);
                setShowMemberFormModal(true);
              }}
              onOpenDetailModal={(m) => {
                setDetailMember(m);
                setShowMemberDetailModal(true);
              }}
              onDeleteMember={handleDeleteMember}
              corrections={corrections}
              onUpdateCorrection={handleUpdateCorrection}
              onDeleteCorrection={handleDeleteCorrection}
              onOpenImportModal={() => setShowImportModal(true)}
              onOpenPrintReport={() => {
                setReportType('members');
                setShowPrintReportModal(true);
              }}
            />
          )}

          {currentView === 'families' && (
            <FamiliesView
              families={families}
              members={members}
              rayons={rayons}
              onOpenAddModal={() => { setEditingFamily(null); setShowFamilyModal(true); }}
              onOpenEditModal={(f) => { setEditingFamily(f); setShowFamilyModal(true); }}
              onDeleteFamily={handleDeleteFamily}
              onOpenPrintReport={() => {
                setReportType('rayons');
                setShowPrintReportModal(true);
              }}
            />
          )}

          {currentView === 'rayons' && (
            <RayonsView
              rayons={rayons}
              categorials={categorials}
              members={members}
              onSelectMember={(m) => {
                setDetailMember(m);
                setShowMemberDetailModal(true);
              }}
              onSaveRayon={handleSaveRayon}
              onDeleteRayon={handleDeleteRayon}
              onSaveCategorial={handleSaveCategorial}
              onDeleteCategorial={handleDeleteCategorial}
            />
          )}

          {currentView === 'categorials' && (
            <RayonsView
              defaultTab="categorials"
              rayons={rayons}
              categorials={categorials}
              members={members}
              onSelectMember={(m) => {
                setDetailMember(m);
                setShowMemberDetailModal(true);
              }}
              onSaveRayon={handleSaveRayon}
              onDeleteRayon={handleDeleteRayon}
              onSaveCategorial={handleSaveCategorial}
              onDeleteCategorial={handleDeleteCategorial}
            />
          )}

          {currentView === 'staff' && (
            <StaffView
              staff={staff}
              onSaveStaff={handleSaveStaff}
              onDeleteStaff={handleDeleteStaff}
            />
          )}

          {currentView === 'sacraments' && (
            <SacramentsView
              baptisms={baptisms}
              confirmations={confirmations}
              marriages={marriages}
              members={members}
              onOpenAddBaptism={() => {
                setEditingSacrament(null);
                setSacramentType('baptis');
                setShowSacramentModal(true);
              }}
              onOpenAddConfirmation={() => {
                setEditingSacrament(null);
                setSacramentType('sidi');
                setShowSacramentModal(true);
              }}
              onOpenAddMarriage={() => {
                setEditingSacrament(null);
                setSacramentType('nikah');
                setShowSacramentModal(true);
              }}
              onOpenEditBaptism={(record) => {
                setEditingSacrament(record);
                setSacramentType('baptis');
                setShowSacramentModal(true);
              }}
              onOpenEditConfirmation={(record) => {
                setEditingSacrament(record);
                setSacramentType('sidi');
                setShowSacramentModal(true);
              }}
              onOpenEditMarriage={(record) => {
                setEditingSacrament(record);
                setSacramentType('nikah');
                setShowSacramentModal(true);
              }}
              onDeleteBaptism={handleDeleteBaptism}
              onDeleteConfirmation={handleDeleteConfirmation}
              onDeleteMarriage={handleDeleteMarriage}
              onPrintCertificate={(type, record) => {
                setReportType('sacraments');
                setShowPrintReportModal(true);
              }}
            />
          )}

          {currentView === 'mutations' && (
            <MutationsView
              mutations={mutations}
              members={members}
              rayons={rayons}
              onSaveMutation={handleSaveMutation}
              onDeleteMutation={handleDeleteMutation}
            />
          )}

          {currentView === 'events' && (
            <EventsView
              events={events}
              schedules={schedules}
              onSaveEvent={handleSaveEvent}
              onDeleteEvent={handleDeleteEvent}
              onSaveSchedule={handleSaveSchedule}
              onDeleteSchedule={handleDeleteSchedule}
            />
          )}

          {currentView === 'attendance' && (
            <AttendanceView
              attendance={attendance}
              onSaveAttendance={handleSaveAttendance}
              onDeleteAttendance={handleDeleteAttendance}
              onOpenPrintReport={() => {
                setReportType('attendance');
                setShowPrintReportModal(true);
              }}
            />
          )}

          {currentView === 'finance' && (
            <FinanceView
              transactions={transactions}
              onSaveTransaction={handleSaveFinance}
              onDeleteTransaction={handleDeleteFinance}
              onOpenPrintReport={() => {
                setReportType('finance');
                setShowPrintReportModal(true);
              }}
            />
          )}

          {currentView === 'documents' && (
            <DocumentsView
              documents={documents}
              onSaveDocument={handleSaveDocument}
              onDeleteDocument={handleDeleteDocument}
            />
          )}

          {currentView === 'announcements' && (
            <AnnouncementsView
              announcements={announcements}
              onSaveAnnouncement={handleSaveAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView
              onOpenPrintReport={(t) => {
                setReportType(t);
                setShowPrintReportModal(true);
              }}
              members={members}
              families={families}
              rayons={rayons}
              transactions={transactions}
            />
          )}

          {currentView === 'portal' && activePortalMember && (
            <JemaatPortalView
              currentMember={activePortalMember}
              family={activePortalFamily}
              familyMembers={activePortalFamilyMembers}
              schedules={schedules}
              corrections={corrections}
              onSubmitCorrection={handleSubmitCorrection}
              onPrintCard={() => {
                setDetailMember(activePortalMember);
                setShowMemberDetailModal(true);
              }}
            />
          )}

          {currentView === 'backup' && (
            <BackupView
              currentUser={currentUser}
              onOpenImport={() => setShowImportModal(true)}
              onDatabaseModified={loadAllData}
            />
          )}

          {currentView === 'users' && currentUser.role === 'Super Admin' && (
            <UsersView
              users={users}
              rayons={rayons}
              members={members}
              currentUser={currentUser}
              onSaveUser={handleSaveUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {currentView === 'audit' && (
            <AuditLogsView
              logs={auditLogs}
            />
          )}
          </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Modals */}
      <ErrorBoundary>
      <Suspense fallback={null}>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      <MemberFormModal
        isOpen={showMemberFormModal}
        onClose={() => {
          setShowMemberFormModal(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        member={editingMember}
        rayons={rayons}
        categorials={categorials}
        families={families}
      />

      <MemberDetailModal
        isOpen={showMemberDetailModal}
        onClose={() => {
          setShowMemberDetailModal(false);
          setDetailMember(null);
        }}
        member={detailMember}
      />

      <FamilyModal
        isOpen={showFamilyModal}
        onClose={() => { setShowFamilyModal(false); setEditingFamily(null); }}
        onSave={handleSaveFamily}
        family={editingFamily}
        rayons={rayons}
      />

      <SacramentModal
        isOpen={showSacramentModal}
        type={sacramentType}
        record={editingSacrament}
        onClose={() => { setShowSacramentModal(false); setEditingSacrament(null); }}
        members={members}
        onSaveBaptism={handleSaveBaptism}
        onSaveConfirmation={handleSaveConfirmation}
        onSaveMarriage={handleSaveMarriage}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportMembers}
        rayons={rayons}
        categorials={categorials}
      />

      <PrintReportModal
        isOpen={showPrintReportModal}
        onClose={() => setShowPrintReportModal(false)}
        reportType={reportType}
        members={members}
        families={families}
        rayons={rayons}
        transactions={transactions}
      />
      </Suspense>
      </ErrorBoundary>
    </div>
  );
}
