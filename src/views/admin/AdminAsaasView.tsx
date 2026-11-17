import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyRound,
  QrCode,
  Webhook,
  RefreshCw,
  Copy,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import {
  AsaasConfigPublic,
  AsaasLivePayment,
  AsaasOrderRecord,
  AsaasTransactionRecord,
} from '../../types/admin';
import {
  createAdminPixCharge,
  fetchAsaasConfig,
  fetchAsaasPaymentsAndTransactions,
  refreshAdminAsaasPayment,
  registerAsaasWebhook,
  saveAsaasConfig,
  testAsaasConnection,
} from '../../utils/adminStore';

function formatCurrencyBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getStatusBadge(status: string): { label: string; cls: string } {
  switch (status) {
    case 'RECEIVED':
    case 'CONFIRMED':
    case 'RECEIVED_IN_CASH':
      return { label: 'Pago / Confirmado', cls: 'bg-emerald-100 text-emerald-900' };
    case 'PENDING':
      return { label: 'Aguardando PIX', cls: 'bg-amber-100 text-amber-900' };
    case 'OVERDUE':
      return { label: 'Vencido', cls: 'bg-rose-100 text-rose-900' };
    case 'REFUNDED':
      return { label: 'Estornado', cls: 'bg-slate-200 text-slate-800' };
    default:
      return { label: status, cls: 'bg-slate-100 text-slate-800' };
  }
}

