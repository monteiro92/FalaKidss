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
export type AdminAccountType = 'responsavel' | 'educador' | 'clinica' | 'convidado';
export type AdminPremiumDuration = '30_days' | '90_days' | '6_months' | 'permanent' | 'custom';
export type UserAccessBadge =
  | 'GRATUITO'
  | 'PREMIUM PAGO'
  | 'PREMIUM ADMINISTRATIVO'
  | 'PREMIUM EXPIRADO'
  | 'PREMIUM REVOGADO'
  | 'BLOQUEADO';

interface ServerAdminPremiumGrant {
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

interface ServerAdminAuditLogRecord {
  id: string;
  action: string;
  detail: string;
  actorEmail: string;
  actorName?: string;
  targetUserId?: string | null;
  targetUserEmail?: string | null;
  timestamp: string;
}

interface ServerManagedUserRecord {
  id: string;
  subscriberId: string | null;
  childAccountId: string | null;
  guardianName: string;
  email: string;
  accountType?: AdminAccountType;
  childName: string;
  childAge: number;
  status: ManagedUserStatus;
  passwordSetupInvite?: boolean;
  starsCount: number;
  activitiesCount: number;
  createdAt: string;
  lastAccessAt: string;
  updatedAt: string;
  notes?: string;
  passwordHash?: string;
  adminPremiumGrant?: ServerAdminPremiumGrant | null;
}

const PREMIUM_PLAN_NAME = 'FalaKids Premium';
const PREMIUM_MONTHLY_VALUE = 29.99;

export type ServerSubscriptionStatus = 'PENDING' | 'ACTIVE' | 'OVERDUE' | 'CANCELED';

interface ServerSubscriptionPaymentRecord {
  id: string;
  asaasPaymentId: string;
  value: number;
  billingType: string;
  status: string;
  dueDate: string;
  paidAt: string | null;
  invoiceUrl: string | null;
  pixPayload: string | null;
  pixEncodedImage: string | null;
  pixExpirationDate: string | null;
  description?: string;
  createdAt: string;
}

interface ServerSubscriptionRecord {
  id: string;
  subscriberId: string;
  childAccountId?: string | null;
  idempotencyKey: string;
  asaasCustomerId: string;
  asaasSubscriptionId: string;
  planName: string;
  value: number;
  cycle: 'MONTHLY';
  billingType: 'PIX' | 'CREDIT_CARD';
  status: ServerSubscriptionStatus;
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
  payments: ServerSubscriptionPaymentRecord[];
}

export type ServerContentTier = 'GRATUITO' | 'PREMIUM';
export type ServerContentCategory = 'module' | 'activity' | 'game' | 'story';

interface ServerContentClassificationEntry {
  tier: ServerContentTier;
  updatedAt: string;
  updatedBy?: string;
}

interface ServerCatalogItemDefinition {
  id: string;
  category: ServerContentCategory;
  title: string;
  subtitle: string;
  defaultTier: ServerContentTier;
  order: number;
  lockedFree?: boolean;
  meta?: {
    configKey?: string;
    ageHint?: string;
    coverImage?: string;
    accent?: string;
    artKey?: string;
  };
}

const SERVER_DEFAULT_CATALOG: ServerCatalogItemDefinition[] = [
  {
    id: 'first-words',
    category: 'module',
    title: 'Primeiras Palavras',
    subtitle: 'Família, alimentos, animais, objetos, corpo e natureza',
    defaultTier: 'GRATUITO',
    order: 1,
    meta: { configKey: 'first-words' },
  },
  {
    id: 'alphabet',
    category: 'module',
    title: 'Vogais e Alfabeto',
    subtitle: 'Vogais A–U, alfabeto completo e sons das letras',
    defaultTier: 'GRATUITO',
    order: 2,
    meta: { configKey: 'alphabet' },
  },
  {
    id: 'pronunciation',
    category: 'module',
    title: 'Treinamento de Pronúncia',
    subtitle: 'Vogais, consoantes, sílabas, frases e Teste 3D Gratuito',
    defaultTier: 'GRATUITO',
    order: 3,
    meta: { configKey: 'pronunciation' },
  },
  {
    id: 'oral-motor',
    category: 'module',
    title: 'Anatomia 3D do Trato Vocal',
    subtitle: 'Modelo 3D interativo e Teste 3D Gratuito (Papai / Mamãe)',
    defaultTier: 'GRATUITO',
    order: 4,
    lockedFree: true,
    meta: { configKey: 'oral-motor' },
  },
  {
    id: 'animal-sounds',
    category: 'module',
    title: 'Sons dos Animais',
    subtitle: 'Ouça, imite e descubra qual animal fez o som',
    defaultTier: 'GRATUITO',
    order: 5,
    meta: { configKey: 'animal-sounds' },
  },
  {
    id: 'daily-phrases',
    category: 'module',
    title: 'Frases do Dia a Dia',
    subtitle: 'Expressões úteis para pedir, agradecer e brincar',
    defaultTier: 'GRATUITO',
    order: 6,
    meta: { configKey: 'daily-phrases' },
  },
  {
    id: 'camera',
    category: 'module',
    title: 'Minhas Fotos e Objetos',
    subtitle: 'Cartões personalizados criados pelos responsáveis',
    defaultTier: 'GRATUITO',
    order: 7,
    meta: { configKey: 'camera' },
  },
  {
    id: 'prem-act-1',
    category: 'activity',
    title: 'Respiração Guiada da Tartaruga',
    subtitle: 'Ritmo calmo antes de falar frases longas',
    defaultTier: 'PREMIUM',
    order: 8,
  },
  {
    id: 'prem-act-2',
    category: 'activity',
    title: 'Trava-Língua Divertido do R',
    subtitle: 'Treino avançado de agilidade da ponta da língua',
    defaultTier: 'PREMIUM',
    order: 9,
  },
  {
    id: 'prem-act-3',
    category: 'activity',
    title: 'Expressão Completa de Pedido',
    subtitle: 'Comunicação gentil com frase expandida',
    defaultTier: 'PREMIUM',
    order: 10,
  },
  {
    id: 'prem-act-4',
    category: 'activity',
    title: 'Narrativa de Rotina Matinal',
    subtitle: 'Sequência lógica em 3 etapas',
    defaultTier: 'PREMIUM',
    order: 11,
  },
  {
    id: 'memoria',
    category: 'game',
    title: '1. Jogo da Memória',
    subtitle: 'Encontre os pares de imagens iguais',
    defaultTier: 'GRATUITO',
    order: 12,
    meta: { accent: '#0284C7', artKey: 'estrela' },
  },
  {
    id: 'encontre-imagem',
    category: 'game',
    title: '2. Encontre a Imagem',
    subtitle: 'Ouça o nome e toque na figura certa',
    defaultTier: 'GRATUITO',
    order: 13,
    meta: { accent: '#EC4899', artKey: 'olho' },
  },
  {
    id: 'complete-palavra',
    category: 'game',
    title: '3. Complete a Palavra',
    subtitle: 'Escolha a letra ou sílaba que falta',
    defaultTier: 'GRATUITO',
    order: 14,
    meta: { accent: '#F59E0B', artKey: 'lapis' },
  },
  {
    id: 'qual-animal',
    category: 'game',
    title: '4. Qual é o Animal?',
    subtitle: 'Ouça o som e descubra o bichinho',
    defaultTier: 'GRATUITO',
    order: 15,
    meta: { accent: '#10B981', artKey: 'cachorro' },
  },
  {
    id: 'acerte-letra',
    category: 'game',
    title: '5. Acerte a Letra',
    subtitle: 'Reconheça vogais e consoantes iniciais em 3 níveis',
    defaultTier: 'GRATUITO',
    order: 16,
    meta: { accent: '#8B5CF6', artKey: 'bola' },
  },
  {
    id: 'ouca-escolha',
    category: 'game',
    title: '6. Ouça e Escolha',
    subtitle: 'Atenção aos sons parecidos',
    defaultTier: 'GRATUITO',
    order: 17,
    meta: { accent: '#0EA5E9', artKey: 'orelha' },
  },
  {
    id: 'monte-frase',
    category: 'game',
    title: '7. Monte a Frase',
    subtitle: 'Coloque as palavras na ordem correta',
    defaultTier: 'GRATUITO',
    order: 18,
    meta: { accent: '#F97316', artKey: 'livro' },
  },
  {
    id: 'ligue-imagem',
    category: 'game',
    title: '8. Ligue a Imagem à Palavra',
    subtitle: 'Conecte cada desenho ao seu nome',
    defaultTier: 'GRATUITO',
    order: 19,
    meta: { accent: '#10B981', artKey: 'flor' },
  },
  {
    id: 'descubra-objeto',
    category: 'game',
    title: '9. Descubra o Objeto',
    subtitle: 'Ouça as pistas para revelar o segredo',
    defaultTier: 'GRATUITO',
    order: 20,
    meta: { accent: '#6366F1', artKey: 'pergunta' },
  },
  {
    id: 'embaralha',
    category: 'game',
    title: '10. Embaralha',
    subtitle: 'Organize as letras embaralhadas para formar palavras',
    defaultTier: 'GRATUITO',
    order: 21,
    meta: { accent: '#E11D48', artKey: 'brinquedo' },
  },
  {
    id: 'fonemas-especiais',
    category: 'game',
    title: '11. Desafio dos Fonemas Especiais',
    subtitle: 'Pratique sons complexos (CH, LH, NH e encontros) com pistas faladas',
    defaultTier: 'PREMIUM',
    order: 22,
    meta: { accent: '#D97706', artKey: 'chocolate' },
  },
  {
    id: 'caca-rimas',
    category: 'game',
    title: '12. Caça às Rimas Divertidas',
    subtitle: 'Descubra palavras com sons finais parecidos e ganhe estrelas extras',
    defaultTier: 'PREMIUM',
    order: 23,
    meta: { accent: '#EA580C', artKey: 'leao' },
  },
  {
    id: 'sol-jardim',
    category: 'story',
    title: 'O Sol e o Jardim Colorido',
    subtitle: 'Faixa sugerida · 2 a 7 anos',
    defaultTier: 'GRATUITO',
    order: 24,
    meta: { ageHint: '2 a 7 anos', accent: '#F59E0B' },
  },
  {
    id: 'patinho-lago',
    category: 'story',
    title: 'O Patinho Curioso no Lago',
    subtitle: 'Faixa sugerida · 2 a 9 anos',
    defaultTier: 'GRATUITO',
    order: 25,
    meta: { ageHint: '2 a 9 anos', accent: '#0284C7' },
  },
  {
    id: 'lua-estrelas',
    category: 'story',
    title: 'A Lua e a Casinha das Estrelas',
    subtitle: 'Faixa sugerida · 4 a 12 anos',
    defaultTier: 'GRATUITO',
    order: 26,
    meta: { ageHint: '4 a 12 anos', accent: '#8B5CF6' },
  },
  {
    id: 'prem-oceano-coral',
    category: 'story',
    title: 'O Oceano Encantado de Coral',
    subtitle: 'Faixa sugerida · 3 a 10 anos',
    defaultTier: 'PREMIUM',
    order: 27,
    meta: { ageHint: '3 a 10 anos', accent: '#D97706' },
  },
  {
    id: 'prem-nuvem-arcoiris',
    category: 'story',
    title: 'A Nuvem Viajante e o Arco-Íris',
    subtitle: 'Faixa sugerida · 4 a 12 anos',
    defaultTier: 'PREMIUM',
    order: 28,
    meta: { ageHint: '4 a 12 anos', accent: '#EA580C' },
  },
];

const SERVER_EXCLUSIVE_STORIES = [
  {
    id: 'prem-oceano-coral',
    title: 'O Oceano Encantado de Coral',
    ageHint: '3 a 10 anos',
    coverImage: '/src/assets/images/story_premium_oceano_1795006076054.jpg',
    accent: '#D97706',
    paragraphs: [
      'No fundo do mar azul-turquesa, o peixinho Dourado e a tartaruga Tita nadavam juntinhos entre os corais.',
      'Cada bolhinha que subia na água fazia um som divertido: plim, plom, plum!',
      'Tita ensinou o peixinho a respirar bem fundo e soltar os sons com calma, palavra por palavra.',
      'Logo chegaram os cavalos-marinhos batendo palminhas para ouvir as histórias do recife.',
      'Antes de dormir, o oceano inteiro cantou baixinho: boa noite, amigos do mar!',
    ],
    questions: [
      {
        question: 'Quem nadava junto com o peixinho Dourado?',
        options: ['A tartaruga Tita', 'O leão da selva', 'O gatinho'],
        correctIndex: 0,
        encouragement: 'Isso mesmo! A tartaruga Tita era a grande amiga do peixinho.',
      },
      {
        question: 'Qual som as bolhinhas faziam subindo na água?',
        options: ['Plim, plom, plum!', 'Miau, miau!', 'Au, au!'],
        correctIndex: 0,
        encouragement: 'Muito bem! As bolhinhas faziam plim, plom, plum!',
      },
    ],
    matchingWord: {
      prompt: 'Onde o peixinho e a tartaruga viviam na história?',
      targetWord: 'Oceano',
      distractors: ['Cama', 'Escola'],
    },
  },
  {
    id: 'prem-nuvem-arcoiris',
    title: 'A Nuvem Viajante e o Arco-Íris',
    ageHint: '4 a 12 anos',
    coverImage: '/src/assets/images/story_premium_nuvem_1795006076383.jpg',
    accent: '#EA580C',
    paragraphs: [
      'Lá no alto das colinas verdes, uma nuvem fofinha chamada Bela adorava passear com a brisa da tarde.',
      'Quando o sol dourado sorriu por trás da chuva fininha, apareceu um arco-íris com sete cores brilhantes.',
      'Bela cumprimentou cada casinha do vale falando devagar: olá, bom dia, tudo bem?',
      'As crianças lá embaixo acenaram para o céu e repetiram todas as palavras com alegria.',
      'Assim a nuvem descobriu que falar com carinho aproxima todo mundo, mesmo lá do alto!',
    ],
    questions: [
      {
        question: 'O que apareceu no céu quando o sol sorriu após a chuva?',
        options: ['Um arco-íris', 'Um navio', 'Um trem'],
        correctIndex: 0,
        encouragement: 'Acertou! Apareceu um lindo arco-íris de sete cores.',
      },
      {
        question: 'Como a nuvem Bela cumprimentou as casinhas do vale?',
        options: ['Olá, bom dia, tudo bem?', 'Boa noite, lua!', 'Até logo!'],
        correctIndex: 0,
        encouragement: 'Perfeito! Ela disse olá, bom dia, tudo bem?',
      },
    ],
    matchingWord: {
      prompt: 'Qual era o nome da personagem fofinha que passeava no céu?',
      targetWord: 'Nuvem',
      distractors: ['Sapato', 'Garfo'],
    },
  },
];

const SERVER_PHONEME_ROUNDS = [
  {
    id: 'ph-ch',
    targetPhoneme: 'CH',
    spokenHint: 'Ouça o som suave do CH, como em CHUVA e CHOCOLATE!',
    prompt: 'Qual palavra começa com o som do CH?',
    correctWord: 'Chocolate',
    correctArtKey: 'chocolate',
    options: [
      { word: 'Chocolate', artKey: 'chocolate' },
      { word: 'Banana', artKey: 'banana' },
      { word: 'Casa', artKey: 'casa' },
    ],
  },
  {
    id: 'ph-lh',
    targetPhoneme: 'LH',
    spokenHint: 'Sinta a língua encostar no céu da boca no som LH, como em OVELHA!',
    prompt: 'Qual bichinho tem o som do LH no nome?',
    correctWord: 'Ovelha',
    correctArtKey: 'ovelha',
    options: [
      { word: 'Ovelha', artKey: 'ovelha' },
      { word: 'Gato', artKey: 'gato' },
      { word: 'Pato', artKey: 'pato' },
    ],
  },
  {
    id: 'ph-nh',
    targetPhoneme: 'NH',
    spokenHint: 'O som NH sai quentinho pelo nariz, como em GALINHA!',
    prompt: 'Toque na figura com o som NH:',
    correctWord: 'Galinha',
    correctArtKey: 'galinha',
    options: [
      { word: 'Galinha', artKey: 'galinha' },
      { word: 'Vaca', artKey: 'vaca' },
      { word: 'Peixe', artKey: 'peixe' },
    ],
  },
  {
    id: 'ph-br',
    targetPhoneme: 'BR / BL',
    spokenHint: 'Junte os lábios e solte o som forte com R ou L, como em BORBOLETA!',
    prompt: 'Encontre a palavra com som suave de B:',
    correctWord: 'Borboleta',
    correctArtKey: 'borboleta',
    options: [
      { word: 'Borboleta', artKey: 'borboleta' },
      { word: 'Dado', artKey: 'dado' },
      { word: 'Sol', artKey: 'sol' },
    ],
  },
];

const SERVER_RHYME_ROUNDS = [
  {
    id: 'rh-pato',
    baseWord: 'Pato',
    baseArtKey: 'pato',
    correctRhyme: 'Gato',
    correctArtKey: 'gato',
    options: [
      { word: 'Gato', artKey: 'gato' },
      { word: 'Bola', artKey: 'bola' },
      { word: 'Mesa', artKey: 'mesa' },
    ],
    tip: 'Pato e Gato terminam igualzinho com ATO!',
  },
  {
    id: 'rh-mola',
    baseWord: 'Bola',
    baseArtKey: 'bola',
    correctRhyme: 'Escola',
    correctArtKey: 'escola',
    options: [
      { word: 'Escola', artKey: 'escola' },
      { word: 'Leão', artKey: 'leao' },
      { word: 'Uva', artKey: 'uva' },
    ],
    tip: 'Bola e Escola rimam com o som OLA!',
  },
  {
    id: 'rh-pao',
    baseWord: 'Pão',
    baseArtKey: 'pao',
    correctRhyme: 'Leão',
    correctArtKey: 'leao',
    options: [
      { word: 'Leão', artKey: 'leao' },
      { word: 'Casa', artKey: 'casa' },
      { word: 'Flor', artKey: 'flor' },
    ],
    tip: 'Pão e Leão têm o som final ÃO!',
  },
  {
    id: 'rh-fada',
    baseWord: 'Cama',
    baseArtKey: 'cama',
    correctRhyme: 'Mamãe',
    correctArtKey: 'mamae',
    options: [
      { word: 'Mamãe', artKey: 'mamae' },
      { word: 'Rato', artKey: 'rato' },
      { word: 'Sapo', artKey: 'sapo' },
    ],
    tip: 'Ouça o som nasal suave de Cama e Mamãe!',
  },
];

const SERVER_EXCLUSIVE_ACTIVITIES = [
  {
    id: 'prem-act-1',
    title: 'Respiração Guiada da Tartaruga',
    subtitle: 'Ritmo calmo antes de falar frases longas',
    phrase: 'Eu respiro fundo, sorrio e falo com calma.',
    tip: 'Inspire pelo nariz por 3 segundos e fale devagar sílaba por sílaba.',
    category: 'Atividades Exclusivas',
  },
  {
    id: 'prem-act-2',
    title: 'Trava-Língua Divertido do R',
    subtitle: 'Treino avançado de agilidade da ponta da língua',
    phrase: 'O rato roeu a roupa do rei de Roma rapidinho.',
    tip: 'Divida em partes menores primeiro e só depois junte tudo!',
    category: 'Atividades Exclusivas',
  },
  {
    id: 'prem-act-3',
    title: 'Expressão Completa de Pedido',
    subtitle: 'Comunicação gentil com frase expandida',
    phrase: 'Por favor, você pode me ajudar a guardar os brinquedos?',
    tip: 'Pratique mantendo contato visual e entonação amigável.',
    category: 'Atividades Exclusivas',
  },
  {
    id: 'prem-act-4',
    title: 'Narrativa de Rotina Matinal',
    subtitle: 'Sequência lógica em 3 etapas',
    phrase: 'Eu acordei cedo, escovei os dentes e tomei café.',
    tip: 'Conte nos dedos cada ação enquanto fala cada parte da frase.',
    category: 'Atividades Exclusivas',
  },
];

function buildDefaultContentClassificationMap(nowIso = new Date().toISOString()): Record<string, ServerContentClassificationEntry> {
  const map: Record<string, ServerContentClassificationEntry> = {};
  for (const item of SERVER_DEFAULT_CATALOG) {
    map[item.id] = {
      tier: item.defaultTier,
      updatedAt: nowIso,
    };
  }
  return map;
}

interface GatewayStore {
  sessionSecret: string;
  adminCreds: ServerAdminCreds;
  asaasConfig: ServerAsaasConfig;
  orders: ServerOrderRecord[];
  transactions: ServerTransactionRecord[];
  processedWebhookIds: string[];
  managedUsers: ServerManagedUserRecord[];
  subscriptions: ServerSubscriptionRecord[];
  adminAuditLogs: ServerAdminAuditLogRecord[];
  contentClassification: Record<string, ServerContentClassificationEntry>;
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
      defaultPlanValue: PREMIUM_MONTHLY_VALUE,
      defaultPlanDescription: 'FalaKids Premium - Assinatura Mensal',
      updatedAt: process.env.ASAAS_API_KEY ? new Date().toISOString() : null,
    },
    orders: [],
    transactions: [],
    processedWebhookIds: [],
    managedUsers: [],
    subscriptions: [],
    adminAuditLogs: [],
    contentClassification: buildDefaultContentClassificationMap(),
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

