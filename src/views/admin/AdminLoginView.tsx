import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';
import tucaAppIcon from '../../assets/images/tuca_app_icon.png';
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
    <div className="min-h-screen bg-[#FFFDF5] text-[#0F2942] flex flex-col justify-between p-4 sm:p-6">
      <div className="max-w-md w-full mx-auto flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onExitToApp}
          className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-white px-3.5 py-2 text-xs font-bold text-[#0F2942] hover:bg-amber-50 transition min-h-[42px] shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4 text-orange-600" aria-hidden="true" />
          <span>Voltar ao aplicativo</span>
        </button>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-[#FFFBEB] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-amber-900">
          <ShieldCheck className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
          <span>Área Restrita</span>
        </span>
      </div>

      <main className="max-w-md w-full mx-auto my-auto py-8">
        <div className="rounded-3xl border border-amber-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-2.5 text-center">
            <img
              src={tucaAppIcon}
              alt="FalaKids"
              className="w-16 h-16 rounded-2xl object-cover mx-auto shadow-sm border border-amber-200"
            />
            <h1 className="text-2xl font-display font-extrabold text-[#0F2942] tracking-tight">
              Administração FalaKids
            </h1>
            <p className="text-sm text-slate-600">
              Acesso exclusivo para gerenciamento administrativo de usuários, concessões Premium e configurações.
            </p>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="admin-login-email" className="block text-xs font-bold uppercase tracking-wide text-[#0F2942]">
                E-mail Administrativo
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="admin-login-email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@falamelhor.app"
                  className="w-full rounded-2xl border border-amber-200 bg-[#FFFDF7] pl-10 pr-4 py-3 text-sm text-[#0F2942] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="admin-login-password" className="block text-xs font-bold uppercase tracking-wide text-[#0F2942]">
                Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  id="admin-login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full rounded-2xl border border-amber-200 bg-[#FFFDF7] pl-10 pr-11 py-3 text-sm text-[#0F2942] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-xl text-slate-500 hover:text-[#0F2942] transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-700 hover:to-amber-600 px-5 py-3.5 text-sm font-extrabold text-white disabled:opacity-60 transition min-h-[48px] shadow-sm"
            >
              {submitting ? 'Verificando acesso...' : 'Entrar no Painel Administrativo'}
            </button>
          </form>

          <div className="rounded-2xl border border-amber-200 bg-[#FFFBEB] p-3.5 text-xs text-slate-700 space-y-1">
            <div className="font-bold text-[#0F2942]">Acesso inicial configurado:</div>
            <div>
              Login: <code className="font-bold text-orange-700">{DEFAULT_ADMIN_EMAIL}</code> · Senha:{' '}
              <code className="font-bold text-orange-700">Admin@2026</code>
            </div>
            <div className="text-[11px] text-slate-500">
              Recomendamos alterar a senha na aba Segurança após o primeiro acesso.
            </div>
          </div>
        </div>
      </main>

      <div className="text-center text-xs text-amber-900/70 font-medium pb-2">
        Ambiente protegido por autenticação no servidor · FalaKids
      </div>
    </div>
  );
};
