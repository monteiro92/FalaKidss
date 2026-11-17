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
  ShieldCheck,
  QrCode,
} from 'lucide-react';
import {
  AdminAppConfig,
  AdminAuditLog,
  AdminRoute,
  AdminSession,
  ManagedUserAccount,
} from '../../types/admin';
import {
  adminRouteToPath,
  appendAdminAuditLog,
  createAdminUser,
  deleteAdminUser,
  fetchAdminUsers,
  getActiveAdminSession,
  loadAdminAppConfig,
  loadAdminAuditLogs,
  loadManagedUsers,
  logoutAdminSession,
  parseAdminRouteFromPathname,
  saveAdminAppConfig,
  saveManagedUsers,
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
  { id: 'users', label: 'Usuários', Icon: Users },
  { id: 'asaas', label: 'Asaas (PIX)', Icon: QrCode },
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
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [usersNotice, setUsersNotice] = useState<string | null>(null);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [appConfig, setAppConfig] = useState<AdminAppConfig>(() => loadAdminAppConfig());
  const [logs, setLogs] = useState<AdminAuditLog[]>(() => loadAdminAuditLogs());

  useEffect(() => {
    setRoute(parseAdminRouteFromPathname(currentPathname));
  }, [currentPathname]);

  const loadUsersFromServer = useCallback(async () => {
    if (!getActiveAdminSession()) return;
    setLoadingUsers(true);
    setUsersError(null);
    try {
      const serverUsers = await fetchAdminUsers();
      setUsers(serverUsers);
      saveManagedUsers(serverUsers);
    } catch (err) {
      setUsersError(
        err instanceof Error ? err.message : 'Erro ao carregar lista de usuários do servidor.'
      );
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      loadUsersFromServer();
    }
  }, [session, route, loadUsersFromServer]);

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
    // Route protection: reject route switches if unauthenticated
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
    setLogs(loadAdminAuditLogs());
    onSyncPathname('/admin');
  };

  // Hard auth guard across ALL /admin/* routes
  if (!session) {
    return (
      <AdminLoginView
        onSuccess={(newSession) => {
          setSession(newSession);
          setAppConfig(loadAdminAppConfig());
          setLogs(loadAdminAuditLogs());
        }}
        onExitToApp={onExitToApp}
      />
    );
  }

  const recordLog = (action: string, detail: string) => {
    const nextLogs = appendAdminAuditLog(action, detail, session.email);
    setLogs(nextLogs);
  };

  const showAutoSavedNotice = (msg: string) => {
    setUsersNotice(msg);
    window.setTimeout(() => {
      setUsersNotice((curr) => (curr === msg ? null : curr));
    }, 4000);
  };

  const handleCreateUser = async (payload: {
    guardianName: string;
    email: string;
    childName: string;
    childAge: number;
    status: ManagedUserAccount['status'];
    password?: string;
    notes?: string;
  }) => {
    setUsersError(null);
    const created = await createAdminUser(payload);
    setUsers((prev) => {
      const next = [created, ...prev];
      saveManagedUsers(next);
      return next;
    });
    recordLog('Conta cadastrada', `${created.guardianName} (${created.email})`);
    showAutoSavedNotice(`Usuário ${created.guardianName} cadastrado e salvo automaticamente.`);
  };

  const handleUpdateUser = async (
    id: string,
    payload: {
      guardianName: string;
      email: string;
      childName: string;
      childAge: number;
      status: ManagedUserAccount['status'];
      password?: string;
      notes?: string;
    }
  ) => {
    setUsersError(null);
    setSavingUserId(id);
    try {
      const updated = await updateAdminUser(id, payload);
      setUsers((prev) => {
        const next = prev.map((u) => (u.id === updated.id ? updated : u));
        saveManagedUsers(next);
        return next;
      });
      recordLog('Conta editada', `${updated.guardianName} (${updated.email})`);
      showAutoSavedNotice(`Alterações de ${updated.guardianName} salvas automaticamente.`);
    } finally {
      setSavingUserId(null);
    }
  };

  const handleToggleBlockUser = async (target: ManagedUserAccount) => {
    const nextStatus = (target.status === 'active' ? 'blocked' : 'active') as ManagedUserAccount['status'];
    setUsersError(null);
    setSavingUserId(target.id);
    try {
      const updated = await updateAdminUser(target.id, { status: nextStatus });
      setUsers((prev) => {
        const next = prev.map((u) => (u.id === updated.id ? updated : u));
        saveManagedUsers(next);
        return next;
      });
      recordLog(
        nextStatus === 'blocked' ? 'Conta bloqueada' : 'Conta desbloqueada',
        `${updated.guardianName} (${updated.email})`
      );
      showAutoSavedNotice(
        nextStatus === 'blocked'
          ? `Usuário ${updated.guardianName} bloqueado e salvo automaticamente.`
          : `Usuário ${updated.guardianName} desbloqueado e salvo automaticamente.`
      );
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : 'Erro ao alterar status do usuário.');
    } finally {
      setSavingUserId(null);
    }
  };

  const handleDeleteUser = async (target: ManagedUserAccount) => {
    setUsersError(null);
    setSavingUserId(target.id);
    try {
      await deleteAdminUser(target.id);
      setUsers((prev) => {
        const next = prev.filter((u) => u.id !== target.id);
        saveManagedUsers(next);
        return next;
      });
      recordLog('Conta excluída', `${target.guardianName} (${target.email})`);
      showAutoSavedNotice(`Usuário ${target.guardianName} removido e salvo automaticamente.`);
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
    recordLog('Configurações atualizadas', 'Parâmetros globais do aplicativo salvos');
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
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col lg:flex-row">
      {/* Desktop Dedicated Admin Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 bg-slate-950 text-slate-100 p-5 justify-between shrink-0 border-r border-slate-800">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-1">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-white truncate">Administração</div>
              <div className="text-[11px] text-slate-400 truncate">FalaKids</div>
            </div>
          </div>

          {renderMenuButtons()}
        </div>

        <div className="space-y-2 pt-4 border-t border-slate-800">
          <div className="px-2 pb-2">
            <div className="text-xs font-bold text-white truncate">{session.name}</div>
            <div className="text-[11px] text-slate-400 truncate">{session.email}</div>
          </div>

          <button
            type="button"
            onClick={onExitToApp}
            className="w-full flex items-center gap-2.5 rounded-2xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-slate-200 hover:bg-slate-800 transition min-h-[42px]"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>Voltar ao aplicativo</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-950/50 px-3.5 py-2.5 text-xs font-bold text-rose-200 hover:bg-rose-900/60 transition min-h-[42px]"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            <span>Encerrar sessão</span>
          </button>
        </div>
      </aside>

      {/* Mobile Admin Header */}
      <header className="lg:hidden sticky top-0 z-30 bg-slate-950 text-white px-4 h-[58px] flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menu administrativo"
            className="w-10 h-10 rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center text-slate-200"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
          <span className="text-sm font-extrabold tracking-tight">Painel Admin</span>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Sair do painel administrativo"
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-rose-300"
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
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[85vw] bg-slate-950 text-slate-100 h-full p-5 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-base font-extrabold text-white">Menu Admin</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Fechar menu administrativo"
                  className="w-9 h-9 rounded-xl border border-slate-800 flex items-center justify-center text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {renderMenuButtons()}
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onExitToApp}
                className="w-full flex items-center gap-2.5 rounded-2xl border border-slate-800 bg-slate-900 px-3.5 py-2.5 text-xs font-bold text-slate-200 min-h-[42px]"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Voltar ao aplicativo</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 rounded-2xl border border-rose-500/30 bg-rose-950/50 px-3.5 py-2.5 text-xs font-bold text-rose-200 min-h-[42px]"
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
            onToggleBlockUser={handleToggleBlockUser}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {route === 'asaas' && <AdminAsaasView />}

        {route === 'app-settings' && (
          <AdminAppSettingsView config={appConfig} onSaveConfig={handleSaveAppConfig} />
        )}

        {route === 'security' && (
          <AdminSecurityView
            session={session}
            logs={logs}
            onSessionUpdated={(updated) => {
              setSession(updated);
              setLogs(loadAdminAuditLogs());
            }}
          />
        )}
      </main>
    </div>
  );
};