    const rawDefaultValue = Number(parsed.asaasConfig?.defaultPlanValue);
    const normalizedPlanValue =
      !Number.isFinite(rawDefaultValue) || Math.abs(rawDefaultValue - 29.9) < 0.001
        ? PREMIUM_MONTHLY_VALUE
        : rawDefaultValue;

    const existingClassification =
      parsed.contentClassification && typeof parsed.contentClassification === 'object'
        ? parsed.contentClassification
        : {};
    const nowIso = new Date().toISOString();
    const mergedClassification: Record<string, ServerContentClassificationEntry> = {};
    let classificationChanged = !parsed.contentClassification;

    for (const def of SERVER_DEFAULT_CATALOG) {
      const existing = existingClassification[def.id];
      const validTier: ServerContentTier | null =
        existing?.tier === 'GRATUITO' || existing?.tier === 'PREMIUM' ? existing.tier : null;
      if (!validTier) {
        classificationChanged = true;
      }
      mergedClassification[def.id] = {
        tier: def.lockedFree ? 'GRATUITO' : validTier || def.defaultTier,
        updatedAt: existing?.updatedAt || nowIso,
        updatedBy: existing?.updatedBy,
      };
    }

    const merged: GatewayStore = {
      sessionSecret: parsed.sessionSecret || fallback.sessionSecret,
      adminCreds: parsed.adminCreds?.email ? parsed.adminCreds : fallback.adminCreds,
      asaasConfig: {
        ...fallback.asaasConfig,
        ...(parsed.asaasConfig || {}),
        defaultPlanValue: normalizedPlanValue,
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
      subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : [],
      adminAuditLogs: Array.isArray(parsed.adminAuditLogs) ? parsed.adminAuditLogs : [],
      contentClassification: mergedClassification,
    };

    if (classificationChanged || normalizedPlanValue !== rawDefaultValue) {
      fs.writeFileSync(STORE_PATH, JSON.stringify(merged, null, 2), { mode: 0o600 });
    }

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

function appendServerAuditLog(
  store: GatewayStore,
  entry: {
    action: string;
    detail: string;
    actorEmail: string;
    actorName?: string;
    targetUserId?: string | null;
    targetUserEmail?: string | null;
  }
): void {
  const record: ServerAdminAuditLogRecord = {
    id: `log_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
    action: entry.action,
    detail: entry.detail,
    actorEmail: entry.actorEmail,
    actorName: entry.actorName,
    targetUserId: entry.targetUserId ?? null,
    targetUserEmail: entry.targetUserEmail ?? null,
    timestamp: new Date().toISOString(),
  };
  store.adminAuditLogs = [record, ...(store.adminAuditLogs || [])].slice(0, 500);
}

function formatDatePtBrServer(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const normalized = dateStr.length === 10 ? `${dateStr}T12:00:00` : dateStr;
  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('pt-BR');
}

function normalizeDateInputToIsoStart(raw?: string): string {
  const clean = String(raw || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return `${clean}T00:00:00.000Z`;
  }
  if (clean) {
    const parsed = new Date(clean);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  const today = getTodayDateISO();
  return `${today}T00:00:00.000Z`;
}

function buildAdminGrantFromInput(params: {
  duration?: AdminPremiumDuration;
  startDate?: string;
  expiresAt?: string | null;
  reason?: string;
  actorEmail: string;
  actorName?: string;
}): { ok: true; grant: ServerAdminPremiumGrant } | { ok: false; error: string } {
  const duration: AdminPremiumDuration =
    params.duration === '30_days' ||
    params.duration === '90_days' ||
    params.duration === '6_months' ||
    params.duration === 'permanent' ||
    params.duration === 'custom'
      ? params.duration
      : '30_days';

  const startDateIso = normalizeDateInputToIsoStart(params.startDate);
  const startBase = new Date(startDateIso);
  const reason = String(params.reason || '').trim() || 'Concessão administrativa manual';

  if (duration === 'permanent') {
    return {
      ok: true,
      grant: {
        active: true,
        duration: 'permanent',
        durationLabel: 'Acesso permanente',
        isPermanent: true,
        startDate: startDateIso,
        expiresAt: null,
        reason,
        grantedByEmail: params.actorEmail,
        grantedByName: params.actorName,
        grantedAt: new Date().toISOString(),
        revokedAt: null,
        revokedByEmail: null,
        revokeReason: null,
      },
    };
  }

  let expirationIso: string;
  let durationLabel = 'Personalizado';

  if (params.expiresAt && String(params.expiresAt).trim()) {
    const rawExp = String(params.expiresAt).trim();
    expirationIso = /^\d{4}-\d{2}-\d{2}$/.test(rawExp)
      ? `${rawExp}T23:59:59.999Z`
      : new Date(rawExp).toISOString();
    if (Number.isNaN(new Date(expirationIso).getTime())) {
      return { ok: false, error: 'Data de expiração inválida.' };
    }
    if (duration === '30_days') durationLabel = '30 dias';
    else if (duration === '90_days') durationLabel = '90 dias';
    else if (duration === '6_months') durationLabel = '6 meses';
  } else {
    const exp = new Date(startBase.getTime());
    if (duration === '30_days') {
      exp.setUTCDate(exp.getUTCDate() + 30);
      durationLabel = '30 dias';
    } else if (duration === '90_days') {
      exp.setUTCDate(exp.getUTCDate() + 90);
      durationLabel = '90 dias';
    } else if (duration === '6_months') {
      exp.setUTCMonth(exp.getUTCMonth() + 6);
      durationLabel = '6 meses';
    } else {
      return { ok: false, error: 'Informe a data de expiração para duração personalizada.' };
    }
    exp.setUTCHours(23, 59, 59, 999);
    expirationIso = exp.toISOString();
  }

  if (new Date(expirationIso).getTime() <= startBase.getTime()) {
    return {
      ok: false,
      error: 'A data de expiração deve ser posterior à data de início.',
    };
  }

  return {
    ok: true,
    grant: {
      active: true,
      duration,
      durationLabel,
      isPermanent: false,
      startDate: startDateIso,
      expiresAt: expirationIso,
      reason,
      grantedByEmail: params.actorEmail,
      grantedByName: params.actorName,
      grantedAt: new Date().toISOString(),
      revokedAt: null,
      revokedByEmail: null,
      revokeReason: null,
    },
  };
}

function isAdminGrantCurrentlyActive(grant?: ServerAdminPremiumGrant | null): boolean {
  if (!grant || !grant.active || grant.revokedAt) return false;
  if (grant.isPermanent || !grant.expiresAt) return true;
  const expMs = new Date(grant.expiresAt).getTime();
  return Number.isFinite(expMs) && expMs > Date.now();
}

function findMatchingManagedUser(
  store: GatewayStore,
  subscriberId?: string,
  childAccountId?: string,
  email?: string
): ServerManagedUserRecord | null {
  const cleanEmail = email?.trim().toLowerCase();
  return (
    store.managedUsers.find(
      (u) =>
        (subscriberId && u.subscriberId === subscriberId) ||
        (childAccountId && (u.childAccountId === childAccountId || u.id === childAccountId)) ||
        (cleanEmail && u.email.toLowerCase() === cleanEmail)
    ) || null
  );
}

function findSubscriptionForUser(
  store: GatewayStore,
  user: ServerManagedUserRecord
): ServerSubscriptionRecord | null {
  const cleanEmail = user.email.trim().toLowerCase();
  const matches = store.subscriptions.filter(
    (s) =>
      (user.subscriberId && s.subscriberId === user.subscriberId) ||
      (user.childAccountId && s.childAccountId === user.childAccountId) ||
      (cleanEmail && s.customerEmail.toLowerCase() === cleanEmail)
  );
  if (matches.length === 0) return null;
  const priorityOrder: Record<ServerSubscriptionStatus, number> = {
    ACTIVE: 4,
    PENDING: 3,
    OVERDUE: 2,
    CANCELED: 1,
  };
  return [...matches].sort((a, b) => {
    const pDiff = priorityOrder[b.status] - priorityOrder[a.status];
    if (pDiff !== 0) return pDiff;
    return b.updatedAt.localeCompare(a.updatedAt);
  })[0];
}

function computeUserAccessState(store: GatewayStore, user: ServerManagedUserRecord): {
  accessBadge: UserAccessBadge;
  planLabel: 'FalaKids Gratuito' | 'FalaKids Premium';
  accessType: string;
  premiumValidityLabel: string;
  hasEffectivePremium: boolean;
  paidSub: ServerSubscriptionRecord | null;
} {
  const paidSub = findSubscriptionForUser(store, user);
  const grant = user.adminPremiumGrant || null;
  const grantActive = isAdminGrantCurrentlyActive(grant);
  const grantExpired = Boolean(
    grant &&
      grant.active &&
      !grant.revokedAt &&
      !grant.isPermanent &&
      grant.expiresAt &&
      new Date(grant.expiresAt).getTime() <= Date.now()
  );

  if (user.status === 'blocked') {
    return {
      accessBadge: 'BLOQUEADO',
      planLabel: 'FalaKids Gratuito',
      accessType: 'Conta Bloqueada',
      premiumValidityLabel: 'Acesso suspenso',
      hasEffectivePremium: false,
      paidSub,
    };
  }

  if (paidSub && paidSub.status === 'ACTIVE') {
    return {
      accessBadge: 'PREMIUM PAGO',
      planLabel: 'FalaKids Premium',
      accessType: 'Assinatura Paga',
      premiumValidityLabel: paidSub.nextDueDate
        ? `Renovação em ${formatDatePtBrServer(paidSub.nextDueDate)}`
        : 'Assinatura ativa',
      hasEffectivePremium: true,
      paidSub,
    };
  }

  if (grant && grantActive) {
    return {
      accessBadge: 'PREMIUM ADMINISTRATIVO',
      planLabel: 'FalaKids Premium',
      accessType: 'Concessão Administrativa',
      premiumValidityLabel: grant.isPermanent
        ? 'Acesso permanente'
        : `Até ${formatDatePtBrServer(grant.expiresAt)}`,
      hasEffectivePremium: true,
      paidSub,
    };
  }

  if (grant && grant.revokedAt) {
    return {
      accessBadge: 'PREMIUM REVOGADO',
      planLabel: 'FalaKids Gratuito',
      accessType: 'Premium Revogado',
      premiumValidityLabel: `Revogado em ${formatDatePtBrServer(grant.revokedAt)}`,
      hasEffectivePremium: false,
      paidSub,
    };
  }

  if (grantExpired) {
    return {
      accessBadge: 'PREMIUM EXPIRADO',
      planLabel: 'FalaKids Gratuito',
      accessType: 'Concessão Expirada',
      premiumValidityLabel: `Expirou em ${formatDatePtBrServer(grant?.expiresAt)}`,
      hasEffectivePremium: false,
      paidSub,
    };
  }

  if (paidSub && (paidSub.status === 'OVERDUE' || paidSub.status === 'CANCELED')) {
    return {
      accessBadge: 'PREMIUM EXPIRADO',
      planLabel: 'FalaKids Gratuito',
      accessType: paidSub.status === 'OVERDUE' ? 'Assinatura Vencida' : 'Assinatura Cancelada',
      premiumValidityLabel: paidSub.canceledAt
        ? `Cancelada em ${formatDatePtBrServer(paidSub.canceledAt)}`
        : 'Inativo / Expirado',
      hasEffectivePremium: false,
      paidSub,
    };
  }

  return {
    accessBadge: 'GRATUITO',
    planLabel: 'FalaKids Gratuito',
    accessType: 'Gratuito',
    premiumValidityLabel: '—',
    hasEffectivePremium: false,
    paidSub,
  };
}

function sanitizeManagedUserForAdmin(store: GatewayStore, user: ServerManagedUserRecord) {
  const computed = computeUserAccessState(store, user);
  const { passwordHash: _omitPasswordHash, ...safeFields } = user;
  return {
    ...safeFields,
    accountType: user.accountType || 'responsavel',
    passwordSetupInvite: Boolean(user.passwordSetupInvite),
    adminPremiumGrant: user.adminPremiumGrant || null,
    paidSubscription: computed.paidSub
      ? {
          id: computed.paidSub.id,
          status: computed.paidSub.status,
          billingType: computed.paidSub.billingType,
          value: computed.paidSub.value,
          nextDueDate: computed.paidSub.nextDueDate,
          startedAt: computed.paidSub.startedAt,
          activatedAt: computed.paidSub.activatedAt,
          canceledAt: computed.paidSub.canceledAt,
        }
      : null,
    accessBadge: computed.accessBadge,
    planLabel: computed.planLabel,
    accessType: computed.accessType,
    premiumValidityLabel: computed.premiumValidityLabel,
    hasEffectivePremium: computed.hasEffectivePremium,
  };
}

function computeAdminDashboardMetrics(store: GatewayStore) {
  let freeUsers = 0;
  let paidPremiumUsers = 0;
  let adminPremiumUsers = 0;
  let blockedUsers = 0;
  let expiredSubscriptions = 0;
  let revokedUsers = 0;
  let activeUsers = 0;

  for (const user of store.managedUsers) {
    if (user.status === 'active') activeUsers += 1;
    const state = computeUserAccessState(store, user);
    switch (state.accessBadge) {
      case 'BLOQUEADO':
        blockedUsers += 1;
        break;
      case 'PREMIUM PAGO':
        paidPremiumUsers += 1;
        break;
      case 'PREMIUM ADMINISTRATIVO':
        adminPremiumUsers += 1;
        break;
      case 'PREMIUM EXPIRADO':
        expiredSubscriptions += 1;
        freeUsers += 1;
        break;
      case 'PREMIUM REVOGADO':
        revokedUsers += 1;
        freeUsers += 1;
        break;
      case 'GRATUITO':
      default:
        freeUsers += 1;
        break;
    }
  }

  // Count orphan overdue/canceled subscriptions not matched to a managedUser if any
  const matchedSubIds = new Set<string>();
  for (const user of store.managedUsers) {
    const sub = findSubscriptionForUser(store, user);
    if (sub) matchedSubIds.add(sub.id);
  }
  for (const sub of store.subscriptions) {
    if (!matchedSubIds.has(sub.id) && (sub.status === 'OVERDUE' || sub.status === 'CANCELED')) {
      expiredSubscriptions += 1;
    }
  }

  // Real received revenue strictly from confirmed/received real gateway payments (deduplicated by asaasPaymentId).
  // Administrative grants NEVER generate payment records or count toward revenue.
  const countedPaymentIds = new Set<string>();
  let receivedRevenueBRL = 0;

  for (const sub of store.subscriptions) {
    for (const p of sub.payments || []) {
      if (isPaidStatus(p.status) && p.asaasPaymentId && !countedPaymentIds.has(p.asaasPaymentId)) {
        countedPaymentIds.add(p.asaasPaymentId);
        receivedRevenueBRL += Number(p.value || 0);
      }
    }
  }
  for (const order of store.orders) {
    if (
      isPaidStatus(order.status) &&
      order.asaasPaymentId &&
      !countedPaymentIds.has(order.asaasPaymentId)
    ) {
      countedPaymentIds.add(order.asaasPaymentId);
      receivedRevenueBRL += Number(order.value || 0);
    }
  }

  return {
    totalUsers: store.managedUsers.length,
    freeUsers,
    paidPremiumUsers,
    adminPremiumUsers,
    blockedUsers,
    expiredSubscriptions,
    revokedUsers,
    receivedRevenueBRL: Number(receivedRevenueBRL.toFixed(2)),
    commercialPlanPriceBRL: PREMIUM_MONTHLY_VALUE,
    activeUsers,
  };
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
  const cleanEmail = params.email?.trim().toLowerCase() || null;
  const cleanChildName = params.childName?.trim() || 'Pequeno Explorador';
  const cleanChildAge = Math.min(12, Math.max(2, Number(params.childAge) || 5));
  const cleanStars = Math.max(0, Number(params.starsCount) || 0);
  const cleanActivities = Math.max(0, Number(params.activitiesCount) || 0);

  const idx = store.managedUsers.findIndex(
    (u) =>
      u.subscriberId === params.subscriberId ||
      (cleanChildId && (u.childAccountId === cleanChildId || u.id === cleanChildId)) ||
      (cleanEmail && u.email.toLowerCase() === cleanEmail)
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
      guardianName: params.guardianName?.trim() || current.guardianName,
      email: cleanEmail || current.email,
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
      cleanEmail ||
      linkedOrder?.customerEmail?.toLowerCase() ||
      `conta-${params.subscriberId.slice(-6)}@falamelhor.app`,
    accountType: 'responsavel',
    childName: cleanChildName,
    childAge: cleanChildAge,
    status: 'active',
    passwordSetupInvite: false,
    starsCount: cleanStars,
    activitiesCount: cleanActivities,
    createdAt: nowIso,
    lastAccessAt: nowIso,
    updatedAt: nowIso,
    notes: 'Conta sincronizada automaticamente.',
    adminPremiumGrant: null,
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

    appendServerAuditLog(store, {
      action: 'Login administrativo',
      detail: `Sessão administrativa iniciada por ${store.adminCreds.email}`,
      actorEmail: store.adminCreds.email,
      actorName: store.adminCreds.name,
    });
    saveStore(store);

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
    const adminActor = (req as Request & { adminUser?: { email: string; name: string } }).adminUser;
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
    appendServerAuditLog(store, {
      action: 'Credenciais administrativas atualizadas',
      detail: `Dados de acesso atualizados para ${cleanEmail}`,
      actorEmail: adminActor?.email || cleanEmail,
      actorName: adminActor?.name || cleanName,
    });
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
            'PAYMENT_CHARGEBACK_REQUESTED',
            'SUBSCRIPTION_CREATED',
            'SUBSCRIPTION_UPDATED',
            'SUBSCRIPTION_INACTIVATED',
            'SUBSCRIPTION_DELETED',
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

  // --- Protected Admin User & Premium Management ---
  app.get('/api/admin/dashboard', requireAdmin, (_req, res) => {
    const store = ensureStoreLoaded();
    res.json({
      metrics: computeAdminDashboardMetrics(store),
      auditLogs: store.adminAuditLogs || [],
    });
  });

  app.get('/api/admin/audit-logs', requireAdmin, (_req, res) => {
    const store = ensureStoreLoaded();
    res.json({ auditLogs: store.adminAuditLogs || [] });
  });

  app.get('/api/admin/users', requireAdmin, (_req, res) => {
    const store = ensureStoreLoaded();
    const sorted = [...store.managedUsers]
      .sort((a, b) => (b.lastAccessAt || b.createdAt).localeCompare(a.lastAccessAt || a.createdAt))
      .map((u) => sanitizeManagedUserForAdmin(store, u));
    res.json({
      users: sorted,
      metrics: computeAdminDashboardMetrics(store),
      auditLogs: store.adminAuditLogs || [],
    });
  });

  app.post('/api/admin/users', requireAdmin, (req, res) => {
    const store = ensureStoreLoaded();
    const adminActor = (req as Request & { adminUser?: { email: string; name: string } }).adminUser!;
    const body = (req.body || {}) as {
      guardianName?: string;
      email?: string;
      accountType?: AdminAccountType;
      childName?: string;
      childAge?: number;
      status?: ManagedUserStatus;
      plan?: 'free' | 'premium';
      passwordMode?: 'provisional' | 'invite';
      password?: string;
      passwordHash?: string;
      notes?: string;
      premiumGrant?: {
        duration?: AdminPremiumDuration;
        startDate?: string;
        expiresAt?: string | null;
        reason?: string;
      };
    };

    const guardianName = String(body.guardianName || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const childName = String(body.childName || '').trim() || 'Pequeno Explorador';

    if (!guardianName || !email) {
      res.status(400).json({ error: 'Preencha o nome completo e o e-mail.' });
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

    const passwordMode = body.passwordMode === 'invite' ? 'invite' : 'provisional';
    const rawPassword = typeof body.password === 'string' ? body.password.trim() : '';
    let finalHash: string | undefined;
    let passwordSetupInvite = false;

    if (passwordMode === 'invite') {
      passwordSetupInvite = true;
      finalHash = undefined;
    } else {
      finalHash =
        rawPassword.length >= 4
          ? hashPassword(rawPassword)
          : typeof body.passwordHash === 'string' && body.passwordHash.trim()
          ? body.passwordHash.trim()
          : undefined;

      if (!finalHash) {
        res.status(400).json({
          error: 'Informe uma senha provisória de pelo menos 4 caracteres ou selecione convite para definir senha.',
        });
        return;
      }
    }

    const accountType: AdminAccountType =
      body.accountType === 'educador' ||
      body.accountType === 'clinica' ||
      body.accountType === 'convidado'
        ? body.accountType
        : 'responsavel';

    let initialGrant: ServerAdminPremiumGrant | null = null;
    if (body.plan === 'premium') {
      const built = buildAdminGrantFromInput({
        duration: body.premiumGrant?.duration || '30_days',
        startDate: body.premiumGrant?.startDate,
        expiresAt: body.premiumGrant?.expiresAt,
        reason:
          body.premiumGrant?.reason || 'Concessão administrativa no cadastro manual',
        actorEmail: adminActor.email,
        actorName: adminActor.name,
      });
      if (!built.ok) {
        res.status(400).json({ error: built.error });
        return;
      }
      initialGrant = built.grant;
    }

    const nowIso = new Date().toISOString();
    const status: ManagedUserStatus = body.status === 'blocked' ? 'blocked' : 'active';
    const newUser: ServerManagedUserRecord = {
      id: `usr_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      subscriberId: null,
      childAccountId: `child_${crypto.randomBytes(6).toString('hex')}`,
      guardianName,
      email,
      accountType,
      childName,
      childAge: Math.min(12, Math.max(2, Number(body.childAge) || 5)),
      status,
      passwordSetupInvite,
      starsCount: 0,
      activitiesCount: 0,
      createdAt: nowIso,
      lastAccessAt: nowIso,
      updatedAt: nowIso,
      notes: body.notes?.trim() || undefined,
      passwordHash: finalHash,
      adminPremiumGrant: initialGrant,
    };

    store.managedUsers = [newUser, ...store.managedUsers].slice(0, 500);
    appendServerAuditLog(store, {
      action: 'Usuário adicionado manualmente',
      detail: `${newUser.guardianName} (${newUser.email}) cadastrado como ${accountType}${
        initialGrant ? ` com Premium Administrativo (${initialGrant.durationLabel})` : ' no plano Gratuito'
      }.`,
      actorEmail: adminActor.email,
      actorName: adminActor.name,
      targetUserId: newUser.id,
      targetUserEmail: newUser.email,
    });
    saveStore(store);

    res.status(201).json({
      user: sanitizeManagedUserForAdmin(store, newUser),
      metrics: computeAdminDashboardMetrics(store),
      auditLogs: store.adminAuditLogs,
    });
  });

