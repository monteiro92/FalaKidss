import React, { useState } from 'react';
import { KeyRound, ShieldCheck, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { AdminAuditLog, AdminSession } from '../../types/admin';
import { updateAdminCredentials } from '../../utils/adminStore';

interface AdminSecurityViewProps {
  session: AdminSession;
  logs: AdminAuditLog[];
  onSessionUpdated: (session: AdminSession) => void;
}

export const AdminSecurityView: React.FC<AdminSecurityViewProps> = ({
  session,
  logs,
  onSessionUpdated,
}) => {
  const [name, setName] = useState(session.name);
  const [email, setEmail] = useState(session.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (newPassword && newPassword !== confirmPassword) {
      setStatus({ type: 'err', text: 'A confirmação da nova senha não confere.' });
      return;
    }

    const res = await updateAdminCredentials({
      currentPassword,
      newEmail: email,
      newName: name,
      newPassword: newPassword || undefined,
    });

    if (!res.ok) {
      setStatus({ type: 'err', text: res.error });
      return;
    }

    onSessionUpdated(res.session);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setStatus({ type: 'ok', text: 'Credenciais administrativas atualizadas com segurança.' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
          Segurança e Acesso Administrativo
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Atualize seu e-mail e senha de administrador e acompanhe o histórico de acessos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Credentials Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-indigo-600" aria-hidden="true" />
            <h2 className="text-base font-extrabold text-slate-900">
              Credenciais do Administrador
            </h2>
          </div>

          {status && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm flex items-start gap-2 ${
                status.type === 'ok'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-rose-200 bg-rose-50 text-rose-800'
              }`}
            >
              {status.type === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{status.text}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
              Nome do Administrador
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
              E-mail de Login
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
              Senha Atual (obrigatória para salvar)
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
                Nova Senha (opcional)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white hover:bg-indigo-700 transition min-h-[46px]"
          >
            Atualizar credenciais
          </button>
        </form>

        {/* Active Session & Audit */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              <h2 className="text-base font-extrabold text-slate-900">Sessão Protegida Ativa</h2>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm space-y-1.5">
              <div>
                <span className="text-slate-500">Autenticado como:</span>{' '}
                <strong className="text-slate-900">{session.email}</strong>
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>
                  Válida até{' '}
                  {new Date(session.expiresAt).toLocaleString('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-3">
            <h2 className="text-base font-extrabold text-slate-900">
              Histórico de Auditoria ({logs.length})
            </h2>
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum evento registrado.</p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2 font-bold text-slate-900">
                      <span>{log.action}</span>
                      <span className="text-slate-500 font-normal">
                        {new Date(log.timestamp).toLocaleString('pt-BR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    <div className="text-slate-600 mt-0.5">{log.detail}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
