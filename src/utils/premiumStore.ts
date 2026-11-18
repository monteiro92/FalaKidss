import {
  ContentCatalogResponse,
  PaymentBillingMethod,
  PremiumExclusiveContentPayload,
  PremiumStatusResponse,
} from '../types/premium';
import {
  fetchJsonWithRetry,
  getSubscriberHeaders,
  storeSubscriberToken,
} from './adminStore';

export async function fetchPremiumStatus(params?: {
  sync?: boolean;
  childAccountId?: string;
}): Promise<PremiumStatusResponse> {
  const qs = new URLSearchParams();
  if (params?.sync) qs.set('sync', '1');
  if (params?.childAccountId) qs.set('childAccountId', params.childAccountId);
  const query = qs.toString();

  const { res, data } = await fetchJsonWithRetry<PremiumStatusResponse & { error?: string }>(
    `/api/premium/status${query ? `?${query}` : ''}`,
    {
      credentials: 'include',
      headers: getSubscriberHeaders(),
    },
    2
  );
  if (data.subscriberToken) {
    storeSubscriberToken(data.subscriberToken);
  }
  if (!res.ok) {
    throw new Error(data.error || 'Não foi possível verificar o status da assinatura.');
  }
  return data;
}

export async function createPremiumSubscription(payload: {
  customerName: string;
  customerCpfCnpj: string;
  customerEmail: string;
  billingType: PaymentBillingMethod;
  acceptedTerms: boolean;
  childAccountId?: string;
  childName?: string;
  idempotencyKey: string;
}): Promise<PremiumStatusResponse> {
  const { res, data } = await fetchJsonWithRetry<PremiumStatusResponse & { error?: string }>(
    '/api/premium/subscribe',
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...getSubscriberHeaders(),
      },
      body: JSON.stringify(payload),
    },
    1
  );
  if (data.subscriberToken) {
    storeSubscriberToken(data.subscriberToken);
  }
  if (!res.ok) {
    throw new Error(data.error || 'Não foi possível iniciar a assinatura Premium.');
  }
  return data;
}

export async function refreshPremiumSubscription(
  childAccountId?: string
): Promise<PremiumStatusResponse> {
  const { res, data } = await fetchJsonWithRetry<PremiumStatusResponse & { error?: string }>(
    '/api/premium/subscription/refresh',
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...getSubscriberHeaders(),
      },
      body: JSON.stringify({ childAccountId }),
    },
    1
  );
  if (data.subscriberToken) {
    storeSubscriberToken(data.subscriberToken);
  }
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao consultar confirmação de pagamento.');
  }
  return data;
}

export async function cancelPremiumSubscription(
  childAccountId?: string
): Promise<PremiumStatusResponse> {
  const { res, data } = await fetchJsonWithRetry<PremiumStatusResponse & { error?: string }>(
    '/api/premium/subscription/cancel',
    {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...getSubscriberHeaders(),
      },
      body: JSON.stringify({ childAccountId }),
    },
    1
  );
  if (data.subscriberToken) {
    storeSubscriberToken(data.subscriberToken);
  }
  if (!res.ok) {
    throw new Error(data.error || 'Erro ao cancelar assinatura.');
  }
  return data;
}

export async function fetchPremiumExclusiveContent(): Promise<PremiumExclusiveContentPayload> {
  const { res, data } = await fetchJsonWithRetry<
    PremiumExclusiveContentPayload & { error?: string }
  >(
    '/api/premium/content',
    {
      credentials: 'include',
      headers: getSubscriberHeaders(),
    },
    1
  );
  if (!res.ok) {
    throw new Error(
      data.error || 'Assinatura FalaKids Premium ativa necessária para este conteúdo.'
    );
  }
  return data;
}

export async function fetchContentCatalog(
  childAccountId?: string
): Promise<ContentCatalogResponse> {
  const qs = new URLSearchParams();
  if (childAccountId) qs.set('childAccountId', childAccountId);
  const query = qs.toString();

  const { res, data } = await fetchJsonWithRetry<ContentCatalogResponse & { error?: string }>(
    `/api/content/catalog${query ? `?${query}` : ''}`,
    {
      credentials: 'include',
      headers: getSubscriberHeaders(),
    },
    2
  );
  if (!res.ok) {
    throw new Error(data.error || 'Não foi possível carregar o catálogo de conteúdos.');
  }
  return data;
}