  app.patch('/api/admin/users/:id', requireAdmin, (req, res) => {
    const store = ensureStoreLoaded();
    const adminActor = (req as Request & { adminUser?: { email: string; name: string } }).adminUser!;
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
      accountType?: AdminAccountType;
      childName?: string;
      childAge?: number;
      status?: ManagedUserStatus;
      plan?: 'free' | 'premium';
      passwordMode?: 'keep' | 'provisional' | 'invite';
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
    let nextPasswordInvite = Boolean(current.passwordSetupInvite);

    if (body.passwordMode === 'invite') {
      nextPasswordInvite = true;
    } else if (rawPassword.length > 0) {
      if (rawPassword.length < 4) {
        res.status(400).json({ error: 'A nova senha deve ter pelo menos 4 caracteres.' });
        return;
      }
      nextPasswordHash = hashPassword(rawPassword);
      nextPasswordInvite = false;
    } else if (typeof body.passwordHash === 'string' && body.passwordHash.trim()) {
      nextPasswordHash = body.passwordHash.trim();
      nextPasswordInvite = false;
    }

    const nextAccountType: AdminAccountType =
      body.accountType === 'responsavel' ||
      body.accountType === 'educador' ||
      body.accountType === 'clinica' ||
      body.accountType === 'convidado'
        ? body.accountType
        : current.accountType || 'responsavel';

    const nextStatus: ManagedUserStatus =
      body.status === 'active' || body.status === 'blocked' ? body.status : current.status;

    const nowIso = new Date().toISOString();
    let nextGrant = current.adminPremiumGrant || null;
    if (body.plan === 'free' && nextGrant && nextGrant.active && !nextGrant.revokedAt) {
      nextGrant = {
        ...nextGrant,
        active: false,
        revokedAt: nowIso,
        revokedByEmail: adminActor.email,
        revokeReason: 'Alteração administrativa para plano Gratuito',
      };
    } else if (body.plan === 'premium' && !isAdminGrantCurrentlyActive(nextGrant)) {
      const built = buildAdminGrantFromInput({
        duration: '30_days',
        reason: 'Alteração administrativa de plano para Premium',
        actorEmail: adminActor.email,
        actorName: adminActor.name,
      });
      if (built.ok) nextGrant = built.grant;
    }

    const updated: ServerManagedUserRecord = {
      ...current,
      guardianName: nextGuardian,
      email: nextEmail,
      accountType: nextAccountType,
      childName: nextChildName,
      childAge:
        body.childAge !== undefined
          ? Math.min(12, Math.max(2, Number(body.childAge) || current.childAge))
          : current.childAge,
      status: nextStatus,
      passwordSetupInvite: nextPasswordInvite,
      notes:
        body.notes !== undefined ? body.notes.trim() || undefined : current.notes,
      passwordHash: nextPasswordHash,
      adminPremiumGrant: nextGrant,
      updatedAt: nowIso,
    };

    store.managedUsers[idx] = updated;
    appendServerAuditLog(store, {
      action: 'Cadastro editado',
      detail: `Dados atualizados para ${updated.guardianName} (${updated.email})${
        body.plan ? ` · Plano ajustado para ${body.plan === 'premium' ? 'Premium' : 'Gratuito'}` : ''
      }.`,
      actorEmail: adminActor.email,
      actorName: adminActor.name,
      targetUserId: updated.id,
      targetUserEmail: updated.email,
    });
    saveStore(store);

    res.json({
      user: sanitizeManagedUserForAdmin(store, updated),
      metrics: computeAdminDashboardMetrics(store),
      auditLogs: store.adminAuditLogs,
    });
  });

