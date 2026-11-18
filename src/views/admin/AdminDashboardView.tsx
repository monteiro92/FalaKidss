import React, { useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Crown,
  Sparkles,
  Clock,
  ShieldAlert,
  ArrowRight,
  CircleDollarSign,
  AlertTriangle,
  Star,
} from 'lucide-react';
import {
  AdminAppConfig,
  AdminAuditLog,
  AdminDashboardMetrics,
  AdminRoute,
  ManagedUserAccount,
} from '../../types/admin';
import { APP_MODULES_CATALOG } from '../../utils/adminStore';

interface AdminDashboardViewProps {
  users: ManagedUserAccount[];
  metrics: AdminDashboardMetrics | null;
  appConfig: AdminAppConfig;
  logs: AdminAuditLog[];
  onNavigate: (route: AdminRoute) => void;
}

function formatCurrencyBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  users,
  metrics,
  appConfig,
  logs,
  onNavigate,
}) => {
  const resolvedMetrics: AdminDashboardMetrics = useMemo(() => {
    if (metrics) return metrics;
    return {
      totalUsers: users.length,
      freeUsers: users.filter((u) => !u.hasEffectivePremium && u.status === 'active').length,
      paidPremiumUsers: users.filter((u) => u.accessBadge === 'PREMIUM PAGO').length,
      adminPremiumUsers: users.filter((u) => u.accessBadge === 'PREMIUM ADMINISTRATIVO').length,
      blockedUsers: users.filter((u) => u.status === 'blocked').length,
      expiredSubscriptions: users.filter((u) => u.accessBadge === 'PREMIUM EXPIRADO').length,
      revokedUsers: users.filter((u) => u.accessBadge === 'PREMIUM REVOGADO').length,
      receivedRevenueBRL: 0,
      commercialPlanPriceBRL: 29.99,
      activeUsers: users.filter((u) => u.status === 'active').length,
    };
  }, [metrics, users]);

  const ageBuckets = useMemo(() => {
    const total = users.length;
    return [
      {
        label: '2 a 4 anos',
        count: users.filter((u) => u.childAge <= 4).length,
        color: 'bg-emerald-500',
        total,
      },
      {
        label: '5 a 7 anos',
        count: users.filter((u) => u.childAge >= 5 && u.childAge <= 7).length,
        color: 'bg-amber-500',
        total,
      },
      {
        label: '8 a 12 anos',
        count: users.filter((u) => u.childAge >= 8).length,
        color: 'bg-orange-600',
        total,
      },
    ];
  }, [users]);

  const enabledModulesCount = useMemo(
    () => APP_MODULES_CATALOG.filter((m) => appConfig.enabledModules[m.id] !== false).length,
    [appConfig]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-[#FFFBEB] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-900 mb-2">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-600" aria-hidden="true" />
            <span>Painel Administrativo FalaKids · Valor ref. {formatCurrencyBRL(resolvedMetrics.commercialPlanPriceBRL)}/mês</span>
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-[#0F2942]">
            Dashboard Administrativo
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Indicadores reais de usuários, assinaturas pagas, concessões administrativas e receita efetivamente recebida.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('users')}
          className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-orange-700 transition min-h-[44px] self-start sm:self-auto shadow-xs"
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

      {/* Real Revenue Highlight + 6 Real User Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-amber-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Total de Usuários
            </span>
            <span className="w-9 h-9 rounded-xl bg-amber-100 text-orange-600 flex items-center justify-center">
              <Users className="w-5 h-5" aria-hidden="true" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#0F2942] tabular-nums">
            {resolvedMetrics.totalUsers}
          </div>
          <div className="text-xs text-slate-600">
            {resolvedMetrics.activeUsers} contas com situação ativa
          </div>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Usuários Gratuitos
            </span>
            <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <UserCheck className="w-5 h-5" aria-hidden="true" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#0F2942] tabular-nums">
            {resolvedMetrics.freeUsers}
          </div>
          <div className="text-xs text-slate-600">
            Incluindo contas gratuitas e sem Premium ativo
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-emerald-800">
              Assinantes Premium Pagos
            </span>
            <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Crown className="w-5 h-5" aria-hidden="true" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-950 tabular-nums">
            {resolvedMetrics.paidPremiumUsers}
          </div>
          <div className="text-xs text-emerald-800">
            Pagamentos confirmados no gateway Asaas
          </div>
        </div>

        <div className="rounded-3xl border border-orange-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-orange-800">
              Premium Administrativo
            </span>
            <span className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#0F2942] tabular-nums">
            {resolvedMetrics.adminPremiumUsers}
          </div>
          <div className="text-xs text-slate-600">
            Concessões manuais (sem geração de cobrança)
          </div>
        </div>
      </div>

      {/* Second KPI Row: Blocked, Expired, Real Revenue & Active Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-rose-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-rose-800">
              Usuários Bloqueados
            </span>
            <span className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <UserX className="w-5 h-5" aria-hidden="true" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-rose-950 tabular-nums">
            {resolvedMetrics.blockedUsers}
          </div>
          <div className="text-xs text-slate-600">
            Contas suspensas pelo administrador
          </div>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-white p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-amber-900">
              Assinaturas Expiradas
            </span>
            <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-[#0F2942] tabular-nums">
            {resolvedMetrics.expiredSubscriptions}
          </div>
          <div className="text-xs text-slate-600">
            Assinaturas vencidas/canceladas ou prazos vencidos
          </div>
        </div>

        <div className="rounded-3xl border-2 border-emerald-300 bg-gradient-to-br from-white via-[#FFFDF7] to-emerald-50/60 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wide text-emerald-900">
              Receita Efetivamente Recebida
            </span>
            <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CircleDollarSign className="w-5 h-5" aria-hidden="true" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-950 tabular-nums">
            {formatCurrencyBRL(resolvedMetrics.receivedRevenueBRL)}
          </div>
          <div className="text-[11px] font-semibold text-emerald-900">
            Soma apenas pagamentos reais confirmados. Concessões administrativas não contabilizam como receita.
          </div>
        </div>
      </div>

      {/* Distribution & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Age Group Distribution */}
        <div className="lg:col-span-5 rounded-3xl border border-amber-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-extrabold text-[#0F2942]">
              Distribuição por Faixa Etária
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Perfis infantis reais cadastrados no FalaKids ({enabledModulesCount}/{APP_MODULES_CATALOG.length} módulos ativos)
            </p>
          </div>

          <div className="space-y-3.5">
            {ageBuckets.map((bucket) => {
              const pct =
                bucket.total > 0 ? Math.round((bucket.count / bucket.total) * 100) : 0;
              return (
                <div key={bucket.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#0F2942]">
                    <span>{bucket.label}</span>
                    <span className="tabular-nums">
                      {bucket.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-amber-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${bucket.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-amber-100 flex items-center justify-between text-xs text-slate-600">
            <span>Tema padrão do aplicativo:</span>
            <span className="font-bold text-[#0F2942]">{appConfig.defaultThemeId}</span>
          </div>
        </div>

        {/* Recent Admin Activity */}
        <div className="lg:col-span-7 rounded-3xl border border-amber-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-[#0F2942]">
                Registro de Operações Administrativas
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Trilha de auditoria gravada no servidor com responsável, data e horário
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('security')}
              className="text-xs font-extrabold text-orange-700 hover:text-orange-900"
            >
              Ver auditoria completa
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-200 bg-[#FFFDF7] p-6 text-center text-sm text-slate-500">
              Nenhuma operação administrativa registrada até o momento.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {logs.slice(0, 8).map((log) => (
                <div
                  key={log.id}
                  className="rounded-2xl border border-amber-100 bg-[#FFFDF7] px-4 py-3 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#0F2942]">{log.action}</div>
                    <div className="text-xs text-slate-600 mt-0.5 break-words">{log.detail}</div>
                    <div className="text-[11px] font-semibold text-amber-800 mt-1">
                      Admin: {log.actorName || log.actorEmail} ({log.actorEmail})
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-500 whitespace-nowrap flex items-center gap-1 shrink-0 tabular-nums">
                    <Clock className="w-3 h-3 text-orange-600" aria-hidden="true" />
                    <span>
                      {new Date(log.timestamp).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
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
