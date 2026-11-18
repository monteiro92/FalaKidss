import React, { useCallback, useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  QrCode,
} from 'lucide-react';
import tucaAppIcon from '../../assets/images/tuca_app_icon.png';
import {
  AdminAccountType,
  AdminAppConfig,
  AdminAuditLog,
  AdminDashboardMetrics,
  AdminPremiumDuration,
  AdminRoute,
  AdminSession,
  ManagedUserAccount,
  ManagedUserStatus,
} from '../../types/admin';
import { ContentTier } from '../../types/premium';
import {
  AdminContentCatalogResponse,
  adminRouteToPath,
  appendAdminAuditLog,
  blockAdminUser,
  createAdminUser,
  deleteAdminUser,
  fetchAdminContentCatalog,
  fetchAdminUserHistory,
  fetchAdminUsers,
  getActiveAdminSession,
  grantAdminUserPremium,
  loadAdminAppConfig,
  loadAdminAuditLogs,
  loadManagedUsers,
  logoutAdminSession,
  parseAdminRouteFromPathname,
  revokeAdminUserPremium,
  saveAdminAppConfig,
  saveManagedUsers,
  unblockAdminUser,
  updateAdminContentTier,
  updateAdminUser,
} from '../../utils/adminStore';
import { AdminLoginView } from './AdminLoginView';
import { AdminDashboardView } from './AdminDashboardView';
import { AdminUsersView } from './AdminUsersView';
import { AdminAppSettingsView } from './AdminAppSettingsView';
import { AdminSecurityView } from './AdminSecurityView';
import { AdminAsaasView } from './AdminAsaasView';

interface AdminPortalProps {
  currentPathname: string;
  onSyncPathname: (path: string) => void;
  onConfigUpdated: (config: AdminAppConfig) => void;
  onExitToApp: () => void;
}