  app.post('/api/admin/users/:id/grant-premium', requireAdmin, (req, res) => {
    const store = ensureStoreLoaded();
    const adminActor = (req as Request & { adminUser?: { email: string; name: string } }).adminUser!;
    const userId = String(req.params.id || '').trim();
    const idx = store.managedUsers.findIndex((u) => u.id === userId);
    if (idx < 0) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    const body = (req.body || {}) as {
      duration?: AdminPremiumDuration;
      startDate?: string;
      expiresAt?: string | null;
      reason?: string;
    };

    const built = buildAdminGrantFromInput({
      duration: body.duration,
      startDate: body.startDate,
      expiresAt: body.expiresAt,
      reason: body.reason,
      actorEmail: adminActor.email,
      actorName: adminActor.name,
    });

    if (!built.ok) {
      res.status(400).json({ error: built.error });
      return;
    }

    const current = store.managedUsers[idx];
    const nowIso = new Date().toISOString();
    const updated: ServerManagedUserRecord = {
      ...current,
      adminPremiumGrant: built.grant,
      updatedAt: nowIso,
    };
    store.managedUsers[idx] = updated;

    appendServerAuditLog(store, {
      action: 'Premium administrativo liberado',
      detail: `${updated.guardianName} (${updated.email}) recebeu FalaKids Premium (${built.grant.durationLabel}${
        built.grant.expiresAt ? ` até ${formatDatePtBrServer(built.grant.expiresAt)}` : ''
      }) · Motivo: ${built.grant.reason}. Sem cobrança gerada.`,
      actorEmail: adminActor.email,
      actorName: adminActor.name,
      targetUserId: updated.id,
      targetUserEmail: updated.email,
    });
    saveStore(store);

    res.json({
      user: sanitizeManagedUserForAdmin(store, updated),
      metrics: computeAdminDashboardMetrics(store),
      auditLogs: store.adminAuditLogs,
    });
  });

