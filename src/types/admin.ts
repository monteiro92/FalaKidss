import { ThemeId } from './app';

export type AdminRoute = 'dashboard' | 'users' | 'asaas' | 'app-settings' | 'security';

export type ManagedUserStatus = 'active' | 'blocked';

export interface ManagedUserAccount {
  id: string;
  subscriberId?: string | null;
  childAccountId?: string | null;
  guardianName: string;
  email: string;
  childName: string;
  childAge: number;
  status: ManagedUserStatus;
  starsCount: number;
  activitiesCount: number;
  createdAt: string;
  lastAccessAt: string;
  updatedAt?: string;
  notes?: string;
  passwordHash?: string;
}

export interface AdminAppConfig {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  announcementEnabled: boolean;
  announcementText: string;
  registrationOpen: boolean;
  defaultThemeId: ThemeId;
  enabledModules: Record<string, boolean>;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  detail: string;
  actorEmail: string;
  timestamp: string;
}

export interface AdminCredentialsRecord {
  email: string;
  name: string;
  passwordHash: string;
  updatedAt: string;
}

export interface AdminSession {
  token: string;
  email: string;
  name: string;
  issuedAt: number;
  expiresAt: number;
}

export interface AsaasConfigPublic {
  configured: boolean;
  keyPreview: string | null;
  environment: 'PRODUCTION';
  baseUrl: string;
  pixEnabled: boolean;
  defaultPlanValue: number;
  defaultPlanDescription: string;
  webhookUrlHint: string;
  hasWebhookToken: boolean;
  webhookTokenPreview: string | null;
  updatedAt: string | null;
}

export interface AsaasOrderRecord {
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
}

export interface AsaasTransactionRecord {
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

export interface AsaasLivePayment {
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
}

export interface RequiredPhraseTest {
  id: string;
  label: string;
  text: string;
  tip: string;
}

export interface VocalTractAccessResponse {
  allowed: boolean;
  blocked?: boolean;
  isFreeFeature?: boolean;
  subscriberToken: string;
  message?: string;
  requiredPhraseTests?: RequiredPhraseTest[];
}

