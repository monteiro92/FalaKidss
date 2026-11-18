import React, { useMemo, useState } from 'react';
import {
  Search,
  UserPlus,
  Pencil,
  Ban,
  CheckCircle2,
  Trash2,
  X,
  RefreshCw,
  AlertCircle,
  Users,
  ShieldCheck,
  Crown,
  Eye,
  History,
  Sparkles,
  Calendar,
  ArrowUpDown,
  XCircle,
  Clock,
  Receipt,
} from 'lucide-react';
import {
  AdminAccountType,
  AdminPremiumDuration,
  AdminUserHistoryResponse,
  ManagedUserAccount,
  ManagedUserStatus,
  UserAccessBadge,
} from '../../types/admin';

interface AdminUsersViewProps {
  users: ManagedUserAccount[];
  loading?: boolean;
  savingUserId?: string | null;
  autoSaveNotice?: string | null;
  serverError?: string | null;
  onRefresh?: () => void;
  onCreateUser: (payload: {
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
  }) => Promise<void>;
  onUpdateUser: (
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
  ) => Promise<void>;
  onGrantPremium: (
    id: string,
    payload: {
      duration: AdminPremiumDuration;
      startDate?: string;
      expiresAt?: string | null;
      reason?: string;
    }
  ) => Promise<void>;
  onRevokePremium: (id: string, reason?: string) => Promise<void>;
  onBlockUser: (user: ManagedUserAccount) => Promise<void>;
  onUnblockUser: (user: ManagedUserAccount) => Promise<void>;
  onDeleteUser: (user: ManagedUserAccount) => Promise<void>;
  onFetchUserHistory: (id: string) => Promise<AdminUserHistoryResponse>;
}

interface UserFormState {
  guardianName: string;
  email: string;
  accountType: AdminAccountType;
  childName: string;
  childAge: number;
  status: ManagedUserStatus;
  plan: 'free' | 'premium';
  passwordMode: 'provisional' | 'invite' | 'keep';
  password: string;
  notes: string;
  grantDuration: AdminPremiumDuration;
  grantStartDate: string;
  grantExpiresAt: string;
  grantReason: string;
}

interface GrantFormState {
  duration: AdminPremiumDuration;
  startDate: string;
  expiresAt: string;
  reason: string;
}

type ConfirmActionState =
  | { type: 'block'; user: ManagedUserAccount }
  | { type: 'revoke'; user: ManagedUserAccount }
  | { type: 'delete'; user: ManagedUserAccount }
  | null;

const ACCOUNT_TYPE_LABELS: Record<AdminAccountType, string> = {
  responsavel: 'Responsável / Família',
  educador: 'Educador(a) / Professor',
  clinica: 'Clínica / Fonoaudiologia',
  convidado: 'Convidado / Parceiro',
};

