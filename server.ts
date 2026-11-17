import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';

const PORT = Number(process.env.PORT || 3000);
const ASAAS_PROD_BASE_URL = 'https://api.asaas.com/v3';
const DATA_DIR = path.resolve(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'asaas-gateway.json');

interface ServerAdminCreds {
  email: string;
  name: string;
  passwordHash: string;
  updatedAt: string;
}

interface ServerAsaasConfig {
  apiKey: string;
  webhookToken: string;
  pixEnabled: boolean;
  defaultPlanValue: number;
  defaultPlanDescription: string;
  updatedAt: string | null;
}

interface ServerOrderRecord {
  id: string;
  asaasPaymentId: string;
  externalReference: string;
  customerId: string;
  customerName: string;
  customerCpfCnpj: string;
  customerEmail: string;
  value: number;
  description: string;
  billingType: 'PIX';
  status: string;
  dueDate: string;
  invoiceUrl: string | null;
  pixPayload: string | null;
  pixEncodedImage: string | null;
  pixExpirationDate: string | null;
  createdAt: string;
  updatedAt: string;
  paidAt: string | null;
  subscriberId?: string | null;
  childAccountId?: string | null;
  childName?: string | null;
}

interface ServerTransactionRecord {
  id: string;
  event: string;
  paymentId: string;
  externalReference: string | null;
  value: number;
  status: string;
  receivedAt: string;
  source: 'webhook' | 'api_sync' | 'pix_created';
  summary: string;
}

export type ManagedUserStatus = 'active' | 'blocked';

interface ServerManagedUserRecord {
  id: string;
  subscriberId: string | null;
  childAccountId: string | null;
  guardianName: string;
  email: string;
  childName: string;
  childAge: number;
  status: ManagedUserStatus;
  starsCount: number;
  activitiesCount: number;
  createdAt: string;
  lastAccessAt: string;
  updatedAt: string;
  notes?: string;
  passwordHash?: string;
}

interface GatewayStore {
  sessionSecret: string;
  adminCreds: ServerAdminCreds;
  asaasConfig: ServerAsaasConfig;
  orders: ServerOrderRecord[];
  transactions: ServerTransactionRecord[];
  processedWebhookIds: string[];
  managedUsers: ServerManagedUserRecord[];
}

function hashPassword(value: string): string {
  return crypto.createHash('sha256').update(`fmi_salt_2026:${value}`).digest('hex');
}

function createInitialStore(): GatewayStore {
  const defaultEmail = (process.env.ADMIN_EMAIL || 'admin@falamelhor.app').trim().toLowerCase();
  const defaultPass = process.env.ADMIN_PASSWORD || 'Admin@2026';

  return {
    sessionSecret: crypto.randomBytes(32).toString('hex'),
    adminCreds: {
      email: defaultEmail,
      name: 'Administrador Principal',
      passwordHash: hashPassword(defaultPass),
      updatedAt: new Date().toISOString(),
    },
    asaasConfig: {
      apiKey: (process.env.ASAAS_API_KEY || '').trim(),
      webhookToken: (process.env.ASAAS_WEBHOOK_TOKEN || '').trim() || `whsec_${crypto.randomBytes(16).toString('hex')}`,
      pixEnabled: true,
      defaultPlanValue: 29.9,
      defaultPlanDescription: 'Cobrança PIX - FalaKids',
      updatedAt: process.env.ASAAS_API_KEY ? new Date().toISOString() : null,
    },
    orders: [],
    transactions: [],
    processedWebhookIds: [],
    managedUsers: [],
  };
}

function ensureStoreLoaded(): GatewayStore {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    const initial = createInitialStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), { mode: 0o600 });
    return initial;
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<GatewayStore>;
    const fallback = createInitialStore();
    const rawDefaultDesc = String(parsed.asaasConfig?.defaultPlanDescription || '').trim();
    const sanitizedDesc =
      !rawDefaultDesc || /assinatura\s+premium|fala\s+melhor\s+infantil/i.test(rawDefaultDesc)
        ? fallback.asaasConfig.defaultPlanDescription
        : rawDefaultDesc;

    const merged: GatewayStore = {
      sessionSecret: parsed.sessionSecret || fallback.sessionSecret,
      adminCreds: parsed.adminCreds?.email ? parsed.adminCreds : fallback.adminCreds,
      asaasConfig: {
        ...fallback.asaasConfig,
        ...(parsed.asaasConfig || {}),
        defaultPlanDescription: sanitizedDesc,
        apiKey: (parsed.asaasConfig?.apiKey || process.env.ASAAS_API_KEY || '').trim(),
        webhookToken:
          (parsed.asaasConfig?.webhookToken || process.env.ASAAS_WEBHOOK_TOKEN || '').trim() ||
          fallback.asaasConfig.webhookToken,
      },
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      processedWebhookIds: Array.isArray(parsed.processedWebhookIds)
        ? parsed.processedWebhookIds
        : [],
      managedUsers: Array.isArray(parsed.managedUsers) ? parsed.managedUsers : [],
    };
    return merged;
  } catch {
    const fresh = createInitialStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(fresh, null, 2), { mode: 0o600 });
    return fresh;
  }
}

function saveStore(store: GatewayStore): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), { mode: 0o600 });
}

