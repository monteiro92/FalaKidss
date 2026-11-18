import {
  AdminAccountType,
  AdminAppConfig,
  AdminAuditLog,
  AdminDashboardMetrics,
  AdminPremiumDuration,
  AdminRoute,
  AdminSession,
  AdminUserHistoryResponse,
  AsaasConfigPublic,
  AsaasLivePayment,
  AsaasOrderRecord,
  AsaasTransactionRecord,
  ManagedUserAccount,
  VocalTractAccessResponse,
} from '../types/admin';
import { CatalogItemDTO, ContentCatalogResponse, ContentTier } from '../types/premium';

const ADMIN_SESSION_KEY = 'fala_melhor_admin_session_v1';
const ADMIN_USERS_KEY = 'fala_melhor_admin_users_v1';
const ADMIN_CONFIG_KEY = 'fala_melhor_admin_config_v1';
const ADMIN_LOGS_KEY = 'fala_melhor_admin_logs_v1';
const SUBSCRIBER_TOKEN_KEY = 'fala_melhor_subscriber_token_v1';

export const DEFAULT_ADMIN_EMAIL =
  (import.meta.env.VITE_ADMIN_EMAIL as string | undefined) || 'admin@falamelhor.app';

export const APP_MODULES_CATALOG: { id: string; label: string; description: string }[] = [
  { id: 'first-words', label: 'Primeiras Palavras', description: 'Vocabulário ilustrado por categorias' },
  { id: 'alphabet', label: 'Vogais e Alfabeto', description: 'Letras, sons e exemplos interativos' },
  { id: 'pronunciation', label: 'Treinamento de Pronúncia', description: 'Vogais, sílabas, frases e textos' },
  { id: 'oral-motor', label: 'Anatomia 3D do Trato Vocal', description: 'Modelo 3D articulado e lotes de frases' },
  { id: 'animal-sounds', label: 'Sons dos Animais', description: 'Onomatopeias e áudio sintetizado' },
  { id: 'daily-phrases', label: 'Frases do Dia a Dia', description: 'Expressões funcionais cotidianas' },
  { id: 'games', label: 'Jogos Educativos', description: 'Memória, Complete a Palavra e outros' },
  { id: 'stories', label: 'Histórias Infantis', description: 'Leitura guiada com áudio e perguntas' },
];

export async function hashSecret(value: string): Promise<string> {
  const input = `fmi_salt_2026:${value}`;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoded = new TextEncoder().encode(input);
    const digest = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `fb_${(h >>> 0).toString(16)}`;
}

async function parseJsonSafely<T>(res: Response): Promise<T> {
  const text = await res.text();
  const trimmed = text.trim();
  if (!trimmed) {
    return {} as T;
  }
  if (trimmed.startsWith('<')) {
    throw new Error('Servidor temporariamente indisponível. Aguarde um instante e tente novamente.');
  }
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new Error('Resposta inválida do servidor. Tente novamente em instantes.');
  }
}

export async function fetchJsonWithRetry<T>(
  url: string,
  init?: RequestInit,
  retries = 3
): Promise<{ res: Response; data: T }> {
  let lastErr: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        cache: 'no-store',
        ...init,
        headers: {
          Accept: 'application/json',
          ...(init?.headers || {}),
        },
      });

      // Retry transient proxy/startup responses (502/503/504 or HTML page while server boots)
      const contentType = (res.headers.get('content-type') || '').toLowerCase();
      if (
        (res.status === 502 || res.status === 503 || res.status === 504 || contentType.includes('text/html')) &&
        attempt < retries
      ) {
        await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
        continue;
      }

      const data = await parseJsonSafely<T>(res);
      return { res, data };
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error('Erro de comunicação com o servidor.');
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 700 * (attempt + 1)));
        continue;
      }
    }
  }
  throw lastErr || new Error('Não foi possível conectar ao servidor.');
}

