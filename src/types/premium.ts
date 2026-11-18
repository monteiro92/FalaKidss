export type SubscriptionStatus = 'FREE' | 'PENDING' | 'ACTIVE' | 'OVERDUE' | 'CANCELED';

export type PaymentBillingMethod = 'PIX' | 'CREDIT_CARD';

export interface SubscriptionPaymentRecord {
  id: string;
  asaasPaymentId: string;
  value: number;
  billingType: string;
  status: string;
  dueDate: string;
  paidAt: string | null;
  invoiceUrl: string | null;
  pixPayload?: string | null;
  pixEncodedImage?: string | null;
  pixExpirationDate?: string | null;
  description?: string;
  createdAt: string;
}

export interface SubscriptionDetails {
  id: string;
  asaasSubscriptionId: string;
  planName: string;
  value: number;
  cycle: 'MONTHLY';
  billingType: PaymentBillingMethod;
  status: Exclude<SubscriptionStatus, 'FREE'>;
  customerName: string;
  customerEmail: string;
  nextDueDate: string | null;
  startedAt: string;
  activatedAt: string | null;
  canceledAt: string | null;
  updatedAt: string;
  latestInvoiceUrl: string | null;
  latestPixPayload: string | null;
  latestPixEncodedImage: string | null;
  latestPixExpirationDate: string | null;
}

export interface PremiumStatusResponse {
  hasPremiumAccess: boolean;
  planName: string;
  monthlyValue: number;
  status: SubscriptionStatus;
  accessSource?: 'paid_subscription' | 'admin_grant' | 'free';
  adminGrantExpiresAt?: string | null;
  isPermanentGrant?: boolean;
  adminGrantReason?: string | null;
  gatewayConfigured: boolean;
  pixSupported: boolean;
  cardSupported: boolean;
  adFree: boolean;
  subscription: SubscriptionDetails | null;
  paymentHistory: SubscriptionPaymentRecord[];
  subscriberToken?: string;
}

export interface PremiumStoryQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  encouragement: string;
}

export interface PremiumStoryPayload {
  id: string;
  title: string;
  ageHint: string;
  coverImage: string;
  accent: string;
  paragraphs: string[];
  questions: PremiumStoryQuestion[];
  matchingWord: {
    prompt: string;
    targetWord: string;
    distractors: string[];
  };
}

export interface PremiumPhonemeRound {
  id: string;
  targetPhoneme: string;
  spokenHint: string;
  prompt: string;
  correctWord: string;
  correctArtKey: string;
  options: { word: string; artKey: string }[];
}

export interface PremiumRhymeRound {
  id: string;
  baseWord: string;
  baseArtKey: string;
  correctRhyme: string;
  correctArtKey: string;
  options: { word: string; artKey: string }[];
  tip: string;
}

export interface PremiumActivityTrack {
  id: string;
  title: string;
  subtitle: string;
  phrase: string;
  tip: string;
  category: string;
}

export interface PremiumExclusiveContentPayload {
  stories: PremiumStoryPayload[];
  phonemeRounds: PremiumPhonemeRound[];
  rhymeRounds: PremiumRhymeRound[];
  exclusiveActivities: PremiumActivityTrack[];
}

export type ContentTier = 'GRATUITO' | 'PREMIUM';

export type ContentCategory = 'module' | 'activity' | 'game' | 'story';

export interface CatalogItemDTO {
  id: string;
  category: ContentCategory;
  title: string;
  subtitle: string;
  tier: ContentTier;
  unlocked: boolean;
  accessReason: 'free' | 'paid_subscription' | 'admin_grant' | 'premium_required' | 'blocked';
  order: number;
  lockedFree?: boolean;
  meta?: {
    configKey?: string;
    ageHint?: string;
    coverImage?: string;
    accent?: string;
    artKey?: string;
  };
  updatedAt?: string;
}

export interface ContentCatalogResponse {
  hasPremiumAccess: boolean;
  blocked: boolean;
  accessSource: 'paid_subscription' | 'admin_grant' | 'free';
  monthlyValue: number;
  counts: {
    total: number;
    free: number;
    premium: number;
    byCategory: Record<ContentCategory, { total: number; free: number; premium: number }>;
  };
  items: CatalogItemDTO[];
  unlockedPayloads: {
    stories: Record<string, PremiumStoryPayload>;
    activities: Record<string, PremiumActivityTrack>;
    phonemeRounds: PremiumPhonemeRound[];
    rhymeRounds: PremiumRhymeRound[];
  };
}

