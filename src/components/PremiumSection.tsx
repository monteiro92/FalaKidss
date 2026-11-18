import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  BookMarked,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Crown,
  ExternalLink,
  Gamepad2,
  Lock,
  QrCode,
  Receipt,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  X,
  XCircle,
} from 'lucide-react';
import { AppSection, ChildProfile, ProgressState } from '../types/app';
import {
  ContentCatalogResponse,
  PaymentBillingMethod,
  PremiumStatusResponse,
  SubscriptionStatus,
} from '../types/premium';
import {
  cancelPremiumSubscription,
  createPremiumSubscription,
  refreshPremiumSubscription,
} from '../utils/premiumStore';

interface PremiumSectionProps {
  profile: ChildProfile;
  progress: ProgressState;
  premiumStatus: PremiumStatusResponse | null;
  loadingPremium: boolean;
  catalogCounts?: ContentCatalogResponse['counts'];
  onRefreshPremium: (sync?: boolean) => Promise<void>;
  onStatusUpdated: (status: PremiumStatusResponse) => void;
  onNavigate?: (section: AppSection) => void;
}

const PREMIUM_BENEFITS = [
  {
    title: 'Acesso aos conteúdos Premium',
    detail: 'Biblioteca ampliada com novos desafios guiados de fala e linguagem.',
  },
  {
    title: 'Atividades educativas exclusivas',
    detail: 'Trilhas avançadas de respiração, ritmo, trava-línguas e frases completas.',
  },
  {
    title: 'Jogos especiais',
    detail: 'Desafios exclusivos de fonemas complexos (CH, LH, NH) e caça às rimas.',
  },
  {
    title: 'Histórias exclusivas',
    detail: 'Contos ilustrados inéditos com narração sincronizada e quiz interativo.',
  },
  {
    title: 'Experiência personalizada',
    detail: 'Recomendações e resumo adaptados à faixa etária e ao ritmo da criança.',
  },
  {
    title: 'Novos conteúdos adicionados ao plano',
    detail: 'Atualizações contínuas com novas atividades, histórias e jogos.',
  },
  {
    title: 'Acompanhamento de conquistas',
    detail: 'Painel detalhado de evolução positiva e marcos celebrados em família.',
  },
  {
    title: 'Experiência 100% sem anúncios',
    detail: 'Ambiente infantil seguro, calmo e livre de propagandas ou distrações.',
  },
];

function formatCurrencyBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDatePtBr(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const normalized = dateStr.length === 10 ? `${dateStr}T12:00:00` : dateStr;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('pt-BR');
}

function formatCpfCnpjInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1-$2');
  }
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

function translatePaymentStatus(status: string): { label: string; toneClass: string } {
  switch (status) {
    case 'RECEIVED':
    case 'CONFIRMED':
    case 'RECEIVED_IN_CASH':
      return { label: 'Confirmado', toneClass: 'bg-emerald-50 border-emerald-200 text-emerald-800' };
    case 'OVERDUE':
      return { label: 'Em atraso', toneClass: 'bg-rose-50 border-rose-200 text-rose-800' };
    case 'REFUNDED':
      return { label: 'Estornado', toneClass: 'bg-slate-100 border-slate-300 text-slate-700' };
    case 'DELETED':
    case 'CHARGEBACK_REQUESTED':
      return { label: 'Cancelado / Contestado', toneClass: 'bg-rose-50 border-rose-200 text-rose-800' };
    default:
      return { label: 'Aguardando pagamento', toneClass: 'bg-amber-50 border-amber-200 text-amber-900' };
  }
}

function getSubscriptionStatusMeta(status: SubscriptionStatus): {
  label: string;
  description: string;
  badgeClass: string;
  Icon: React.FC<{ className?: string }>;
} {
  switch (status) {
    case 'ACTIVE':
      return {
        label: 'Assinatura Ativa',
        description: 'Pagamento confirmado. Todos os conteúdos exclusivos estão liberados.',
        badgeClass: 'bg-emerald-50 border-emerald-300 text-emerald-900',
        Icon: CheckCircle2,
      };
    case 'PENDING':
      return {
        label: 'Pagamento Pendente',
        description: 'Aguardando confirmação real do pagamento para liberar os conteúdos Premium.',
        badgeClass: 'bg-amber-50 border-amber-300 text-amber-900',
        Icon: Clock,
      };
    case 'OVERDUE':
      return {
        label: 'Inadimplente / Em Atraso',
        description: 'Regularize a cobrança pendente para reativar os conteúdos exclusivos.',
        badgeClass: 'bg-rose-50 border-rose-300 text-rose-900',
        Icon: AlertTriangle,
      };
    case 'CANCELED':
      return {
        label: 'Assinatura Cancelada',
        description: 'A cobrança recorrente foi encerrada. Os recursos gratuitos seguem disponíveis.',
        badgeClass: 'bg-slate-100 border-slate-300 text-slate-800',
        Icon: XCircle,
      };
    default:
      return {
        label: 'Plano Gratuito',
        description: 'Acesso completo a todas as atividades, jogos e histórias gratuitas.',
        badgeClass: 'bg-slate-100 border-slate-200 text-slate-800',
        Icon: ShieldCheck,
      };
  }
}