export function getStoredSubscriberToken(): string {
  try {
    return localStorage.getItem(SUBSCRIBER_TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function storeSubscriberToken(token?: string): void {
  if (!token) return;
  try {
    localStorage.setItem(SUBSCRIBER_TOKEN_KEY, token);
  } catch {
    // Ignore storage warnings
  }
}

export function getSubscriberHeaders(): Record<string, string> {
  const token = getStoredSubscriberToken();
  return token ? { 'x-subscriber-id': token } : {};
}

export async function authenticateAdmin(
  email: string,
  password: string
): Promise<{ ok: true; session: AdminSession } | { ok: false; error: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) {
    return { ok: false, error: 'Informe o e-mail e a senha de administrador.' };
  }

  try {
    const { res, data } = await fetchJsonWithRetry<Partial<AdminSession> & { error?: string }>(
      '/api/admin/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      },
      1
    );
    if (!res.ok || !data.token || !data.email) {
      return { ok: false, error: data.error || 'Credenciais inválidas.' };
    }

    const session: AdminSession = {
      token: data.token,
      email: data.email,
      name: data.name || 'Administrador Principal',
      issuedAt: data.issuedAt || Date.now(),
      expiresAt: data.expiresAt || Date.now() + 1000 * 60 * 60 * 8,
    };

    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
    } catch {
      // Ignore sessionStorage warnings
    }

    appendAdminAuditLog('Login administrativo', `Sessão iniciada por ${session.email}`, session.email);
    return { ok: true, session };
  } catch (err) {
    return {
      ok: false,
      error:
        err instanceof Error
          ? err.message
          : 'Não foi possível conectar ao servidor de autenticação.',
    };
  }
}

export function getActiveAdminSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AdminSession;
    // Require server-signed HMAC token (contains '.')
    if (
      !session?.token ||
      !session.token.includes('.') ||
      !session?.expiresAt ||
      Date.now() > session.expiresAt
    ) {
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function logoutAdminSession(): void {
  const current = getActiveAdminSession();
  if (current) {
    appendAdminAuditLog('Logout administrativo', `Sessão encerrada por ${current.email}`, current.email);
  }
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  } catch {
    // Ignore
  }
}

export async function updateAdminCredentials(params: {
  currentPassword: string;
  newEmail: string;
  newName: string;
  newPassword?: string;
}): Promise<{ ok: true; session: AdminSession } | { ok: false; error: string }> {
  const current = getActiveAdminSession();
  if (!current) {
    return { ok: false, error: 'Sessão administrativa expirada. Faça login novamente.' };
  }

  try {
    const { res, data } = await fetchJsonWithRetry<Partial<AdminSession> & { error?: string }>(
      '/api/admin/auth/update',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${current.token}`,
        },
        body: JSON.stringify(params),
      },
      1
    );
    if (!res.ok || !data.token || !data.email) {
      return { ok: false, error: data.error || 'Falha ao atualizar credenciais.' };
    }

    const updatedSession: AdminSession = {
      token: data.token,
      email: data.email,
      name: data.name || params.newName,
      issuedAt: data.issuedAt || Date.now(),
      expiresAt: data.expiresAt || Date.now() + 1000 * 60 * 60 * 8,
    };

    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(updatedSession));
    } catch {
      // Ignore
    }

    appendAdminAuditLog(
      'Credenciais atualizadas',
      `Dados administrativos alterados para ${updatedSession.email}`,
      updatedSession.email
    );
    return { ok: true, session: updatedSession };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Erro de comunicação com o servidor.',
    };
  }
}

// --- Protected Asaas API Client ---
async function adminApiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const session = getActiveAdminSession();
  if (!session) {
    throw new Error('Sessão administrativa expirada. Faça login novamente.');
  }
  const { res, data } = await fetchJsonWithRetry<T & { error?: string }>(
    path,
    {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
        Authorization: `Bearer ${session.token}`,
      },
    },
    1
  );
  if (res.status === 401) {
    logoutAdminSession();
    throw new Error(data.error || 'Sessão inválida ou expirada.');
  }
  if (!res.ok) {
    throw new Error(data.error || `Erro HTTP ${res.status}`);
  }
  return data;
}

export function fetchAsaasConfig(): Promise<AsaasConfigPublic> {
  return adminApiFetch<AsaasConfigPublic>('/api/admin/asaas/config');
}

export function saveAsaasConfig(payload: {
  apiKey?: string;
  clearApiKey?: boolean;
  webhookToken?: string;
  regenerateWebhookToken?: boolean;
  pixEnabled?: boolean;
  defaultPlanValue?: number;
  defaultPlanDescription?: string;
}): Promise<AsaasConfigPublic> {
  return adminApiFetch<AsaasConfigPublic>('/api/admin/asaas/config', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function testAsaasConnection(): Promise<{
  connected: boolean;
  environment: 'PRODUCTION';
  accountName: string;
  accountEmail: string | null;
}> {
  return adminApiFetch('/api/admin/asaas/test-connection', {
    method: 'POST',
  });
}

export function registerAsaasWebhook(payload?: {
  webhookUrl?: string;
  email?: string;
}): Promise<{ registered: boolean; webhook: { id: string; url: string; enabled: boolean } }> {
  return adminApiFetch('/api/admin/asaas/webhooks/register', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

export function fetchAsaasPaymentsAndTransactions(filters?: {
  status?: string;
  externalReference?: string;
}): Promise<{
  orders: AsaasOrderRecord[];
  transactions: AsaasTransactionRecord[];
  livePayments: AsaasLivePayment[];
  syncError: string | null;
}> {
  const qs = new URLSearchParams();
  if (filters?.status) qs.set('status', filters.status);
  if (filters?.externalReference) qs.set('externalReference', filters.externalReference);
  const queryStr = qs.toString();
  return adminApiFetch(`/api/admin/asaas/payments${queryStr ? `?${queryStr}` : ''}`);
}

export function createAdminPixCharge(payload: {
  customerName: string;
  customerCpfCnpj: string;
  customerEmail?: string;
  value: number;
  description: string;
  externalReference?: string;
  dueDate?: string;
}): Promise<{ order: AsaasOrderRecord }> {
  return adminApiFetch('/api/admin/asaas/payments/pix', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function refreshAdminAsaasPayment(paymentId: string): Promise<{
  order: AsaasOrderRecord | null;
  livePayment: AsaasLivePayment;
}> {
  return adminApiFetch(`/api/admin/asaas/payments/${encodeURIComponent(paymentId)}/refresh`);
}

// --- Protected Admin User & Premium Management (Server-Backed) ---
export interface AdminUsersSyncPayload {
  users: ManagedUserAccount[];
  metrics: AdminDashboardMetrics;
  auditLogs: AdminAuditLog[];
}

export interface AdminUserMutationResponse {
  user: ManagedUserAccount;
  metrics: AdminDashboardMetrics;
  auditLogs: AdminAuditLog[];
}

export function fetchAdminDashboard(): Promise<{
  metrics: AdminDashboardMetrics;
  auditLogs: AdminAuditLog[];
}> {
  return adminApiFetch('/api/admin/dashboard');
}

export function fetchAdminAuditLogs(): Promise<{ auditLogs: AdminAuditLog[] }> {
  return adminApiFetch('/api/admin/audit-logs');
}

export async function fetchAdminUsers(): Promise<AdminUsersSyncPayload> {
  const data = await adminApiFetch<AdminUsersSyncPayload>('/api/admin/users');
  const users = Array.isArray(data.users) ? data.users : [];
  saveManagedUsers(users);
  return {
    users,
    metrics: data.metrics,
    auditLogs: Array.isArray(data.auditLogs) ? data.auditLogs : [],
  };
}

export async function createAdminUser(payload: {
  guardianName: string;
  email: string;
  accountType: AdminAccountType;
  childName: string;
  childAge: number;
  status: 'active' | 'blocked';
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
}): Promise<AdminUserMutationResponse> {
  return adminApiFetch<AdminUserMutationResponse>('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateAdminUser(
  id: string,
  payload: Partial<{
    guardianName: string;
    email: string;
    accountType: AdminAccountType;
    childName: string;
    childAge: number;
    status: 'active' | 'blocked';
    plan: 'free' | 'premium';
    passwordMode: 'keep' | 'provisional' | 'invite';
    password: string;
    notes: string;
  }>
): Promise<AdminUserMutationResponse> {
  return adminApiFetch<AdminUserMutationResponse>(
    `/api/admin/users/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }
  );
}

export async function grantAdminUserPremium(
  id: string,
  payload: {
    duration: AdminPremiumDuration;
    startDate?: string;
    expiresAt?: string | null;
    reason?: string;
  }
): Promise<AdminUserMutationResponse> {
  return adminApiFetch<AdminUserMutationResponse>(
    `/api/admin/users/${encodeURIComponent(id)}/grant-premium`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  );
}

export async function revokeAdminUserPremium(
  id: string,
  reason?: string
): Promise<AdminUserMutationResponse> {
  return adminApiFetch<AdminUserMutationResponse>(
    `/api/admin/users/${encodeURIComponent(id)}/revoke-premium`,
    {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }
  );
}

export async function blockAdminUser(id: string): Promise<AdminUserMutationResponse> {
  return adminApiFetch<AdminUserMutationResponse>(
    `/api/admin/users/${encodeURIComponent(id)}/block`,
    { method: 'POST' }
  );
}

export async function unblockAdminUser(id: string): Promise<AdminUserMutationResponse> {
  return adminApiFetch<AdminUserMutationResponse>(
    `/api/admin/users/${encodeURIComponent(id)}/unblock`,
    { method: 'POST' }
  );
}

export async function fetchAdminUserHistory(id: string): Promise<AdminUserHistoryResponse> {
  return adminApiFetch<AdminUserHistoryResponse>(
    `/api/admin/users/${encodeURIComponent(id)}/history`
  );
}

export async function deleteAdminUser(id: string): Promise<{
  deleted: boolean;
  id: string;
  metrics: AdminDashboardMetrics;
  auditLogs: AdminAuditLog[];
}> {
  return adminApiFetch(`/api/admin/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export interface AdminContentCatalogResponse {
  monthlyValue: number;
  counts: ContentCatalogResponse['counts'];
  items: CatalogItemDTO[];
  auditLogs: AdminAuditLog[];
}

export function fetchAdminContentCatalog(): Promise<AdminContentCatalogResponse> {
  return adminApiFetch<AdminContentCatalogResponse>('/api/admin/content-catalog');
}

export function updateAdminContentTier(
  id: string,
  tier: ContentTier
): Promise<AdminContentCatalogResponse> {
  return adminApiFetch<AdminContentCatalogResponse>(
    `/api/admin/content-catalog/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ tier }),
    }
  );
}

