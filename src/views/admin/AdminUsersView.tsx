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
} from 'lucide-react';
import { ManagedUserAccount, ManagedUserStatus } from '../../types/admin';

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
    childName: string;
    childAge: number;
    status: ManagedUserStatus;
    password?: string;
    notes?: string;
  }) => Promise<void>;
  onUpdateUser: (
    id: string,
    payload: {
      guardianName: string;
      email: string;
      childName: string;
      childAge: number;
      status: ManagedUserStatus;
      password?: string;
      notes?: string;
    }
  ) => Promise<void>;
  onToggleBlockUser: (user: ManagedUserAccount) => Promise<void>;
  onDeleteUser: (user: ManagedUserAccount) => Promise<void>;
}

interface UserFormState {
  guardianName: string;
  email: string;
  childName: string;
  childAge: number;
  status: ManagedUserStatus;
  password: string;
  notes: string;
}

const EMPTY_FORM: UserFormState = {
  guardianName: '',
  email: '',
  childName: '',
  childAge: 5,
  status: 'active',
  password: '',
  notes: '',
};

export const AdminUsersView: React.FC<AdminUsersViewProps> = ({
  users,
  loading = false,
  savingUserId = null,
  autoSaveNotice = null,
  serverError = null,
  onRefresh,
  onCreateUser,
  onUpdateUser,
  onToggleBlockUser,
  onDeleteUser,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ManagedUserStatus>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUserAccount | null>(null);
  const [form, setForm] = useState<UserFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittingForm, setSubmittingForm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<ManagedUserAccount | null>(null);

  const summary = useMemo(() => {
    const total = users.length;
    const activeCount = users.filter((u) => u.status === 'active').length;
    const blockedCount = users.filter((u) => u.status === 'blocked').length;
    return { total, activeCount, blockedCount };
  }, [users]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (statusFilter !== 'all' && u.status !== statusFilter) return false;
      if (!q) return true;
      return (
        u.guardianName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.childName.toLowerCase().includes(q)
      );
    });
  }, [users, search, statusFilter]);

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (user: ManagedUserAccount) => {
    setEditingUser(user);
    setForm({
      guardianName: user.guardianName,
      email: user.email,
      childName: user.childName,
      childAge: user.childAge,
      status: user.status,
      password: '',
      notes: user.notes || '',
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const guardianName = form.guardianName.trim();
    const email = form.email.trim().toLowerCase();
    const childName = form.childName.trim();

    if (!guardianName || !email || !childName) {
      setFormError('Preencha nome do responsável, e-mail e nome da criança.');
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

    if (!editingUser && form.password.trim().length < 4) {
      setFormError('Informe uma senha inicial de pelo menos 4 caracteres.');
      return;
    }

    setSubmittingForm(true);
    try {
      const payload = {
        guardianName,
        email,
        childName,
        childAge: Math.min(12, Math.max(2, Number(form.childAge) || 5)),
        status: form.status,
        password: form.password.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };

      if (editingUser) {
        await onUpdateUser(editingUser.id, payload);
      } else {
        await onCreateUser(payload);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Não foi possível salvar o usuário.');
    } finally {
      setSubmittingForm(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-indigo-700 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Acesso exclusivo do administrador · Salvamento automático</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Gerenciamento de Usuários
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Visualize os usuários cadastrados, edite informações da conta ou bloqueie/desbloqueie acessos com salvamento automático.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition min-h-[44px] disabled:opacity-60"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>Atualizar</span>
            </button>
          )}
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition min-h-[44px]"
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            <span>Cadastrar usuário</span>
          </button>
        </div>
      </div>

      {/* Summary Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500">
            <span>Cadastrados</span>
            <Users className="w-4 h-4 text-indigo-600" aria-hidden="true" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">
            {summary.total}
          </div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-emerald-800">
            <span>Ativos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-950 mt-1 tabular-nums">
            {summary.activeCount}
          </div>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-rose-800">
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

      {/* Filters Bar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por responsável, e-mail ou criança..."
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            aria-label="Filtrar por status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | ManagedUserStatus)}
            className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-700 min-h-[42px]"
          >
            <option value="all">Todos os status</option>
            <option value="active">Somente ativos</option>
            <option value="blocked">Somente bloqueados</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-5">Responsável / E-mail</th>
                <th className="py-3.5 px-4">Criança</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Progresso</th>
                <th className="py-3.5 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    {loading
                      ? 'Carregando usuários cadastrados...'
                      : 'Nenhuma conta encontrada com os filtros atuais.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isBusy = savingUserId === user.id;
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-5">
                        <div className="font-bold text-slate-900">{user.guardianName}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{user.childName}</div>
                        <div className="text-xs text-slate-500">{user.childAge} anos</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold ${
                            user.status === 'active'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {user.status === 'active' ? 'Ativo' : 'Bloqueado'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 tabular-nums">
                        <div>{user.starsCount} estrelas</div>
                        <div>{user.activitiesCount} atividades</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => onToggleBlockUser(user)}
                            title={
                              user.status === 'active' ? 'Bloquear usuário' : 'Desbloquear usuário'
                            }
                            className={`rounded-xl border px-2.5 py-1.5 text-xs font-bold inline-flex items-center gap-1 disabled:opacity-50 ${
                              user.status === 'active'
                                ? 'border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                            }`}
                          >
                            {user.status === 'active' ? (
                              <>
                                <Ban className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Bloquear</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Desbloquear</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => openEditModal(user)}
                            title="Editar conta"
                            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1 disabled:opacity-50"
                          >
                            <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => setUserToDelete(user)}
                            title="Excluir conta"
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
            {loading
              ? 'Carregando usuários cadastrados...'
              : 'Nenhuma conta encontrada com os filtros atuais.'}
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isBusy = savingUserId === user.id;
            return (
              <div
                key={user.id}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">{user.guardianName}</div>
                    <div className="text-xs text-slate-500 truncate">{user.email}</div>
                    <div className="text-xs text-slate-700 mt-1">
                      Criança: <strong>{user.childName}</strong> ({user.childAge} anos)
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`rounded-lg px-2.5 py-0.5 text-[11px] font-bold ${
                        user.status === 'active'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-rose-100 text-rose-900'
                      }`}
                    >
                      {user.status === 'active' ? 'Ativo' : 'Bloqueado'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onToggleBlockUser(user)}
                      className={`flex-1 rounded-xl border px-3 py-2 text-xs font-bold inline-flex items-center justify-center gap-1.5 min-h-[40px] disabled:opacity-50 ${
                        user.status === 'active'
                          ? 'border-rose-200 bg-rose-50 text-rose-800'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      }`}
                    >
                      {user.status === 'active' ? (
                        <>
                          <Ban className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Bloquear</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Desbloquear</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => openEditModal(user)}
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 inline-flex items-center justify-center gap-1.5 min-h-[40px] disabled:opacity-50"
                    >
                      <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => setUserToDelete(user)}
                      aria-label={`Excluir ${user.guardianName}`}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 inline-flex items-center justify-center min-h-[40px] disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={editingUser ? 'Editar conta de usuário' : 'Cadastrar nova conta'}
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-extrabold text-slate-900">
                {editingUser ? 'Editar Conta' : 'Cadastrar Nova Conta'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Fechar formulário"
                className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
                  Nome do Responsável
                </label>
                <input
                  type="text"
                  required
                  value={form.guardianName}
                  onChange={(e) => setForm((f) => ({ ...f, guardianName: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
                    Nome da Criança
                  </label>
                  <input
                    type="text"
                    required
                    value={form.childName}
                    onChange={(e) => setForm((f) => ({ ...f, childName: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
                    Idade (2 a 12)
                  </label>
                  <input
                    type="number"
                    min={2}
                    max={12}
                    required
                    value={form.childAge}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, childAge: Number(e.target.value) || 5 }))
                    }
                    className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
                  Status da Conta
                </label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value as ManagedUserStatus }))
                  }
                  className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
                >
                  <option value="active">Ativo</option>
                  <option value="blocked">Bloqueado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
                  {editingUser ? 'Redefinir senha (opcional)' : 'Senha inicial'}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder={editingUser ? 'Deixe em branco para manter' : 'Mínimo 4 caracteres'}
                  className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
                  Observações internas
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingForm}
                  className="rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {submittingForm
                    ? 'Salvando...'
                    : editingUser
                    ? 'Salvar alterações'
                    : 'Cadastrar conta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {userToDelete && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirmar exclusão de conta"
        >
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">Excluir conta?</h2>
            <p className="text-sm text-slate-600">
              Tem certeza que deseja excluir permanentemente a conta de{' '}
              <strong>{userToDelete.guardianName}</strong> ({userToDelete.email})? Esta ação não pode ser desfeita.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteUser(userToDelete);
                  setUserToDelete(null);
                }}
                className="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700"
              >
                Excluir conta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
