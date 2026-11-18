import { ThemeId } from './app';

export type AdminRoute = 'dashboard' | 'users' | 'asaas' | 'app-settings' | 'security';

export type ManagedUserStatus = 'active' | 'blocked';

export type AdminAccountType = 'responsavel' | 'educador' | 'clinica' | 'convidado';

export type AdminPremiumDuration =
  | '30_days'
  | '90_days'
  | '6_months'
  | 'permanent'
  | 'custom';

export type UserAccessBadge =
  | 'GRATUITO'
  | 'PREMIUM PAGO'
  | 'PREMIUM ADMINISTRATIVO'
  | 'PREMIUM EXPIRADO'
  | 'PREMIUM REVOGADO'
  | 'BLOQUEADO';

export interface AdminPremiumGrant {
  active: boolean;
  duration: AdminPremiumDuration;
  durationLabel: string;
  isPermanent: boolean;
  startDate: string;
  expiresAt: string | null;
  reason: string;
  grantedByEmail: string;
  grantedByName?: string;
  grantedAt: string;
  revokedAt?: string | null;
  revokedByEmail?: string | null;
  revokeReason?: string | null;
}

export interface PaidSubscriptionSummary {
  id: string;
  status: 'PENDING' | 'ACTIVE' | 'OVERDUE' | 'CANCELED';
  billingType: 'PIX' | 'CREDIT_CARD';
  value: number;
  nextDueDate: string | null;
  startedAt: string;
  activatedAt: string | null;
  canceledAt: string | null;
}

export interface ManagedUserAccount {
  id: string;
  subscriberId?: string | null;
  childAccountId?: string | null;
  guardianName: string;
  email: string;
  accountType: AdminAccountType;
  childName: string;
  childAge: number;
  status: ManagedUserStatus;
  passwordSetupInvite?: boolean;
  starsCount: number;
  activitiesCount: number;
  createdAt: string;
  lastAccessAt: string;
  updatedAt?: string;
  notes?: string;
  adminPremiumGrant?: AdminPremiumGrant | null;
  paidSubscription?: PaidSubscriptionSummary | null;
  // Computed server-authoritative fields
  accessBadge: UserAccessBadge;
  planLabel: 'FalaKids Gratuito' | 'FalaKids Premium';
  accessType: string;
  premiumValidityLabel: string;
  hasEffectivePremium: boolean;
}

export interface AdminDashboardMetrics {
  totalUsers: number;
  freeUsers: number;
  paidPremiumUsers: number;
  adminPremiumUsers: number;
  blockedUsers: number;
  expiredSubscriptions: number;
  revokedUsers: number;
  receivedRevenueBRL: number;
  commercialPlanPriceBRL: number;
  activeUsers: number;
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
  actorName?: string;
  targetUserId?: string | null;
  targetUserEmail?: string | null;
  timestamp: string;
}

export interface AdminUserHistoryResponse {
  user: ManagedUserAccount;
  auditLogs: AdminAuditLog[];
  payments: {
    id: string;
    asaasPaymentId: string;
    value: number;
    billingType: string;
    status: string;
    dueDate: string;
    paidAt: string | null;
    description?: string;
    invoiceUrl?: string | null;
  }[];
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