export async function syncCurrentUserWithServer(payload: {
  childAccountId?: string;
  childName?: string;
  childAge?: number;
  starsCount?: number;
  activitiesCount?: number;
}): Promise<{
  subscriberToken: string;
  blocked: boolean;
  status: 'active' | 'blocked';
}> {
  const { res, data } = await fetchJsonWithRetry<{
    error?: string;
    subscriberToken: string;
    blocked: boolean;
    status: 'active' | 'blocked';
  }>(
    '/api/users/sync',
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...getSubscriberHeaders(),
      },
      body: JSON.stringify(payload),
    },
    2
  );
  if (data.subscriberToken) {
    storeSubscriberToken(data.subscriberToken);
  }
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao sincronizar conta com o servidor.');
  }
  return data;
}

export async function fetchVocalTractAccess(sync = false): Promise<VocalTractAccessResponse> {
  const { res, data } = await fetchJsonWithRetry<VocalTractAccessResponse>(
    `/api/vocal-tract/access${sync ? '?sync=1' : ''}`,
    {
      credentials: 'include',
      headers: getSubscriberHeaders(),
    },
    3
  );
  if (data.subscriberToken) {
    storeSubscriberToken(data.subscriberToken);
  }
  if (!res.ok) {
    throw new Error(data.message || 'Erro ao carregar dados da Anatomia 3D.');
  }
  return {
    ...data,
    allowed: !data.blocked,
    isFreeFeature: true,
  };
}