const ADMIN_NAV: { id: AdminRoute; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'users', label: 'Usuários & Premium', Icon: Users },
  { id: 'asaas', label: 'Asaas (Pagamentos)', Icon: QrCode },
  { id: 'app-settings', label: 'Aplicativo', Icon: Settings },
  { id: 'security', label: 'Segurança', Icon: Shield },
];

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentPathname,
  onSyncPathname,
  onConfigUpdated,
  onExitToApp,
}) => {
  const [session, setSession] = useState<AdminSession | null>(() => getActiveAdminSession());
  const [route, setRoute] = useState<AdminRoute>(() =>
    parseAdminRouteFromPathname(currentPathname)
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [users, setUsers] = useState<ManagedUserAccount[]>(() => loadManagedUsers());
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [usersNotice, setUsersNotice] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [appConfig, setAppConfig] = useState<AdminAppConfig>(() => loadAdminAppConfig());
  const [logs, setLogs] = useState<AdminAuditLog[]>(() => loadAdminAuditLogs());
  const [contentCatalog, setContentCatalog] = useState<AdminContentCatalogResponse | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [savingCatalogId, setSavingCatalogId] = useState<string | null>(null);
  const [catalogNotice, setCatalogNotice] = useState<string | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  useEffect(() => {
    setRoute(parseAdminRouteFromPathname(currentPathname));
  }, [currentPathname]);

  const loadCatalogFromServer = useCallback(async () => {
    if (!getActiveAdminSession()) return;
    setLoadingCatalog(true);
    setCatalogError(null);
    try {
      const payload = await fetchAdminContentCatalog();
      setContentCatalog(payload);
      if (Array.isArray(payload.auditLogs) && payload.auditLogs.length > 0) {
        setLogs(payload.auditLogs);
      }
    } catch (err) {
      setCatalogError(
        err instanceof Error ? err.message : 'Erro ao carregar classificação dos conteúdos.'
      );
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  const loadUsersFromServer = useCallback(async () => {
    if (!getActiveAdminSession()) return;
    setLoadingUsers(true);
    setUsersError(null);
    try {
      const payload = await fetchAdminUsers();
      setUsers(payload.users);
      setMetrics(payload.metrics);
      if (payload.auditLogs.length > 0) {
        setLogs(payload.auditLogs);
      }
      saveManagedUsers(payload.users);
    } catch (err) {
      setUsersError(
        err instanceof Error ? err.message : 'Erro ao carregar dados administrativos do servidor.'
      );
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      loadUsersFromServer();
      loadCatalogFromServer();
    }
  }, [session, route, loadUsersFromServer, loadCatalogFromServer]);

  // Verify session validity periodically
  useEffect(() => {
    if (!session) return;
    const timer = window.setInterval(() => {
      const valid = getActiveAdminSession();
      if (!valid) {
        setSession(null);
      }
    }, 30000);
    return () => window.clearInterval(timer);
  }, [session]);

  const navigateAdmin = (nextRoute: AdminRoute) => {
    const active = getActiveAdminSession();
    if (!active) {
      setSession(null);
      return;
    }
    setRoute(nextRoute);
    onSyncPathname(adminRouteToPath(nextRoute));
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logoutAdminSession();
    setSession(null);
    onSyncPathname('/admin');
  };

  // Hard auth guard across ALL /admin/* routes
  if (!session) {
    return (
      <AdminLoginView
        onSuccess={(newSession) => {
          setSession(newSession);
          setAppConfig(loadAdminAppConfig());
        }}
        onExitToApp={onExitToApp}
      />
    );
  }

  const showAutoSavedNotice = (msg: string) => {
    setUsersNotice(msg);
    window.setTimeout(() => {
      setUsersNotice((curr) => (curr === msg ? null : curr));
    }, 4500);
  };

  const applyMutationState = (
    nextUsers: ManagedUserAccount[],
    nextMetrics: AdminDashboardMetrics,
    nextLogs: AdminAuditLog[]
  ) => {
    setUsers(nextUsers);
    saveManagedUsers(nextUsers);
    setMetrics(nextMetrics);
    if (Array.isArray(nextLogs)) {
      setLogs(nextLogs);
    }
  };

  const handleCreateUser = async (payload: {
    guardianName: string;
    email: string;
    accountType: AdminAccountType;
    childName: string;
    childAge: number;
    status: ManagedUserStatus;
    plan: 'free' | 'premium';
    passwordMode: 'provisional' | 'invite';
    password?: string;
    notes?: string;
    premiumGrant?: {
      duration: AdminPremiumDuration;
      startDate?: string;
      expiresAt?: string | null;
      reason?: string;
    };
  }) => {
    setUsersError(null);
    const res = await createAdminUser(payload);
    const nextUsers = [res.user, ...users];
    applyMutationState(nextUsers, res.metrics, res.auditLogs);
    showAutoSavedNotice(`Usuário ${res.user.guardianName} adicionado e salvo no servidor.`);
  };

  const handleUpdateUser = async (
    id: string,
    payload: {
      guardianName?: string;
      email?: string;
      accountType?: AdminAccountType;
      childName?: string;
      childAge?: number;
      status?: ManagedUserStatus;
      plan?: 'free' | 'premium';
      passwordMode?: 'keep' | 'provisional' | 'invite';
      password?: string;
      notes?: string;
    }
  ) => {
    setUsersError(null);
    setSavingUserId(id);
    try {
      const res = await updateAdminUser(id, payload);
      const nextUsers = users.map((u) => (u.id === res.user.id ? res.user : u));
      applyMutationState(nextUsers, res.metrics, res.auditLogs);
      showAutoSavedNotice(`Cadastro de ${res.user.guardianName} atualizado com sucesso.`);
    } finally {
      setSavingUserId(null);
    }
  };

  const handleGrantPremium = async (
    id: string,
    payload: {
      duration: AdminPremiumDuration;
      startDate?: string;
      expiresAt?: string | null;
      reason?: string;
    }
  ) => {
    setUsersError(null);
    setSavingUserId(id);
    try {
      const res = await grantAdminUserPremium(id, payload);
      const nextUsers = users.map((u) => (u.id === res.user.id ? res.user : u));
      applyMutationState(nextUsers, res.metrics, res.auditLogs);
      showAutoSavedNotice(
        `FalaKids Premium liberado administrativamente para ${res.user.guardianName}.`
      );
    } finally {
      setSavingUserId(null);
    }
  };

  const handleRevokePremium = async (id: string, reason?: string) => {
    setUsersError(null);
    setSavingUserId(id);
    try {
      const res = await revokeAdminUserPremium(id, reason);
      const nextUsers = users.map((u) => (u.id === res.user.id ? res.user : u));
      applyMutationState(nextUsers, res.metrics, res.auditLogs);
      showAutoSavedNotice(
        `Acesso Premium administrativo revogado para ${res.user.guardianName}.`
      );
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Erro ao revogar Premium.');
    } finally {
      setSavingUserId(null);
    }
  };

  const handleBlockUser = async (target: ManagedUserAccount) => {
    setUsersError(null);
    setSavingUserId(target.id);
    try {
      const res = await blockAdminUser(target.id);
      const nextUsers = users.map((u) => (u.id === res.user.id ? res.user : u));
      applyMutationState(nextUsers, res.metrics, res.auditLogs);
      showAutoSavedNotice(`Usuário ${res.user.guardianName} bloqueado no servidor.`);
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Erro ao bloquear usuário.');
    } finally {
      setSavingUserId(null);
    }
  };

  const handleUnblockUser = async (target: ManagedUserAccount) => {
    setUsersError(null);
    setSavingUserId(target.id);
    try {
      const res = await unblockAdminUser(target.id);
      const nextUsers = users.map((u) => (u.id === res.user.id ? res.user : u));
      applyMutationState(nextUsers, res.metrics, res.auditLogs);
      showAutoSavedNotice(`Usuário ${res.user.guardianName} desbloqueado com sucesso.`);
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Erro ao desbloquear usuário.');
    } finally {
      setSavingUserId(null);
    }
  };

  const handleDeleteUser = async (target: ManagedUserAccount) => {
    setUsersError(null);
    setSavingUserId(target.id);
    try {
      const res = await deleteAdminUser(target.id);
      const nextUsers = users.filter((u) => u.id !== target.id);
      applyMutationState(nextUsers, res.metrics, res.auditLogs);
      showAutoSavedNotice(`Usuário ${target.guardianName} excluído permanentemente.`);
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Erro ao excluir usuário.');
    } finally {
      setSavingUserId(null);
    }
  };

  const handleSaveAppConfig = (nextConfig: AdminAppConfig) => {
    setAppConfig(nextConfig);
    saveAdminAppConfig(nextConfig);
    onConfigUpdated(nextConfig);
    appendAdminAuditLog(
      'Configurações do aplicativo atualizadas',
      'Parâmetros globais salvos',
      session.email
    );
  };

  const handleToggleContentTier = async (id: string, nextTier: ContentTier) => {
    setCatalogError(null);
    setCatalogNotice(null);
    setSavingCatalogId(id);
    try {
      const updated = await updateAdminContentTier(id, nextTier);
      setContentCatalog(updated);
      if (Array.isArray(updated.auditLogs) && updated.auditLogs.length > 0) {
        setLogs(updated.auditLogs);
      }
      const changedItem = updated.items.find((it) => it.id === id);
      const msg = `"${changedItem?.title || id}" classificado como ${nextTier} no servidor.`;
      setCatalogNotice(msg);
      window.setTimeout(() => {
        setCatalogNotice((curr) => (curr === msg ? null : curr));
      }, 4000);
    } catch (err) {
      setCatalogError(
        err instanceof Error ? err.message : 'Não foi possível alterar a classificação do conteúdo.'
      );
    } finally {
      setSavingCatalogId(null);
    }
  };

  const renderMenuButtons = () => (
    <nav className="space-y-1.5" aria-label="Menu administrativo">
      {ADMIN_NAV.map((item) => {
        const Icon = item.Icon;
        const active = route === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => navigateAdmin(item.id)}
            aria-current={active ? 'page' : undefined}
            className={`w-full flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-bold transition min-h-[44px] ${
              active
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-sm'
                : 'text-[#0F2942] hover:bg-amber-100/80'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#0F2942] flex flex-col lg:flex-row">
      {/* Desktop Dedicated FalaKids Admin Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-[#FFFBEB] text-[#0F2942] p-5 justify-between shrink-0 border-r border-amber-200">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-1">
            <img
              src={tucaAppIcon}
              alt="FalaKids"
              className="w-11 h-11 rounded-2xl object-cover shadow-xs border border-amber-200 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-base font-display font-extrabold text-[#0F2942] truncate">
                FalaKids Admin
              </div>
              <div className="text-[11px] font-bold text-orange-700 truncate">
                Gestão Administrativa
              </div>
            </div>
          </div>

          {renderMenuButtons()}
        </div>

        <div className="space-y-2.5 pt-4 border-t border-amber-200">
          <div className="rounded-2xl border border-amber-200 bg-white/80 px-3 py-2.5">
            <div className="text-xs font-extrabold text-[#0F2942] truncate">{session.name}</div>
            <div className="text-[11px] text-slate-600 truncate">{session.email}</div>
          </div>

          <button
            type="button"
            onClick={onExitToApp}
            className="w-full flex items-center gap-2.5 rounded-2xl border border-amber-200 bg-white px-3.5 py-2.5 text-xs font-bold text-[#0F2942] hover:bg-amber-50 transition min-h-[42px]"
          >
            <ArrowLeft className="w-4 h-4 text-orange-600" aria-hidden="true" />
            <span>Voltar ao aplicativo</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-800 hover:bg-rose-100 transition min-h-[42px]"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span>Encerrar sessão</span>
          </button>
        </div>
      </aside>

      {/* Mobile Admin Header */}
      <header className="lg:hidden sticky top-0 z-30 bg-[#FFFBEB]/95 backdrop-blur-xs text-[#0F2942] px-4 h-[60px] flex items-center justify-between border-b border-amber-200">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menu administrativo"
            className="w-10 h-10 rounded-xl border border-amber-200 bg-white flex items-center justify-center text-[#0F2942]"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
          <img
            src={tucaAppIcon}
            alt="FalaKids"
            className="w-8 h-8 rounded-xl object-cover border border-amber-200"
          />
          <span className="text-sm font-display font-extrabold tracking-tight text-[#0F2942]">
            FalaKids Admin
          </span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Sair do painel administrativo"
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-800"
        >
          <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Sair</span>
        </button>
      </header>

      {/* Mobile Admin Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Menu administrativo móvel"
        >
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-[#0F2942]/45 backdrop-blur-xs"
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] bg-[#FFFBEB] text-[#0F2942] h-full p-5 flex flex-col justify-between border-r border-amber-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={tucaAppIcon}
                    alt="FalaKids"
                    className="w-9 h-9 rounded-xl object-cover border border-amber-200"
                  />
                  <span className="text-base font-display font-extrabold text-[#0F2942]">
                    FalaKids Admin
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Fechar menu administrativo"
                  className="w-9 h-9 rounded-xl border border-amber-200 bg-white flex items-center justify-center text-[#0F2942]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {renderMenuButtons()}
            </div>

            <div className="space-y-2 pt-4 border-t border-amber-200">
              <button
                type="button"
                onClick={onExitToApp}
                className="w-full flex items-center gap-2.5 rounded-2xl border border-amber-200 bg-white px-3.5 py-2.5 text-xs font-bold text-[#0F2942] min-h-[42px]"
              >
                <ArrowLeft className="w-4 h-4 text-orange-600" aria-hidden="true" />
                <span>Voltar ao aplicativo</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-800 min-h-[42px]"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Encerrar sessão</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Protected Admin Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {route === 'dashboard' && (
          <AdminDashboardView
            users={users}
            metrics={metrics}
            appConfig={appConfig}
            logs={logs}
            onNavigate={navigateAdmin}
          />
        )}

        {route === 'users' && (
          <AdminUsersView
            users={users}
            loading={loadingUsers}
            savingUserId={savingUserId}
            autoSaveNotice={usersNotice}
            serverError={usersError}
            onRefresh={loadUsersFromServer}
            onCreateUser={handleCreateUser}
            onUpdateUser={handleUpdateUser}
            onGrantPremium={handleGrantPremium}
            onRevokePremium={handleRevokePremium}
            onBlockUser={handleBlockUser}
            onUnblockUser={handleUnblockUser}
            onDeleteUser={handleDeleteUser}
            onFetchUserHistory={fetchAdminUserHistory}
          />
        )}

        {route === 'asaas' && <AdminAsaasView />}

        {route === 'app-settings' && (
          <AdminAppSettingsView
            config={appConfig}
            contentCatalog={contentCatalog}
            loadingCatalog={loadingCatalog}
            savingCatalogId={savingCatalogId}
            catalogNotice={catalogNotice}
            catalogError={catalogError}
            onSaveConfig={handleSaveAppConfig}
            onRefreshCatalog={loadCatalogFromServer}
            onToggleContentTier={handleToggleContentTier}
          />
        )}

        {route === 'security' && (
          <AdminSecurityView
            session={session}
            logs={logs}
            onSessionUpdated={(updated) => {
              setSession(updated);
              loadUsersFromServer();
            }}
          />
        )}
      </main>
    </div>
  );
};