function getTodayYmd(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDurationToYmd(startYmd: string, duration: AdminPremiumDuration): string {
  if (duration === 'permanent') return '';
  const base = startYmd ? new Date(`${startYmd}T12:00:00`) : new Date();
  if (Number.isNaN(base.getTime())) return '';
  if (duration === '30_days') base.setDate(base.getDate() + 30);
  else if (duration === '90_days') base.setDate(base.getDate() + 90);
  else if (duration === '6_months') base.setMonth(base.getMonth() + 6);
  else return '';
  const y = base.getFullYear();
  const m = String(base.getMonth() + 1).padStart(2, '0');
  const d = String(base.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDatePtBr(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const normalized = dateStr.length === 10 ? `${dateStr}T12:00:00` : dateStr;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('pt-BR');
}

function formatCurrencyBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getBadgeStyle(badge: UserAccessBadge): string {
  switch (badge) {
    case 'PREMIUM PAGO':
      return 'bg-emerald-50 border-emerald-300 text-emerald-900';
    case 'PREMIUM ADMINISTRATIVO':
      return 'bg-orange-50 border-orange-300 text-orange-900';
    case 'PREMIUM EXPIRADO':
      return 'bg-amber-100 border-amber-300 text-amber-950';
    case 'PREMIUM REVOGADO':
      return 'bg-slate-100 border-slate-300 text-slate-800';
    case 'BLOQUEADO':
      return 'bg-rose-50 border-rose-300 text-rose-900';
    case 'GRATUITO':
    default:
      return 'bg-amber-50 border-amber-200 text-[#0F2942]';
  }
}

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  users,
  loading = false,
  savingUserId = null,
  autoSaveNotice = null,
  serverError = null,
  onRefresh,
  onCreateUser,
  onUpdateUser,
  onGrantPremium,
  onRevokePremium,
  onBlockUser,
  onUnblockUser,
  onDeleteUser,
  onFetchUserHistory,
}) => {
  const [search, setSearch] = useState('');
  const [badgeFilter, setBadgeFilter] = useState<'all' | UserAccessBadge>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ManagedUserStatus>('all');

  // Create / Edit User modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUserAccount | null>(null);
  const [form, setForm] = useState<UserFormState>(() => {
    const today = getTodayYmd();
    return {
      guardianName: '',
      email: '',
      accountType: 'responsavel',
      childName: '',
      childAge: 5,
      status: 'active',
      plan: 'free',
      passwordMode: 'provisional',
      password: '',
      notes: '',
      grantDuration: '30_days',
      grantStartDate: today,
      grantExpiresAt: addDurationToYmd(today, '30_days'),
      grantReason: '',
    };
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submittingForm, setSubmittingForm] = useState(false);

  // Grant Premium modal
  const [grantTarget, setGrantTarget] = useState<ManagedUserAccount | null>(null);
  const [grantForm, setGrantForm] = useState<GrantFormState>(() => {
    const today = getTodayYmd();
    return {
      duration: '30_days',
      startDate: today,
      expiresAt: addDurationToYmd(today, '30_days'),
      reason: '',
    };
  });
  const [grantError, setGrantError] = useState<string | null>(null);
  const [submittingGrant, setSubmittingGrant] = useState(false);

  // Change Plan modal
  const [planModalUser, setPlanModalUser] = useState<ManagedUserAccount | null>(null);

  // Confirm Dialog (Block / Revoke / Delete)
  const [confirmAction, setConfirmAction] = useState<ConfirmActionState>(null);
  const [revokeReasonInput, setRevokeReasonInput] = useState('');
  const [submittingConfirm, setSubmittingConfirm] = useState(false);

  // Details & History Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsTab, setDetailsTab] = useState<'details' | 'history'>('details');
  const [detailsUser, setDetailsUser] = useState<ManagedUserAccount | null>(null);
  const [historyData, setHistoryData] = useState<AdminUserHistoryResponse | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const summary = useMemo(() => {
    const total = users.length;
    const paidCount = users.filter((u) => u.accessBadge === 'PREMIUM PAGO').length;
    const adminPremCount = users.filter((u) => u.accessBadge === 'PREMIUM ADMINISTRATIVO').length;
    const freeCount = users.filter(
      (u) =>
        u.accessBadge === 'GRATUITO' ||
        u.accessBadge === 'PREMIUM EXPIRADO' ||
        u.accessBadge === 'PREMIUM REVOGADO'
    ).length;
    const blockedCount = users.filter((u) => u.status === 'blocked').length;
    return { total, paidCount, adminPremCount, freeCount, blockedCount };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      if (badgeFilter !== 'all' && u.accessBadge !== badgeFilter) return false;
      if (!q) return true;
      return (
        u.guardianName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.childName.toLowerCase().includes(q) ||
        u.accessBadge.toLowerCase().includes(q)
      );
    });
  }, [users, search, statusFilter, badgeFilter]);

  const openCreateModal = () => {
    const today = getTodayYmd();
    setEditingUser(null);
    setForm({
      guardianName: '',
      email: '',
      accountType: 'responsavel',
      childName: '',
      childAge: 5,
      status: 'active',
      plan: 'free',
      passwordMode: 'provisional',
      password: '',
      notes: '',
      grantDuration: '30_days',
      grantStartDate: today,
      grantExpiresAt: addDurationToYmd(today, '30_days'),
      grantReason: '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (user: ManagedUserAccount) => {
    const today = getTodayYmd();
    setEditingUser(user);
    setForm({
      guardianName: user.guardianName,
      email: user.email,
      accountType: user.accountType || 'responsavel',
      childName: user.childName,
      childAge: user.childAge,
      status: user.status,
      plan: user.hasEffectivePremium ? 'premium' : 'free',
      passwordMode: 'keep',
      password: '',
      notes: user.notes || '',
      grantDuration: '30_days',
      grantStartDate: today,
      grantExpiresAt: addDurationToYmd(today, '30_days'),
      grantReason: '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const openGrantModal = (user: ManagedUserAccount) => {
    const today = getTodayYmd();
    setGrantTarget(user);
    setGrantForm({
      duration: '30_days',
      startDate: today,
      expiresAt: addDurationToYmd(today, '30_days'),
      reason: '',
    });
    setGrantError(null);
  };

  const openDetailsOrHistory = async (
    user: ManagedUserAccount,
    initialTab: 'details' | 'history'
  ) => {
    setDetailsUser(user);
    setDetailsTab(initialTab);
    setDetailsModalOpen(true);
    setHistoryData(null);
    setLoadingHistory(true);
    try {
      const res = await onFetchUserHistory(user.id);
      setHistoryData(res);
      setDetailsUser(res.user);
    } catch {
      // Keep basic user details visible even if history request fails
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSaveUserForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const guardianName = form.guardianName.trim();
    const email = form.email.trim().toLowerCase();
    const childName = form.childName.trim() || 'Pequeno Explorador';

    if (!guardianName || !email) {
      setFormError('Preencha o nome completo e o e-mail.');
      return;
    }
    if (!email.includes('@')) {
      setFormError('Informe um endereço de e-mail válido.');
      return;
    }

    const duplicate = users.some(
      (u) => u.email.toLowerCase() === email && u.id !== editingUser?.id
    );
    if (duplicate) {
      setFormError('Já existe uma conta cadastrada com este e-mail.');
      return;
    }

    if (!editingUser && form.passwordMode === 'provisional' && form.password.trim().length < 4) {
      setFormError('Informe uma senha provisória de pelo menos 4 caracteres ou escolha convite para definir senha.');
      return;
    }

    if (
      editingUser &&
      form.passwordMode === 'provisional' &&
      form.password.trim().length > 0 &&
      form.password.trim().length < 4
    ) {
      setFormError('A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }

    setSubmittingForm(true);
    try {
      if (editingUser) {
        await onUpdateUser(editingUser.id, {
          guardianName,
          email,
          accountType: form.accountType,
          childName,
          childAge: Math.min(12, Math.max(2, Number(form.childAge) || 5)),
          status: form.status,
          plan: form.plan,
          passwordMode: form.passwordMode,
          password: form.password.trim() || undefined,
          notes: form.notes.trim() || undefined,
        });
      } else {
        await onCreateUser({
          guardianName,
          email,
          accountType: form.accountType,
          childName,
          childAge: Math.min(12, Math.max(2, Number(form.childAge) || 5)),
          status: form.status,
          plan: form.plan,
          passwordMode: form.passwordMode === 'invite' ? 'invite' : 'provisional',
          password:
            form.passwordMode === 'provisional' ? form.password.trim() : undefined,
          notes: form.notes.trim() || undefined,
          premiumGrant:
            form.plan === 'premium'
              ? {
                  duration: form.grantDuration,
                  startDate: form.grantStartDate,
                  expiresAt:
                    form.grantDuration === 'permanent' ? null : form.grantExpiresAt || null,
                  reason: form.grantReason.trim() || 'Cadastro manual no plano Premium',
                }
              : undefined,
        });
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Não foi possível salvar o usuário.');
    } finally {
      setSubmittingForm(false);
    }
  };

  const handleSubmitGrantPremium = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantTarget) return;
    setGrantError(null);

    if (grantForm.duration !== 'permanent' && !grantForm.expiresAt) {
      setGrantError('Defina a data de expiração ou selecione Acesso permanente.');
      return;
    }

    setSubmittingGrant(true);
    try {
      await onGrantPremium(grantTarget.id, {
        duration: grantForm.duration,
        startDate: grantForm.startDate,
        expiresAt: grantForm.duration === 'permanent' ? null : grantForm.expiresAt,
        reason: grantForm.reason.trim() || 'Liberação administrativa manual',
      });
      setGrantTarget(null);
    } catch (err) {
      setGrantError(err instanceof Error ? err.message : 'Erro ao liberar Premium.');
    } finally {
      setSubmittingGrant(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    setSubmittingConfirm(true);
    try {
      if (confirmAction.type === 'block') {
        await onBlockUser(confirmAction.user);
      } else if (confirmAction.type === 'revoke') {
        await onRevokePremium(
          confirmAction.user.id,
          revokeReasonInput.trim() || 'Revogação administrativa manual'
        );
      } else if (confirmAction.type === 'delete') {
        await onDeleteUser(confirmAction.user);
      }
      setConfirmAction(null);
      setRevokeReasonInput('');
    } finally {
      setSubmittingConfirm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-orange-700 mb-1">
            <ShieldCheck className="w-4 h-4 text-orange-600" aria-hidden="true" />
            <span>Acesso exclusivo administrativo · Valor comercial ref. R$ 29,99/mês</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-[#0F2942]">
            Gerenciamento de Usuários e Premium
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Cadastre usuários manualmente, libere ou revogue acesso Premium administrativo, gerencie planos, bloqueios e histórico completo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-white px-4 py-2.5 text-sm font-bold text-[#0F2942] hover:bg-amber-50 transition min-h-[44px] disabled:opacity-60"
            >
              <RefreshCw
                className={`w-4 h-4 text-orange-600 ${loading ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>Atualizar</span>
            </button>
          )}
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 px-5 py-2.5 text-sm font-extrabold text-white transition min-h-[44px] shadow-xs"
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            <span>+ ADICIONAR USUÁRIO</span>
          </button>
        </div>
      </div>

      {/* Summary Counters */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-500">
            <span>Total</span>
            <Users className="w-4 h-4 text-orange-600" aria-hidden="true" />
          </div>
          <div className="text-2xl font-extrabold text-[#0F2942] mt-1 tabular-nums">
            {summary.total}
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-amber-900">
            <span>Gratuitos</span>
            <Users className="w-4 h-4 text-amber-600" aria-hidden="true" />
          </div>
          <div className="text-2xl font-extrabold text-[#0F2942] mt-1 tabular-nums">
            {summary.freeCount}
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-emerald-800">
            <span>Premium Pago</span>
            <Crown className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-950 mt-1 tabular-nums">
            {summary.paidCount}
          </div>
        </div>
        <div className="rounded-2xl border border-orange-200 bg-orange-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-orange-800">
            <span>Premium Admin</span>
            <Sparkles className="w-4 h-4 text-orange-600" aria-hidden="true" />
          </div>
          <div className="text-2xl font-extrabold text-[#0F2942] mt-1 tabular-nums">
            {summary.adminPremCount}
          </div>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-rose-800">
            <span>Bloqueados</span>
            <Ban className="w-4 h-4 text-rose-600" aria-hidden="true" />
          </div>
          <div className="text-2xl font-extrabold text-rose-950 mt-1 tabular-nums">
            {summary.blockedCount}
          </div>
        </div>
      </div>

      {/* Auto-save / Error Feedback */}
      {autoSaveNotice && (
        <div
          role="status"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>{autoSaveNotice}</span>
        </div>
      )}

      {serverError && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Search & Filters */}
      <div className="rounded-3xl border border-amber-200 bg-white p-4 shadow-xs flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail, criança ou badge..."
            className="w-full rounded-2xl border border-amber-200 bg-[#FFFDF7] pl-10 pr-4 py-2.5 text-sm text-[#0F2942] focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Filtrar por identificação"
            value={badgeFilter}
            onChange={(e) => setBadgeFilter(e.target.value as 'all' | UserAccessBadge)}
            className="rounded-2xl border border-amber-200 bg-[#FFFDF7] px-3.5 py-2.5 text-sm font-semibold text-[#0F2942] min-h-[42px]"
          >
            <option value="all">Todas as identificações</option>
            <option value="GRATUITO">GRATUITO</option>
            <option value="PREMIUM PAGO">PREMIUM PAGO</option>
            <option value="PREMIUM ADMINISTRATIVO">PREMIUM ADMINISTRATIVO</option>
            <option value="PREMIUM EXPIRADO">PREMIUM EXPIRADO</option>
            <option value="PREMIUM REVOGADO">PREMIUM REVOGADO</option>
            <option value="BLOQUEADO">BLOQUEADO</option>
          </select>

          <select
            aria-label="Filtrar por situação da conta"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | ManagedUserStatus)}
            className="rounded-2xl border border-amber-200 bg-[#FFFDF7] px-3.5 py-2.5 text-sm font-semibold text-[#0F2942] min-h-[42px]"
          >
            <option value="all">Todas as situações</option>
            <option value="active">Somente ativos</option>
            <option value="blocked">Somente bloqueados</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden xl:block rounded-3xl border border-amber-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-amber-200 bg-[#FFFBEB] text-[11px] font-extrabold uppercase tracking-wider text-[#0F2942]">
                <th className="py-3.5 px-4">Nome / E-mail</th>
                <th className="py-3.5 px-3">Plano atual</th>
                <th className="py-3.5 px-3">Tipo de acesso</th>
                <th className="py-3.5 px-3">Situação</th>
                <th className="py-3.5 px-3">Cadastro</th>
                <th className="py-3.5 px-3">Validade Premium</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-100 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    {loading
                      ? 'Carregando usuários cadastrados...'
                      : 'Nenhuma conta encontrada com os filtros atuais.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isBusy = savingUserId === user.id;
                  const canRevokeAdmin =
                    user.adminPremiumGrant?.active && !user.adminPremiumGrant?.revokedAt;
                  return (
                    <tr key={user.id} className="hover:bg-amber-50/40 transition align-top">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-[#0F2942]">{user.guardianName}</div>
                        <div className="text-xs text-slate-600">{user.email}</div>
                        <div className="text-[11px] text-amber-900/80 mt-0.5 font-semibold">
                          {ACCOUNT_TYPE_LABELS[user.accountType || 'responsavel']} · Criança: {user.childName} ({user.childAge}a)
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-[#0F2942] text-xs mb-1">
                          {user.planLabel}
                        </div>
                        <span
                          className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[10px] font-extrabold tracking-wide ${getBadgeStyle(
                            user.accessBadge
                          )}`}
                        >
                          {user.accessBadge}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-xs font-semibold text-slate-700">
                        {user.accessType}
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${
                            user.status === 'active'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {user.status === 'active' ? 'Ativa' : 'Bloqueada'}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-xs text-slate-600 tabular-nums whitespace-nowrap">
                        {formatDatePtBr(user.createdAt)}
                      </td>

                      <td className="py-3.5 px-3 text-xs font-semibold text-[#0F2942] tabular-nums">
                        {user.premiumValidityLabel}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap max-w-[340px] ml-auto">
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => openGrantModal(user)}
                            className="rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 px-2.5 py-1.5 text-[11px] font-extrabold text-white inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <Crown className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>LIBERAR PREMIUM</span>
                          </button>

                          {canRevokeAdmin && (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => {
                                setRevokeReasonInput('');
                                setConfirmAction({ type: 'revoke', user });
                              }}
                              className="rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 text-[11px] font-bold text-amber-950 inline-flex items-center gap-1 disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Revogar</span>
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => openDetailsOrHistory(user, 'details')}
                            title="Visualizar detalhes"
                            className="rounded-xl border border-amber-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#0F2942] hover:bg-amber-50 inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <Eye className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
                            <span>Detalhes</span>
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => openEditModal(user)}
                            title="Editar cadastro"
                            className="rounded-xl border border-amber-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#0F2942] hover:bg-amber-50 inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => setPlanModalUser(user)}
                            title="Alterar plano"
                            className="rounded-xl border border-amber-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#0F2942] hover:bg-amber-50 inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
                            <span>Alterar plano</span>
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => openDetailsOrHistory(user, 'history')}
                            title="Consultar histórico"
                            className="rounded-xl border border-amber-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#0F2942] hover:bg-amber-50 inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <History className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
                            <span>Histórico</span>
                          </button>

                          {user.status === 'active' ? (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => setConfirmAction({ type: 'block', user })}
                              className="rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-bold text-rose-800 hover:bg-rose-100 inline-flex items-center gap-1 disabled:opacity-50"
                            >
                              <Ban className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Bloquear</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => onUnblockUser(user)}
                              className="rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-900 hover:bg-emerald-100 inline-flex items-center gap-1 disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Desbloquear</span>
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => setConfirmAction({ type: 'delete', user })}
                            title="Excluir usuário"
                            aria-label={`Excluir ${user.guardianName}`}
                            className="rounded-xl border border-rose-200 bg-rose-50 p-1.5 text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tablet & Mobile Cards */}
      <div className="xl:hidden space-y-3.5">
        {filteredUsers.length === 0 ? (
          <div className="rounded-3xl border border-amber-200 bg-white p-6 text-center text-sm text-slate-500">
            {loading
              ? 'Carregando usuários cadastrados...'
              : 'Nenhuma conta encontrada com os filtros atuais.'}
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isBusy = savingUserId === user.id;
            const canRevokeAdmin =
              user.adminPremiumGrant?.active && !user.adminPremiumGrant?.revokedAt;
            return (
              <div
                key={user.id}
                className="rounded-3xl border border-amber-200 bg-white p-4 sm:p-5 shadow-xs space-y-3.5"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-extrabold text-[#0F2942] text-base">
                      {user.guardianName}
                    </div>
                    <div className="text-xs text-slate-600 break-all">{user.email}</div>
                    <div className="text-xs text-amber-900 font-semibold mt-1">
                      {ACCOUNT_TYPE_LABELS[user.accountType || 'responsavel']} · Criança: {user.childName} ({user.childAge} anos)
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span
                      className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[11px] font-extrabold ${getBadgeStyle(
                        user.accessBadge
                      )}`}
                    >
                      {user.accessBadge}
                    </span>
                    <span
                      className={`rounded-lg px-2 py-0.5 text-[11px] font-bold ${
                        user.status === 'active'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-rose-100 text-rose-900'
                      }`}
                    >
                      {user.status === 'active' ? 'Ativa' : 'Bloqueada'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-2xl border border-amber-100 bg-[#FFFDF7] p-3 text-xs">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-500">Plano atual</div>
                    <div className="font-bold text-[#0F2942] mt-0.5">{user.planLabel}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-500">Tipo de acesso</div>
                    <div className="font-semibold text-slate-700 mt-0.5">{user.accessType}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-500">Cadastro</div>
                    <div className="font-semibold text-slate-700 mt-0.5 tabular-nums">
                      {formatDatePtBr(user.createdAt)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-500">Validade Premium</div>
                    <div className="font-bold text-[#0F2942] mt-0.5 tabular-nums">
                      {user.premiumValidityLabel}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => openGrantModal(user)}
                    className="rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-3 py-2 text-xs font-extrabold text-white inline-flex items-center gap-1.5 min-h-[40px] disabled:opacity-50"
                  >
                    <Crown className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>LIBERAR PREMIUM</span>
                  </button>

                  {canRevokeAdmin && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => {
                        setRevokeReasonInput('');
                        setConfirmAction({ type: 'revoke', user });
                      }}
                      className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-950 inline-flex items-center gap-1.5 min-h-[40px] disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Revogar Premium</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => openDetailsOrHistory(user, 'details')}
                    className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-[#0F2942] inline-flex items-center gap-1.5 min-h-[40px]"
                  >
                    <Eye className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
                    <span>Detalhes</span>
                  </button>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => openEditModal(user)}
                    className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-[#0F2942] inline-flex items-center gap-1.5 min-h-[40px]"
                  >
                    <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Editar</span>
                  </button>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => setPlanModalUser(user)}
                    className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-[#0F2942] inline-flex items-center gap-1.5 min-h-[40px]"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
                    <span>Alterar plano</span>
                  </button>

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => openDetailsOrHistory(user, 'history')}
                    className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-[#0F2942] inline-flex items-center gap-1.5 min-h-[40px]"
                  >
                    <History className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
                    <span>Histórico</span>
                  </button>

                  {user.status === 'active' ? (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => setConfirmAction({ type: 'block', user })}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-800 inline-flex items-center gap-1.5 min-h-[40px]"
                    >
                      <Ban className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Bloquear</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onUnblockUser(user)}
                      className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-900 inline-flex items-center gap-1.5 min-h-[40px]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Desbloquear</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => setConfirmAction({ type: 'delete', user })}
                    aria-label={`Excluir ${user.guardianName}`}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 inline-flex items-center justify-center min-h-[40px]"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 1. MODAL: + ADICIONAR USUÁRIO / EDITAR CADASTRO */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-[#0F2942]/45 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={editingUser ? 'Editar cadastro do usuário' : 'Adicionar usuário manualmente'}
        >
          <div className="bg-[#FFFDF5] rounded-3xl border border-amber-300 shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-display font-extrabold text-[#0F2942]">
                  {editingUser ? 'Editar Cadastro do Usuário' : '+ Adicionar Usuário Manualmente'}
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Cadastro administrativo direto no banco de dados sem gerar cobranças.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Fechar formulário"
                className="w-9 h-9 rounded-xl border border-amber-200 bg-white flex items-center justify-center text-[#0F2942] hover:bg-amber-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveUserForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#0F2942] mb-1">
                  Nome completo *
                </label>
                <input
                  type="text"
                  required
                  value={form.guardianName}
                  onChange={(e) => setForm((f) => ({ ...f, guardianName: e.target.value }))}
                  placeholder="Nome do responsável ou titular"
                  className="w-full rounded-2xl border border-amber-200 bg-white px-3.5 py-2.5 text-sm text-[#0F2942]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#0F2942] mb-1">
                  E-mail *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                  className="w-full rounded-2xl border border-amber-200 bg-white px-3.5 py-2.5 text-sm text-[#0F2942]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-[#0F2942] mb-1">
                    Tipo de conta
                  </label>
                  <select
                    value={form.accountType}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, accountType: e.target.value as AdminAccountType }))
                    }
                    className="w-full rounded-2xl border border-amber-200 bg-white px-3.5 py-2.5 text-sm text-[#0F2942]"
                  >
                    <option value="responsavel">Responsável / Família</option>
                    <option value="educador">Educador(a) / Professor</option>
                    <option value="clinica">Clínica / Fonoaudiologia</option>
                    <option value="convidado">Convidado / Parceiro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-[#0F2942] mb-1">
                    Status da conta
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value as ManagedUserStatus }))
                    }
                    className="w-full rounded-2xl border border-amber-200 bg-white px-3.5 py-2.5 text-sm text-[#0F2942]"
                  >
                    <option value="active">Ativo</option>
                    <option value="blocked">Bloqueado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-[#0F2942] mb-1">
                    Nome da criança
                  </label>
                  <input
                    type="text"
                    value={form.childName}
                    onChange={(e) => setForm((f) => ({ ...f, childName: e.target.value }))}
                    placeholder="Ex.: Lucas"
                    className="w-full rounded-2xl border border-amber-200 bg-white px-3.5 py-2.5 text-sm text-[#0F2942]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-[#0F2942] mb-1">
                    Idade da criança (2 a 12)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={12}
                    value={form.childAge}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, childAge: Number(e.target.value) || 5 }))
                    }
                    className="w-full rounded-2xl border border-amber-200 bg-white px-3.5 py-2.5 text-sm text-[#0F2942]"
                  />
                </div>
              </div>

              {/* Password or Setup Invite */}
              <div className="rounded-2xl border border-amber-200 bg-white p-4 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wide text-[#0F2942]">
                  {editingUser ? 'Credencial / Senha de acesso' : 'Senha provisória ou convite *'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {editingUser && (
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, passwordMode: 'keep' }))}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${
                        form.passwordMode === 'keep'
                          ? 'border-orange-500 bg-orange-50 text-orange-900'
                          : 'border-amber-200 bg-[#FFFDF7] text-slate-700'
                      }`}
                    >
                      Manter atual
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, passwordMode: 'provisional' }))}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${
                      form.passwordMode === 'provisional'
                        ? 'border-orange-500 bg-orange-50 text-orange-900'
                        : 'border-amber-200 bg-[#FFFDF7] text-slate-700'
                    }`}
                  >
                    Definir senha provisória
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, passwordMode: 'invite' }))}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold ${
                      form.passwordMode === 'invite'
                        ? 'border-orange-500 bg-orange-50 text-orange-900'
                        : 'border-amber-200 bg-[#FFFDF7] text-slate-700'
                    }`}
                  >
                    Convite para definir senha
                  </button>
                </div>

                {form.passwordMode === 'provisional' && (
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    placeholder="Senha provisória (mínimo 4 caracteres)"
                    className="w-full rounded-2xl border border-amber-200 bg-[#FFFDF7] px-3.5 py-2.5 text-sm text-[#0F2942]"
                  />
                )}
                {form.passwordMode === 'invite' && (
                  <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                    A conta será marcada com convite pendente para que o usuário defina sua própria senha no primeiro acesso.
                  </p>
                )}
              </div>

              {/* Plan Selection */}
              <div className="rounded-2xl border border-amber-200 bg-white p-4 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wide text-[#0F2942]">
                  Plano inicial
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, plan: 'free' }))}
                    className={`rounded-2xl border-2 p-3 text-left transition ${
                      form.plan === 'free'
                        ? 'border-orange-500 bg-orange-50/70'
                        : 'border-amber-200 bg-[#FFFDF7]'
                    }`}
                  >
                    <div className="text-sm font-extrabold text-[#0F2942]">Gratuito</div>
                    <div className="text-[11px] text-slate-600">Recursos gratuitos padrão</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, plan: 'premium' }))}
                    className={`rounded-2xl border-2 p-3 text-left transition ${
                      form.plan === 'premium'
                        ? 'border-orange-500 bg-orange-50/70'
                        : 'border-amber-200 bg-[#FFFDF7]'
                    }`}
                  >
                    <div className="text-sm font-extrabold text-[#0F2942] flex items-center gap-1">
                      <Crown className="w-4 h-4 text-orange-600" aria-hidden="true" />
                      <span>Premium</span>
                    </div>
                    <div className="text-[11px] text-slate-600">Concessão admin (R$ 0,00)</div>
                  </button>
                </div>

                {!editingUser && form.plan === 'premium' && (
                  <div className="space-y-3 pt-2 border-t border-amber-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                          Duração da concessão
                        </label>
                        <select
                          value={form.grantDuration}
                          onChange={(e) => {
                            const dur = e.target.value as AdminPremiumDuration;
                            setForm((f) => ({
                              ...f,
                              grantDuration: dur,
                              grantExpiresAt: addDurationToYmd(f.grantStartDate, dur),
                            }));
                          }}
                          className="w-full rounded-xl border border-amber-200 bg-[#FFFDF7] px-3 py-2 text-xs font-semibold text-[#0F2942]"
                        >
                          <option value="30_days">30 dias</option>
                          <option value="90_days">90 dias</option>
                          <option value="6_months">6 meses</option>
                          <option value="permanent">Acesso permanente</option>
                          <option value="custom">Personalizado</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                          Data de início
                        </label>
                        <input
                          type="date"
                          value={form.grantStartDate}
                          onChange={(e) => {
                            const start = e.target.value;
                            setForm((f) => ({
                              ...f,
                              grantStartDate: start,
                              grantExpiresAt: addDurationToYmd(start, f.grantDuration),
                            }));
                          }}
                          className="w-full rounded-xl border border-amber-200 bg-[#FFFDF7] px-3 py-2 text-xs text-[#0F2942]"
                        />
                      </div>
                    </div>

                    {form.grantDuration !== 'permanent' && (
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                          Data de expiração
                        </label>
                        <input
                          type="date"
                          value={form.grantExpiresAt}
                          onChange={(e) =>
                            setForm((f) => ({
                              ...f,
                              grantDuration: 'custom',
                              grantExpiresAt: e.target.value,
                            }))
                          }
                          className="w-full rounded-xl border border-amber-200 bg-[#FFFDF7] px-3 py-2 text-xs text-[#0F2942]"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                        Motivo da concessão
                      </label>
                      <input
                        type="text"
                        value={form.grantReason}
                        onChange={(e) => setForm((f) => ({ ...f, grantReason: e.target.value }))}
                        placeholder="Ex.: Parceria clínica, cortesia familiar..."
                        className="w-full rounded-xl border border-amber-200 bg-[#FFFDF7] px-3 py-2 text-xs text-[#0F2942]"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#0F2942] mb-1">
                  Observações internas
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full rounded-2xl border border-amber-200 bg-white px-3.5 py-2.5 text-sm text-[#0F2942]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-2xl border border-amber-200 bg-white px-4 py-2.5 text-sm font-bold text-[#0F2942] hover:bg-amber-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="rounded-2xl bg-orange-600 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-orange-700 disabled:opacity-60"
                >
                  {submittingForm
                    ? 'Salvando...'
                    : editingUser
                    ? 'Salvar alterações'
                    : 'Cadastrar usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL: LIBERAR FALAKIDS PREMIUM */}
      {grantTarget && (
        <div
          className="fixed inset-0 z-50 bg-[#0F2942]/45 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Liberar FalaKids Premium"
        >
          <div className="bg-[#FFFDF5] rounded-3xl border-2 border-amber-300 shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-900 mb-1">
                  <Crown className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
                  <span>Concessão Administrativa</span>
                </span>
                <h2 className="text-xl font-display font-extrabold text-[#0F2942]">
                  Liberar FalaKids Premium
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Usuário: <strong>{grantTarget.guardianName}</strong> ({grantTarget.email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGrantTarget(null)}
                aria-label="Fechar"
                className="w-9 h-9 rounded-xl border border-amber-200 bg-white flex items-center justify-center text-[#0F2942] hover:bg-amber-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-white p-3.5 text-xs text-slate-700 space-y-1">
              <div className="font-extrabold text-[#0F2942]">
                Preço comercial de referência: R$ 29,99/mês
              </div>
              <p>
                A concessão manual libera o acesso Premium imediatamente no servidor sem gerar cobrança, assinatura paga ou registro de pagamento. Não entra na receita recebida.
              </p>
            </div>

            {grantError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
                {grantError}
              </div>
            )}

            <form onSubmit={handleSubmitGrantPremium} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#0F2942] mb-2">
                  Escolha a duração
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {(
                    [
                      { id: '30_days', label: '30 dias' },
                      { id: '90_days', label: '90 dias' },
                      { id: '6_months', label: '6 meses' },
                      { id: 'permanent', label: 'Acesso permanente' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() =>
                        setGrantForm((g) => ({
                          ...g,
                          duration: opt.id,
                          expiresAt: addDurationToYmd(g.startDate, opt.id),
                        }))
                      }
                      className={`rounded-2xl border-2 px-3 py-2.5 text-xs font-extrabold transition text-left ${
                        grantForm.duration === opt.id
                          ? 'border-orange-500 bg-orange-50 text-orange-950'
                          : 'border-amber-200 bg-white text-[#0F2942] hover:bg-amber-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-[#0F2942] mb-1">
                    Data de início
                  </label>
                  <div className="relative">
                    <Calendar
                      className="w-4 h-4 text-orange-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      type="date"
                      required
                      value={grantForm.startDate}
                      onChange={(e) => {
                        const start = e.target.value;
                        setGrantForm((g) => ({
                          ...g,
                          startDate: start,
                          expiresAt: addDurationToYmd(start, g.duration),
                        }));
                      }}
                      className="w-full rounded-2xl border border-amber-200 bg-white pl-9 pr-3 py-2.5 text-sm text-[#0F2942]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-[#0F2942] mb-1">
                    Data de expiração
                  </label>
                  {grantForm.duration === 'permanent' ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-sm font-bold text-amber-950">
                      Sem expiração (Permanente)
                    </div>
                  ) : (
                    <input
                      type="date"
                      required
                      value={grantForm.expiresAt}
                      onChange={(e) =>
                        setGrantForm((g) => ({
                          ...g,
                          duration: 'custom',
                          expiresAt: e.target.value,
                        }))
                      }
                      className="w-full rounded-2xl border border-amber-200 bg-white px-3.5 py-2.5 text-sm text-[#0F2942]"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-[#0F2942] mb-1">
                  Motivo da concessão *
                </label>
                <textarea
                  rows={2}
                  required
                  value={grantForm.reason}
                  onChange={(e) => setGrantForm((g) => ({ ...g, reason: e.target.value }))}
                  placeholder="Ex.: Acompanhamento fonoaudiológico, cortesia educacional, parceiro..."
                  className="w-full rounded-2xl border border-amber-200 bg-white px-3.5 py-2.5 text-sm text-[#0F2942]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                {grantTarget.adminPremiumGrant?.active && !grantTarget.adminPremiumGrant?.revokedAt ? (
                  <button
                    type="button"
                    onClick={() => {
                      const target = grantTarget;
                      setGrantTarget(null);
                      setRevokeReasonInput('');
                      setConfirmAction({ type: 'revoke', user: target });
                    }}
                    className="rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-800 hover:bg-rose-100"
                  >
                    Revogar acesso Premium
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setGrantTarget(null)}
                    className="rounded-2xl border border-amber-200 bg-white px-4 py-2.5 text-sm font-bold text-[#0F2942] hover:bg-amber-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingGrant}
                    className="rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-2.5 text-sm font-extrabold text-white hover:from-orange-700 hover:to-amber-600 disabled:opacity-60"
                  >
                    {submittingGrant ? 'Liberando...' : 'Confirmar Liberação'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL: ALTERAR PLANO */}
      {planModalUser && (
        <div
          className="fixed inset-0 z-50 bg-[#0F2942]/45 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Alterar plano do usuário"
        >
          <div className="bg-[#FFFDF5] rounded-3xl border border-amber-300 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-display font-extrabold text-[#0F2942]">
                Alterar Plano de Acesso
              </h2>
              <button
                type="button"
                onClick={() => setPlanModalUser(null)}
                aria-label="Fechar"
                className="w-8 h-8 rounded-xl border border-amber-200 bg-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Titular: <strong>{planModalUser.guardianName}</strong> · Plano atual:{' '}
              <strong>{planModalUser.planLabel}</strong> ({planModalUser.accessBadge})
            </p>
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  const target = planModalUser;
                  setPlanModalUser(null);
                  openGrantModal(target);
                }}
                className="w-full rounded-2xl border-2 border-orange-300 bg-orange-50/70 hover:bg-orange-100/70 p-4 text-left space-y-1 transition"
              >
                <div className="text-sm font-extrabold text-[#0F2942] flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-orange-600" aria-hidden="true" />
                  <span>Definir / Configurar FalaKids Premium (Administrativo)</span>
                </div>
                <div className="text-xs text-slate-600">
                  Escolher duração (30 dias, 90 dias, 6 meses ou permanente) sem cobrança.
                </div>
              </button>

              <button
                type="button"
                disabled={!planModalUser.hasEffectivePremium}
                onClick={() => {
                  const target = planModalUser;
                  setPlanModalUser(null);
                  setRevokeReasonInput('Alteração administrativa para plano Gratuito');
                  setConfirmAction({ type: 'revoke', user: target });
                }}
                className="w-full rounded-2xl border border-amber-200 bg-white hover:bg-amber-50 p-4 text-left space-y-1 transition disabled:opacity-50"
              >
                <div className="text-sm font-extrabold text-[#0F2942]">
                  Passar para FalaKids Gratuito (Revogar Premium Administrativo)
                </div>
                <div className="text-xs text-slate-600">
                  Mantém todos os recursos gratuitos liberados e encerra o acesso Premium administrativo.
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: CONFIRMAÇÃO OBRIGATÓRIA (BLOQUEAR / REVOGAR / EXCLUIR) */}
      {confirmAction && (
        <div
          className="fixed inset-0 z-50 bg-[#0F2942]/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmação administrativa"
        >
          <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-display font-extrabold text-[#0F2942]">
              {confirmAction.type === 'block'
                ? 'Confirmar bloqueio de usuário?'
                : confirmAction.type === 'revoke'
                ? 'Confirmar revogação do Premium?'
                : 'Confirmar exclusão permanente?'}
            </h2>
            <p className="text-sm text-slate-600">
              {confirmAction.type === 'block' && (
                <>
                  Deseja bloquear o acesso de <strong>{confirmAction.user.guardianName}</strong> ({confirmAction.user.email})? O bloqueio terá efeito imediato no servidor.
                </>
              )}
              {confirmAction.type === 'revoke' && (
                <>
                  Deseja revogar o acesso Premium administrativo de{' '}
                  <strong>{confirmAction.user.guardianName}</strong> ({confirmAction.user.email})? O usuário continuará apenas com os recursos gratuitos.
                </>
              )}
              {confirmAction.type === 'delete' && (
                <>
                  Tem certeza que deseja excluir permanentemente a conta de{' '}
                  <strong>{confirmAction.user.guardianName}</strong> ({confirmAction.user.email})? Esta ação será registrada na auditoria e não pode ser desfeita.
                </>
              )}
            </p>

            {confirmAction.type === 'revoke' && (
              <div>
                <label className="block text-xs font-bold uppercase text-[#0F2942] mb-1">
                  Motivo da revogação (opcional)
                </label>
                <input
                  type="text"
                  value={revokeReasonInput}
                  onChange={(e) => setRevokeReasonInput(e.target.value)}
                  placeholder="Ex.: Término do período de cortesia"
                  className="w-full rounded-2xl border border-amber-200 bg-[#FFFDF7] px-3.5 py-2.5 text-sm text-[#0F2942]"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={submittingConfirm}
                onClick={() => setConfirmAction(null)}
                className="rounded-2xl border border-amber-200 bg-white px-4 py-2.5 text-sm font-bold text-[#0F2942] hover:bg-amber-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={submittingConfirm}
                onClick={handleConfirmAction}
                className="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {submittingConfirm
                  ? 'Confirmando...'
                  : confirmAction.type === 'block'
                  ? 'Confirmar bloqueio'
                  : confirmAction.type === 'revoke'
                  ? 'Confirmar revogação'
                  : 'Confirmar exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: VISUALIZAR DETALHES & CONSULTAR HISTÓRICO */}
      {detailsModalOpen && detailsUser && (
        <div
          className="fixed inset-0 z-50 bg-[#0F2942]/45 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Detalhes e histórico do usuário"
        >
          <div className="bg-[#FFFDF5] rounded-3xl border border-amber-300 shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[11px] font-extrabold ${getBadgeStyle(
                      detailsUser.accessBadge
                    )}`}
                  >
                    {detailsUser.accessBadge}
                  </span>
                  <span
                    className={`rounded-lg px-2 py-0.5 text-[11px] font-bold ${
                      detailsUser.status === 'active'
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {detailsUser.status === 'active' ? 'Ativa' : 'Bloqueada'}
                  </span>
                </div>
                <h2 className="text-xl font-display font-extrabold text-[#0F2942]">
                  {detailsUser.guardianName}
                </h2>
                <p className="text-xs text-slate-600">{detailsUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                aria-label="Fechar detalhes"
                className="w-9 h-9 rounded-xl border border-amber-200 bg-white flex items-center justify-center text-[#0F2942] hover:bg-amber-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2 border-b border-amber-200 pb-3">
              <button
                type="button"
                onClick={() => setDetailsTab('details')}
                className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                  detailsTab === 'details'
                    ? 'bg-orange-600 text-white'
                    : 'bg-white border border-amber-200 text-[#0F2942]'
                }`}
              >
                Detalhes do Usuário
              </button>
              <button
                type="button"
                onClick={() => setDetailsTab('history')}
                className={`rounded-xl px-4 py-2 text-xs font-extrabold transition ${
                  detailsTab === 'history'
                    ? 'bg-orange-600 text-white'
                    : 'bg-white border border-amber-200 text-[#0F2942]'
                }`}
              >
                Histórico Administrativo & Pagamentos
              </button>
            </div>

            {detailsTab === 'details' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-amber-200 bg-white p-3.5">
                    <div className="text-[11px] font-bold uppercase text-slate-500">Tipo de Conta</div>
                    <div className="font-bold text-[#0F2942] mt-0.5">
                      {ACCOUNT_TYPE_LABELS[detailsUser.accountType || 'responsavel']}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-white p-3.5">
                    <div className="text-[11px] font-bold uppercase text-slate-500">Perfil Infantil</div>
                    <div className="font-bold text-[#0F2942] mt-0.5">
                      {detailsUser.childName} ({detailsUser.childAge} anos) · {detailsUser.starsCount} estrelas
                    </div>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-white p-3.5">
                    <div className="text-[11px] font-bold uppercase text-slate-500">Plano e Tipo de Acesso</div>
                    <div className="font-bold text-[#0F2942] mt-0.5">
                      {detailsUser.planLabel} · {detailsUser.accessType}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-white p-3.5">
                    <div className="text-[11px] font-bold uppercase text-slate-500">Validade do Premium</div>
                    <div className="font-bold text-[#0F2942] mt-0.5">
                      {detailsUser.premiumValidityLabel}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-white p-3.5">
                    <div className="text-[11px] font-bold uppercase text-slate-500">Data de Cadastro</div>
                    <div className="font-semibold text-[#0F2942] mt-0.5 tabular-nums">
                      {new Date(detailsUser.createdAt).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-amber-200 bg-white p-3.5">
                    <div className="text-[11px] font-bold uppercase text-slate-500">Convite de Senha</div>
                    <div className="font-semibold text-[#0F2942] mt-0.5">
                      {detailsUser.passwordSetupInvite ? 'Convite pendente' : 'Senha configurada'}
                    </div>
                  </div>
                </div>

                {detailsUser.adminPremiumGrant && (
                  <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-4 space-y-1.5 text-xs">
                    <div className="font-extrabold text-[#0F2942]">
                      Registro da Concessão Administrativa
                    </div>
                    <div>
                      <strong>Duração:</strong> {detailsUser.adminPremiumGrant.durationLabel} ·{' '}
                      <strong>Início:</strong> {formatDatePtBr(detailsUser.adminPremiumGrant.startDate)} ·{' '}
                      <strong>Expiração:</strong>{' '}
                      {detailsUser.adminPremiumGrant.isPermanent
                        ? 'Permanente'
                        : formatDatePtBr(detailsUser.adminPremiumGrant.expiresAt)}
                    </div>
                    <div>
                      <strong>Motivo:</strong> {detailsUser.adminPremiumGrant.reason}
                    </div>
                    <div>
                      <strong>Concedido por:</strong> {detailsUser.adminPremiumGrant.grantedByEmail} em{' '}
                      {formatDatePtBr(detailsUser.adminPremiumGrant.grantedAt)}
                    </div>
                    {detailsUser.adminPremiumGrant.revokedAt && (
                      <div className="text-rose-800 font-semibold">
                        Revogado em {formatDatePtBr(detailsUser.adminPremiumGrant.revokedAt)} por{' '}
                        {detailsUser.adminPremiumGrant.revokedByEmail} · Motivo:{' '}
                        {detailsUser.adminPremiumGrant.revokeReason || '—'}
                      </div>
                    )}
                  </div>
                )}

                {detailsUser.notes && (
                  <div className="rounded-2xl border border-amber-200 bg-white p-3.5 text-xs text-slate-700">
                    <strong className="text-[#0F2942]">Observações:</strong> {detailsUser.notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {loadingHistory ? (
                  <div className="rounded-2xl border border-amber-200 bg-white p-6 text-center text-sm text-slate-500">
                    Consultando histórico no servidor...
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-[#0F2942]">
                        <Clock className="w-4 h-4 text-orange-600" aria-hidden="true" />
                        <span>Histórico de Operações Administrativas ({historyData?.auditLogs.length || 0})</span>
                      </div>
                      {!historyData || historyData.auditLogs.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-amber-200 bg-white p-4 text-xs text-slate-500">
                          Nenhuma operação administrativa registrada para este usuário.
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                          {historyData.auditLogs.map((log) => (
                            <div
                              key={log.id}
                              className="rounded-2xl border border-amber-200 bg-white p-3 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between gap-2 font-bold text-[#0F2942]">
                                <span>{log.action}</span>
                                <span className="text-slate-500 font-normal tabular-nums">
                                  {new Date(log.timestamp).toLocaleString('pt-BR', {
                                    dateStyle: 'short',
                                    timeStyle: 'short',
                                  })}
                                </span>
                              </div>
                              <div className="text-slate-700">{log.detail}</div>
                              <div className="text-[11px] font-semibold text-amber-800">
                                Responsável: {log.actorEmail}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-[#0F2942]">
                        <Receipt className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                        <span>Pagamentos Reais no Gateway ({historyData?.payments.length || 0})</span>
                      </div>
                      {!historyData || historyData.payments.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-amber-200 bg-white p-4 text-xs text-slate-500">
                          Nenhum pagamento financeiro registrado (concessões manuais não geram cobranças).
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {historyData.payments.map((pay) => (
                            <div
                              key={pay.id}
                              className="rounded-2xl border border-emerald-200 bg-white p-3 text-xs flex items-center justify-between gap-2"
                            >
                              <div>
                                <div className="font-bold text-[#0F2942]">
                                  {formatCurrencyBRL(pay.value)} · {pay.billingType}
                                </div>
                                <div className="text-slate-600">
                                  Vencimento: {formatDatePtBr(pay.dueDate)}
                                  {pay.paidAt ? ` · Pago em ${formatDatePtBr(pay.paidAt)}` : ''}
                                </div>
                              </div>
                              <span className="rounded-lg bg-amber-100 px-2.5 py-1 font-bold text-[#0F2942]">
                                {pay.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
