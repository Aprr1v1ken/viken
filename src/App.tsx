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
  const [showSacramentModal, setShowSacramentModal] = useState(false);
  const [sacramentType, setSacramentType] = useState<'baptis' | 'sidi' | 'nikah'>('baptis');
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
    await api.createFamilyApi(data);
    await loadAllData();
  };

  const handleDeleteFamily = async (id: string) => {
    await api.deleteFamilyApi(id);
    await loadAllData();
  };

  // Staff handler
  const handleAddStaff = async (data: Partial<ChurchStaff>) => {
    await api.createStaffApi(data);
    await loadAllData();
  };

  // Sacrament handlers
  const handleSaveBaptism = async (data: any) => {
    await api.createBaptismApi(data);
    await loadAllData();
  };
  const handleSaveConfirmation = async (data: any) => {
    await api.createConfirmationApi(data);
    await loadAllData();
  };
  const handleSaveMarriage = async (data: any) => {
    await api.createMarriageApi(data);
    await loadAllData();
  };

  // Mutation handler
  const handleAddMutation = async (data: Partial<MutationRecord>) => {
    await api.createMutationApi(data);
    await loadAllData();
  };

  // Event & Schedule handlers
  const handleAddEvent = async (data: Partial<ChurchEvent>) => {
    await api.createEventApi(data);
    await loadAllData();
  };
  const handleAddSchedule = async (data: Partial<ServiceSchedule>) => {
    await api.createScheduleApi(data);
    await loadAllData();
  };

  // Attendance handler
  const handleAddAttendance = async (data: Partial<AttendanceRecord>) => {
    await api.createAttendanceApi(data);
    await loadAllData();
  };

  // Finance handler
  const handleAddFinance = async (data: Partial<FinancialTransaction>) => {
    await api.createFinanceApi(data);
    await loadAllData();
  };

  // Document handler
  const handleAddDocument = async (data: Partial<DocumentRecord>) => {
    await api.createDocumentApi(data);
    await loadAllData();
  };

  // Announcement handler
  const handleAddAnnouncement = async (data: Partial<Announcement>) => {
    await api.createAnnouncementApi(data);
    await loadAllData();
  };

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
              onOpenAddFamily={() => setShowFamilyModal(true)}
              onOpenAddFinance={() => setCurrentView('finance')}
              onOpenAddAttendance={() => setCurrentView('attendance')}
              onSeedDemoData={async () => {
                await api.resetSeedDataApi(currentUser?.role || 'Super Admin');
                await loadAllData();
              }}
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
              onOpenAddModal={() => setShowFamilyModal(true)}
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
            />
          )}

          {currentView === 'categorials' && (
            <RayonsView
              rayons={rayons}
              categorials={categorials}
              members={members}
              onSelectMember={(m) => {
                setDetailMember(m);
                setShowMemberDetailModal(true);
              }}
            />
          )}

          {currentView === 'staff' && (
            <StaffView
              staff={staff}
              onAddStaff={handleAddStaff}
            />
          )}

          {currentView === 'sacraments' && (
            <SacramentsView
              baptisms={baptisms}
              confirmations={confirmations}
              marriages={marriages}
              members={members}
              onOpenAddBaptism={() => {
                setSacramentType('baptis');
                setShowSacramentModal(true);
              }}
              onOpenAddConfirmation={() => {
                setSacramentType('sidi');
                setShowSacramentModal(true);
              }}
              onOpenAddMarriage={() => {
                setSacramentType('nikah');
                setShowSacramentModal(true);
              }}
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
              onAddMutation={handleAddMutation}
            />
          )}

          {currentView === 'events' && (
            <EventsView
              events={events}
              schedules={schedules}
              onAddEvent={handleAddEvent}
              onAddSchedule={handleAddSchedule}
            />
          )}

          {currentView === 'attendance' && (
            <AttendanceView
              attendance={attendance}
              onAddAttendance={handleAddAttendance}
              onOpenPrintReport={() => {
                setReportType('attendance');
                setShowPrintReportModal(true);
              }}
            />
          )}

          {currentView === 'finance' && (
            <FinanceView
              transactions={transactions}
              onAddTransaction={handleAddFinance}
              onOpenPrintReport={() => {
                setReportType('finance');
                setShowPrintReportModal(true);
              }}
            />
          )}

          {currentView === 'documents' && (
            <DocumentsView
              documents={documents}
              onAddDocument={handleAddDocument}
            />
          )}

          {currentView === 'announcements' && (
            <AnnouncementsView
              announcements={announcements}
              onAddAnnouncement={handleAddAnnouncement}
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
        onClose={() => setShowFamilyModal(false)}
        onSave={handleSaveFamily}
        rayons={rayons}
      />

      <SacramentModal
        isOpen={showSacramentModal}
        type={sacramentType}
        onClose={() => setShowSacramentModal(false)}
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