export const AdminAsaasView: React.FC = () => {
  const [config, setConfig] = useState<AsaasConfigPublic | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Config form fields (API key stays write-only from browser -> server)
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [webhookTokenInput, setWebhookTokenInput] = useState('');
  const [pixEnabled, setPixEnabled] = useState(true);
  const [defaultPlanValue, setDefaultPlanValue] = useState('29.90');
  const [defaultPlanDescription, setDefaultPlanDescription] = useState(
    'Cobrança PIX - FalaKids'
  );

  // Feedback alerts
  const [alert, setAlert] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);
  const [testingConn, setTestingConn] = useState(false);
  const [registeringWebhook, setRegisteringWebhook] = useState(false);

  // PIX generation form
  const [customerName, setCustomerName] = useState('');
  const [customerCpfCnpj, setCustomerCpfCnpj] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [pixValue, setPixValue] = useState('29.90');
  const [pixDescription, setPixDescription] = useState('Cobrança PIX - FalaKids');
  const [pixRef, setPixRef] = useState('');
  const [generatingPix, setGeneratingPix] = useState(false);
  const [activeQrOrder, setActiveQrOrder] = useState<AsaasOrderRecord | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);

  // Payments, orders & transactions
  const [orders, setOrders] = useState<AsaasOrderRecord[]>([]);
  const [transactions, setTransactions] = useState<AsaasTransactionRecord[]>([]);
  const [livePayments, setLivePayments] = useState<AsaasLivePayment[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [refFilter, setRefFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'live' | 'transactions'>('orders');
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    setLoadingConfig(true);
    try {
      const cfg = await fetchAsaasConfig();
      setConfig(cfg);
      setPixEnabled(cfg.pixEnabled);
      setDefaultPlanValue(String(cfg.defaultPlanValue.toFixed(2)));
      setDefaultPlanDescription(cfg.defaultPlanDescription);
      setPixValue(String(cfg.defaultPlanValue.toFixed(2)));
      setPixDescription(cfg.defaultPlanDescription);
    } catch (err) {
      setAlert({
        type: 'err',
        text: err instanceof Error ? err.message : 'Erro ao carregar configuração do Asaas.',
      });
    } finally {
      setLoadingConfig(false);
    }
  }, []);

  const loadPayments = useCallback(async () => {
    setLoadingPayments(true);
    try {
      const res = await fetchAsaasPaymentsAndTransactions({
        status: statusFilter || undefined,
        externalReference: refFilter.trim() || undefined,
      });
      setOrders(res.orders);
      setTransactions(res.transactions);
      setLivePayments(res.livePayments);
      setSyncError(res.syncError);
    } catch (err) {
      setAlert({
        type: 'err',
        text: err instanceof Error ? err.message : 'Erro ao consultar pagamentos do Asaas.',
      });
    } finally {
      setLoadingPayments(false);
    }
  }, [statusFilter, refFilter]);

  useEffect(() => {
    loadConfig();
    loadPayments();
  }, [loadConfig, loadPayments]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    setSavingConfig(true);
    try {
      const updated = await saveAsaasConfig({
        apiKey: apiKeyInput.trim() || undefined,
        webhookToken: webhookTokenInput.trim() || undefined,
        pixEnabled,
        defaultPlanValue: Number(defaultPlanValue.replace(',', '.')),
        defaultPlanDescription,
      });
      setConfig(updated);
      setApiKeyInput('');
      setWebhookTokenInput('');
      setAlert({
        type: 'ok',
        text: 'Configurações do Asaas (Produção) salvas permanentemente no servidor.',
      });
      loadPayments();
    } catch (err) {
      setAlert({
        type: 'err',
        text: err instanceof Error ? err.message : 'Falha ao salvar configuração.',
      });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleTestConnection = async () => {
    setAlert(null);
    setTestingConn(true);
    try {
      const res = await testAsaasConnection();
      setAlert({
        type: 'ok',
        text: `Conexão com Asaas PRODUÇÃO confirmada! Conta: ${res.accountName}.`,
      });
    } catch (err) {
      setAlert({
        type: 'err',
        text: err instanceof Error ? err.message : 'Erro ao testar conexão com Asaas.',
      });
    } finally {
      setTestingConn(false);
    }
  };

  const handleRegisterWebhook = async () => {
    if (!config) return;
    setAlert(null);
    setRegisteringWebhook(true);
    try {
      const res = await registerAsaasWebhook({ webhookUrl: config.webhookUrlHint });
      setAlert({
        type: 'ok',
        text: `Webhook registrado automaticamente no Asaas Produção (${res.webhook.url}).`,
      });
    } catch (err) {
      setAlert({
        type: 'err',
        text: err instanceof Error ? err.message : 'Não foi possível registrar o webhook no Asaas.',
      });
    } finally {
      setRegisteringWebhook(false);
    }
  };

  const handleGeneratePix = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    setGeneratingPix(true);
    try {
      const res = await createAdminPixCharge({
        customerName,
        customerCpfCnpj,
        customerEmail: customerEmail || undefined,
        value: Number(pixValue.replace(',', '.')),
        description: pixDescription,
        externalReference: pixRef.trim() || undefined,
      });
      setActiveQrOrder(res.order);
      setCustomerName('');
      setCustomerCpfCnpj('');
      setCustomerEmail('');
      setPixRef('');
      setAlert({
        type: 'ok',
        text: `Cobrança PIX criada no Asaas Produção (${res.order.asaasPaymentId}).`,
      });
      loadPayments();
    } catch (err) {
      setAlert({
        type: 'err',
        text: err instanceof Error ? err.message : 'Erro ao gerar cobrança PIX no Asaas.',
      });
    } finally {
      setGeneratingPix(false);
    }
  };

  const handleRefreshPayment = async (paymentId: string) => {
    setRefreshingId(paymentId);
    try {
      const res = await refreshAdminAsaasPayment(paymentId);
      if (res.order && activeQrOrder?.asaasPaymentId === paymentId) {
        setActiveQrOrder(res.order);
      }
      await loadPayments();
    } catch (err) {
      setAlert({
        type: 'err',
        text: err instanceof Error ? err.message : 'Falha ao atualizar cobrança.',
      });
    } finally {
      setRefreshingId(null);
    }
  };

  const copyText = async (text: string, which: 'payload' | 'webhook') => {
    try {
      await navigator.clipboard.writeText(text);
      if (which === 'payload') {
        setCopiedPayload(true);
        window.setTimeout(() => setCopiedPayload(false), 2500);
      } else {
        setCopiedWebhookUrl(true);
        window.setTimeout(() => setCopiedWebhookUrl(false), 2500);
      }
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-900 px-3 py-1 text-xs font-extrabold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Ambiente de PRODUÇÃO · https://api.asaas.com/v3</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Integração Asaas (PIX Produção)
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Configure a chave API protegida no servidor, gere cobranças PIX com QR Code e acompanhe confirmações automáticas por Webhook.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadPayments()}
          disabled={loadingPayments}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 transition min-h-[44px] self-start sm:self-auto"
        >
          <RefreshCw
            className={`w-4 h-4 ${loadingPayments ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          <span>Atualizar consultas</span>
        </button>
      </div>

      {alert && (
        <div
          role="alert"
          className={`rounded-2xl border px-4 py-3 text-sm flex items-start gap-2.5 ${
            alert.type === 'ok'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {alert.type === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" aria-hidden="true" />
          )}
          <span>{alert.text}</span>
        </div>
      )}

      {/* Top Grid: Gateway Configuration + Automatic PIX Charge Generator */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left: Server-Protected API Key & Webhook Config */}
        <form
          onSubmit={handleSaveConfig}
          className="xl:col-span-6 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <KeyRound className="w-5 h-5 text-indigo-600" aria-hidden="true" />
              <h2 className="text-base font-extrabold text-slate-900">
                Configuração do Gateway (Servidor)
              </h2>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                config?.configured
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {loadingConfig
                ? 'Carregando...'
                : config?.configured
                ? `Chave protegida (${config.keyPreview})`
                : 'Chave não configurada'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
              API Key de Produção Asaas
            </label>
            <input
              type="password"
              autoComplete="off"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={
                config?.configured
                  ? 'Chave salva no servidor (preencha apenas para substituir)'
                  : '$aact_prod_...'
              }
              className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Armazenada exclusivamente no servidor. Nunca é enviada ou exposta ao navegador.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
                Valor Padrão da Cobrança (R$)
              </label>
              <input
                type="number"
                step="0.01"
                min="5"
                value={defaultPlanValue}
                onChange={(e) => setDefaultPlanValue(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm"
              />
            </div>

            <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 cursor-pointer self-end min-h-[42px]">
              <span className="text-sm font-bold text-slate-900">PIX Ativado</span>
              <input
                type="checkbox"
                checked={pixEnabled}
                onChange={(e) => setPixEnabled(e.target.checked)}
                className="w-4 h-4 accent-indigo-600"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
              Descrição Padrão das Cobranças
            </label>
            <input
              type="text"
              value={defaultPlanDescription}
              onChange={(e) => setDefaultPlanDescription(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm"
            />
          </div>

          {/* Webhook Section */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-slate-700">
              <Webhook className="w-4 h-4 text-indigo-600" aria-hidden="true" />
              <span>Webhook Automático Asaas</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={config?.webhookUrlHint || '/api/webhooks/asaas'}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 font-mono"
              />
              <button
                type="button"
                onClick={() => copyText(config?.webhookUrlHint || '', 'webhook')}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 inline-flex items-center gap-1 shrink-0"
              >
                <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{copiedWebhookUrl ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Token de Autenticação do Webhook ({config?.webhookTokenPreview || 'padrão'})
              </label>
              <input
                type="password"
                autoComplete="off"
                value={webhookTokenInput}
                onChange={(e) => setWebhookTokenInput(e.target.value)}
                placeholder="Preencha apenas para alterar o token (asaas-access-token)"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs"
              />
            </div>

            <button
              type="button"
              onClick={handleRegisterWebhook}
              disabled={registeringWebhook || !config?.configured}
              className="w-full rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-900 hover:bg-indigo-100 disabled:opacity-50 transition"
            >
              {registeringWebhook
                ? 'Registrando webhook no Asaas...'
                : 'Registrar Webhook automaticamente no Asaas'}
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              type="submit"
              disabled={savingConfig}
              className="flex-1 rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-60 min-h-[46px]"
            >
              {savingConfig ? 'Salvando...' : 'Salvar configurações'}
            </button>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testingConn || !config?.configured}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 hover:bg-slate-100 disabled:opacity-50 min-h-[46px]"
            >
              {testingConn ? 'Testando...' : 'Testar Conexão'}
            </button>
          </div>
        </form>

        {/* Right: Generate Real PIX Charge + QR Code Preview */}
        <div className="xl:col-span-6 space-y-4">
          <form
            onSubmit={handleGeneratePix}
            className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center gap-2.5">
              <QrCode className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              <h2 className="text-base font-extrabold text-slate-900">
                Gerar Cobrança PIX (Produção)
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nome completo"
                  className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
                  CPF ou CNPJ
                </label>
                <input
                  type="text"
                  required
                  value={customerCpfCnpj}
                  onChange={(e) => setCustomerCpfCnpj(e.target.value)}
                  placeholder="Somente números"
                  className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
                  E-mail (opcional)
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="cliente@exemplo.com"
                  className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
                  Valor (R$ · mín. 5,00)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="5"
                  required
                  value={pixValue}
                  onChange={(e) => setPixValue(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  required
                  value={pixDescription}
                  onChange={(e) => setPixDescription(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
                  Referência do Pedido (opcional)
                </label>
                <input
                  type="text"
                  value={pixRef}
                  onChange={(e) => setPixRef(e.target.value)}
                  placeholder="Ex.: PEDIDO-1024"
                  className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={generatingPix || !config?.configured || !config?.pixEnabled}
              className="w-full rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition min-h-[46px]"
            >
              {generatingPix ? 'Gerando QR Code PIX no Asaas...' : 'Gerar Cobrança PIX Agora'}
            </button>
          </form>

          {/* Active PIX QR Code & Copia e Cola Panel */}
          {activeQrOrder && (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-4 shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wide text-emerald-800">
                    PIX Gerado · {activeQrOrder.externalReference}
                  </div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">
                    {activeQrOrder.customerName} — {formatCurrencyBRL(activeQrOrder.value)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveQrOrder(null)}
                  aria-label="Fechar QR Code PIX"
                  className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {activeQrOrder.pixEncodedImage && (
                  <img
                    src={`data:image/png;base64,${activeQrOrder.pixEncodedImage}`}
                    alt="QR Code PIX"
                    className="w-44 h-44 rounded-2xl border border-slate-200 bg-white p-2 shrink-0"
                  />
                )}

                <div className="flex-1 w-full space-y-3 min-w-0">
                  <div>
                    <div className="text-xs font-bold text-slate-600 mb-1">
                      Código PIX Copia e Cola
                    </div>
                    <textarea
                      readOnly
                      rows={3}
                      value={activeQrOrder.pixPayload || 'Payload PIX indisponível'}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono text-slate-800"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {activeQrOrder.pixPayload && (
                      <button
                        type="button"
                        onClick={() => copyText(activeQrOrder.pixPayload || '', 'payload')}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                      >
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{copiedPayload ? 'Código copiado!' : 'Copiar PIX Copia e Cola'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRefreshPayment(activeQrOrder.asaasPaymentId)}
                      disabled={refreshingId === activeQrOrder.asaasPaymentId}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100"
                    >
                      <RefreshCw
                        className={`w-3.5 h-3.5 ${
                          refreshingId === activeQrOrder.asaasPaymentId ? 'animate-spin' : ''
                        }`}
                        aria-hidden="true"
                      />
                      <span>Verificar Pagamento</span>
                    </button>

                    {activeQrOrder.invoiceUrl && (
                      <a
                        href={activeQrOrder.invoiceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50"
                      >
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Fatura Asaas</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Queries, Orders, Live Asaas Payments & Transactions History */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'orders', label: `Pedidos PIX (${orders.length})` },
                { id: 'live', label: `Cobranças no Asaas (${livePayments.length})` },
                { id: 'transactions', label: `Transações e Webhooks (${transactions.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-2xl px-4 py-2 text-xs sm:text-sm font-bold border transition min-h-[40px] ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 border-indigo-600 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
              <input
                type="text"
                value={refFilter}
                onChange={(e) => setRefFilter(e.target.value)}
                placeholder="Referência externa..."
                className="rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs text-slate-900"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filtrar status Asaas"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700"
            >
              <option value="">Todos os status</option>
              <option value="PENDING">Aguardando (PENDING)</option>
              <option value="RECEIVED">Recebido (RECEIVED)</option>
              <option value="CONFIRMED">Confirmado (CONFIRMED)</option>
              <option value="OVERDUE">Vencido (OVERDUE)</option>
              <option value="REFUNDED">Estornado (REFUNDED)</option>
            </select>
          </div>
        </div>

        {syncError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
            Aviso da consulta Asaas: {syncError}
          </div>
        )}

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="overflow-x-auto">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                Nenhum pedido PIX registrado até o momento. Gere uma cobrança acima ou aguarde um pagamento no aplicativo.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                    <th className="py-3 pr-4">Pedido / ID Asaas</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Valor</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 pl-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => {
                    const badge = getStatusBadge(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/70">
                        <td className="py-3 pr-4">
                          <div className="font-bold text-slate-900">{order.externalReference}</div>
                          <div className="text-xs text-slate-500 font-mono">
                            {order.asaasPaymentId}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-800">{order.customerName}</div>
                          <div className="text-xs text-slate-500">{order.customerEmail || order.customerCpfCnpj}</div>
                        </td>
                        <td className="py-3 px-4 font-bold tabular-nums">
                          {formatCurrencyBRL(order.value)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 pl-4 text-right space-x-2 whitespace-nowrap">
                          {order.pixPayload && (
                            <button
                              type="button"
                              onClick={() => setActiveQrOrder(order)}
                              className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100"
                            >
                              QR Code PIX
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRefreshPayment(order.asaasPaymentId)}
                            disabled={refreshingId === order.asaasPaymentId}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                          >
                            {refreshingId === order.asaasPaymentId ? 'Consultando...' : 'Consultar'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Live Asaas Payments */}
        {activeTab === 'live' && (
          <div className="overflow-x-auto">
            {livePayments.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                Nenhuma cobrança encontrada na consulta ao vivo da conta Asaas Produção.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                    <th className="py-3 pr-4">ID Asaas</th>
                    <th className="py-3 px-4">Forma</th>
                    <th className="py-3 px-4">Vencimento</th>
                    <th className="py-3 px-4">Valor</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 pl-4 text-right">Fatura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {livePayments.map((p) => {
                    const badge = getStatusBadge(p.status);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="py-3 pr-4">
                          <div className="font-mono text-xs font-bold text-slate-900">{p.id}</div>
                          {p.externalReference && (
                            <div className="text-xs text-slate-500">{p.externalReference}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs font-bold text-slate-700">
                          {p.billingType}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-600 tabular-nums">
                          {p.dueDate}
                        </td>
                        <td className="py-3 px-4 font-bold tabular-nums">
                          {formatCurrencyBRL(Number(p.value || 0))}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 pl-4 text-right">
                          {p.invoiceUrl && (
                            <a
                              href={p.invoiceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-50"
                            >
                              <span>Abrir</span>
                              <ExternalLink className="w-3 h-3" aria-hidden="true" />
                            </a>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: Transactions & Webhooks Log */}
        {activeTab === 'transactions' && (
          <div className="space-y-2.5">
            {transactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                Nenhuma transação ou evento de webhook recebido até o momento.
              </div>
            ) : (
              transactions.map((tx) => {
                const badge = getStatusBadge(tx.status);
                return (
                  <div
                    key={tx.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold text-indigo-800 font-mono">
                          {tx.event}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${badge.cls}`}>
                          {badge.label}
                        </span>
                        <span className="text-xs font-bold text-slate-900 tabular-nums">
                          {formatCurrencyBRL(tx.value)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">{tx.summary}</div>
                    </div>
                    <div className="text-[11px] text-slate-500 shrink-0 tabular-nums">
                      {new Date(tx.receivedAt).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </section>
    </div>
  );
};
