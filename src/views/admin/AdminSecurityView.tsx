import React, { useState } from 'react';
import { KeyRound, ShieldCheck, CheckCircle2, AlertCircle, Clock, Lock } from 'lucide-react';
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
        <h1 className="text-2xl md:text-3xl font-display font-extrabold text-[#0F2942]">
          Segurança, Permissões e Auditoria
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Acesso exclusivo para administradores autenticados no servidor, histórico completo de alterações e proteção de dados (LGPD).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Credentials Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-6 rounded-3xl border border-amber-200 bg-white p-5 sm:p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-orange-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="text-base font-extrabold text-[#0F2942]">
              Credenciais do Administrador
            </h2>
          </div>

          {status && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold flex items-start gap-2 ${
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
            <label className="block text-xs font-bold uppercase tracking-wide text-[#0F2942] mb-1">
              Nome do Administrador
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-amber-200 bg-[#FFFDF7] px-3.5 py-2.5 text-sm text-[#0F2942] focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#0F2942] mb-1">
              E-mail de Login
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-amber-200 bg-[#FFFDF7] px-3.5 py-2.5 text-sm text-[#0F2942] focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#0F2942] mb-1">
              Senha Atual (obrigatória para salvar)
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-2xl border border-amber-200 bg-[#FFFDF7] px-3.5 py-2.5 text-sm text-[#0F2942] focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#0F2942] mb-1">
                Nova Senha (opcional)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-2xl border border-amber-200 bg-[#FFFDF7] px-3.5 py-2.5 text-sm text-[#0F2942] focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#0F2942] mb-1">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-amber-200 bg-[#FFFDF7] px-3.5 py-2.5 text-sm text-[#0F2942] focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-orange-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-orange-700 transition min-h-[46px] shadow-xs"
          >
            Atualizar credenciais
          </button>
        </form>

        {/* Active Session & Audit */}
        <div className="lg:col-span-6 space-y-4">
          <div className="rounded-3xl border border-amber-200 bg-white p-5 sm:p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" aria-hidden="true" />
              </div>
              <h2 className="text-base font-extrabold text-[#0F2942]">Sessão Protegida Ativa</h2>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-[#FFFDF7] p-4 text-sm space-y-2">
              <div>
                <span className="text-slate-500">Administrador autenticado:</span>{' '}
                <strong className="text-[#0F2942]">
                  {session.name} ({session.email})
                </strong>
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
                <span>
                  Válida até{' '}
                  {new Date(session.expiresAt).toLocaleString('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <div className="text-xs text-slate-600 flex items-start gap-1.5 pt-1 border-t border-amber-100">
                <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Todas as rotas administrativas validam token assinado no servidor. Senhas nunca são expostas e operações seguem a LGPD.
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-white p-5 sm:p-6 shadow-xs space-y-3">
            <h2 className="text-base font-extrabold text-[#0F2942]">
              Histórico de Auditoria do Servidor ({logs.length})
            </h2>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhum evento administrativo registrado.</p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-2xl border border-amber-100 bg-[#FFFDF7] px-3.5 py-2.5 text-xs space-y-1"
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
                    <div className="text-[11px] text-amber-800 font-semibold">
                      Responsável: {log.actorName ? `${log.actorName} · ` : ''}
                      {log.actorEmail}
                    </div>
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
