import React, { useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Star,
  Activity,
  ShieldAlert,
  ArrowRight,
  Clock,
} from 'lucide-react';
import {
  AdminAppConfig,
  AdminAuditLog,
  AdminRoute,
  ManagedUserAccount,
} from '../../types/admin';
import { APP_MODULES_CATALOG } from '../../utils/adminStore';
import { loadPersistedState } from '../../utils/storage';

interface AdminDashboardViewProps {
  users: ManagedUserAccount[];
  appConfig: AdminAppConfig;
  logs: AdminAuditLog[];
  onNavigate: (route: AdminRoute) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  users,
  appConfig,
  logs,
  onNavigate,
}) => {
  const localAppState = useMemo(() => loadPersistedState(), []);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === 'active').length;
    const blocked = users.filter((u) => u.status === 'blocked').length;
    const activePct = total > 0 ? Math.round((active / total) * 100) : 0;
    const totalStars = users.reduce((sum, u) => sum + u.starsCount, 0);
    const totalActivities = users.reduce((sum, u) => sum + u.activitiesCount, 0);
    const enabledModulesCount = APP_MODULES_CATALOG.filter(
      (m) => appConfig.enabledModules[m.id] !== false
    ).length;

    const ageBuckets = [
      { label: '2 a 4 anos', count: users.filter((u) => u.childAge <= 4).length, color: 'bg-emerald-500' },
      { label: '5 a 7 anos', count: users.filter((u) => u.childAge >= 5 && u.childAge <= 7).length, color: 'bg-sky-500' },
      { label: '8 a 12 anos', count: users.filter((u) => u.childAge >= 8).length, color: 'bg-indigo-500' },
    ];

    return {
      total,
      active,
      blocked,
      activePct,
      totalStars,
      totalActivities,
      enabledModulesCount,
      ageBuckets,
    };
  }, [users, appConfig]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Dashboard Administrativo
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Visão geral de contas, engajamento e estado global do aplicativo.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('users')}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition min-h-[44px] self-start sm:self-auto"
        >
          <span>Gerenciar usuários</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {/* Maintenance banner notice inside dashboard */}
      {appConfig.maintenanceMode && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm text-amber-950">
              <strong>Modo de manutenção ativo:</strong> usuários comuns estão visualizando o aviso de manutenção.
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('app-settings')}
            className="rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 shrink-0"
          >
            Ajustar
          </button>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Total de Contas
            </span>
            <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" aria-hidden="true" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">{stats.total}</div>
          <div className="text-xs text-slate-600 flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              <UserCheck className="w-3.5 h-3.5" aria-hidden="true" /> {stats.active} ativas
            </span>
            <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
              <UserX className="w-3.5 h-3.5" aria-hidden="true" /> {stats.blocked} bloqueadas
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Contas Ativas
            </span>
            <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" aria-hidden="true" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">{stats.active}</div>
          <div className="text-xs text-slate-600 tabular-nums">
            {stats.activePct}% da base cadastrada
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Atividades e Estrelas
            </span>
            <span className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Star className="w-5 h-5" aria-hidden="true" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            {stats.totalStars}
          </div>
          <div className="text-xs text-slate-600 tabular-nums">
            {stats.totalActivities} atividades concluídas · {localAppState.progress.totalMinutesUsed} min neste dispositivo
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Módulos Ativos
            </span>
            <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Activity className="w-5 h-5" aria-hidden="true" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
            {stats.enabledModulesCount}/{APP_MODULES_CATALOG.length}
          </div>
          <div className="text-xs text-slate-600">
            {appConfig.registrationOpen ? 'Novos cadastros abertos' : 'Novos cadastros pausados'}
          </div>
        </div>
      </div>

      {/* Distribution & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Age Group Distribution */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Distribuição por Faixa Etária
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Perfis infantis cadastrados na plataforma
            </p>
          </div>

          <div className="space-y-3.5">
            {stats.ageBuckets.map((bucket) => {
              const pct = stats.total > 0 ? Math.round((bucket.count / stats.total) * 100) : 0;
              return (
                <div key={bucket.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>{bucket.label}</span>
                    <span className="tabular-nums">
                      {bucket.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${bucket.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Tema padrão configurado:</span>
            <span className="font-bold text-slate-900">{appConfig.defaultThemeId}</span>
          </div>
        </div>

        {/* Recent Admin Activity */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Registro de Atividades Administrativas
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Últimas ações realizadas no painel
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('security')}
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900"
            >
              Ver segurança
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              Nenhuma ação registrada recentemente.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {logs.slice(0, 8).map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-slate-900">{log.action}</div>
                    <div className="text-xs text-slate-600 mt-0.5 break-words">{log.detail}</div>
                  </div>
                  <div className="text-[11px] text-slate-500 whitespace-nowrap flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" aria-hidden="true" />
                    <span>
                      {new Date(log.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