  app.post('/api/admin/users/:id/revoke-premium', requireAdmin, (req, res) => {
    const store = ensureStoreLoaded();
    const adminActor = (req as Request & { adminUser?: { email: string; name: string } }).adminUser!;
    const userId = String(req.params.id || '').trim();
    const idx = store.managedUsers.findIndex((u) => u.id === userId);
    if (idx < 0) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    const current = store.managedUsers[idx];
    const body = (req.body || {}) as { reason?: string };
    const revokeReason = String(body.reason || '').trim() || 'Revogação administrativa manual';
    const nowIso = new Date().toISOString();

    const updated: ServerManagedUserRecord = {
      ...current,
      adminPremiumGrant: current.adminPremiumGrant
        ? {
            ...current.adminPremiumGrant,
            active: false,
            revokedAt: nowIso,
            revokedByEmail: adminActor.email,
            revokeReason,
          }
        : {
            active: false,
            duration: 'custom',
            durationLabel: 'Revogado',
            isPermanent: false,
            startDate: nowIso,
            expiresAt: nowIso,
            reason: revokeReason,
            grantedByEmail: adminActor.email,
            grantedByName: adminActor.name,
            grantedAt: nowIso,
            revokedAt: nowIso,
            revokedByEmail: adminActor.email,
            revokeReason,
          },
      updatedAt: nowIso,
    };
    store.managedUsers[idx] = updated;

    appendServerAuditLog(store, {
      action: 'Premium revogado',
      detail: `Acesso Premium administrativo revogado para ${updated.guardianName} (${updated.email}) · Motivo: ${revokeReason}.`,
      actorEmail: adminActor.email,
      actorName: adminActor.name,
      targetUserId: updated.id,
      targetUserEmail: updated.email,
    });
    saveStore(store);

    res.json({
      user: sanitizeManagedUserForAdmin(store, updated),
      metrics: computeAdminDashboardMetrics(store),
      auditLogs: store.adminAuditLogs,
    });
  });