function signAdminToken(payload: { email: string; name: string; issuedAt: number; expiresAt: number }, secret: string): string {
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

function verifyAdminToken(token: string, secret: string): { email: string; name: string; issuedAt: number; expiresAt: number } | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as {
      email: string;
      name: string;
      issuedAt: number;
      expiresAt: number;
    };
    if (!parsed?.email || !parsed?.expiresAt || Date.now() > parsed.expiresAt) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function maskSecretKey(secret: string): string | null {
  const trimmed = secret.trim();
  if (!trimmed) return null;
  if (trimmed.length <= 10) return '••••••••';
  return `${trimmed.slice(0, 10)}••••${trimmed.slice(-4)}`;
}

function buildPublicConfig(store: GatewayStore, req?: Request) {
  const originHint =
    process.env.APP_URL ||
    (req ? `${req.headers['x-forwarded-proto'] || req.protocol}://${req.get('host')}` : '');
  const cleanOrigin = originHint.replace(/\/+$/, '');
  return {
    configured: Boolean(store.asaasConfig.apiKey),
    keyPreview: maskSecretKey(store.asaasConfig.apiKey),
    environment: 'PRODUCTION' as const,
    baseUrl: ASAAS_PROD_BASE_URL,
    pixEnabled: store.asaasConfig.pixEnabled,
    defaultPlanValue: store.asaasConfig.defaultPlanValue,
    defaultPlanDescription: store.asaasConfig.defaultPlanDescription,
    webhookUrlHint: cleanOrigin ? `${cleanOrigin}/api/webhooks/asaas` : '/api/webhooks/asaas',
    hasWebhookToken: Boolean(store.asaasConfig.webhookToken),
    webhookTokenPreview: maskSecretKey(store.asaasConfig.webhookToken),
    updatedAt: store.asaasConfig.updatedAt,
  };
}

interface AsaasApiResult<T = unknown> {
  ok: boolean;
  status: number;
  data?: T;
  errorMessage?: string;
}

async function asaasRequest<T = unknown>(
  apiKey: string,
  endpointPath: string,
  init?: { method?: string; body?: unknown }
): Promise<AsaasApiResult<T>> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    return {
      ok: false,
      status: 400,
      errorMessage: 'API Key de produção do Asaas não configurada no servidor.',
    };
  }
  if (cleanKey.startsWith('$aact_hmlg_')) {
    return {
      ok: false,
      status: 400,
      errorMessage: 'Chave Sandbox detectada. Configure uma API Key de PRODUÇÃO do Asaas.',
    };
  }

  const url = `${ASAAS_PROD_BASE_URL}${endpointPath}`;
  const res = await fetch(url, {
    method: init?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'FalaMelhorInfantil/1.0',
      access_token: cleanKey,
    },
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
  });

  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = null;
  }

  if (!res.ok) {
    const errObj = parsed as { errors?: { description?: string; code?: string }[]; message?: string } | null;
    const msg =
      errObj?.errors?.[0]?.description ||
      errObj?.message ||
      `Erro na API Asaas (HTTP ${res.status})`;
    return { ok: false, status: res.status, errorMessage: msg };
  }

  return { ok: true, status: res.status, data: parsed as T };
}

function getTodayDateISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function sanitizeCpfCnpj(raw: string): string {
  return raw.replace(/\D/g, '');
}

