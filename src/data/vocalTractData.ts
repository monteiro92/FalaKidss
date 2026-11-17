export type AnatomyPartId =
  | 'labios'
  | 'dentes'
  | 'lingua'
  | 'palato'
  | 'mandibula'
  | 'faringe'
  | 'cordas';

export type CameraPresetId = 'frontal' | 'lateral' | 'tres-quartos';

export interface AnatomyPartInfo {
  id: AnatomyPartId;
  label: string;
  description: string;
}

export const ANATOMY_PARTS: Record<AnatomyPartId, AnatomyPartInfo> = {
  labios: {
    id: 'labios',
    label: 'Lábios',
    description:
      'Fecham e vibram nos sons P, B e M, e fazem biquinho nos sons O e U ou sorriso largo no I.',
  },
  dentes: {
    id: 'dentes',
    label: 'Dentes',
    description:
      'Ajudam a direcionar o sopro nos sons S, Z, F e V e servem de apoio para a ponta da língua.',
  },
  lingua: {
    id: 'lingua',
    label: 'Língua',
    description:
      'Principal articulador da fala! Sobe até o céu da boca em T, D, L e N e muda de altura nas vogais.',
  },
  palato: {
    id: 'palato',
    label: 'Palato',
    description:
      'O céu da boca (duro e mole) e a úvula direcionam o som pela boca ou pelo nariz (M, N, NH).',
  },
  mandibula: {
    id: 'mandibula',
    label: 'Mandíbula',
    description:
      'Abre e fecha o espaço da boca, dando abertura ampla em vogais como A e E.',
  },
  faringe: {
    id: 'faringe',
    label: 'Faringe e Via Nasal',
    description:
      'Conduz o ar que vem dos pulmões e amplia a ressonância da voz na garganta e cavidade nasal.',
  },
  cordas: {
    id: 'cordas',
    label: 'Cordas Vocais',
    description:
      'Vibram suavemente na laringe para produzir a voz nas vogais e nas consoantes sonoras (B, D, G, V, Z).',
  },
};

export interface ArticulationFrame {
  mouthOpen: number;
  smileWidth: number;
  lipRound: number;
  lipClose: number;
  tongueOut: number;
  tongueX: number;
  tongueY: number;
  tonguePitch: number;
  voiced: boolean;
  activeParts: AnatomyPartId[];
}

export interface PhraseBatchItem {
  id: string;
  text: string;
  tip: string;
}

export interface PhraseBatch {
  id: 'dia-a-dia' | 'labios' | 'lingua' | 'sopro';
  title: string;
  description: string;
  phrases: PhraseBatchItem[];
}

export const PHRASE_BATCHES: PhraseBatch[] = [
  {
    id: 'dia-a-dia',
    title: 'Dia a dia',
    description: 'Frases úteis para conversas cotidianas, pedidos simples e interação com familiares.',
    phrases: [
      {
        id: 'dd-1',
        text: 'Bom dia, tudo bem com você?',
        tip: 'Saudação natural e ritmo pausado nas palavras.',
      },
      {
        id: 'dd-2',
        text: 'Por favor, pode falar mais devagar?',
        tip: 'Articulação clara do P, F, V e pausa entre palavras.',
      },
      {
        id: 'dd-3',
        text: 'Eu quero beber um copo de água.',
        tip: 'Abertura vocal ampla e fechamento firme em B e P.',
      },
      {
        id: 'dd-4',
        text: 'Muito obrigado pela sua ajuda.',
        tip: 'Encontro consonantal BR e som nasal inicial em M.',
      },
      {
        id: 'dd-5',
        text: 'Estou me sentindo bem melhor hoje.',
        tip: 'Transição suave entre S, T, M e LH.',
      },
    ],
  },
  {
    id: 'labios',
    title: 'Lábios (P/B/M)',
    description: 'Treino de fechamento labial suave para os sons bilabiais P, B e M.',
    phrases: [
      {
        id: 'lb-1',
        text: 'Papai pegou a bola azul.',
        tip: 'Junte os dois lábios com leveza no P e no B.',
      },
      {
        id: 'lb-2',
        text: 'Mamãe preparou bolo de banana.',
        tip: 'Perceba a vibração suave no M e a explosão leve no P e B.',
      },
      {
        id: 'lb-3',
        text: 'A pipa colorida subiu bem alto.',
        tip: 'Mantenha o ritmo pausado entre P, B e as vogais abertas.',
      },
      {
        id: 'lb-4',
        text: 'Meu patinho bebeu muita água.',
        tip: 'Alternância entre biquinho de U e fechamento firme dos lábios.',
      },
      {
        id: 'lb-5',
        text: 'Bia brincou com a boneca nova.',
        tip: 'Articule bem o B inicial e sorria nas vogais I e E.',
      },
    ],
  },
  {
    id: 'lingua',
    title: 'Língua (T/D/L/R)',
    description: 'Movimentos da ponta da língua atrás dos dentes e no céu da boca.',
    phrases: [
      {
        id: 'lg-1',
        text: 'A tartaruga anda bem devagar.',
        tip: 'Toque a ponta da língua atrás dos dentes superiores em T e D.',
      },
      {
        id: 'lg-2',
        text: 'A lua brilha lá no céu.',
        tip: 'Eleve a ponta da língua até o palato para formar o som do L.',
      },
      {
        id: 'lg-3',
        text: 'O rato roeu a roupa do rei.',
        tip: 'Vibração suave na garganta ou ponta da língua em R.',
      },
      {
        id: 'lg-4',
        text: 'Léo deu dois pulos na sala.',
        tip: 'Transição ágil da língua entre L, D e S.',
      },
      {
        id: 'lg-5',
        text: 'Todo dia eu tomo leite morno.',
        tip: 'Coordene língua no T e D com lábios arredondados no O.',
      },
    ],
  },
  {
    id: 'sopro',
    title: 'Sopro (F/V/S/CH)',
    description: 'Controle do fluxo de ar contínuo entre lábios, dentes e língua.',
    phrases: [
      {
        id: 'sp-1',
        text: 'A foca feliz fez uma festa.',
        tip: 'Encoste suavemente os dentes de cima no lábio inferior em F.',
      },
      {
        id: 'sp-2',
        text: 'O vento forte balançou a folha.',
        tip: 'Sinta a vibração das cordas vocais no V e o sopro leve no F.',
      },
      {
        id: 'sp-3',
        text: 'O sapo saltou na piscina azul.',
        tip: 'Direcione um fio de ar contínuo pelos dentes no som do S.',
      },
      {
        id: 'sp-4',
        text: 'Choveu bastante na chácara hoje.',
        tip: 'Arredonde levemente os lábios e sopre no som de CH.',
      },
      {
        id: 'sp-5',
        text: 'Vovó viu cinco passarinhos verdes.',
        tip: 'Alterne V sonoro e S contínuo com calma.',
      },
    ],
  },
];