export const PremiumSection: React.FC<PremiumSectionProps> = ({
  profile,
  progress,
  premiumStatus,
  loadingPremium,
  catalogCounts,
  onRefreshPremium,
  onStatusUpdated,
  onNavigate,
}) => {
  const premStoriesCount = catalogCounts?.byCategory.story.premium ?? 2;
  const premGamesCount = catalogCounts?.byCategory.game.premium ?? 2;
  const premActivitiesCount = catalogCounts?.byCategory.activity.premium ?? 4;
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [manageExpanded, setManageExpanded] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [customerCpfCnpj, setCustomerCpfCnpj] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [billingType, setBillingType] = useState<PaymentBillingMethod>('PIX');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(() => `sub_${Date.now()}`);

  const [submitting, setSubmitting] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);

  const status: SubscriptionStatus = premiumStatus?.status || 'FREE';
  const hasPremiumAccess = Boolean(premiumStatus?.hasPremiumAccess);
  const accessSource = premiumStatus?.accessSource || 'free';
  const isAdminGrant = hasPremiumAccess && accessSource === 'admin_grant';
  const subscription = premiumStatus?.subscription || null;
  const paymentHistory = premiumStatus?.paymentHistory || [];
  const gatewayConfigured = Boolean(premiumStatus?.gatewayConfigured);
  const pixSupported = premiumStatus ? premiumStatus.pixSupported : true;
  const monthlyValue = premiumStatus?.monthlyValue ?? 29.99;

  const statusMeta = useMemo(() => {
    if (isAdminGrant) {
      return {
        label: 'Premium Administrativo',
        description: premiumStatus?.isPermanentGrant
          ? 'Acesso Premium permanente liberado administrativamente sem geração de cobrança.'
          : `Acesso Premium liberado administrativamente até ${formatDatePtBr(
              premiumStatus?.adminGrantExpiresAt
            )}.`,
        badgeClass: 'bg-orange-50 border-orange-300 text-orange-900',
        Icon: Crown,
      };
    }
    return getSubscriptionStatusMeta(status);
  }, [isAdminGrant, premiumStatus?.isPermanentGrant, premiumStatus?.adminGrantExpiresAt, status]);
  const StatusIcon = statusMeta.Icon;

  // Poll server gently while checkout modal is open waiting on PENDING payment confirmation
  useEffect(() => {
    if (!checkoutOpen || status !== 'PENDING') return;
    const interval = window.setInterval(() => {
      refreshPremiumSubscription(profile.childAccountId)
        .then((updated) => {
          onStatusUpdated(updated);
          if (updated.hasPremiumAccess) {
            setActionSuccess('Pagamento confirmado! O FalaKids Premium já está ativo.');
          }
        })
        .catch(() => {});
    }, 5000);
    return () => window.clearInterval(interval);
  }, [checkoutOpen, status, profile.childAccountId, onStatusUpdated]);

  const openCheckoutModal = () => {
    setActionError(null);
    setActionSuccess(null);
    setCopiedPix(false);
    setIdempotencyKey(`sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
    if (!pixSupported && billingType === 'PIX') {
      setBillingType('CREDIT_CARD');
    }
    setCheckoutOpen(true);
  };

  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    const digits = customerCpfCnpj.replace(/\D/g, '');
    if (customerName.trim().length < 3) {
      setActionError('Informe o nome completo do responsável.');
      return;
    }
    if (digits.length !== 11 && digits.length !== 14) {
      setActionError('Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.');
      return;
    }
    if (!customerEmail.trim().includes('@')) {
      setActionError('Informe um e-mail válido para receber os comprovantes.');
      return;
    }
    if (!acceptedTerms) {
      setActionError('Aceite as condições da assinatura mensal e a política de privacidade LGPD.');
      return;
    }

    setSubmitting(true);
    try {
      const updated = await createPremiumSubscription({
        customerName: customerName.trim(),
        customerCpfCnpj: digits,
        customerEmail: customerEmail.trim(),
        billingType,
        acceptedTerms,
        childAccountId: profile.childAccountId,
        childName: profile.name,
        idempotencyKey,
      });
      onStatusUpdated(updated);
      if (updated.hasPremiumAccess) {
        setActionSuccess('Assinatura FalaKids Premium confirmada e ativa!');
      } else {
        setActionSuccess(
          billingType === 'PIX'
            ? 'Cobrança PIX gerada! Conclua o pagamento abaixo para ativar a assinatura.'
            : 'Assinatura registrada! Finalize o pagamento no checkout seguro abaixo.'
        );
      }
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Não foi possível iniciar a assinatura.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckConfirmation = async () => {
    setCheckingPayment(true);
    setActionError(null);
    try {
      const updated = await refreshPremiumSubscription(profile.childAccountId);
      onStatusUpdated(updated);
      if (updated.hasPremiumAccess) {
        setActionSuccess('Pagamento confirmado pelo gateway! Todos os recursos Premium foram liberados.');
      } else if (updated.status === 'PENDING') {
        setActionError('Pagamento ainda aguardando compensação no gateway. Tente novamente em instantes.');
      }
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Erro ao consultar confirmação de pagamento.'
      );
    } finally {
      setCheckingPayment(false);
    }
  };

  const handleCopyPix = async (payload: string) => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopiedPix(true);
      window.setTimeout(() => setCopiedPix(false), 2500);
    } catch {
      setActionError('Não foi possível copiar automaticamente. Selecione o código manualmente.');
    }
  };

  const handleCancelSubscription = async () => {
    setCanceling(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const updated = await cancelPremiumSubscription(profile.childAccountId);
      onStatusUpdated(updated);
      setConfirmCancel(false);
      setActionSuccess('Assinatura cancelada com sucesso. Os recursos gratuitos permanecem ativos.');
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : 'Não foi possível cancelar a assinatura.'
      );
    } finally {
      setCanceling(false);
    }
  };

  return (
    <section
      aria-label="FalaKids Premium"
      className="space-y-6"
    >
      {/* 1. APRESENTAÇÃO FALAKIDS PREMIUM — Design Creme, Dourado e Laranja */}
      <div className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-[#FFFDF7] via-[#FEF6E4] to-[#FFF4E0] p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-center gap-6">
          {/* Cartão de Preço & CTA Principal */}
          <div className="rounded-3xl border border-amber-300 bg-white p-5 md:p-6 shadow-sm min-w-[270px] lg:max-w-xs space-y-4">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Plano Mensal
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-3xl font-extrabold font-display text-[#0F2942] tabular-nums">
                    {formatCurrencyBRL(monthlyValue)}
                  </span>
                  <span className="text-sm font-bold text-slate-600">/ mês</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 fill-amber-400 text-amber-500" aria-hidden="true" />
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Renovação mensal transparente via PIX ou Cartão de Crédito. Cancele quando quiser direto na Área dos Pais.
            </p>

            {hasPremiumAccess ? (
              <div className="space-y-2">
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-extrabold text-emerald-900 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>{isAdminGrant ? 'Premium Administrativo Ativo' : 'Plano Ativo'}</span>
                </div>
                {!isAdminGrant && (
                  <button
                    type="button"
                    onClick={() => setManageExpanded((v) => !v)}
                    className="w-full rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-bold text-amber-950 hover:bg-amber-100 transition min-h-[44px]"
                  >
                    Gerenciar minha assinatura
                  </button>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={openCheckoutModal}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-700 hover:to-amber-600 px-5 py-3.5 text-sm font-extrabold tracking-wide text-white shadow-sm transition min-h-[52px]"
              >
                <Star className="w-4 h-4 fill-white" aria-hidden="true" />
                <span>
                  {status === 'PENDING'
                    ? 'CONCLUIR ASSINATURA'
                    : 'ASSINAR'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Lista de 8 Benefícios em Cartões Elevados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {PREMIUM_BENEFITS.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-2xl border border-amber-200/80 bg-white/95 p-4 flex items-start gap-3 shadow-2xs"
            >
              <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-600" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#0F2942] leading-snug">
                  {benefit.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{benefit.detail}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Nota de proteção aos recursos gratuitos */}
        <div className="rounded-2xl border border-amber-200 bg-white/80 px-4 py-3 flex items-center gap-2.5 text-xs text-slate-700">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>
            <strong>Compromisso FalaKids:</strong> todas as atividades gratuitas, Anatomia 3D, jogos gratuitos e histórias básicas continuam 100% livres para sua família.
          </span>
        </div>
      </div>

      {/* 2. EXPERIÊNCIA PERSONALIZADA DO ASSINANTE ATIVO */}
      {hasPremiumAccess && (
        <div className="rounded-3xl border border-amber-200 bg-white p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#0F2942]">
                  Experiência Personalizada para {profile.name}
                </h3>
                <p className="text-xs text-slate-600">
                  Faixa etária configurada: {profile.age} anos · Conteúdos exclusivos desbloqueados e ambiente sem anúncios.
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-900 self-start">
              <Award className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
              <span>{progress.starsTotal} estrelas conquistadas</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <button
              type="button"
              onClick={() => onNavigate?.('stories')}
              className="rounded-2xl border border-amber-200 bg-[#FFFDF7] hover:bg-amber-50/70 p-4 text-left flex items-center justify-between gap-3 transition min-h-[68px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0">
                  <BookMarked className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900">Histórias Exclusivas</div>
                  <div className="text-xs text-slate-600">
                    {premStoriesCount} {premStoriesCount === 1 ? 'conto ilustrado liberado' : 'novos contos ilustrados liberados'}
                  </div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.('games')}
              className="rounded-2xl border border-amber-200 bg-[#FFFDF7] hover:bg-amber-50/70 p-4 text-left flex items-center justify-between gap-3 transition min-h-[68px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
                  <Gamepad2 className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900">Jogos Especiais</div>
                  <div className="text-xs text-slate-600">
                    {premGamesCount} {premGamesCount === 1 ? 'jogo exclusivo liberado' : 'jogos exclusivos liberados'}
                  </div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onNavigate?.('activities')}
              className="rounded-2xl border border-amber-200 bg-[#FFFDF7] hover:bg-amber-50/70 p-4 text-left flex items-center justify-between gap-3 transition min-h-[68px]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-slate-900">Atividades Exclusivas</div>
                  <div className="text-xs text-slate-600">
                    {premActivitiesCount} {premActivitiesCount === 1 ? 'trilha guiada liberada' : 'trilhas guiadas liberadas'}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 3. GERENCIAMENTO DA ASSINATURA */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Gerenciamento da Assinatura
            </h3>
            <p className="text-sm text-slate-600 mt-0.5">
              Acompanhe o plano atual, situação real do pagamento, próxima cobrança e faturas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={loadingPremium}
              onClick={() => onRefreshPremium(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition min-h-[44px] disabled:opacity-60"
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingPremium ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>Atualizar status</span>
            </button>

            {subscription ? (
              <button
                type="button"
                onClick={() => setManageExpanded((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-[#0F2942] px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition min-h-[44px]"
              >
                <Settings2 className="w-4 h-4" aria-hidden="true" />
                <span>{manageExpanded ? 'Ocultar detalhes' : 'Gerenciar assinatura'}</span>
              </button>
            ) : !isAdminGrant ? (
              <button
                type="button"
                onClick={openCheckoutModal}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-700 transition min-h-[44px]"
              >
                <Star className="w-4 h-4 fill-white" aria-hidden="true" />
                <span>Assinar agora</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Status Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Plano atual
            </div>
            <div className="text-base font-extrabold text-slate-900 mt-1">
              {hasPremiumAccess ? 'FalaKids Premium' : subscription ? 'FalaKids Premium (Não ativo)' : 'FalaKids Gratuito'}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Situação da assinatura
            </div>
            <div className="mt-1.5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-xs font-extrabold ${statusMeta.badgeClass}`}
              >
                <StatusIcon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{statusMeta.label}</span>
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Valor contratado
            </div>
            <div className="text-base font-extrabold text-slate-900 mt-1 tabular-nums">
              {subscription
                ? `${formatCurrencyBRL(subscription.value)} / mês`
                : isAdminGrant
                ? 'Concessão administrativa'
                : 'R$ 0,00 / mês'}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {isAdminGrant ? 'Validade do acesso' : 'Próxima cobrança'}
            </div>
            <div className="text-base font-extrabold text-slate-900 mt-1 tabular-nums flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-500" aria-hidden="true" />
              <span>
                {isAdminGrant
                  ? premiumStatus?.isPermanentGrant
                    ? 'Acesso permanente'
                    : formatDatePtBr(premiumStatus?.adminGrantExpiresAt)
                  : subscription && subscription.status !== 'CANCELED'
                  ? formatDatePtBr(subscription.nextDueDate)
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-600">{statusMeta.description}</p>

        {/* Action feedback messages */}
        {actionError && !checkoutOpen && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
            {actionError}
          </div>
        )}
        {actionSuccess && !checkoutOpen && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
            {actionSuccess}
          </div>
        )}

        {/* Expanded Management Panel */}
        {subscription && manageExpanded && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1 text-sm">
                <div className="font-bold text-slate-900">
                  Titular: {subscription.customerName} ({subscription.customerEmail})
                </div>
                <div className="text-xs text-slate-600">
                  Forma de pagamento:{' '}
                  <strong>
                    {subscription.billingType === 'PIX' ? 'PIX Recorrente' : 'Cartão de Crédito'}
                  </strong>{' '}
                  · Início em {formatDatePtBr(subscription.startedAt)}
                  {subscription.canceledAt
                    ? ` · Cancelada em ${formatDatePtBr(subscription.canceledAt)}`
                    : ''}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {(subscription.status === 'PENDING' || subscription.status === 'OVERDUE') && (
                  <button
                    type="button"
                    onClick={openCheckoutModal}
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-700 min-h-[44px]"
                  >
                    <QrCode className="w-4 h-4" aria-hidden="true" />
                    <span>Visualizar pagamento pendente</span>
                  </button>
                )}

                {subscription.status === 'CANCELED' && (
                  <button
                    type="button"
                    onClick={openCheckoutModal}
                    className="inline-flex items-center gap-1.5 rounded-2xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-orange-700 min-h-[44px]"
                  >
                    <Star className="w-4 h-4 fill-white" aria-hidden="true" />
                    <span>Assinar novamente</span>
                  </button>
                )}

                {subscription.status !== 'CANCELED' && !confirmCancel && (
                  <button
                    type="button"
                    onClick={() => setConfirmCancel(true)}
                    className="inline-flex items-center gap-1.5 rounded-2xl border border-rose-300 bg-white px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-50 min-h-[44px]"
                  >
                    <XCircle className="w-4 h-4" aria-hidden="true" />
                    <span>Cancelar assinatura</span>
                  </button>
                )}
              </div>
            </div>

            {confirmCancel && subscription.status !== 'CANCELED' && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-sm font-semibold text-rose-900">
                  Tem certeza que deseja cancelar a assinatura mensal de {formatCurrencyBRL(subscription.value)}? O acesso aos conteúdos exclusivos será encerrado.
                </p>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={canceling}
                    onClick={handleCancelSubscription}
                    className="rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 min-h-[44px] disabled:opacity-60"
                  >
                    {canceling ? 'Cancelando...' : 'Confirmar cancelamento'}
                  </button>
                  <button
                    type="button"
                    disabled={canceling}
                    onClick={() => setConfirmCancel(false)}
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 min-h-[44px]"
                  >
                    Manter assinatura
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Histórico de Pagamentos */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-slate-600" aria-hidden="true" />
            <h4 className="text-base font-bold text-slate-900">Histórico de Pagamentos</h4>
          </div>

          {paymentHistory.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              Nenhuma cobrança registrada até o momento.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Vencimento / Pago</th>
                    <th className="px-4 py-3">Método</th>
                    <th className="px-4 py-3">Valor</th>
                    <th className="px-4 py-3">Situação</th>
                    <th className="px-4 py-3 text-right">Comprovante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {paymentHistory.map((pay) => {
                    const st = translatePaymentStatus(pay.status);
                    return (
                      <tr key={pay.id}>
                        <td className="px-4 py-3 tabular-nums text-slate-800 font-medium">
                          {pay.paidAt
                            ? `Pago em ${formatDatePtBr(pay.paidAt)}`
                            : `Vence em ${formatDatePtBr(pay.dueDate)}`}
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-semibold">
                          {pay.billingType === 'CREDIT_CARD' ? 'Cartão de Crédito' : 'PIX'}
                        </td>
                        <td className="px-4 py-3 tabular-nums font-bold text-slate-900">
                          {formatCurrencyBRL(pay.value)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-bold ${st.toneClass}`}
                          >
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {pay.invoiceUrl ? (
                            <a
                              href={pay.invoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 hover:text-sky-900 underline"
                            >
                              <span>Abrir fatura</span>
                              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 4. MODAL DE CHECKOUT SEGURO */}
      {checkoutOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-premium-title"
        >
          <div className="w-full max-w-xl rounded-3xl border border-amber-300 bg-[#FFFDF7] shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0F2942] to-[#1E3A5F] px-6 py-5 text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-[#0F2942] flex items-center justify-center shrink-0">
                  <Crown className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 id="checkout-premium-title" className="text-lg font-extrabold">
                    Assinar FalaKids Premium
                  </h3>
                  <p className="text-xs text-amber-200 font-semibold tabular-nums">
                    {formatCurrencyBRL(monthlyValue)} / mês · Assinatura recorrente
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutOpen(false)}
                aria-label="Fechar contratação"
                className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
              {/* Plan conditions summary */}
              <div className="rounded-2xl border border-amber-200 bg-white p-4 space-y-2">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-bold text-slate-900">Plano FalaKids Premium</span>
                  <span className="font-extrabold text-orange-600 tabular-nums">
                    {formatCurrencyBRL(monthlyValue)} / mês
                  </span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• Cobrança mensal recorrente — cancele a qualquer momento na Área dos Pais.</li>
                  <li>• Liberação imediata somente após confirmação real do pagamento pelo gateway.</li>
                  <li>• Segurança PCI-DSS e LGPD: nunca armazenamos dados de cartão no aplicativo.</li>
                </ul>
              </div>

              {!gatewayConfigured && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-3 text-sm text-amber-950">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <strong>Gateway de pagamentos aguardando configuração:</strong> o administrador precisa salvar a chave de produção Asaas para gerar cobranças reais por PIX ou Cartão. Nenhuma cobrança simulada é permitida.
                  </div>
                </div>
              )}

              {actionError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-sm font-semibold text-rose-800">
                  {actionError}
                </div>
              )}

              {actionSuccess && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm font-semibold text-emerald-900">
                  {actionSuccess}
                </div>
              )}

              {/* Active confirmation inside modal */}
              {hasPremiumAccess ? (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" aria-hidden="true" />
                  <h4 className="text-lg font-extrabold text-emerald-950">
                    Assinatura FalaKids Premium Ativa!
                  </h4>
                  <p className="text-sm text-emerald-900">
                    Seu pagamento foi confirmado e todas as histórias exclusivas, jogos especiais e atividades avançadas estão liberados.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCheckoutOpen(false)}
                    className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 min-h-[46px]"
                  >
                    Concluir e explorar Premium
                  </button>
                </div>
              ) : subscription && subscription.status === 'PENDING' ? (
                /* Real PENDING Checkout Instructions (PIX QR or Hosted Card Checkout) */
                <div className="rounded-2xl border border-amber-300 bg-white p-5 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-extrabold text-slate-900">
                      {subscription.billingType === 'PIX'
                        ? 'Pague com PIX para ativar'
                        : 'Finalize no Checkout Seguro Asaas'}
                    </span>
                    <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900">
                      Aguardando confirmação
                    </span>
                  </div>

                  {subscription.billingType === 'PIX' && subscription.latestPixEncodedImage && (
                    <div className="flex flex-col items-center gap-3 py-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
                        <img
                          src={`data:image/png;base64,${subscription.latestPixEncodedImage}`}
                          alt="QR Code PIX FalaKids Premium"
                          className="w-48 h-48 object-contain"
                        />
                      </div>
                      {subscription.latestPixPayload && (
                        <div className="w-full space-y-2">
                          <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-[11px] font-mono text-slate-700 break-all max-h-20 overflow-y-auto">
                            {subscription.latestPixPayload}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyPix(subscription.latestPixPayload || '')}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 py-2.5 text-sm font-bold text-amber-950 hover:bg-amber-100 min-h-[44px]"
                          >
                            {copiedPix ? (
                              <>
                                <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                                <span>Código PIX copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" aria-hidden="true" />
                                <span>Copiar código PIX Copia e Cola</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {subscription.latestInvoiceUrl && (
                    <a
                      href={subscription.latestInvoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 hover:bg-orange-700 px-5 py-3.5 text-sm font-extrabold text-white shadow-xs transition min-h-[48px]"
                    >
                      <Lock className="w-4 h-4" aria-hidden="true" />
                      <span>
                        {subscription.billingType === 'CREDIT_CARD'
                          ? 'Ir para Checkout Seguro (Cartão de Crédito)'
                          : 'Abrir Fatura Segura Asaas'}
                      </span>
                      <ExternalLink className="w-4 h-4" aria-hidden="true" />
                    </a>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-slate-600">
                      Após pagar, aguarde alguns segundos ou verifique agora:
                    </p>
                    <button
                      type="button"
                      disabled={checkingPayment}
                      onClick={handleCheckConfirmation}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-[#0F2942] px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 min-h-[44px] shrink-0 disabled:opacity-60"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${checkingPayment ? 'animate-spin' : ''}`}
                        aria-hidden="true"
                      />
                      <span>
                        {checkingPayment ? 'Verificando...' : 'Verificar confirmação no servidor'}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Subscription Checkout Form */
                <form onSubmit={handleSubscribeSubmit} className="space-y-4">
                  {/* Payment Method Selection */}
                  <div className="space-y-2">
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Forma de pagamento
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        disabled={!pixSupported}
                        onClick={() => setBillingType('PIX')}
                        className={`rounded-2xl border-2 p-3.5 text-left transition flex items-center gap-3 min-h-[60px] ${
                          billingType === 'PIX'
                            ? 'border-orange-500 bg-orange-50/70'
                            : 'border-slate-200 bg-white hover:border-amber-300'
                        } disabled:opacity-50`}
                      >
                        <QrCode className="w-5 h-5 text-orange-600 shrink-0" aria-hidden="true" />
                        <div>
                          <div className="text-sm font-extrabold text-slate-900">PIX</div>
                          <div className="text-[11px] text-slate-600">QR Code instantâneo</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBillingType('CREDIT_CARD')}
                        className={`rounded-2xl border-2 p-3.5 text-left transition flex items-center gap-3 min-h-[60px] ${
                          billingType === 'CREDIT_CARD'
                            ? 'border-orange-500 bg-orange-50/70'
                            : 'border-slate-200 bg-white hover:border-amber-300'
                        }`}
                      >
                        <CreditCard className="w-5 h-5 text-sky-700 shrink-0" aria-hidden="true" />
                        <div>
                          <div className="text-sm font-extrabold text-slate-900">Cartão</div>
                          <div className="text-[11px] text-slate-600">Checkout seguro Asaas</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="prem-guardian-name"
                      className="block text-xs font-bold text-slate-700 mb-1"
                    >
                      Nome completo do responsável
                    </label>
                    <input
                      id="prem-guardian-name"
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nome completo"
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor="prem-guardian-cpf"
                        className="block text-xs font-bold text-slate-700 mb-1"
                      >
                        CPF ou CNPJ (para emissão fiscal)
                      </label>
                      <input
                        id="prem-guardian-cpf"
                        type="text"
                        inputMode="numeric"
                        required
                        value={customerCpfCnpj}
                        onChange={(e) => setCustomerCpfCnpj(formatCpfCnpjInput(e.target.value))}
                        placeholder="000.000.000-00"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="prem-guardian-email"
                        className="block text-xs font-bold text-slate-700 mb-1"
                      >
                        E-mail do responsável
                      </label>
                      <input
                        id="prem-guardian-email"
                        type="email"
                        required
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="responsavel@email.com"
                        className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <label className="flex items-start gap-2.5 rounded-2xl border border-slate-200 bg-white p-3.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-orange-600 shrink-0"
                    />
                    <span className="text-xs text-slate-700 leading-relaxed">
                      Concordo com a assinatura mensal de <strong>{formatCurrencyBRL(monthlyValue)} / mês</strong>, renovável automaticamente até o cancelamento, e com a Política de Privacidade (LGPD) do FalaKids.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={submitting || !gatewayConfigured}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-sm transition min-h-[52px] disabled:opacity-50"
                  >
                    <Lock className="w-4 h-4" aria-hidden="true" />
                    <span>
                      {submitting
                        ? 'Preparando checkout seguro...'
                        : billingType === 'PIX'
                        ? 'Gerar PIX Seguro da Assinatura'
                        : 'Prosseguir para Checkout Seguro'}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