async function createRealPixCharge(
  store: GatewayStore,
  params: {
    customerName: string;
    customerCpfCnpj: string;
    customerEmail: string;
    value: number;
    description: string;
    externalReference?: string;
    dueDate?: string;
    subscriberId?: string;
    childAccountId?: string;
    childName?: string;
  }
): Promise<{ ok: true; order: ServerOrderRecord } | { ok: false; status: number; error: string }> {
  const apiKey = store.asaasConfig.apiKey;
  if (!apiKey) {
    return {
      ok: false,
      status: 400,
      error: 'Asaas não configurado. Salve sua API Key de produção no painel administrativo.',
    };
  }
  if (!store.asaasConfig.pixEnabled) {
    return {
      ok: false,
      status: 400,
      error: 'Pagamentos via PIX estão desativados nas configurações do Asaas.',
    };
  }

  const cpfCnpj = sanitizeCpfCnpj(params.customerCpfCnpj);
  if (cpfCnpj.length !== 11 && cpfCnpj.length !== 14) {
    return {
      ok: false,
      status: 400,
      error: 'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido para gerar a cobrança PIX.',
    };
  }

  const numericValue = Number(params.value);
  if (!Number.isFinite(numericValue) || numericValue < 5) {
    return {
      ok: false,
      status: 400,
      error: 'O valor da cobrança PIX deve ser de no mínimo R$ 5,00.',
    };
  }

  // 1. Lookup or create real customer in Asaas Production
  const lookup = await asaasRequest<{ data?: { id: string; name: string }[] }>(
    apiKey,
    `/customers?cpfCnpj=${encodeURIComponent(cpfCnpj)}`
  );
  if (!lookup.ok) {
    return { ok: false, status: lookup.status, error: lookup.errorMessage || 'Falha ao consultar cliente no Asaas.' };
  }

  let customerId = lookup.data?.data?.[0]?.id;
  if (!customerId) {
    const createdCustomer = await asaasRequest<{ id: string }>(apiKey, '/customers', {
      method: 'POST',
      body: {
        name: params.customerName.trim(),
        cpfCnpj,
        email: params.customerEmail.trim() || undefined,
      },
    });
    if (!createdCustomer.ok || !createdCustomer.data?.id) {
      return {
        ok: false,
        status: createdCustomer.status,
        error: createdCustomer.errorMessage || 'Falha ao cadastrar cliente no Asaas.',
      };
    }
    customerId = createdCustomer.data.id;
  }

  // 2. Create real PIX payment
  const externalRef = params.externalReference?.trim() || `FMI-${Date.now()}`;
  const dueDate = params.dueDate?.trim() || getTodayDateISO();
  const description = params.description.trim() || store.asaasConfig.defaultPlanDescription;

  const paymentRes = await asaasRequest<{
    id: string;
    status: string;
    value: number;
    dueDate: string;
    invoiceUrl?: string;
    externalReference?: string;
  }>(apiKey, '/payments', {
    method: 'POST',
    body: {
      customer: customerId,
      billingType: 'PIX',
      value: Number(numericValue.toFixed(2)),
      dueDate,
      description,
      externalReference: externalRef,
    },
  });

  if (!paymentRes.ok || !paymentRes.data?.id) {
    return {
      ok: false,
      status: paymentRes.status,
      error: paymentRes.errorMessage || 'Falha ao criar cobrança PIX no Asaas.',
    };
  }

  const payment = paymentRes.data;

  // 3. Fetch real PIX QR Code & Copia e Cola payload
  const qrRes = await asaasRequest<{
    encodedImage?: string;
    payload?: string;
    expirationDate?: string;
  }>(apiKey, `/payments/${encodeURIComponent(payment.id)}/pixQrCode`);

  const nowIso = new Date().toISOString();
  const order: ServerOrderRecord = {
    id: `ord_${Date.now()}`,
    asaasPaymentId: payment.id,
    externalReference: payment.externalReference || externalRef,
    customerId,
    customerName: params.customerName.trim(),
    customerCpfCnpj: cpfCnpj,
    customerEmail: params.customerEmail.trim(),
    value: Number(payment.value ?? numericValue),
    description,
    billingType: 'PIX',
    status: payment.status || 'PENDING',
    dueDate: payment.dueDate || dueDate,
    invoiceUrl: payment.invoiceUrl || null,
    pixEncodedImage: qrRes.ok ? qrRes.data?.encodedImage || null : null,
    pixPayload: qrRes.ok ? qrRes.data?.payload || null : null,
    pixExpirationDate: qrRes.ok ? qrRes.data?.expirationDate || null : null,
    createdAt: nowIso,
    updatedAt: nowIso,
    paidAt: null,
    subscriberId: params.subscriberId || null,
    childAccountId: params.childAccountId || null,
    childName: params.childName || null,
  };

  store.orders = [order, ...store.orders].slice(0, 200);
  store.transactions = [
    {
      id: `tx_${Date.now()}`,
      event: 'PAYMENT_CREATED',
      paymentId: payment.id,
      externalReference: order.externalReference,
      value: order.value,
      status: order.status,
      receivedAt: nowIso,
      source: 'pix_created' as const,
      summary: `Cobrança PIX criada para ${order.customerName} (${order.externalReference})`,
    },
    ...store.transactions,
  ].slice(0, 300);

  if (params.subscriberId) {
    const userIdx = store.managedUsers.findIndex(
      (u) =>
        u.subscriberId === params.subscriberId ||
        (params.childAccountId && u.childAccountId === params.childAccountId)
    );
    if (userIdx >= 0) {
      const existingUser = store.managedUsers[userIdx];
      store.managedUsers[userIdx] = {
        ...existingUser,
        guardianName:
          params.customerName.trim() || existingUser.guardianName,
        email:
          params.customerEmail.trim().toLowerCase() || existingUser.email,
        childName: params.childName?.trim() || existingUser.childName,
        childAccountId: params.childAccountId || existingUser.childAccountId,
        updatedAt: nowIso,
      };
    }
  }

  saveStore(store);

  return { ok: true, order };
}

function isPaidStatus(status: string): boolean {
  return status === 'RECEIVED' || status === 'CONFIRMED' || status === 'RECEIVED_IN_CASH';
}

function parseCookies(req: Request): Record<string, string> {
  const raw = req.headers.cookie || '';
  const result: Record<string, string> = {};
  raw.split(';').forEach((part) => {
    const eq = part.indexOf('=');
    if (eq > 0) {
      const k = part.slice(0, eq).trim();
      const v = part.slice(eq + 1).trim();
      if (k) result[k] = decodeURIComponent(v);
    }
  });
  return result;
}

function signSubscriberToken(subId: string, secret: string): string {
  const sig = crypto.createHmac('sha256', secret).update(`sub:${subId}`).digest('base64url');
  return `${subId}.${sig}`;
}

function verifySubscriberToken(token: string, secret: string): string | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [subId, sig] = parts;
  if (!subId || !subId.startsWith('sub_')) return null;
  const expected = crypto.createHmac('sha256', secret).update(`sub:${subId}`).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  return subId;
}

function resolveOrCreateSubscriber(
  req: Request,
  res: Response,
  store: GatewayStore
): { subscriberId: string; subscriberToken: string } {
  const cookies = parseCookies(req);
  const headerToken = String(req.headers['x-subscriber-id'] || '').trim();
  const cookieToken = cookies.fmi_sub_id || '';

  const verifiedId =
    verifySubscriberToken(headerToken, store.sessionSecret) ||
    verifySubscriberToken(cookieToken, store.sessionSecret);

  if (verifiedId) {
    const signed = signSubscriberToken(verifiedId, store.sessionSecret);
    return { subscriberId: verifiedId, subscriberToken: signed };
  }

  const newSubId = `sub_${crypto.randomBytes(12).toString('hex')}`;
  const signed = signSubscriberToken(newSubId, store.sessionSecret);
  res.cookie('fmi_sub_id', signed, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 365 * 24 * 60 * 60 * 1000,
    path: '/',
  });
  return { subscriberId: newSubId, subscriberToken: signed };
}

function isUserBlockedOnServer(
  store: GatewayStore,
  subscriberId: string,
  childAccountId?: string
): boolean {
  return store.managedUsers.some(
    (u) =>
      u.status === 'blocked' &&
      (u.subscriberId === subscriberId ||
        (childAccountId && (u.childAccountId === childAccountId || u.id === childAccountId)))
  );
}