  app.post('/api/admin/users/:id/block', requireAdmin, (req, res) => {
    const store = ensureStoreLoaded();
    const adminActor = (req as Request & { adminUser?: { email: string; name: string } }).adminUser!;
    const userId = String(req.params.id || '').trim();
    const idx = store.managedUsers.findIndex((u) => u.id === userId);
    if (idx < 0) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }
    const current = store.managedUsers[idx];
    const nowIso = new Date().toISOString();
    const updated: ServerManagedUserRecord = {
      ...current,
      status: 'blocked',
      updatedAt: nowIso,
    };
    store.managedUsers[idx] = updated;
    appendServerAuditLog(store, {
      action: 'Usuário bloqueado',
      detail: `Acesso bloqueado para ${updated.guardianName} (${updated.email}).`,
      actorEmail: adminActor.email,
      actorName: adminActor.name,
      targetUserId: updated.id,
      targetUserEmail: updated.email,
    });
    saveStore(store);

    res.json({
      user: sanitizeManagedUserForAdmin(store, updated),
      metrics: computeAdminDashboardMetrics(store),
      auditLogs: store.adminAuditLogs,
    });
  });

  app.post('/api/admin/users/:id/unblock', requireAdmin, (req, res) => {
    const store = ensureStoreLoaded();
    const adminActor = (req as Request & { adminUser?: { email: string; name: string } }).adminUser!;
    const userId = String(req.params.id || '').trim();
    const idx = store.managedUsers.findIndex((u) => u.id === userId);
    if (idx < 0) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }
    const current = store.managedUsers[idx];
    const nowIso = new Date().toISOString();
    const updated: ServerManagedUserRecord = {
      ...current,
      status: 'active',
      updatedAt: nowIso,
    };
    store.managedUsers[idx] = updated;
    appendServerAuditLog(store, {
      action: 'Usuário desbloqueado',
      detail: `Acesso reativado para ${updated.guardianName} (${updated.email}).`,
      actorEmail: adminActor.email,
      actorName: adminActor.name,
      targetUserId: updated.id,
      targetUserEmail: updated.email,
    });
    saveStore(store);

    res.json({
      user: sanitizeManagedUserForAdmin(store, updated),
      metrics: computeAdminDashboardMetrics(store),
      auditLogs: store.adminAuditLogs,
    });
  });

  app.get('/api/admin/users/:id/history', requireAdmin, (req, res) => {
    const store = ensureStoreLoaded();
    const userId = String(req.params.id || '').trim();
    const user = store.managedUsers.find((u) => u.id === userId);
    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }

    const sanitized = sanitizeManagedUserForAdmin(store, user);
    const cleanEmail = user.email.toLowerCase();
    const userAuditLogs = (store.adminAuditLogs || []).filter(
      (log) =>
        log.targetUserId === user.id ||
        (log.targetUserEmail && log.targetUserEmail.toLowerCase() === cleanEmail)
    );
    const sub = findSubscriptionForUser(store, user);
    const payments = (sub?.payments || []).map((p) => ({
      id: p.id,
      asaasPaymentId: p.asaasPaymentId,
      value: p.value,
      billingType: p.billingType,
      status: p.status,
      dueDate: p.dueDate,
      paidAt: p.paidAt,
      description: p.description,
      invoiceUrl: p.invoiceUrl,
    }));

    res.json({
      user: sanitized,
      auditLogs: userAuditLogs,
      payments,
    });
  });

  app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
    const store = ensureStoreLoaded();
    const adminActor = (req as Request & { adminUser?: { email: string; name: string } }).adminUser!;
    const userId = String(req.params.id || '').trim();
    const idx = store.managedUsers.findIndex((u) => u.id === userId);
    if (idx < 0) {
      res.status(404).json({ error: 'Usuário não encontrado.' });
      return;
    }
    const target = store.managedUsers[idx];
    store.managedUsers.splice(idx, 1);
    appendServerAuditLog(store, {
      action: 'Usuário excluído',
      detail: `Conta removida permanentemente: ${target.guardianName} (${target.email}).`,
      actorEmail: adminActor.email,
      actorName: adminActor.name,
      targetUserId: target.id,
      targetUserEmail: target.email,
    });
    saveStore(store);
    res.json({
      deleted: true,
      id: userId,
      metrics: computeAdminDashboardMetrics(store),
      auditLogs: store.adminAuditLogs,
    });
  });

  // --- Authoritative Content Classification Catalog (Admin + Public) ---
  function getEffectiveItemTier(store: GatewayStore, def: ServerCatalogItemDefinition): ServerContentTier {
    if (def.lockedFree) return 'GRATUITO';
    const entry = store.contentClassification?.[def.id];
    if (entry?.tier === 'GRATUITO' || entry?.tier === 'PREMIUM') {
      return entry.tier;
    }
    return def.defaultTier;
  }

  function buildCatalogSummaryCounts(items: { category: ServerContentCategory; tier: ServerContentTier }[]) {
    const byCategory: Record<ServerContentCategory, { total: number; free: number; premium: number }> = {
      module: { total: 0, free: 0, premium: 0 },
      activity: { total: 0, free: 0, premium: 0 },
      game: { total: 0, free: 0, premium: 0 },
      story: { total: 0, free: 0, premium: 0 },
    };
    let free = 0;
    let premium = 0;
    for (const item of items) {
      byCategory[item.category].total += 1;
      if (item.tier === 'PREMIUM') {
        premium += 1;
        byCategory[item.category].premium += 1;
      } else {
        free += 1;
        byCategory[item.category].free += 1;
      }
    }
    return {
      total: items.length,
      free,
      premium,
      byCategory,
    };
  }

  app.get('/api/admin/content-catalog', requireAdmin, (_req, res) => {
    const store = ensureStoreLoaded();
    const items = SERVER_DEFAULT_CATALOG.map((def) => {
      const tier = getEffectiveItemTier(store, def);
      return {
        id: def.id,
        category: def.category,
        title: def.title,
        subtitle: def.subtitle,
        tier,
        unlocked: true,
        accessReason: tier === 'GRATUITO' ? ('free' as const) : ('admin_grant' as const),
        order: def.order,
        lockedFree: Boolean(def.lockedFree),
        meta: def.meta,
        updatedAt: store.contentClassification?.[def.id]?.updatedAt,
      };
    });

    res.json({
      monthlyValue: PREMIUM_MONTHLY_VALUE,
      counts: buildCatalogSummaryCounts(items),
      items,
      auditLogs: store.adminAuditLogs,
    });
  });

  app.patch('/api/admin/content-catalog/:id', requireAdmin, (req, res) => {
    const store = ensureStoreLoaded();
    const adminActor = (req as Request & { adminUser?: { email: string; name: string } }).adminUser!;
    const itemId = String(req.params.id || '').trim();
    const body = (req.body || {}) as { tier?: string };
    const nextTier: ServerContentTier | null =
      body.tier === 'GRATUITO' || body.tier === 'PREMIUM' ? body.tier : null;

    if (!nextTier) {
      res.status(400).json({ error: 'Classificação inválida. Utilize GRATUITO ou PREMIUM.' });
      return;
    }

    const def = SERVER_DEFAULT_CATALOG.find((item) => item.id === itemId);
    if (!def) {
      res.status(404).json({ error: 'Conteúdo não encontrado no catálogo.' });
      return;
    }

    if (def.lockedFree && nextTier === 'PREMIUM') {
      res.status(400).json({
        error: 'A Anatomia 3D do Trato Vocal permanece gratuita conforme política do FalaKids.',
      });
      return;
    }

    const currentTier = getEffectiveItemTier(store, def);
    const simulated = SERVER_DEFAULT_CATALOG.map((item) => ({
      id: item.id,
      tier: item.id === itemId ? nextTier : getEffectiveItemTier(store, item),
    }));
    const freeAfter = simulated.filter((x) => x.tier === 'GRATUITO').length;
    const premiumAfter = simulated.filter((x) => x.tier === 'PREMIUM').length;

    if (freeAfter === 0) {
      res.status(400).json({
        error: 'Não é permitido classificar todos os conteúdos como PREMIUM.',
      });
      return;
    }
    if (premiumAfter === 0) {
      res.status(400).json({
        error: 'Não é permitido classificar todos os conteúdos como GRATUITO.',
      });
      return;
    }

    const nowIso = new Date().toISOString();
    store.contentClassification[def.id] = {
      tier: nextTier,
      updatedAt: nowIso,
      updatedBy: adminActor.email,
    };

    if (currentTier !== nextTier) {
      appendServerAuditLog(store, {
        action: 'Classificação de conteúdo alterada',
        detail: `${def.title} (${def.category}) alterado de ${currentTier} para ${nextTier}.`,
        actorEmail: adminActor.email,
        actorName: adminActor.name,
      });
    }
    saveStore(store);

    const items = SERVER_DEFAULT_CATALOG.map((item) => {
      const tier = getEffectiveItemTier(store, item);
      return {
        id: item.id,
        category: item.category,
        title: item.title,
        subtitle: item.subtitle,
        tier,
        unlocked: true,
        accessReason: tier === 'GRATUITO' ? ('free' as const) : ('admin_grant' as const),
        order: item.order,
        lockedFree: Boolean(item.lockedFree),
        meta: item.meta,
        updatedAt: store.contentClassification?.[item.id]?.updatedAt,
      };
    });

    res.json({
      monthlyValue: PREMIUM_MONTHLY_VALUE,
      counts: buildCatalogSummaryCounts(items),
      items,
      auditLogs: store.adminAuditLogs,
    });
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

  // --- Premium Subscriptions (Server-Authoritative Asaas Integration) ---
  const pendingSubscriptionCreates = new Map<
    string,
    Promise<{ ok: true; sub: ServerSubscriptionRecord } | { ok: false; status: number; error: string }>
  >();

  function findLatestSubscription(
    store: GatewayStore,
    subscriberId: string,
    childAccountId?: string
  ): ServerSubscriptionRecord | null {
    const matches = store.subscriptions.filter(
      (s) =>
        s.subscriberId === subscriberId ||
        (childAccountId && s.childAccountId && s.childAccountId === childAccountId)
    );
    if (matches.length === 0) return null;
    const priorityOrder: Record<ServerSubscriptionStatus, number> = {
      ACTIVE: 4,
      PENDING: 3,
      OVERDUE: 2,
      CANCELED: 1,
    };
    return [...matches].sort((a, b) => {
      const pDiff = priorityOrder[b.status] - priorityOrder[a.status];
      if (pDiff !== 0) return pDiff;
      return b.updatedAt.localeCompare(a.updatedAt);
    })[0];
  }

  function hasActivePremiumAccess(
    store: GatewayStore,
    subscriberId: string,
    childAccountId?: string
  ): boolean {
    if (isUserBlockedOnServer(store, subscriberId, childAccountId)) return false;
    const sub = findLatestSubscription(store, subscriberId, childAccountId);
    if (sub && sub.status === 'ACTIVE') return true;
    const matchedUser = findMatchingManagedUser(store, subscriberId, childAccountId);
    return Boolean(matchedUser && isAdminGrantCurrentlyActive(matchedUser.adminPremiumGrant));
  }

  function recomputeSubscriptionStatus(
    sub: ServerSubscriptionRecord,
    asaasSubStatus?: string
  ): ServerSubscriptionStatus {
    if (
      sub.canceledAt ||
      asaasSubStatus === 'INACTIVE' ||
      asaasSubStatus === 'EXPIRED'
    ) {
      return 'CANCELED';
    }
    const payments = sub.payments || [];
    const hasOverdue = payments.some((p) => p.status === 'OVERDUE');
    const hasPaid = payments.some((p) => isPaidStatus(p.status));
    const hasRefundOrChargebackOnly =
      payments.length > 0 &&
      payments.every((p) => p.status === 'REFUNDED' || p.status === 'CHARGEBACK_REQUESTED' || p.status === 'DELETED');

    if (hasRefundOrChargebackOnly) return 'CANCELED';
    if (hasOverdue) return 'OVERDUE';
    if (hasPaid) return 'ACTIVE';
    return 'PENDING';
  }

  async function syncSubscriptionWithAsaas(
    store: GatewayStore,
    sub: ServerSubscriptionRecord
  ): Promise<ServerSubscriptionRecord> {
    if (!store.asaasConfig.apiKey || !sub.asaasSubscriptionId) {
      return sub;
    }

    const [subRes, paymentsRes] = await Promise.all([
      asaasRequest<{
        id: string;
        status?: string;
        nextDueDate?: string;
        deleted?: boolean;
      }>(store.asaasConfig.apiKey, `/subscriptions/${encodeURIComponent(sub.asaasSubscriptionId)}`),
      asaasRequest<{
        data?: {
          id: string;
          status: string;
          value: number;
          billingType: string;
          dueDate: string;
          paymentDate?: string | null;
          confirmedDate?: string | null;
          invoiceUrl?: string | null;
          description?: string;
          dateCreated?: string;
        }[];
      }>(
        store.asaasConfig.apiKey,
        `/subscriptions/${encodeURIComponent(sub.asaasSubscriptionId)}/payments?limit=20`
      ),
    ]);

    const nowIso = new Date().toISOString();
    const updatedPayments: ServerSubscriptionPaymentRecord[] = [...(sub.payments || [])];

    if (paymentsRes.ok && Array.isArray(paymentsRes.data?.data)) {
      for (const remotePay of paymentsRes.data.data) {
        const existingIdx = updatedPayments.findIndex((p) => p.asaasPaymentId === remotePay.id);
        let pixPayload = existingIdx >= 0 ? updatedPayments[existingIdx].pixPayload : null;
        let pixEncodedImage = existingIdx >= 0 ? updatedPayments[existingIdx].pixEncodedImage : null;
        let pixExpirationDate =
          existingIdx >= 0 ? updatedPayments[existingIdx].pixExpirationDate : null;

        if (
          remotePay.billingType === 'PIX' &&
          remotePay.status === 'PENDING' &&
          (!pixPayload || !pixEncodedImage)
        ) {
          const qrRes = await asaasRequest<{
            encodedImage?: string;
            payload?: string;
            expirationDate?: string;
          }>(store.asaasConfig.apiKey, `/payments/${encodeURIComponent(remotePay.id)}/pixQrCode`);
          if (qrRes.ok && qrRes.data) {
            pixEncodedImage = qrRes.data.encodedImage || pixEncodedImage;
            pixPayload = qrRes.data.payload || pixPayload;
            pixExpirationDate = qrRes.data.expirationDate || pixExpirationDate;
          }
        }

        const nextRecord: ServerSubscriptionPaymentRecord = {
          id: existingIdx >= 0 ? updatedPayments[existingIdx].id : `subpay_${remotePay.id}`,
          asaasPaymentId: remotePay.id,
          value: Number(remotePay.value ?? sub.value),
          billingType: remotePay.billingType || sub.billingType,
          status: remotePay.status || 'PENDING',
          dueDate: remotePay.dueDate || getTodayDateISO(),
          paidAt: isPaidStatus(remotePay.status)
            ? (existingIdx >= 0 ? updatedPayments[existingIdx].paidAt : null) ||
              remotePay.confirmedDate ||
              remotePay.paymentDate ||
              nowIso
            : existingIdx >= 0
            ? updatedPayments[existingIdx].paidAt
            : null,
          invoiceUrl:
            remotePay.invoiceUrl ||
            (existingIdx >= 0 ? updatedPayments[existingIdx].invoiceUrl : null),
          pixPayload,
          pixEncodedImage,
          pixExpirationDate,
          description: remotePay.description || sub.planName,
          createdAt:
            (existingIdx >= 0 ? updatedPayments[existingIdx].createdAt : null) ||
            remotePay.dateCreated ||
            nowIso,
        };

        if (existingIdx >= 0) {
          updatedPayments[existingIdx] = nextRecord;
        } else {
          updatedPayments.push(nextRecord);
        }
      }
    }

    updatedPayments.sort((a, b) => b.dueDate.localeCompare(a.dueDate));

    const nextSub: ServerSubscriptionRecord = {
      ...sub,
      payments: updatedPayments,
      nextDueDate: subRes.ok && subRes.data?.nextDueDate ? subRes.data.nextDueDate : sub.nextDueDate,
      updatedAt: nowIso,
    };

    const asaasStatus = subRes.ok && subRes.data ? (subRes.data.deleted ? 'INACTIVE' : subRes.data.status) : undefined;
    nextSub.status = recomputeSubscriptionStatus(nextSub, asaasStatus);

    if (nextSub.status === 'ACTIVE' && !nextSub.activatedAt) {
      nextSub.activatedAt = nowIso;
    }

    const latestPending = updatedPayments.find((p) => p.status === 'PENDING') || updatedPayments[0];
    if (latestPending) {
      nextSub.latestInvoiceUrl = latestPending.invoiceUrl || nextSub.latestInvoiceUrl;
      nextSub.latestPixPayload = latestPending.pixPayload || nextSub.latestPixPayload;
      nextSub.latestPixEncodedImage =
        latestPending.pixEncodedImage || nextSub.latestPixEncodedImage;
      nextSub.latestPixExpirationDate =
        latestPending.pixExpirationDate || nextSub.latestPixExpirationDate;
    }

    const storeIdx = store.subscriptions.findIndex((s) => s.id === sub.id);
    if (storeIdx >= 0) {
      store.subscriptions[storeIdx] = nextSub;
      saveStore(store);
    }

    return nextSub;
  }

  function buildPremiumStatusPayload(
    store: GatewayStore,
    subscriberId: string,
    subscriberToken: string,
    childAccountId?: string
  ) {
    const blocked = isUserBlockedOnServer(store, subscriberId, childAccountId);
    const sub = findLatestSubscription(store, subscriberId, childAccountId);
    const matchedUser = findMatchingManagedUser(store, subscriberId, childAccountId);
    const adminGrant = matchedUser?.adminPremiumGrant || null;
    const hasPaidActive = !blocked && Boolean(sub && sub.status === 'ACTIVE');
    const hasGrantActive = !blocked && isAdminGrantCurrentlyActive(adminGrant);
    const hasPremiumAccess = hasPaidActive || hasGrantActive;

    const accessSource: 'paid_subscription' | 'admin_grant' | 'free' = hasPaidActive
      ? 'paid_subscription'
      : hasGrantActive
      ? 'admin_grant'
      : 'free';

    const resolvedStatus =
      hasPaidActive
        ? 'ACTIVE'
        : hasGrantActive
        ? 'ACTIVE'
        : sub
        ? sub.status
        : ('FREE' as const);

    return {
      hasPremiumAccess,
      planName: PREMIUM_PLAN_NAME,
      monthlyValue: PREMIUM_MONTHLY_VALUE,
      status: resolvedStatus,
      accessSource,
      adminGrantExpiresAt: hasGrantActive ? adminGrant?.expiresAt || null : null,
      isPermanentGrant: hasGrantActive ? Boolean(adminGrant?.isPermanent) : false,
      adminGrantReason: hasGrantActive ? adminGrant?.reason || null : null,
      gatewayConfigured: Boolean(store.asaasConfig.apiKey),
      pixSupported: Boolean(store.asaasConfig.pixEnabled),
      cardSupported: Boolean(store.asaasConfig.apiKey),
      adFree: true,
      subscriberToken,
      subscription: sub
        ? {
            id: sub.id,
            asaasSubscriptionId: sub.asaasSubscriptionId,
            planName: sub.planName,
            value: sub.value,
            cycle: sub.cycle,
            billingType: sub.billingType,
            status: sub.status,
            customerName: sub.customerName,
            customerEmail: sub.customerEmail,
            nextDueDate: sub.nextDueDate,
            startedAt: sub.startedAt,
            activatedAt: sub.activatedAt,
            canceledAt: sub.canceledAt,
            updatedAt: sub.updatedAt,
            latestInvoiceUrl: sub.latestInvoiceUrl,
            latestPixPayload: sub.latestPixPayload,
            latestPixEncodedImage: sub.latestPixEncodedImage,
            latestPixExpirationDate: sub.latestPixExpirationDate,
          }
        : null,
      paymentHistory: sub ? sub.payments : [],
    };
  }

  app.get('/api/premium/status', async (req, res) => {
    const store = ensureStoreLoaded();
    const { subscriberId, subscriberToken } = resolveOrCreateSubscriber(req, res, store);
    const childAccountId =
      typeof req.query.childAccountId === 'string' ? req.query.childAccountId.trim() : undefined;
    const shouldSync = req.query.sync === '1';

    const existing = findLatestSubscription(store, subscriberId, childAccountId);
    if (shouldSync && existing && existing.status !== 'CANCELED') {
      try {
        await syncSubscriptionWithAsaas(store, existing);
      } catch {
        // Return local state if transient Asaas lookup fails
      }
    }

    res.json(buildPremiumStatusPayload(store, subscriberId, subscriberToken, childAccountId));
  });

  app.post('/api/premium/subscribe', async (req, res) => {
    const store = ensureStoreLoaded();
    const { subscriberId, subscriberToken } = resolveOrCreateSubscriber(req, res, store);

    const body = (req.body || {}) as {
      customerName?: string;
      customerCpfCnpj?: string;
      customerEmail?: string;
      billingType?: 'PIX' | 'CREDIT_CARD';
      acceptedTerms?: boolean;
      childAccountId?: string;
      childName?: string;
      idempotencyKey?: string;
    };

    const customerName = String(body.customerName || '').trim();
    const customerCpfCnpj = sanitizeCpfCnpj(String(body.customerCpfCnpj || ''));
    const customerEmail = String(body.customerEmail || '').trim().toLowerCase();
    const billingType: 'PIX' | 'CREDIT_CARD' =
      body.billingType === 'CREDIT_CARD' ? 'CREDIT_CARD' : 'PIX';
    const childAccountId = body.childAccountId?.trim() || undefined;
    const childName = body.childName?.trim() || undefined;
    const idempotencyKey =
      String(body.idempotencyKey || '').trim() || `${subscriberId}_${billingType}`;

    if (!body.acceptedTerms) {
      res.status(400).json({ error: 'Aceite os termos da assinatura mensal e a política LGPD para continuar.' });
      return;
    }
    if (!customerName || customerName.length < 3) {
      res.status(400).json({ error: 'Informe o nome completo do responsável.' });
      return;
    }
    if (customerCpfCnpj.length !== 11 && customerCpfCnpj.length !== 14) {
      res.status(400).json({ error: 'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.' });
      return;
    }
    if (!customerEmail || !customerEmail.includes('@')) {
      res.status(400).json({ error: 'Informe um endereço de e-mail válido para receber comprovantes.' });
      return;
    }
    if (!store.asaasConfig.apiKey) {
      res.status(503).json({
        error:
          'Gateway de pagamento Asaas ainda não configurado pelo administrador. Configure a API Key de produção no Painel Administrativo para iniciar assinaturas reais.',
      });
      return;
    }
    if (billingType === 'PIX' && !store.asaasConfig.pixEnabled) {
      res.status(400).json({ error: 'Pagamentos via PIX estão temporariamente desativados no gateway.' });
      return;
    }

    // Duplicate protection: block if already active
    const existing = findLatestSubscription(store, subscriberId, childAccountId);
    if (existing && existing.status === 'ACTIVE') {
      res.status(409).json({
        error: 'Você já possui uma assinatura FalaKids Premium ativa.',
        ...buildPremiumStatusPayload(store, subscriberId, subscriberToken, childAccountId),
      });
      return;
    }

    // Duplicate protection: reuse recent PENDING subscription with same idempotency or billingType (within 15 min)
    if (
      existing &&
      existing.status === 'PENDING' &&
      (existing.idempotencyKey === idempotencyKey ||
        (existing.billingType === billingType &&
          Date.now() - new Date(existing.startedAt).getTime() < 15 * 60 * 1000))
    ) {
      try {
        await syncSubscriptionWithAsaas(store, existing);
      } catch {
        // Keep existing invoice/QR data
      }
      res.json(buildPremiumStatusPayload(store, subscriberId, subscriberToken, childAccountId));
      return;
    }

    // Concurrent request lock per subscriberId
    const inFlight = pendingSubscriptionCreates.get(subscriberId);
    if (inFlight) {
      const result = await inFlight;
      if (!result.ok) {
        res.status(result.status).json({ error: result.error });
        return;
      }
      res.json(buildPremiumStatusPayload(store, subscriberId, subscriberToken, childAccountId));
      return;
    }

    const createPromise = (async (): Promise<
      { ok: true; sub: ServerSubscriptionRecord } | { ok: false; status: number; error: string }
    > => {
      const apiKey = store.asaasConfig.apiKey;

      // 1. Lookup or create customer in Asaas Production
      const lookup = await asaasRequest<{ data?: { id: string }[] }>(
        apiKey,
        `/customers?cpfCnpj=${encodeURIComponent(customerCpfCnpj)}`
      );
      if (!lookup.ok) {
        return {
          ok: false,
          status: lookup.status,
          error: lookup.errorMessage || 'Falha ao consultar cadastro no gateway Asaas.',
        };
      }

      let asaasCustomerId = lookup.data?.data?.[0]?.id;
      if (!asaasCustomerId) {
        const createdCustomer = await asaasRequest<{ id: string }>(apiKey, '/customers', {
          method: 'POST',
          body: {
            name: customerName,
            cpfCnpj: customerCpfCnpj,
            email: customerEmail,
          },
        });
        if (!createdCustomer.ok || !createdCustomer.data?.id) {
          return {
            ok: false,
            status: createdCustomer.status,
            error: createdCustomer.errorMessage || 'Falha ao registrar responsável no gateway Asaas.',
          };
        }
        asaasCustomerId = createdCustomer.data.id;
      }

      // 2. Create real monthly recurring subscription in Asaas
      const nextDueDate = getTodayDateISO();
      const externalReference = `FKPREM-${subscriberId.slice(-8)}-${Date.now()}`;
      const subRes = await asaasRequest<{
        id: string;
        status?: string;
        nextDueDate?: string;
        value?: number;
      }>(apiKey, '/subscriptions', {
        method: 'POST',
        body: {
          customer: asaasCustomerId,
          billingType,
          value: PREMIUM_MONTHLY_VALUE,
          nextDueDate,
          cycle: 'MONTHLY',
          description: `${PREMIUM_PLAN_NAME} - Assinatura Mensal`,
          externalReference,
        },
      });

      if (!subRes.ok || !subRes.data?.id) {
        return {
          ok: false,
          status: subRes.status,
          error: subRes.errorMessage || 'Falha ao criar assinatura recorrente no gateway Asaas.',
        };
      }

      const nowIso = new Date().toISOString();
      const newSub: ServerSubscriptionRecord = {
        id: `subrec_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        subscriberId,
        childAccountId: childAccountId || null,
        idempotencyKey,
        asaasCustomerId,
        asaasSubscriptionId: subRes.data.id,
        planName: PREMIUM_PLAN_NAME,
        value: PREMIUM_MONTHLY_VALUE,
        cycle: 'MONTHLY',
        billingType,
        status: 'PENDING',
        customerName,
        customerEmail,
        nextDueDate: subRes.data.nextDueDate || nextDueDate,
        startedAt: nowIso,
        activatedAt: null,
        canceledAt: null,
        updatedAt: nowIso,
        latestInvoiceUrl: null,
        latestPixPayload: null,
        latestPixEncodedImage: null,
        latestPixExpirationDate: null,
        payments: [],
      };

      store.subscriptions = [newSub, ...store.subscriptions].slice(0, 300);

      // Update managed user directory contact details (no CPF or card stored)
      const userIdx = store.managedUsers.findIndex(
        (u) => u.subscriberId === subscriberId || (childAccountId && u.childAccountId === childAccountId)
      );
      if (userIdx >= 0) {
        store.managedUsers[userIdx] = {
          ...store.managedUsers[userIdx],
          guardianName: customerName,
          email: customerEmail,
          childName: childName || store.managedUsers[userIdx].childName,
          updatedAt: nowIso,
        };
      }

      saveStore(store);

      // Immediately sync first generated invoice & PIX QR / Checkout link from Asaas
      const syncedSub = await syncSubscriptionWithAsaas(store, newSub);
      return { ok: true, sub: syncedSub };
    })();

    pendingSubscriptionCreates.set(subscriberId, createPromise);
    try {
      const result = await createPromise;
      if (!result.ok) {
        res.status(result.status).json({ error: result.error });
        return;
      }
      res.status(201).json(buildPremiumStatusPayload(store, subscriberId, subscriberToken, childAccountId));
    } finally {
      pendingSubscriptionCreates.delete(subscriberId);
    }
  });

  app.post('/api/premium/subscription/refresh', async (req, res) => {
    const store = ensureStoreLoaded();
    const { subscriberId, subscriberToken } = resolveOrCreateSubscriber(req, res, store);
    const body = (req.body || {}) as { childAccountId?: string };
    const sub = findLatestSubscription(store, subscriberId, body.childAccountId);

    if (sub && sub.status !== 'CANCELED') {
      try {
        await syncSubscriptionWithAsaas(store, sub);
      } catch (err) {
        res.status(502).json({
          error:
            err instanceof Error
              ? err.message
              : 'Não foi possível consultar o status no gateway no momento.',
        });
        return;
      }
    }

    res.json(buildPremiumStatusPayload(store, subscriberId, subscriberToken, body.childAccountId));
  });

  app.post('/api/premium/subscription/cancel', async (req, res) => {
    const store = ensureStoreLoaded();
    const { subscriberId, subscriberToken } = resolveOrCreateSubscriber(req, res, store);
    const body = (req.body || {}) as { childAccountId?: string };
    const sub = findLatestSubscription(store, subscriberId, body.childAccountId);

    if (!sub) {
      res.status(404).json({ error: 'Nenhuma assinatura encontrada para cancelar.' });
      return;
    }

    if (sub.status !== 'CANCELED' && store.asaasConfig.apiKey && sub.asaasSubscriptionId) {
      const cancelRes = await asaasRequest<{ deleted?: boolean }>(
        store.asaasConfig.apiKey,
        `/subscriptions/${encodeURIComponent(sub.asaasSubscriptionId)}`,
        { method: 'DELETE' }
      );
      if (!cancelRes.ok && cancelRes.status !== 404) {
        res.status(cancelRes.status).json({
          error: cancelRes.errorMessage || 'Não foi possível cancelar a assinatura no gateway.',
        });
        return;
      }
    }

    const nowIso = new Date().toISOString();
    const idx = store.subscriptions.findIndex((s) => s.id === sub.id);
    if (idx >= 0) {
      store.subscriptions[idx] = {
        ...store.subscriptions[idx],
        status: 'CANCELED',
        canceledAt: store.subscriptions[idx].canceledAt || nowIso,
        updatedAt: nowIso,
      };
      saveStore(store);
    }

    res.json(buildPremiumStatusPayload(store, subscriberId, subscriberToken, body.childAccountId));
  });

  function buildContentCatalogPayload(
    store: GatewayStore,
    subscriberId: string,
    childAccountId?: string
  ) {
    const blocked = isUserBlockedOnServer(store, subscriberId, childAccountId);
    const sub = findLatestSubscription(store, subscriberId, childAccountId);
    const matchedUser = findMatchingManagedUser(store, subscriberId, childAccountId);
    const hasPaidActive = !blocked && Boolean(sub && sub.status === 'ACTIVE');
    const hasGrantActive =
      !blocked && isAdminGrantCurrentlyActive(matchedUser?.adminPremiumGrant);
    const hasPremiumAccess = hasPaidActive || hasGrantActive;

    const accessSource: 'paid_subscription' | 'admin_grant' | 'free' = hasPaidActive
      ? 'paid_subscription'
      : hasGrantActive
      ? 'admin_grant'
      : 'free';

    const items = SERVER_DEFAULT_CATALOG.map((def) => {
      const tier = getEffectiveItemTier(store, def);
      const isFree = tier === 'GRATUITO';
      const unlocked = !blocked && (isFree || hasPremiumAccess);
      const accessReason:
        | 'free'
        | 'paid_subscription'
        | 'admin_grant'
        | 'premium_required'
        | 'blocked' = blocked
        ? 'blocked'
        : isFree
        ? 'free'
        : hasPaidActive
        ? 'paid_subscription'
        : hasGrantActive
        ? 'admin_grant'
        : 'premium_required';

      return {
        id: def.id,
        category: def.category,
        title: def.title,
        subtitle: def.subtitle,
        tier,
        unlocked,
        accessReason,
        order: def.order,
        lockedFree: Boolean(def.lockedFree),
        meta: def.meta,
        updatedAt: store.contentClassification?.[def.id]?.updatedAt,
      };
    });

    const itemMap = new Map(items.map((it) => [it.id, it]));

    const unlockedStories: Record<string, (typeof SERVER_EXCLUSIVE_STORIES)[number]> = {};
    for (const story of SERVER_EXCLUSIVE_STORIES) {
      if (itemMap.get(story.id)?.unlocked) {
        unlockedStories[story.id] = story;
      }
    }

    const unlockedActivities: Record<string, (typeof SERVER_EXCLUSIVE_ACTIVITIES)[number]> = {};
    for (const act of SERVER_EXCLUSIVE_ACTIVITIES) {
      if (itemMap.get(act.id)?.unlocked) {
        unlockedActivities[act.id] = act;
      }
    }

    const phonemeRounds = itemMap.get('fonemas-especiais')?.unlocked ? SERVER_PHONEME_ROUNDS : [];
    const rhymeRounds = itemMap.get('caca-rimas')?.unlocked ? SERVER_RHYME_ROUNDS : [];

    return {
      hasPremiumAccess,
      blocked,
      accessSource,
      monthlyValue: PREMIUM_MONTHLY_VALUE,
      counts: buildCatalogSummaryCounts(items),
      items,
      unlockedPayloads: {
        stories: unlockedStories,
        activities: unlockedActivities,
        phonemeRounds,
        rhymeRounds,
      },
    };
  }

  app.get('/api/content/catalog', (req, res) => {
    const store = ensureStoreLoaded();
    const { subscriberId } = resolveOrCreateSubscriber(req, res, store);
    const childAccountId =
      typeof req.query.childAccountId === 'string' ? req.query.childAccountId.trim() : undefined;

    res.json(buildContentCatalogPayload(store, subscriberId, childAccountId));
  });

  app.get('/api/content/:category/:id', (req, res) => {
    const store = ensureStoreLoaded();
    const { subscriberId } = resolveOrCreateSubscriber(req, res, store);
    const childAccountId =
      typeof req.query.childAccountId === 'string' ? req.query.childAccountId.trim() : undefined;
    const category = String(req.params.category || '').trim();
    const id = String(req.params.id || '').trim();

    const catalog = buildContentCatalogPayload(store, subscriberId, childAccountId);
    const item = catalog.items.find((entry) => entry.category === category && entry.id === id);

    if (!item) {
      res.status(404).json({ error: 'Conteúdo não encontrado no catálogo.' });
      return;
    }

    if (!item.unlocked) {
      res.status(403).json({
        error: catalog.blocked
          ? 'Acesso bloqueado pelo administrador.'
          : 'Conteúdo exclusivo FalaKids Premium. Assinatura ativa necessária.',
        tier: item.tier,
        unlocked: false,
        accessReason: item.accessReason,
      });
      return;
    }

    let payload: unknown = null;
    if (item.category === 'story') {
      payload = catalog.unlockedPayloads.stories[item.id] || null;
    } else if (item.category === 'activity') {
      payload = catalog.unlockedPayloads.activities[item.id] || null;
    } else if (item.id === 'fonemas-especiais') {
      payload = catalog.unlockedPayloads.phonemeRounds;
    } else if (item.id === 'caca-rimas') {
      payload = catalog.unlockedPayloads.rhymeRounds;
    }

    res.json({
      item,
      payload,
    });
  });

  app.get('/api/premium/content', (req, res) => {
    const store = ensureStoreLoaded();
    const { subscriberId } = resolveOrCreateSubscriber(req, res, store);
    const childAccountId =
      typeof req.query.childAccountId === 'string' ? req.query.childAccountId.trim() : undefined;

    if (!hasActivePremiumAccess(store, subscriberId, childAccountId)) {
      res.status(403).json({
        error: 'Conteúdo exclusivo para assinantes ativos do FalaKids Premium.',
      });
      return;
    }

    const catalog = buildContentCatalogPayload(store, subscriberId, childAccountId);
    res.json({
      stories: SERVER_EXCLUSIVE_STORIES.filter((s) =>
        catalog.items.some((it) => it.id === s.id && it.unlocked)
      ),
      phonemeRounds: catalog.unlockedPayloads.phonemeRounds,
      rhymeRounds: catalog.unlockedPayloads.rhymeRounds,
      exclusiveActivities: SERVER_EXCLUSIVE_ACTIVITIES.filter((a) =>
        catalog.items.some((it) => it.id === a.id && it.unlocked)
      ),
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
        subscription?: string;
        billingType?: string;
        status?: string;
        value?: number;
        dueDate?: string;
        invoiceUrl?: string;
        externalReference?: string;
        confirmedDate?: string;
        paymentDate?: string;
        clientPaymentDate?: string;
      };
      subscription?: {
        id?: string;
        status?: string;
        nextDueDate?: string;
        deleted?: boolean;
      };
    };

    const eventId = payload.id ? String(payload.id) : '';
    const eventName = String(payload.event || 'UNKNOWN_EVENT');
    const payment = payload.payment;
    const subscriptionObj = payload.subscription;

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
          : eventName === 'PAYMENT_CHARGEBACK_REQUESTED'
          ? 'CHARGEBACK_REQUESTED'
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

      // Reconcile matching FalaKids Premium subscription
      const subIdx = store.subscriptions.findIndex(
        (s) =>
          (payment.subscription && s.asaasSubscriptionId === payment.subscription) ||
          s.payments.some((p) => p.asaasPaymentId === payment.id)
      );
      if (subIdx >= 0) {
        const sub = store.subscriptions[subIdx];
        const payIdx = sub.payments.findIndex((p) => p.asaasPaymentId === payment.id);
        const paidAtValue = isPaidStatus(nextStatus)
          ? (payIdx >= 0 ? sub.payments[payIdx].paidAt : null) ||
            payment.confirmedDate ||
            payment.paymentDate ||
            payment.clientPaymentDate ||
            nowIso
          : payIdx >= 0
          ? sub.payments[payIdx].paidAt
          : null;

        const nextPayRecord: ServerSubscriptionPaymentRecord = {
          id: payIdx >= 0 ? sub.payments[payIdx].id : `subpay_${payment.id}`,
          asaasPaymentId: payment.id,
          value: Number(payment.value ?? sub.value),
          billingType: payment.billingType || sub.billingType,
          status: nextStatus,
          dueDate: payment.dueDate || (payIdx >= 0 ? sub.payments[payIdx].dueDate : getTodayDateISO()),
          paidAt: paidAtValue,
          invoiceUrl: payment.invoiceUrl || (payIdx >= 0 ? sub.payments[payIdx].invoiceUrl : null),
          pixPayload: payIdx >= 0 ? sub.payments[payIdx].pixPayload : null,
          pixEncodedImage: payIdx >= 0 ? sub.payments[payIdx].pixEncodedImage : null,
          pixExpirationDate: payIdx >= 0 ? sub.payments[payIdx].pixExpirationDate : null,
          description: sub.planName,
          createdAt: payIdx >= 0 ? sub.payments[payIdx].createdAt : nowIso,
        };

        const updatedPayments = [...sub.payments];
        if (payIdx >= 0) {
          updatedPayments[payIdx] = nextPayRecord;
        } else {
          updatedPayments.unshift(nextPayRecord);
        }

        const updatedSub: ServerSubscriptionRecord = {
          ...sub,
          payments: updatedPayments,
          updatedAt: nowIso,
        };
        updatedSub.status = recomputeSubscriptionStatus(updatedSub);
        if (updatedSub.status === 'ACTIVE' && !updatedSub.activatedAt) {
          updatedSub.activatedAt = nowIso;
        }
        store.subscriptions[subIdx] = updatedSub;
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

    if (subscriptionObj?.id) {
      const subIdx = store.subscriptions.findIndex(
        (s) => s.asaasSubscriptionId === subscriptionObj.id
      );
      if (subIdx >= 0) {
        const sub = store.subscriptions[subIdx];
        const isInactivated =
          eventName === 'SUBSCRIPTION_INACTIVATED' ||
          eventName === 'SUBSCRIPTION_DELETED' ||
          subscriptionObj.deleted === true ||
          subscriptionObj.status === 'INACTIVE';

        const updatedSub: ServerSubscriptionRecord = {
          ...sub,
          nextDueDate: subscriptionObj.nextDueDate || sub.nextDueDate,
          canceledAt: isInactivated ? sub.canceledAt || nowIso : sub.canceledAt,
          updatedAt: nowIso,
        };
        updatedSub.status = recomputeSubscriptionStatus(
          updatedSub,
          isInactivated ? 'INACTIVE' : subscriptionObj.status
        );
        store.subscriptions[subIdx] = updatedSub;
      }
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
