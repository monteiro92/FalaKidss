import { CatalogItemDTO, ContentCategory, ContentTier } from '../types/premium';

export interface DefaultCatalogDefinition {
  id: string;
  category: ContentCategory;
  title: string;
  subtitle: string;
  defaultTier: ContentTier;
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

export const DEFAULT_CONTENT_CATALOG: DefaultCatalogDefinition[] = [
  // Módulos de Atividades (7) — Gratuitos
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

  // Atividades Guiadas Exclusivas (4) — Premium
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

  // Jogos Educativos (12 total: 10 Gratuitos + 2 Premium)
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

  // Histórias Infantis (5 total: 3 Gratuitas + 2 Premium)
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

export function buildFallbackCatalogItems(hasPremiumAccess: boolean, blocked = false): CatalogItemDTO[] {
  return DEFAULT_CONTENT_CATALOG.map((item) => {
    const isFree = item.defaultTier === 'GRATUITO';
    const unlocked = !blocked && (isFree || hasPremiumAccess);
    return {
      id: item.id,
      category: item.category,
      title: item.title,
      subtitle: item.subtitle,
      tier: item.defaultTier,
      unlocked,
      accessReason: blocked
        ? 'blocked'
        : isFree
        ? 'free'
        : hasPremiumAccess
        ? 'paid_subscription'
        : 'premium_required',
      order: item.order,
      lockedFree: item.lockedFree,
      meta: item.meta,
    };
  });
}
