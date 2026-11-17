import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { AdminSession } from '../../types/admin';
import { authenticateAdmin, DEFAULT_ADMIN_EMAIL } from '../../utils/adminStore';

interface AdminLoginViewProps {
  onSuccess: (session: AdminSession) => void;
  onExitToApp: () => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  onSuccess,
  onExitToApp,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (failedAttempts >= 5) {
      setErrorMsg('Muitas tentativas seguidas. Aguarde alguns instantes antes de tentar novamente.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await authenticateAdmin(email, password);
      if (!result.ok) {
        setFailedAttempts((prev) => prev + 1);
        setErrorMsg(result.error);
        return;
      }
      setFailedAttempts(0);
      onSuccess(result.session);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6">
      <div className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onExitToApp}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition min-h-[40px]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Voltar ao aplicativo</span>
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
          Área Restrita
        </span>
      </div>

      <main className="max-w-md w-full mx-auto my-auto py-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-2 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-7 h-7" aria-hidden="true" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Painel Administrativo
            </h1>
            <p className="text-sm text-slate-400">
              Acesso exclusivo para administração de contas e configurações do FalaKids.
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="rounded-2xl border border-rose-500/30 bg-rose-950/60 px-4 py-3 text-sm text-rose-200 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-login-email" className="block text-xs font-bold uppercase tracking-wide text-slate-300">
                E-mail Administrativo
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="admin-login-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@falamelhor.app"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-login-password" className="block text-xs font-bold uppercase tracking-wide text-slate-300">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="admin-login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950 pl-10 pr-11 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-white transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-indigo-600 px-5 py-3.5 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-60 transition min-h-[48px] shadow-lg shadow-indigo-950/50"
            >
              {submitting ? 'Verificando acesso...' : 'Entrar no Painel Administrativo'}
            </button>
          </form>

          <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3.5 text-xs text-slate-400 space-y-1">
            <div className="font-bold text-slate-300">Acesso inicial configurado:</div>
            <div>
              Login: <code className="text-indigo-300">{DEFAULT_ADMIN_EMAIL}</code> · Senha:{' '}
              <code className="text-indigo-300">Admin@2026</code>
            </div>
            <div className="text-[11px] text-slate-500">
              Recomendamos alterar a senha em Segurança após o primeiro acesso.
            </div>
          </div>
        </div>
      </main>

      <div className="text-center text-xs text-slate-600 pb-2">
        Ambiente protegido · Rota exclusiva /admin
      </div>
    </div>
  );
};