export function loadManagedUsers(): ManagedUserAccount[] {
  try {
    const raw = localStorage.getItem(ADMIN_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ManagedUserAccount[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore storage read errors
  }
  return [];
}

export function saveManagedUsers(users: ManagedUserAccount[]): void {
  try {
    localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
  } catch {
    // Ignore storage quota warnings
  }
}

export function loadAdminAppConfig(): AdminAppConfig {
  const defaultEnabled: Record<string, boolean> = {};
  APP_MODULES_CATALOG.forEach((m) => {
    defaultEnabled[m.id] = true;
  });

  const defaults: AdminAppConfig = {
    maintenanceMode: false,
    maintenanceMessage:
      'Estamos realizando melhorias no aplicativo. Voltamos em instantes!',
    announcementEnabled: false,
    announcementText: 'Novidade: explore a Anatomia 3D do Trato Vocal nas atividades!',
    registrationOpen: true,
    defaultThemeId: 'sol-dourado',
    enabledModules: defaultEnabled,
  };

  try {
    const raw = localStorage.getItem(ADMIN_CONFIG_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<AdminAppConfig>;
    return {
      ...defaults,
      ...parsed,
      enabledModules: {
        ...defaultEnabled,
        ...(parsed.enabledModules || {}),
      },
    };
  } catch {
    return defaults;
  }
}

export function saveAdminAppConfig(config: AdminAppConfig): void {
  try {
    localStorage.setItem(ADMIN_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // Ignore
  }
}

export function loadAdminAuditLogs(): AdminAuditLog[] {
  try {
    const raw = localStorage.getItem(ADMIN_LOGS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AdminAuditLog[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendAdminAuditLog(action: string, detail: string, actorEmail: string): AdminAuditLog[] {
  const existing = loadAdminAuditLogs();
  const entry: AdminAuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    action,
    detail,
    actorEmail,
    timestamp: new Date().toISOString(),
  };
  const updated = [entry, ...existing].slice(0, 50);
  try {
    localStorage.setItem(ADMIN_LOGS_KEY, JSON.stringify(updated));
  } catch {
    // Ignore
  }
  return updated;
}

export function parseAdminRouteFromPathname(pathname: string): AdminRoute {
  const clean = pathname.replace(/\/+$/, '').toLowerCase();
  if (clean === '/admin/usuarios' || clean === '/admin/users') return 'users';
  if (clean === '/admin/asaas') return 'asaas';
  if (clean === '/admin/aplicativo' || clean === '/admin/settings') return 'app-settings';
  if (clean === '/admin/seguranca' || clean === '/admin/security') return 'security';
  return 'dashboard';
}

export function adminRouteToPath(route: AdminRoute): string {
  switch (route) {
    case 'users':
      return '/admin/usuarios';
    case 'asaas':
      return '/admin/asaas';
    case 'app-settings':
      return '/admin/aplicativo';
    case 'security':
      return '/admin/seguranca';
    case 'dashboard':
    default:
      return '/admin';
  }
}