export function sampleCharArticulation(rawChar: string): ArticulationFrame {
  const ch = rawChar
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (ch === 'p' || ch === 'b' || ch === 'm') {
    return {
      mouthOpen: 0.04,
      smileWidth: 0.95,
      lipRound: 0.15,
      lipClose: 1.0,
      tongueOut: 0.0,
      tongueX: 0.0,
      tongueY: -0.04,
      tonguePitch: 0.0,
      voiced: ch !== 'p',
      activeParts: ch === 'p' ? ['labios', 'mandibula'] : ['labios', 'palato', 'cordas'],
    };
  }

  if (ch === 'f' || ch === 'v') {
    return {
      mouthOpen: 0.16,
      smileWidth: 1.02,
      lipRound: 0.1,
      lipClose: 0.55,
      tongueOut: 0.0,
      tongueX: 0.0,
      tongueY: -0.04,
      tonguePitch: 0.0,
      voiced: ch === 'v',
      activeParts: ch === 'v' ? ['labios', 'dentes', 'cordas'] : ['labios', 'dentes'],
    };
  }

  if (ch === 't' || ch === 'd' || ch === 'l' || ch === 'n' || ch === 'r') {
    return {
      mouthOpen: 0.36,
      smileWidth: 1.0,
      lipRound: 0.05,
      lipClose: 0.0,
      tongueOut: 0.18,
      tongueX: 0.0,
      tongueY: 0.24,
      tonguePitch: 0.38,
      voiced: ch !== 't',
      activeParts: ['lingua', 'dentes', 'palato', 'mandibula'],
    };
  }

  if (ch === 's' || ch === 'z' || ch === 'c' || ch === 'x') {
    return {
      mouthOpen: 0.22,
      smileWidth: 1.12,
      lipRound: 0.0,
      lipClose: 0.0,
      tongueOut: 0.1,
      tongueX: 0.0,
      tongueY: 0.1,
      tonguePitch: 0.15,
      voiced: ch === 'z',
      activeParts: ch === 'z' ? ['dentes', 'lingua', 'cordas'] : ['dentes', 'lingua'],
    };
  }

  if (ch === 'a') {
    return {
      mouthOpen: 0.85,
      smileWidth: 1.0,
      lipRound: 0.05,
      lipClose: 0.0,
      tongueOut: 0.0,
      tongueX: 0.0,
      tongueY: -0.1,
      tonguePitch: -0.05,
      voiced: true,
      activeParts: ['mandibula', 'labios', 'lingua', 'cordas'],
    };
  }

  if (ch === 'e' || ch === 'i') {
    return {
      mouthOpen: 0.44,
      smileWidth: 1.24,
      lipRound: 0.0,
      lipClose: 0.0,
      tongueOut: 0.1,
      tongueX: 0.0,
      tongueY: 0.14,
      tonguePitch: 0.18,
      voiced: true,
      activeParts: ['labios', 'lingua', 'dentes', 'cordas'],
    };
  }

  if (ch === 'o' || ch === 'u') {
    return {
      mouthOpen: ch === 'o' ? 0.56 : 0.3,
      smileWidth: 0.72,
      lipRound: ch === 'u' ? 0.95 : 0.75,
      lipClose: 0.0,
      tongueOut: 0.0,
      tongueX: 0.0,
      tongueY: -0.05,
      tonguePitch: -0.08,
      voiced: true,
      activeParts: ['labios', 'mandibula', 'faringe', 'cordas'],
    };
  }

  if (ch === 'k' || ch === 'g' || ch === 'q') {
    return {
      mouthOpen: 0.48,
      smileWidth: 1.0,
      lipRound: 0.1,
      lipClose: 0.0,
      tongueOut: -0.08,
      tongueX: 0.0,
      tongueY: 0.18,
      tonguePitch: -0.15,
      voiced: ch === 'g',
      activeParts: ['lingua', 'palato', 'faringe', 'cordas'],
    };
  }

  return {
    mouthOpen: 0.35,
    smileWidth: 1.0,
    lipRound: 0.08,
    lipClose: 0.0,
    tongueOut: 0.04,
    tongueX: 0.0,
    tongueY: 0.0,
    tonguePitch: 0.0,
    voiced: /[a-z]/.test(ch),
    activeParts: ['labios', 'lingua', 'dentes', 'mandibula'],
  };
}