function upsertManagedUserOnSync(
  store: GatewayStore,
  params: {
    subscriberId: string;
    childAccountId?: string;
    childName?: string;
    childAge?: number;
    starsCount?: number;
    activitiesCount?: number;
    guardianName?: string;
    email?: string;
  }
): ServerManagedUserRecord {
  const nowIso = new Date().toISOString();
  const cleanChildId = params.childAccountId?.trim() || null;
  const cleanChildName = params.childName?.trim() || 'Pequeno Explorador';
  const cleanChildAge = Math.min(12, Math.max(2, Number(params.childAge) || 5));
  const cleanStars = Math.max(0, Number(params.starsCount) || 0);
  const cleanActivities = Math.max(0, Number(params.activitiesCount) || 0);

  const idx = store.managedUsers.findIndex(
    (u) =>
      u.subscriberId === params.subscriberId ||
      (cleanChildId && u.childAccountId === cleanChildId)
  );

  if (idx >= 0) {
    const current = store.managedUsers[idx];
    const updated: ServerManagedUserRecord = {
      ...current,
      subscriberId: current.subscriberId || params.subscriberId,
      childAccountId: cleanChildId || current.childAccountId,
      childName: cleanChildName || current.childName,
      childAge: cleanChildAge,
      starsCount: cleanStars,
      activitiesCount: cleanActivities,
      guardianName:
        params.guardianName?.trim() || current.guardianName,
      email:
        params.email?.trim().toLowerCase() || current.email,
      lastAccessAt: nowIso,
      updatedAt: nowIso,
    };
    store.managedUsers[idx] = updated;
    return updated;
  }

  const linkedOrder = store.orders.find((o) => o.subscriberId === params.subscriberId);
  const created: ServerManagedUserRecord = {
    id: `usr_${crypto.randomBytes(6).toString('hex')}`,
    subscriberId: params.subscriberId,
    childAccountId: cleanChildId,
    guardianName:
      params.guardianName?.trim() ||
      linkedOrder?.customerName ||
      `Responsável (${cleanChildName})`,
    email:
      params.email?.trim().toLowerCase() ||
      linkedOrder?.customerEmail?.toLowerCase() ||
      `conta-${params.subscriberId.slice(-6)}@falamelhor.app`,
    childName: cleanChildName,
    childAge: cleanChildAge,
    status: 'active',
    starsCount: cleanStars,
    activitiesCount: cleanActivities,
    createdAt: nowIso,
    lastAccessAt: nowIso,
    updatedAt: nowIso,
    notes: 'Conta sincronizada automaticamente.',
  };
  store.managedUsers = [created, ...store.managedUsers].slice(0, 500);
  return created;
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const store = ensureStoreLoaded();
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) {
    res.status(401).json({ error: 'Sessão administrativa ausente ou expirada.' });
    return;
  }
  const verified = verifyAdminToken(token, store.sessionSecret);
  if (!verified) {
    res.status(401).json({ error: 'Token administrativo inválido ou expirado.' });
    return;
  }
  (req as Request & { adminUser?: { email: string; name: string } }).adminUser = {
    email: verified.email,
    name: verified.name,
  };
  next();
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '1mb' }));

  // --- Admin Auth Endpoints ---
  app.post('/api/admin/auth/login', (req, res) => {
    const store = ensureStoreLoaded();
    const { email, password } = (req.body || {}) as { email?: string; password?: string };
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPass = String(password || '');

    if (!cleanEmail || !cleanPass) {
      res.status(400).json({ error: 'Informe o e-mail e a senha de administrador.' });
      return;
    }

    const attemptHash = hashPassword(cleanPass);
    if (
      cleanEmail !== store.adminCreds.email.toLowerCase() ||
      attemptHash !== store.adminCreds.passwordHash
    ) {
      res.status(401).json({ error: 'Credenciais inválidas. Verifique o login e a senha.' });
      return;
    }

    const issuedAt = Date.now();
    const expiresAt = issuedAt + 1000 * 60 * 60 * 8;
    const token = signAdminToken(
      {
        email: store.adminCreds.email,
        name: store.adminCreds.name,
        issuedAt,
        expiresAt,
      },
      store.sessionSecret
    );

    res.json({
      token,
      email: store.adminCreds.email,
      name: store.adminCreds.name,
      issuedAt,
      expiresAt,
    });
  });

  app.get('/api/admin/auth/verify', requireAdmin, (req, res) => {
    const adminUser = (req as Request & { adminUser?: { email: string; name: string } }).adminUser;
    res.json({ valid: true, admin: adminUser });
  });

  app.post('/api/admin/auth/update', requireAdmin, (req, res) => {
    const store = ensureStoreLoaded();
    const { currentPassword, newEmail, newName, newPassword } = (req.body || {}) as {
      currentPassword?: string;
      newEmail?: string;
      newName?: string;
      newPassword?: string;
    };

    if (!currentPassword || hashPassword(currentPassword) !== store.adminCreds.passwordHash) {
      res.status(400).json({ error: 'A senha atual informada está incorreta.' });
      return;
    }

    const cleanEmail = String(newEmail || '').trim().toLowerCase();
    const cleanName = String(newName || '').trim() || store.adminCreds.name;
    if (!cleanEmail || !cleanEmail.includes('@')) {
      res.status(400).json({ error: 'Informe um e-mail administrativo válido.' });
      return;
    }

    let nextHash = store.adminCreds.passwordHash;
    if (newPassword && newPassword.trim().length > 0) {
      if (newPassword.trim().length < 6) {
        res.status(400).json({ error: 'A nova senha deve ter pelo menos 6 caracteres.' });
        return;
      }
      nextHash = hashPassword(newPassword.trim());
    }

    store.adminCreds = {
      email: cleanEmail,
      name: cleanName,
      passwordHash: nextHash,
      updatedAt: new Date().toISOString(),
    };
    saveStore(store);

    const issuedAt = Date.now();
    const expiresAt = issuedAt + 1000 * 60 * 60 * 8;
    const token = signAdminToken(
      { email: cleanEmail, name: cleanName, issuedAt, expiresAt },
      store.sessionSecret
    );

    res.json({ token, email: cleanEmail, name: cleanName, issuedAt, expiresAt });
  });

  // --- Protected Asaas Gateway Admin Endpoints ---
  app.get('/api/admin/asaas/config', requireAdmin, (req, res) => {
    const store = ensureStoreLoaded();
    res.json(buildPublicConfig(store, req));
  });

  app.post('/api/admin/asaas/config', requireAdmin, (req, res) => {
    const store = ensureStoreLoaded();
    const body = (req.body || {}) as {
      apiKey?: string;
      clearApiKey?: boolean;
      webhookToken?: string;
      regenerateWebhookToken?: boolean;
      pixEnabled?: boolean;
      defaultPlanValue?: number;
      defaultPlanDescription?: string;
    };

    if (body.clearApiKey) {
      store.asaasConfig.apiKey = '';
    } else if (typeof body.apiKey === 'string' && body.apiKey.trim().length > 0) {
      const trimmedKey = body.apiKey.trim();
      if (trimmedKey.startsWith('$aact_hmlg_')) {
        res.status(400).json({
          error:
            'Esta chave pertence ao ambiente Sandbox ($aact_hmlg_). Insira uma API Key de PRODUÇÃO do Asaas.',
        });
        return;
      }
      store.asaasConfig.apiKey = trimmedKey;
    }

    if (body.regenerateWebhookToken) {
      store.asaasConfig.webhookToken = `whsec_${crypto.randomBytes(16).toString('hex')}`;
    } else if (typeof body.webhookToken === 'string' && body.webhookToken.trim().length > 0) {
      store.asaasConfig.webhookToken = body.webhookToken.trim();
    }

    if (typeof body.pixEnabled === 'boolean') {
      store.asaasConfig.pixEnabled = body.pixEnabled;
    }

    if (body.defaultPlanValue !== undefined) {
      const val = Number(body.defaultPlanValue);
      if (!Number.isFinite(val) || val < 5) {
        res.status(400).json({ error: 'O valor padrão da cobrança deve ser no mínimo R$ 5,00.' });
        return;
      }
      store.asaasConfig.defaultPlanValue = Number(val.toFixed(2));
    }

    if (typeof body.defaultPlanDescription === 'string' && body.defaultPlanDescription.trim()) {
      store.asaasConfig.defaultPlanDescription = body.defaultPlanDescription.trim();
    }

    store.asaasConfig.updatedAt = new Date().toISOString();
    saveStore(store);

    res.json(buildPublicConfig(store, req));
  });

  app.post('/api/admin/asaas/test-connection', requireAdmin, async (_req, res) => {
    const store = ensureStoreLoaded();
    if (!store.asaasConfig.apiKey) {
      res.status(400).json({ error: 'Salve uma API Key de produção antes de testar a conexão.' });
      return;
    }

    const result = await asaasRequest<{ name?: string; email?: string; cpfCnpj?: string }>(
      store.asaasConfig.apiKey,
      '/myAccount/commercialInfo'
    );

    if (!result.ok) {
      res.status(result.status).json({ error: result.errorMessage });
      return;
    }

    res.json({
      connected: true,
      environment: 'PRODUCTION',
      accountName: result.data?.name || 'Conta Asaas Produção',
      accountEmail: result.data?.email || null,
    });
  });

  app.get('/api/admin/asaas/webhooks', requireAdmin, async (_req, res) => {
    const store = ensureStoreLoaded();
    if (!store.asaasConfig.apiKey) {
      res.json({ webhooks: [] });
      return;
    }
    const result = await asaasRequest<{ data?: unknown[] }>(store.asaasConfig.apiKey, '/webhooks');
    if (!result.ok) {
      res.status(result.status).json({ error: result.errorMessage });
      return;
    }
    res.json({ webhooks: result.data?.data || [] });
  });

  app.post('/api/admin/asaas/webhooks/register', requireAdmin, async (req, res) => {
    const store = ensureStoreLoaded();
    if (!store.asaasConfig.apiKey) {
      res.status(400).json({ error: 'Configure e salve a API Key de produção antes de registrar o webhook.' });
      return;
    }

    const { webhookUrl, email } = (req.body || {}) as { webhookUrl?: string; email?: string };
    const origin =
      process.env.APP_URL ||
      `${req.headers['x-forwarded-proto'] || req.protocol}://${req.get('host')}`;
    const targetUrl = (webhookUrl || `${origin.replace(/\/+$/, '')}/api/webhooks/asaas`).trim();

    if (!/^https?:\/\//i.test(targetUrl)) {
      res.status(400).json({ error: 'Informe uma URL HTTPS pública válida para o webhook.' });
      return;
    }

    const result = await asaasRequest<{ id: string; url: string; enabled: boolean }>(
      store.asaasConfig.apiKey,
      '/webhooks',
      {
        method: 'POST',
        body: {
          name: 'FalaKids PIX Webhook',
          url: targetUrl,
          email: (email || store.adminCreds.email).trim(),
          enabled: true,
          interrupted: false,
          apiVersion: 3,
          authToken: store.asaasConfig.webhookToken,
          sendType: 'SEQUENTIALLY',
          events: [
            'PAYMENT_CREATED',
            'PAYMENT_RECEIVED',
            'PAYMENT_CONFIRMED',
            'PAYMENT_OVERDUE',
            'PAYMENT_DELETED',
            'PAYMENT_REFUNDED',
          ],
        },
      }
    );

    if (!result.ok) {
      res.status(result.status).json({ error: result.errorMessage });
      return;
    }

    res.json({ registered: true, webhook: result.data });
  });

  app.post('/api/admin/asaas/payments/pix', requireAdmin, async (req, res) => {
    const store = ensureStoreLoaded();
    const {
      customerName,
      customerCpfCnpj,
      customerEmail,
      value,
      description,
      externalReference,
      dueDate,
    } = (req.body || {}) as {
      customerName?: string;
      customerCpfCnpj?: string;
      customerEmail?: string;
      value?: number;
      description?: string;
      externalReference?: string;
      dueDate?: string;
    };

    if (!customerName?.trim() || !customerCpfCnpj?.trim()) {
      res.status(400).json({ error: 'Informe o nome completo e CPF/CNPJ do cliente.' });
      return;
    }

    const created = await createRealPixCharge(store, {
      customerName,
      customerCpfCnpj,
      customerEmail: customerEmail || '',
      value: Number(value ?? store.asaasConfig.defaultPlanValue),
      description: description || store.asaasConfig.defaultPlanDescription,
      externalReference,
      dueDate,
    });

    if (!created.ok) {
      res.status(created.status).json({ error: created.error });
      return;
    }

    res.json({ order: created.order });
  });

  app.get('/api/admin/asaas/payments', requireAdmin, async (req, res) => {
    const store = ensureStoreLoaded();
    const statusFilter = typeof req.query.status === 'string' ? req.query.status.trim() : '';
    const refFilter =
      typeof req.query.externalReference === 'string' ? req.query.externalReference.trim() : '';

    let livePayments: unknown[] = [];
    let syncError: string | null = null;

    if (store.asaasConfig.apiKey) {
      const qs = new URLSearchParams({ limit: '30' });
      if (statusFilter) qs.set('status', statusFilter);
      if (refFilter) qs.set('externalReference', refFilter);

      const asaasRes = await asaasRequest<{
        data?: {
          id: string;
          status: string;
          value: number;
          billingType: string;
          dueDate: string;
          paymentDate?: string | null;
          confirmedDate?: string | null;
          description?: string;
          externalReference?: string;
          invoiceUrl?: string;
          customer?: string;
        }[];
      }>(store.asaasConfig.apiKey, `/payments?${qs.toString()}`);

      if (asaasRes.ok && Array.isArray(asaasRes.data?.data)) {
        livePayments = asaasRes.data.data;

        // Reconcile local orders with live Asaas statuses
        let changed = false;
        const nowIso = new Date().toISOString();
        asaasRes.data.data.forEach((remote) => {
          const localIdx = store.orders.findIndex((o) => o.asaasPaymentId === remote.id);
          if (localIdx >= 0 && store.orders[localIdx].status !== remote.status) {
            store.orders[localIdx] = {
              ...store.orders[localIdx],
              status: remote.status,
              updatedAt: nowIso,
              paidAt: isPaidStatus(remote.status)
                ? store.orders[localIdx].paidAt || remote.confirmedDate || remote.paymentDate || nowIso
                : store.orders[localIdx].paidAt,
            };
            changed = true;
          }
        });
        if (changed) saveStore(store);
      } else if (!asaasRes.ok) {
        syncError = asaasRes.errorMessage || null;
      }
    }

    res.json({
      orders: store.orders,
      transactions: store.transactions,
      livePayments,
      syncError,
    });
  });

  app.get('/api/admin/asaas/payments/:paymentId/refresh', requireAdmin, async (req, res) => {
    const store = ensureStoreLoaded();
    const paymentId = String(req.params.paymentId || '').trim();
    if (!paymentId) {
      res.status(400).json({ error: 'ID da cobrança ausente.' });
      return;
    }

    const remoteRes = await asaasRequest<{
      id: string;
      status: string;
      value: number;
      dueDate: string;
      paymentDate?: string | null;
      confirmedDate?: string | null;
      invoiceUrl?: string;
      externalReference?: string;
    }>(store.asaasConfig.apiKey, `/payments/${encodeURIComponent(paymentId)}`);

    if (!remoteRes.ok || !remoteRes.data) {
      res.status(remoteRes.status).json({ error: remoteRes.errorMessage });
      return;
    }

    const remote = remoteRes.data;
    const nowIso = new Date().toISOString();
    const idx = store.orders.findIndex((o) => o.asaasPaymentId === paymentId);

    if (idx >= 0) {
      let pixEncodedImage = store.orders[idx].pixEncodedImage;
      let pixPayload = store.orders[idx].pixPayload;
      let pixExpirationDate = store.orders[idx].pixExpirationDate;

      if (!pixPayload || !pixEncodedImage) {
        const qrRes = await asaasRequest<{
          encodedImage?: string;
          payload?: string;
          expirationDate?: string;
        }>(store.asaasConfig.apiKey, `/payments/${encodeURIComponent(paymentId)}/pixQrCode`);
        if (qrRes.ok && qrRes.data) {
          pixEncodedImage = qrRes.data.encodedImage || pixEncodedImage;
          pixPayload = qrRes.data.payload || pixPayload;
          pixExpirationDate = qrRes.data.expirationDate || pixExpirationDate;
        }
      }

      const prevStatus = store.orders[idx].status;
      store.orders[idx] = {
        ...store.orders[idx],
        status: remote.status,
        invoiceUrl: remote.invoiceUrl || store.orders[idx].invoiceUrl,
        pixEncodedImage,
        pixPayload,
        pixExpirationDate,
        updatedAt: nowIso,
        paidAt: isPaidStatus(remote.status)
          ? store.orders[idx].paidAt || remote.confirmedDate || remote.paymentDate || nowIso
          : store.orders[idx].paidAt,
      };

      if (prevStatus !== remote.status) {
        store.transactions = [
          {
            id: `tx_${Date.now()}`,
            event: `STATUS_${remote.status}`,
            paymentId,
            externalReference: store.orders[idx].externalReference,
            value: remote.value,
            status: remote.status,
            receivedAt: nowIso,
            source: 'api_sync' as const,
            summary: `Status atualizado via consulta Asaas: ${prevStatus} → ${remote.status}`,
          },
          ...store.transactions,
        ].slice(0, 300);
      }

      saveStore(store);
      res.json({ order: store.orders[idx], livePayment: remote });
      return;
    }

    res.json({ order: null, livePayment: remote });
  });

  // --- Protected Admin User Management (Admin Access) ---
  app.get('/api/admin/users', requireAdmin, (_req, res) => {
    const store = ensureStoreLoaded();
    const sorted = [...store.managedUsers].sort((a, b) =>
      (b.lastAccessAt || b.createdAt).localeCompare(a.lastAccessAt || a.createdAt)
    );
    res.json({ users: sorted });
  });

  app.post('/api/admin/users', requireAdmin, (req, res) => {
    const store = ensureStoreLoaded();
    const body = (req.body || {}) as {
      guardianName?: string;
      email?: string;
      childName?: string;
      childAge?: number;
      status?: ManagedUserStatus;
      password?: string;
      passwordHash?: string;
      notes?: string;
    };

    const guardianName = String(body.guardianName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const childName = String(body.childName || '').trim();

    if (!guardianName || !email || !childName) {
      res.status(400).json({ error: 'Preencha nome do responsável, e-mail e nome da criança.' });
      return;
    }
    if (!email.includes('@')) {
      res.status(400).json({ error: 'Informe um endereço de e-mail válido.' });
      return;
    }
    if (store.managedUsers.some((u) => u.email.toLowerCase() === email)) {
      res.status(409).json({ error: 'Já existe uma conta cadastrada com este e-mail.' });
      return;
    }

    const rawPassword = typeof body.password === 'string' ? body.password.trim() : '';
    const finalHash =
      rawPassword.length >= 4
        ? hashPassword(rawPassword)
        : typeof body.passwordHash === 'string' && body.passwordHash.trim()
        ? body.passwordHash.trim()
        : undefined;

    if (!finalHash) {
      res.status(400).json({ error: 'Informe uma senha inicial de pelo menos 4 caracteres.' });
      return;
    }

    const nowIso = new Date().toISOString();
    const status: ManagedUserStatus = body.status === 'blocked' ? 'blocked' : 'active';
    const newUser: ServerManagedUserRecord = {
      id: `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      subscriberId: null,
      childAccountId: `child_${crypto.randomBytes(6).toString('hex')}`,
      guardianName,
      email,
      childName,
      childAge: Math.min(12, Math.max(2, Number(body.childAge) || 5)),
      status,
      starsCount: 0,
      activitiesCount: 0,
      createdAt: nowIso,
      lastAccessAt: nowIso,
      updatedAt: nowIso,
      notes: body.notes?.trim() || undefined,
      passwordHash: finalHash,
    };

    store.managedUsers = [newUser, ...store.managedUsers].slice(0, 500);
    saveStore(store);
    res.status(201).json({ user: newUser });
  });

  app.patch('/api/admin/users/:id', requireAdmin, (req, res) => {
    const store = ensureStoreLoaded();
    const userId = String(req.params.id || '').trim();
    const idx = store.managedUsers.findIndex((u) => u.id === userId);
    if (idx < 0) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    const current = store.managedUsers[idx];
    const body = (req.body || {}) as {
      guardianName?: string;
      email?: string;
      childName?: string;
      childAge?: number;
      status?: ManagedUserStatus;
      password?: string;
      passwordHash?: string;
      notes?: string;
    };

    const nextEmail =
      body.email !== undefined ? String(body.email).trim().toLowerCase() : current.email;
    if (!nextEmail || !nextEmail.includes('@')) {
      res.status(400).json({ error: 'Informe um endereço de e-mail válido.' });
      return;
    }
    if (store.managedUsers.some((u) => u.id !== userId && u.email.toLowerCase() === nextEmail)) {
      res.status(409).json({ error: 'Já existe outra conta cadastrada com este e-mail.' });
      return;
    }

    const nextGuardian =
      body.guardianName !== undefined ? String(body.guardianName).trim() : current.guardianName;
    const nextChildName =
      body.childName !== undefined ? String(body.childName).trim() : current.childName;
    if (!nextGuardian || !nextChildName) {
      res.status(400).json({ error: 'Nome do responsável e da criança são obrigatórios.' });
      return;
    }

    const rawPassword = typeof body.password === 'string' ? body.password.trim() : '';
    let nextPasswordHash = current.passwordHash;
    if (rawPassword.length > 0) {
      if (rawPassword.length < 4) {
        res.status(400).json({ error: 'A nova senha deve ter pelo menos 4 caracteres.' });
        return;
      }
      nextPasswordHash = hashPassword(rawPassword);
    } else if (typeof body.passwordHash === 'string' && body.passwordHash.trim()) {
      nextPasswordHash = body.passwordHash.trim();
    }

    const nextStatus: ManagedUserStatus =
      body.status === 'active' || body.status === 'blocked' ? body.status : current.status;

    const nowIso = new Date().toISOString();
    const updated: ServerManagedUserRecord = {
      ...current,
      guardianName: nextGuardian,
      email: nextEmail,
      childName: nextChildName,
      childAge:
        body.childAge !== undefined
          ? Math.min(12, Math.max(2, Number(body.childAge) || current.childAge))
          : current.childAge,
      status: nextStatus,
      notes:
        body.notes !== undefined ? body.notes.trim() || undefined : current.notes,
      passwordHash: nextPasswordHash,
      updatedAt: nowIso,
    };

    store.managedUsers[idx] = updated;
    saveStore(store);

    res.json({ user: updated });
  });

  app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
    const store = ensureStoreLoaded();
    const userId = String(req.params.id || '').trim();
    const idx = store.managedUsers.findIndex((u) => u.id === userId);
    if (idx < 0) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }
    store.managedUsers.splice(idx, 1);
    saveStore(store);
    res.json({ deleted: true, id: userId });
  });

  // --- User Account Sync & Server-Authoritative Status ---
  app.post('/api/users/sync', (req, res) => {
    const store = ensureStoreLoaded();
    const { subscriberId, subscriberToken } = resolveOrCreateSubscriber(req, res, store);
    const body = (req.body || {}) as {
      childAccountId?: string;
      childName?: string;
      childAge?: number;
      starsCount?: number;
      activitiesCount?: number;
      guardianName?: string;
      email?: string;
    };

    const userRecord = upsertManagedUserOnSync(store, {
      subscriberId,
      childAccountId: body.childAccountId,
      childName: body.childName,
      childAge: body.childAge,
      starsCount: body.starsCount,
      activitiesCount: body.activitiesCount,
      guardianName: body.guardianName,
      email: body.email,
    });
    saveStore(store);

    res.json({
      subscriberToken,
      blocked: userRecord.status === 'blocked',
      status: userRecord.status,
    });
  });

  // --- Free 3D Vocal Tract Access ---
  app.get('/api/vocal-tract/access', (req, res) => {
    const store = ensureStoreLoaded();
    const { subscriberId, subscriberToken } = resolveOrCreateSubscriber(req, res, store);
    const blocked = isUserBlockedOnServer(store, subscriberId);

    res.json({
      allowed: !blocked,
      blocked,
      isFreeFeature: true,
      subscriberToken,
      requiredPhraseTests: [
        {
          id: 'test-papai',
          label: 'Teste 1',
          text: 'Papai.',
          tip: 'Junte os dois lábios com suavidade e solte o ar no som do P.',
        },
        {
          id: 'test-mamae',
          label: 'Teste 2',
          text: 'Mamãe.',
          tip: 'Encoste os lábios com carinho para vibrar o som nasal do M.',
        },
      ],
    });
  });

  // --- Asaas Production Webhook Receiver ---
  app.post('/api/webhooks/asaas', (req, res) => {
    const store = ensureStoreLoaded();

    // Validate webhook access token header if configured
    if (store.asaasConfig.webhookToken) {
      const incomingToken = String(req.headers['asaas-access-token'] || '').trim();
      if (incomingToken !== store.asaasConfig.webhookToken) {
        res.status(401).json({ error: 'Webhook token inválido.' });
        return;
      }
    }

    const payload = (req.body || {}) as {
      id?: string;
      event?: string;
      payment?: {
        id?: string;
        status?: string;
        value?: number;
        externalReference?: string;
        confirmedDate?: string;
        paymentDate?: string;
        clientPaymentDate?: string;
      };
    };

    const eventId = payload.id ? String(payload.id) : '';
    const eventName = String(payload.event || 'UNKNOWN_EVENT');
    const payment = payload.payment;

    // Idempotency guard
    if (eventId && store.processedWebhookIds.includes(eventId)) {
      res.status(200).json({ received: true, duplicate: true });
      return;
    }

    const nowIso = new Date().toISOString();

    if (payment?.id) {
      const nextStatus =
        payment.status ||
        (eventName === 'PAYMENT_RECEIVED' || eventName === 'PAYMENT_CONFIRMED'
          ? 'RECEIVED'
          : eventName === 'PAYMENT_OVERDUE'
          ? 'OVERDUE'
          : eventName === 'PAYMENT_REFUNDED'
          ? 'REFUNDED'
          : eventName === 'PAYMENT_DELETED'
          ? 'DELETED'
          : 'UPDATED');

      const orderIdx = store.orders.findIndex(
        (o) =>
          o.asaasPaymentId === payment.id ||
          (payment.externalReference && o.externalReference === payment.externalReference)
      );

      if (orderIdx >= 0) {
        store.orders[orderIdx] = {
          ...store.orders[orderIdx],
          status: nextStatus,
          updatedAt: nowIso,
          paidAt: isPaidStatus(nextStatus)
            ? store.orders[orderIdx].paidAt ||
              payment.confirmedDate ||
              payment.paymentDate ||
              payment.clientPaymentDate ||
              nowIso
            : store.orders[orderIdx].paidAt,
        };
      }

      store.transactions = [
        {
          id: eventId || `wh_${Date.now()}`,
          event: eventName,
          paymentId: payment.id,
          externalReference: payment.externalReference || null,
          value: Number(payment.value || 0),
          status: nextStatus,
          receivedAt: nowIso,
          source: 'webhook' as const,
          summary: `Webhook ${eventName} recebido para cobrança ${payment.id}`,
        },
        ...store.transactions,
      ].slice(0, 300);
    }

    if (eventId) {
      store.processedWebhookIds = [eventId, ...store.processedWebhookIds].slice(0, 500);
    }
    saveStore(store);

    res.status(200).json({ received: true });
  });

  const httpServer = http.createServer(app);

  // --- Vite Dev Middleware / Production Static Assets ---
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
