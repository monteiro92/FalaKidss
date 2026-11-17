import { AgeGroup } from '../types/app';

export interface WordItem {
  id: string;
  word: string;
  syllables: string;
  category: 'familia' | 'alimentos' | 'animais' | 'objetos' | 'corpo' | 'natureza';
  extraCategories?: WordItem['category'][];
  tip: string;
  color: string;
}

export interface WordCategory {
  id: WordItem['category'];
  label: string;
  accent: string;
  bgTint: string;
  description: string;
}

export const WORD_CATEGORIES: WordCategory[] = [
  { id: 'familia', label: 'Família', accent: '#EC4899', bgTint: '#FDF2F8', description: 'Pessoas queridas do nosso dia a dia' },
  { id: 'alimentos', label: 'Alimentos', accent: '#F97316', bgTint: '#FFF7ED', description: 'Comidas e bebidas gostosas' },
  { id: 'animais', label: 'Animais', accent: '#10B981', bgTint: '#ECFDF5', description: 'Bichinhos amigos e divertidos' },
  { id: 'objetos', label: 'Objetos', accent: '#0284C7', bgTint: '#F0F9FF', description: 'Brinquedos e coisas da casa' },
  { id: 'corpo', label: 'Corpo Humano', accent: '#8B5CF6', bgTint: '#F5F3FF', description: 'Partes do nosso corpo' },
  { id: 'natureza', label: 'Natureza', accent: '#EAB308', bgTint: '#FEFCE8', description: 'O céu, as plantas e o mundo' },
];

export const FIRST_WORDS: WordItem[] = [
  // Família
  { id: 'mamae', word: 'Mamãe', syllables: 'Ma - mã - e', category: 'familia', tip: 'Junte os lábios com carinho para fazer o som Mmm.', color: '#EC4899' },
  { id: 'papai', word: 'Papai', syllables: 'Pa - pai', category: 'familia', tip: 'Solte um soprinho suave nos lábios para o P.', color: '#0284C7' },
  { id: 'vovo_f', word: 'Vovó', syllables: 'Vo - vó', category: 'familia', tip: 'Encoste os dentes de cima devagarinho no lábio de baixo.', color: '#8B5CF6' },
  { id: 'vovo_m', word: 'Vovô', syllables: 'Vo - vô', category: 'familia', tip: 'Faça a boquinha redonda no ô fechado.', color: '#10B981' },
  { id: 'bebe', word: 'Bebê', syllables: 'Be - bê', category: 'familia', tip: 'Junte os lábios e solte o som B com alegria.', color: '#F59E0B' },
  { id: 'irmao', word: 'Irmão', syllables: 'Ir - mão', category: 'familia', tip: 'Comece com sorriso do I e termine com ão.', color: '#0EA5E9' },
  { id: 'irma', word: 'Irmã', syllables: 'Ir - mã', category: 'familia', tip: 'Sorria no Ir e sinta o som suave pelo nariz no mã.', color: '#F43F5E' },
  { id: 'prima', word: 'Prima', syllables: 'Pri - ma', category: 'familia', tip: 'Junte o P e a tremidinha leve da língua no Pri.', color: '#A855F7' },
  { id: 'primo', word: 'Primo', syllables: 'Pri - mo', category: 'familia', tip: 'Fale Pri com firmeza e feche os lábios no mo.', color: '#10B981' },
  { id: 'tia', word: 'Tia', syllables: 'Ti - a', category: 'familia', tip: 'Bata a pontinha da língua atrás dos dentes no Ti e abra no a.', color: '#F97316' },
  { id: 'tio', word: 'Tio', syllables: 'Ti - o', category: 'familia', tip: 'Comece com o som claro do Ti e arredonde a boca no o.', color: '#6366F1' },
  { id: 'titio', word: 'Titio', syllables: 'Ti - ti - o', category: 'familia', tip: 'Repita os dois pedacinhos Ti, ti com alegria e termine no o.', color: '#F59E0B' },
  { id: 'madrinha', word: 'Madrinha', syllables: 'Ma - dri - nha', category: 'familia', tip: 'Encoste o meio da língua no céu da boca no som nha.', color: '#E11D48' },
  { id: 'padrinho', word: 'Padrinho', syllables: 'Pa - dri - nho', category: 'familia', tip: 'Fale Pa firme, trema leve no dri e termine no nho.', color: '#0369A1' },
  { id: 'bisavo_f', word: 'Bisavó', syllables: 'Bi - sa - vó', category: 'familia', tip: 'Pronuncie os três pedacinhos devagar: Bi, sa, vó bem aberto.', color: '#7C3AED' },
  { id: 'bisavo_m', word: 'Bisavô', syllables: 'Bi - sa - vô', category: 'familia', tip: 'Fale Bi, sa e faça biquinho fechado no vô.', color: '#059669' },
  { id: 'sobrinha', word: 'Sobrinha', syllables: 'So - bri - nha', category: 'familia', tip: 'Sopre suavemente no So e capriche no som nha.', color: '#EC4899' },
  { id: 'sobrinho', word: 'Sobrinho', syllables: 'So - bri - nho', category: 'familia', tip: 'Comece com a cobrinha Sss no So e termine no nho.', color: '#06B6D4' },
  { id: 'cunhado', word: 'Cunhado', syllables: 'Cu - nha - do', category: 'familia', tip: 'Sinta a língua tocar o céu da boca no nha e feche no do.', color: '#0D9488' },
  { id: 'cunhada', word: 'Cunhada', syllables: 'Cu - nha - da', category: 'familia', tip: 'Fale Cu redondo, nha suave e abra a boca no da.', color: '#DB2777' },

  // Alimentos
  { id: 'agua', word: 'Água', syllables: 'Á - gua', category: 'alimentos', extraCategories: ['natureza'], tip: 'Abra bem a boca no Á bem claro.', color: '#0284C7' },
  { id: 'arroz', word: 'Arroz', syllables: 'Ar - roz', category: 'alimentos', tip: 'Sopre forte no começo do roz e termine com soprinho no z.', color: '#64748B' },
  { id: 'feijao', word: 'Feijão', syllables: 'Fei - jão', category: 'alimentos', tip: 'Sopre o F no Fei e sinta o som vibrado do jão pelo nariz.', color: '#92400E' },
  { id: 'leite', word: 'Leite', syllables: 'Lei - te', category: 'alimentos', tip: 'A pontinha da língua sobe atrás dos dentes no L.', color: '#38BDF8' },
  { id: 'pao', word: 'Pão', syllables: 'Pão', category: 'alimentos', tip: 'Exploda os lábios no P e deixe o som sair pelo nariz no ão.', color: '#F59E0B' },
  { id: 'bolo', word: 'Bolo', syllables: 'Bo - lo', category: 'alimentos', tip: 'Feche os lábios no Bo e levante a ponta da língua no lo.', color: '#EC4899' },
  { id: 'maca', word: 'Maçã', syllables: 'Ma - çã', category: 'alimentos', tip: 'Sorria no çã e sinta o som suave pelo nariz.', color: '#EF4444' },
  { id: 'banana', word: 'Banana', syllables: 'Ba - na - na', category: 'alimentos', tip: 'Fale cada pedacinho devagar: ba, na, na.', color: '#EAB308' },
  { id: 'uva', word: 'Uva', syllables: 'U - va', category: 'alimentos', tip: 'Faça biquinho redondo no U e sopre o V.', color: '#8B5CF6' },
  { id: 'pera', word: 'Pera', syllables: 'Pe - ra', category: 'alimentos', tip: 'Solte um soprinho suave no Pe e trema leve a língua no ra.', color: '#84CC16' },
  { id: 'mamao', word: 'Mamão', syllables: 'Ma - mão', category: 'alimentos', tip: 'Junte os lábios com suavidade nos dois pedacinhos: Ma e mão.', color: '#F97316' },
  { id: 'melancia', word: 'Melancia', syllables: 'Me - lan - ci - a', category: 'alimentos', tip: 'Pronuncie os quatro pedacinhos devagar: Me, lan, ci, a.', color: '#10B981' },
  { id: 'laranja', word: 'Laranja', syllables: 'La - ran - ja', category: 'alimentos', tip: 'Levante a língua no La, trema no ran e vibre o ja.', color: '#F97316' },
  { id: 'morango', word: 'Morango', syllables: 'Mo - ran - go', category: 'alimentos', tip: 'Faça biquinho no Mo e sinta a tremidinha leve no ran.', color: '#EF4444' },
  { id: 'abacaxi', word: 'Abacaxi', syllables: 'A - ba - ca - xi', category: 'alimentos', tip: 'Abra a boca no A e termine soprando suavemente no xi.', color: '#EAB308' },
  { id: 'batata', word: 'Batata', syllables: 'Ba - ta - ta', category: 'alimentos', tip: 'Bata os lábios no Ba e a pontinha da língua atrás dos dentes no ta.', color: '#D97706' },
  { id: 'cenoura', word: 'Cenoura', syllables: 'Ce - nou - ra', category: 'alimentos', tip: 'Comece com a cobrinha Sss no Ce e trema devagar no ra.', color: '#F97316' },
  { id: 'tomate', word: 'Tomate', syllables: 'To - ma - te', category: 'alimentos', tip: 'Fale cada sílaba com clareza: To, ma, te.', color: '#EF4444' },
  { id: 'ovo', word: 'Ovo', syllables: 'O - vo', category: 'alimentos', tip: 'Boca redondinha no O e dente de cima no lábio para o vo.', color: '#F59E0B' },
  { id: 'queijo', word: 'Queijo', syllables: 'Quei - jo', category: 'alimentos', tip: 'Fale firme o Quei e faça biquinho suave vibrado no jo.', color: '#FBBF24' },
  { id: 'carne', word: 'Carne', syllables: 'Car - ne', category: 'alimentos', tip: 'Fale Car lá atrás e encoste a língua atrás dos dentes no ne.', color: '#E11D48' },
  { id: 'frango', word: 'Frango', syllables: 'Fran - go', category: 'alimentos', tip: 'Sopre o F e junte com a língua vibrando no Fran.', color: '#D97706' },
  { id: 'macarrao', word: 'Macarrão', syllables: 'Ma - car - rão', category: 'alimentos', tip: 'Fale Ma, car e sopre forte na garganta para o rão.', color: '#F59E0B' },
  { id: 'sopa', word: 'Sopa', syllables: 'So - pa', category: 'alimentos', tip: 'Sopre como cobrinha no So e solte os lábios no pa.', color: '#FB923C' },
  { id: 'biscoito', word: 'Biscoito', syllables: 'Bis - coi - to', category: 'alimentos', tip: 'Termine o Bis com cobrinha Sss e fale coi - to bem claro.', color: '#B45309' },

  // Animais
  { id: 'cachorro', word: 'Cachorro', syllables: 'Ca - chor - ro', category: 'animais', tip: 'Faça o sopro do ch como quem pede silêncio: shhh.', color: '#0284C7' },
  { id: 'gato', word: 'Gato', syllables: 'Ga - to', category: 'animais', tip: 'Sinta a garganta vibrar no Ga e bata a língua no to.', color: '#F97316' },
  { id: 'papagaio', word: 'Papagaio', syllables: 'Pa - pa - gai - o', category: 'animais', tip: 'Repita Pa, pa bem firme e junte com gai - o.', color: '#16A34A' },
  { id: 'galinha', word: 'Galinha', syllables: 'Ga - li - nha', category: 'animais', tip: 'Levante a língua no li e sinta o som nha pelo nariz.', color: '#EF4444' },
  { id: 'pintinho', word: 'Pintinho', syllables: 'Pin - ti - nho', category: 'animais', tip: 'Solte o P no Pin e encoste a língua atrás dos dentes no ti.', color: '#EAB308' },
  { id: 'pato', word: 'Pato', syllables: 'Pa - to', category: 'animais', tip: 'Som curtinho e firme: Pa e depois to.', color: '#EAB308' },
  { id: 'vaca', word: 'Vaca', syllables: 'Va - ca', category: 'animais', tip: 'Sinta a vibração suave no lábio para o Va.', color: '#10B981' },
  { id: 'cavalo', word: 'Cavalo', syllables: 'Ca - va - lo', category: 'animais', tip: 'Fale Ca lá atrás, vibre no va e levante a língua no lo.', color: '#92400E' },
  { id: 'porco', word: 'Porco', syllables: 'Por - co', category: 'animais', tip: 'Faça biquinho no Por e bata firme o co.', color: '#EC4899' },
  { id: 'ovelha', word: 'Ovelha', syllables: 'O - ve - lha', category: 'animais', tip: 'Comece com boca redondinha no O e encoste o meio da língua no lha.', color: '#64748B' },
  { id: 'coelho', word: 'Coelho', syllables: 'Co - e - lho', category: 'animais', tip: 'Fale Co redondo, abra no e e termine suave no lho.', color: '#F43F5E' },
  { id: 'macaco', word: 'Macaco', syllables: 'Ma - ca - co', category: 'animais', tip: 'Junte os lábios no Ma e fale os três pedacinhos com ritmo.', color: '#B45309' },
  { id: 'leao', word: 'Leão', syllables: 'Le - ão', category: 'animais', tip: 'Suba a ponta da língua no Le e solte o ão pelo nariz.', color: '#F59E0B' },
  { id: 'tigre', word: 'Tigre', syllables: 'Ti - gre', category: 'animais', tip: 'Bata a língua no Ti e sinta o R vibrar junto do G no gre.', color: '#F97316' },
  { id: 'elefante', word: 'Elefante', syllables: 'E - le - fan - te', category: 'animais', tip: 'Sopre suavemente nos lábios para o fan e fale te bem claro.', color: '#64748B' },
  { id: 'girafa', word: 'Girafa', syllables: 'Gi - ra - fa', category: 'animais', tip: 'Vibre no Gi, trema devagar a língua no ra e sopre o fa.', color: '#EAB308' },
  { id: 'zebra', word: 'Zebra', syllables: 'Ze - bra', category: 'animais', tip: 'Faça zumbido de abelhinha no Ze e feche os lábios no bra.', color: '#0F172A' },
  { id: 'urso', word: 'Urso', syllables: 'Ur - so', category: 'animais', tip: 'Faça biquinho no U e termine com sopro de cobrinha no so.', color: '#78350F' },
  { id: 'peixe', word: 'Peixe', syllables: 'Pei - xe', category: 'animais', tip: 'Sopre suavemente no xe.', color: '#0EA5E9' },
  { id: 'tartaruga', word: 'Tartaruga', syllables: 'Tar - ta - ru - ga', category: 'animais', tip: 'Bata a pontinha da língua no Tar - ta e faça biquinho no ru.', color: '#10B981' },
  { id: 'borboleta', word: 'Borboleta', syllables: 'Bor - bo - le - ta', category: 'animais', tip: 'Bata os lábios no Bor - bo e suba a língua no le.', color: '#EC4899' },
  { id: 'abelha', word: 'Abelha', syllables: 'A - be - lha', category: 'animais', tip: 'Abra a boca no A, feche no be e encoste a língua no céu da boca no lha.', color: '#F59E0B' },
  { id: 'formiga', word: 'Formiga', syllables: 'For - mi - ga', category: 'animais', tip: 'Sopre suave no For, junte os lábios no mi e termine no ga.', color: '#DC2626' },
  { id: 'sapo', word: 'Sapo', syllables: 'Sa - po', category: 'animais', tip: 'Sopre como cobrinha no Sa e estoure o P no po.', color: '#22C55E' },
  { id: 'cobra', word: 'Cobra', syllables: 'Co - bra', category: 'animais', tip: 'Faça boca redonda no Co e junte B e R no bra.', color: '#16A34A' },
  { id: 'baleia', word: 'Baleia', syllables: 'Ba - lei - a', category: 'animais', tip: 'Junte os lábios no Ba, levante a língua no lei e abra no a.', color: '#0284C7' },
  { id: 'golfinho', word: 'Golfinho', syllables: 'Gol - fi - nho', category: 'animais', tip: 'Sopre o F no fi e termine com o som suave de nho.', color: '#0EA5E9' },
  { id: 'coruja', word: 'Coruja', syllables: 'Co - ru - ja', category: 'animais', tip: 'Trema levemente a língua no ru e vibre fazendo biquinho no ja.', color: '#8B5CF6' },
  { id: 'rato', word: 'Rato', syllables: 'Ra - to', category: 'animais', tip: 'Sopre forte na garganta no Ra e bata a língua no to.', color: '#64748B' },
  { id: 'leao-marinho', word: 'Leão-marinho', syllables: 'Le - ão - ma - ri - nho', category: 'animais', tip: 'Fale cada pedacinho devagar: Le, ão, ma, ri, nho.', color: '#0369A1' },

  // Objetos
  { id: 'bola', word: 'Bola', syllables: 'Bo - la', category: 'objetos', tip: 'Boca redondinha no Bo e língua em cima no la.', color: '#EF4444' },
  { id: 'casa', word: 'Casa', syllables: 'Ca - sa', category: 'objetos', tip: 'Sinta a abelhinha vibrar no sa (som de Z).', color: '#F97316' },
  { id: 'mesa', word: 'Mesa', syllables: 'Me - sa', category: 'objetos', tip: 'Junte os lábios no Me e sinta a abelhinha vibrar no sa.', color: '#D97706' },
  { id: 'cadeira', word: 'Cadeira', syllables: 'Ca - dei - ra', category: 'objetos', tip: 'Fale Ca lá atrás, bata a língua no dei e trema leve no ra.', color: '#0284C7' },
  { id: 'cama', word: 'Cama', syllables: 'Ca - ma', category: 'objetos', tip: 'Abra no Ca e junte os lábios com carinho no ma.', color: '#8B5CF6' },
  { id: 'porta', word: 'Porta', syllables: 'Por - ta', category: 'objetos', tip: 'Solte o P no Por e bata a língua atrás dos dentes no ta.', color: '#B45309' },
  { id: 'janela', word: 'Janela', syllables: 'Ja - ne - la', category: 'objetos', tip: 'Vibre fazendo biquinho no Ja e suba a língua no la.', color: '#0EA5E9' },
  { id: 'copo', word: 'Copo', syllables: 'Co - po', category: 'objetos', tip: 'Fale Co redondo e solte um soprinho rápido no po.', color: '#38BDF8' },
  { id: 'prato', word: 'Prato', syllables: 'Pra - to', category: 'objetos', tip: 'Junte P e língua vibrante no Pra e termine no to.', color: '#64748B' },
  { id: 'colher', word: 'Colher', syllables: 'Co - lher', category: 'objetos', tip: 'Encoste o meio da língua no céu da boca para o som lher.', color: '#94A3B8' },
  { id: 'garfo', word: 'Garfo', syllables: 'Gar - fo', category: 'objetos', tip: 'Sopre forte no Gar e encoste o dente no lábio para o fo.', color: '#475569' },
  { id: 'panela', word: 'Panela', syllables: 'Pa - ne - la', category: 'objetos', tip: 'Estoure suave o Pa e suba a língua no ne e no la.', color: '#EF4444' },
  { id: 'telefone', word: 'Telefone', syllables: 'Te - le - fo - ne', category: 'objetos', tip: 'Fale cada pedacinho com calma: Te, le, fo, ne.', color: '#6366F1' },
  { id: 'carro', word: 'Carro', syllables: 'Car - ro', category: 'objetos', tip: 'Sopre forte na garganta no rro como um motorzinho.', color: '#0284C7' },
  { id: 'boneca', word: 'Boneca', syllables: 'Bo - ne - ca', category: 'objetos', tip: 'Fale com ritmo alegre: Bo - ne - ca.', color: '#EC4899' },
  { id: 'carrinho', word: 'Carrinho', syllables: 'Car - ri - nho', category: 'objetos', tip: 'Sopre no Car - ri e termine suave pelo nariz no nho.', color: '#EF4444' },
  { id: 'brinquedo', word: 'Brinquedo', syllables: 'Brin - que - do', category: 'objetos', tip: 'Junte B e R no Brin e fale que - do bem claro.', color: '#F59E0B' },
  { id: 'sapato', word: 'Sapato', syllables: 'Sa - pa - to', category: 'objetos', tip: 'Comece com sopro de cobrinha no Sa e bata no pa - to.', color: '#0EA5E9' },
  { id: 'chinelo', word: 'Chinelo', syllables: 'Chi - ne - lo', category: 'objetos', tip: 'Faça o soprinho shhh no Chi e levante a língua no lo.', color: '#10B981' },
  { id: 'mochila', word: 'Mochila', syllables: 'Mo - chi - la', category: 'objetos', tip: 'Feche os lábios no Mo, sopre no chi e suba a língua no la.', color: '#7C3AED' },
  { id: 'livro', word: 'Livro', syllables: 'Li - vro', category: 'objetos', tip: 'Sinta o V e o R vibrarem juntos no vro.', color: '#8B5CF6' },
  { id: 'lapis', word: 'Lápis', syllables: 'Lá - pis', category: 'objetos', tip: 'Termine com o sopro do S como uma cobrinha.', color: '#10B981' },
  { id: 'tesoura', word: 'Tesoura', syllables: 'Te - sou - ra', category: 'objetos', tip: 'Bata a língua no Te, sopre o sou e trema leve no ra.', color: '#F43F5E' },
  { id: 'escova', word: 'Escova', syllables: 'Es - co - va', category: 'objetos', tip: 'Sopre fininho o S no Es e vibre o lábio no va.', color: '#06B6D4' },
  { id: 'relogio', word: 'Relógio', syllables: 'Re - ló - gio', category: 'objetos', tip: 'Sopre forte na garganta no Re e abra bem no ló.', color: '#F59E0B' },
  { id: 'chave', word: 'Chave', syllables: 'Cha - ve', category: 'objetos', tip: 'Sopre como shhh no Cha e vibre no ve.', color: '#EAB308' },

  // Corpo humano
  { id: 'cabeca', word: 'Cabeça', syllables: 'Ca - be - ça', category: 'corpo', tip: 'Fale Ca claro, junte os lábios no be e sopre suave no ça.', color: '#EC4899' },
  { id: 'cabelo', word: 'Cabelo', syllables: 'Ca - be - lo', category: 'corpo', tip: 'Pronuncie devagar: Ca, be e levante a língua no lo.', color: '#92400E' },
  { id: 'rosto', word: 'Rosto', syllables: 'Ros - to', category: 'corpo', tip: 'Sopre na garganta no Ros e termine firme no to.', color: '#F59E0B' },
  { id: 'olho', word: 'Olho', syllables: 'O - lho', category: 'corpo', tip: 'Encoste o meio da língua no céu da boca no lho.', color: '#8B5CF6' },
  { id: 'nariz', word: 'Nariz', syllables: 'Na - riz', category: 'corpo', tip: 'Língua sobe no Na e termina com soprinho no z.', color: '#0284C7' },
  { id: 'boca', word: 'Boca', syllables: 'Bo - ca', category: 'corpo', tip: 'Bochecha firme no Bo e abertura no ca.', color: '#EC4899' },
  { id: 'lingua', word: 'Língua', syllables: 'Lín - gua', category: 'corpo', tip: 'Suba a ponta da língua no Lín e abra no gua.', color: '#F43F5E' },
  { id: 'dente', word: 'Dente', syllables: 'Den - te', category: 'corpo', tip: 'Bata a pontinha da língua atrás dos dentes no Den e no te.', color: '#0EA5E9' },
  { id: 'orelha', word: 'Orelha', syllables: 'O - re - lha', category: 'corpo', tip: 'Dê uma tremidinha suave na ponta da língua no re.', color: '#F59E0B' },
  { id: 'pescoco', word: 'Pescoço', syllables: 'Pes - co - ço', category: 'corpo', tip: 'Sopre o S no Pes e termine com soprinho suave no ço.', color: '#8B5CF6' },
  { id: 'ombro', word: 'Ombro', syllables: 'Om - bro', category: 'corpo', tip: 'Feche os lábios no Om e faça o som firme de bro.', color: '#10B981' },
  { id: 'braco', word: 'Braço', syllables: 'Bra - ço', category: 'corpo', tip: 'Junte B e R no Bra e sopre suave como cobrinha no ço.', color: '#F97316' },
  { id: 'cotovelo', word: 'Cotovelo', syllables: 'Co - to - ve - lo', category: 'corpo', tip: 'Fale cada sílaba em ritmo calmo: Co, to, ve, lo.', color: '#6366F1' },
  { id: 'mao', word: 'Mão', syllables: 'Mão', category: 'corpo', tip: 'Junte os lábios e faça o som pelo nariz: Mmm-ão.', color: '#F97316' },
  { id: 'dedo', word: 'Dedo', syllables: 'De - do', category: 'corpo', tip: 'Bata a pontinha da língua duas vezes: De e do.', color: '#F59E0B' },
  { id: 'barriga', word: 'Barriga', syllables: 'Bar - ri - ga', category: 'corpo', tip: 'Feche os lábios no Bar e sopre forte na garganta no ri.', color: '#EC4899' },
  { id: 'costas', word: 'Costas', syllables: 'Cos - tas', category: 'corpo', tip: 'Lembre da cobrinha Sss no final de Cos e de tas.', color: '#0284C7' },
  { id: 'perna', word: 'Perna', syllables: 'Per - na', category: 'corpo', tip: 'Solte o P no Per e suba a língua atrás dos dentes no na.', color: '#10B981' },
  { id: 'joelho', word: 'Joelho', syllables: 'Jo - e - lho', category: 'corpo', tip: 'Vibre o Jo, abra no e e encoste a língua no céu da boca no lho.', color: '#8B5CF6' },
  { id: 'pe', word: 'Pé', syllables: 'Pé', category: 'corpo', tip: 'Boca aberta e som bem claro no É!', color: '#10B981' },
  { id: 'coracao', word: 'Coração', syllables: 'Co - ra - ção', category: 'corpo', tip: 'Trema leve a língua no ra e termine com ção pelo nariz.', color: '#EF4444' },
  { id: 'pulmao', word: 'Pulmão', syllables: 'Pul - mão', category: 'corpo', tip: 'Sopre firme no Pul e junte os lábios com som nasal no mão.', color: '#0EA5E9' },
  { id: 'pele', word: 'Pele', syllables: 'Pe - le', category: 'corpo', tip: 'Estoure suave o P no Pe e suba a língua no le.', color: '#FB923C' },
  { id: 'unha', word: 'Unha', syllables: 'U - nha', category: 'corpo', tip: 'Faça biquinho no U e sinta o som nha sair pelo nariz.', color: '#EC4899' },

  // Natureza
  { id: 'sol', word: 'Sol', syllables: 'Sol', category: 'natureza', tip: 'Comece com sopro de cobrinha Sss e termine redondo.', color: '#F59E0B' },
  { id: 'lua', word: 'Lua', syllables: 'Lu - a', category: 'natureza', tip: 'Biquinho no Lu e boca aberta no a.', color: '#8B5CF6' },
  { id: 'estrela', word: 'Estrela', syllables: 'Es - tre - la', category: 'natureza', tip: 'Sinta a língua tremer levemente no tre.', color: '#EAB308' },
  { id: 'ceu', word: 'Céu', syllables: 'Céu', category: 'natureza', tip: 'Sopre como cobrinha Sss e abra bem no éu.', color: '#0EA5E9' },
  { id: 'nuvem', word: 'Nuvem', syllables: 'Nu - vem', category: 'natureza', tip: 'Som suave no Nu e bochechas relaxadas no vem.', color: '#0EA5E9' },
  { id: 'chuva', word: 'Chuva', syllables: 'Chu - va', category: 'natureza', tip: 'Sopre shhh no Chu e encoste o dente no lábio no va.', color: '#0284C7' },
  { id: 'vento', word: 'Vento', syllables: 'Ven - to', category: 'natureza', tip: 'Vibre o lábio no Ven e bata a língua no to.', color: '#38BDF8' },
  { id: 'arco-iris', word: 'Arco-íris', syllables: 'Ar - co - í - ris', category: 'natureza', tip: 'Fale com alegria todos os pedacinhos: Ar, co, í, ris.', color: '#EC4899' },
  { id: 'arvore', word: 'Árvore', syllables: 'Ár - vo - re', category: 'natureza', tip: 'Diga bem aberto o Ár e suave o re no final.', color: '#10B981' },
  { id: 'flor', word: 'Flor', syllables: 'Flor', category: 'natureza', tip: 'Sopre suavemente nos lábios para o Fff.', color: '#EC4899' },
  { id: 'folha', word: 'Folha', syllables: 'Fo - lha', category: 'natureza', tip: 'Sopre o F no Fo e encoste o meio da língua no céu da boca no lha.', color: '#22C55E' },
  { id: 'grama', word: 'Grama', syllables: 'Gra - ma', category: 'natureza', tip: 'Sinta o G e o R juntos no Gra e feche os lábios no ma.', color: '#16A34A' },
  { id: 'terra', word: 'Terra', syllables: 'Ter - ra', category: 'natureza', tip: 'Bata a língua no Ter e sopre forte na garganta no rra.', color: '#92400E' },
  { id: 'rio', word: 'Rio', syllables: 'Ri - o', category: 'natureza', tip: 'Sopre forte no Ri e arredonde os lábios no o.', color: '#0EA5E9' },
  { id: 'mar', word: 'Mar', syllables: 'Mar', category: 'natureza', tip: 'Junte os lábios para o Mmm e abra bem no ar.', color: '#0284C7' },
  { id: 'praia', word: 'Praia', syllables: 'Prai - a', category: 'natureza', tip: 'Junte P e R no Prai e termine abrindo a boca no a.', color: '#F59E0B' },
  { id: 'pedra', word: 'Pedra', syllables: 'Pe - dra', category: 'natureza', tip: 'Solte o P no Pe e junte D e R no dra.', color: '#64748B' },
  { id: 'montanha', word: 'Montanha', syllables: 'Mon - ta - nha', category: 'natureza', tip: 'Fale Mon pelo nariz, bata no ta e termine suave no nha.', color: '#059669' },
  { id: 'cachoeira', word: 'Cachoeira', syllables: 'Ca - cho - ei - ra', category: 'natureza', tip: 'Faça o soprinho shhh no cho e fale ei - ra com calma.', color: '#06B6D4' },
  { id: 'floresta', word: 'Floresta', syllables: 'Flo - res - ta', category: 'natureza', tip: 'Sopre o F no Flo, trema leve no res e bata no ta.', color: '#15803D' },
  { id: 'semente', word: 'Semente', syllables: 'Se - men - te', category: 'natureza', tip: 'Comece com cobrinha Sss no Se e feche os lábios no men.', color: '#84CC16' },
  { id: 'jardim', word: 'Jardim', syllables: 'Jar - dim', category: 'natureza', tip: 'Vibre no Jar e termine com sorriso no dim.', color: '#EC4899' },
  { id: 'fogo', word: 'Fogo', syllables: 'Fo - go', category: 'natureza', tip: 'Sopre suave o F no Fo e faça som na garganta no go.', color: '#F97316' },
];

export interface AlphabetItem {
  letter: string;
  isVowel: boolean;
  exampleWord: string;
  phrase: string;
  phoneticHint: string;
  color: string;
  iconKey: string;
}

export const ALPHABET_ITEMS: AlphabetItem[] = [
  { letter: 'A', isVowel: true, exampleWord: 'Abelha', phrase: 'A de Abelha', phoneticHint: 'Abra bem a boquinha e diga Aaaa!', color: '#F59E0B', iconKey: 'abelha' },
  { letter: 'B', isVowel: false, exampleWord: 'Bola', phrase: 'B de Bola', phoneticHint: 'Junte os dois lábios e estoure suavemente: B!', color: '#EF4444', iconKey: 'bola' },
  { letter: 'C', isVowel: false, exampleWord: 'Casa', phrase: 'C de Casa', phoneticHint: 'O som nasce lá atrás na garganta: Câ!', color: '#F97316', iconKey: 'casa' },
  { letter: 'D', isVowel: false, exampleWord: 'Dado', phrase: 'D de Dado', phoneticHint: 'A ponta da língua bate atrás dos dentes de cima.', color: '#0284C7', iconKey: 'dado' },
  { letter: 'E', isVowel: true, exampleWord: 'Elefante', phrase: 'E de Elefante', phoneticHint: 'Abra a boca num sorriso médio: Ééé / Êêê!', color: '#10B981', iconKey: 'elefante' },
  { letter: 'F', isVowel: false, exampleWord: 'Flor', phrase: 'F de Flor', phoneticHint: 'Dentes de cima encostam no lábio e sopram: Ffff!', color: '#EC4899', iconKey: 'flor' },
  { letter: 'G', isVowel: false, exampleWord: 'Gato', phrase: 'G de Gato', phoneticHint: 'Sinta uma cócega gostosa na garganta: Ggg!', color: '#F97316', iconKey: 'gato' },
  { letter: 'H', isVowel: false, exampleWord: 'Hipopótamo', phrase: 'H de Hipopótamo', phoneticHint: 'O H no início é silencioso e deixa a vogal brilhar!', color: '#8B5CF6', iconKey: 'hipopotamo' },
  { letter: 'I', isVowel: true, exampleWord: 'Igreja', phrase: 'I de Igreja', phoneticHint: 'Dê um sorrisão bem largo e diga Iiii!', color: '#0EA5E9', iconKey: 'igreja' },
  { letter: 'J', isVowel: false, exampleWord: 'Jacaré', phrase: 'J de Jacaré', phoneticHint: 'Biquinho leve com som vibrado: Jjjj!', color: '#10B981', iconKey: 'jacare' },
  { letter: 'K', isVowel: false, exampleWord: 'Kiwi', phrase: 'K de Kiwi', phoneticHint: 'Som firme e rápido lá de trás: K!', color: '#84CC16', iconKey: 'kiwi' },
  { letter: 'L', isVowel: false, exampleWord: 'Lua', phrase: 'L de Lua', phoneticHint: 'Levante a ponta da língua até o céu da boca: Lll!', color: '#8B5CF6', iconKey: 'lua' },
  { letter: 'M', isVowel: false, exampleWord: 'Maçã', phrase: 'M de Maçã', phoneticHint: 'Feche os lábios juntinhos e vibre: Mmmm!', color: '#EF4444', iconKey: 'maca' },
  { letter: 'N', isVowel: false, exampleWord: 'Navio', phrase: 'N de Navio', phoneticHint: 'Língua colada atrás dos dentes e som pelo nariz: Nnn!', color: '#0284C7', iconKey: 'navio' },
  { letter: 'O', isVowel: true, exampleWord: 'Ovo', phrase: 'O de Ovo', phoneticHint: 'Faça uma bolinha com a boca: Óóó / Ôôô!', color: '#F59E0B', iconKey: 'ovo' },
  { letter: 'P', isVowel: false, exampleWord: 'Pato', phrase: 'P de Pato', phoneticHint: 'Feche os lábios e dê um pequeno sopro: Pá!', color: '#EAB308', iconKey: 'pato' },
  { letter: 'Q', isVowel: false, exampleWord: 'Queijo', phrase: 'Q de Queijo', phoneticHint: 'Vem quase sempre juntinho com o U: Quê!', color: '#F59E0B', iconKey: 'queijo' },
  { letter: 'R', isVowel: false, exampleWord: 'Rato', phrase: 'R de Rato', phoneticHint: 'Pode soprar forte no início (Rrr) ou tremer no meio!', color: '#64748B', iconKey: 'rato' },
  { letter: 'S', isVowel: false, exampleWord: 'Sol', phrase: 'S de Sol', phoneticHint: 'Sopre fininho como uma cobrinha feliz: Ssss!', color: '#F59E0B', iconKey: 'sol' },
  { letter: 'T', isVowel: false, exampleWord: 'Tartaruga', phrase: 'T de Tartaruga', phoneticHint: 'Bata a ponta da língua rápido atrás dos dentes: T!', color: '#10B981', iconKey: 'tartaruga' },
  { letter: 'U', isVowel: true, exampleWord: 'Uva', phrase: 'U de Uva', phoneticHint: 'Faça um biquinho pequeno e redondinho: Uuuu!', color: '#8B5CF6', iconKey: 'uva' },
  { letter: 'V', isVowel: false, exampleWord: 'Vaca', phrase: 'V de Vaca', phoneticHint: 'Dente de cima no lábio de baixo com motorzinho: Vvvv!', color: '#0EA5E9', iconKey: 'vaca' },
  { letter: 'W', isVowel: false, exampleWord: 'Waffle', phrase: 'W de Waffle', phoneticHint: 'Tem som de U ou de V dependendo da palavra!', color: '#F97316', iconKey: 'waffle' },
  { letter: 'X', isVowel: false, exampleWord: 'Xícara', phrase: 'X de Xícara', phoneticHint: 'Sopre suavemente fazendo biquinho: Shhh!', color: '#EC4899', iconKey: 'xicara' },
  { letter: 'Y', isVowel: false, exampleWord: 'Yakult', phrase: 'Y de Yakult', phoneticHint: 'Tem som bem parecido com a vogal I!', color: '#0284C7', iconKey: 'estrela' },
  { letter: 'Z', isVowel: false, exampleWord: 'Zebra', phrase: 'Z de Zebra', phoneticHint: 'Faça o zumbido da abelhinha nos dentes: Zzzz!', color: '#0F172A', iconKey: 'zebra' },
];

export interface PronunciationExercise {
  id: string;
  level: 'vogais' | 'consoantes' | 'silabas' | 'palavras' | 'frases-curtas' | 'frases-cotidiano' | 'pequenos-textos';
  title: string;
  targetText: string;
  instruction: string;
  iconKey: string;
  ageGroups: AgeGroup[];
  difficulty?: 'facil' | 'medio' | 'desafio';
}

export const PRONUNCIATION_LEVELS: { id: PronunciationExercise['level']; label: string }[] = [
  { id: 'vogais', label: 'Vogais' },
  { id: 'consoantes', label: 'Consoantes' },
  { id: 'silabas', label: 'Sílabas' },
  { id: 'palavras', label: 'Palavras' },
  { id: 'frases-curtas', label: 'Frases Curtas' },
  { id: 'frases-cotidiano', label: 'Cotidiano' },
  { id: 'pequenos-textos', label: 'Pequenos Textos' },
];

export const PRONUNCIATION_EXERCISES: PronunciationExercise[] = [
  // 1. VOGAIS
  { id: 'p-v-a', level: 'vogais', title: 'Som da Vogal A', targetText: 'Aaaa... Abelha!', instruction: 'Abra bem a boca como quem dá uma risadinha alegre.', iconKey: 'abelha', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-v-e', level: 'vogais', title: 'Som da Vogal E', targetText: 'Ééé... Elefante!', instruction: 'Sorria de leve e deixe o som sair bem claro.', iconKey: 'elefante', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-v-i', level: 'vogais', title: 'Som da Vogal I', targetText: 'Iiii... Igreja!', instruction: 'Dê um sorrisão largo mostrando os dentes e prolongue o som do I.', iconKey: 'igreja', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-v-o', level: 'vogais', title: 'Som da Vogal O', targetText: 'Óóó... Ovo!', instruction: 'Faça uma bolinha redonda com os lábios para o som do O.', iconKey: 'ovo', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-v-u', level: 'vogais', title: 'Som da Vogal U', targetText: 'Uuuu... Uva!', instruction: 'Faça um biquinho pequeno e redondinho para frente no som do U.', iconKey: 'uva', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-v-ou', level: 'vogais', title: 'A – E – I – O – U', targetText: 'A, E, I, O, U!', instruction: 'Troque o formato da boca em cada vogal com calma e alegria.', iconKey: 'sol', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-v-ae', level: 'vogais', title: 'Vogais A – E', targetText: 'A... E... A... E!', instruction: 'Alterne entre boca bem aberta no A e sorriso médio no E.', iconKey: 'abelha', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-v-ei', level: 'vogais', title: 'Vogais E – I', targetText: 'E... I... E... I!', instruction: 'Comece no sorriso suave do E e estique mais o sorriso no I.', iconKey: 'estrela', ageGroups: ['2-4', '5-7'], difficulty: 'medio' },
  { id: 'p-v-ou2', level: 'vogais', title: 'Vogais O – U', targetText: 'O... U... O... U!', instruction: 'Faça boca redonda no O e feche em biquinho menor no U.', iconKey: 'uva', ageGroups: ['2-4', '5-7'], difficulty: 'medio' },
  { id: 'p-v-af', level: 'vogais', title: 'Vogais Abertas e Fechadas', targetText: 'Á, Â, É, Ê, Ó, Ô!', instruction: 'Perceba a boca mais aberta em Á, É, Ó e mais fechada em Â, Ê, Ô.', iconKey: 'vovo_f', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-v-rep', level: 'vogais', title: 'Repetição dos Sons das Vogais', targetText: 'Aaa, Eee, Iii, Ooo, Uuu!', instruction: 'Sustente cada som por dois segundinhos sem pressa, respirando fundo.', iconKey: 'arco-iris', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'medio' },

  // 2. CONSOANTES (todas as 21 consoantes do alfabeto)
  { id: 'p-c-b', level: 'consoantes', title: 'Som do B', targetText: 'Bbb... Bola!', instruction: 'Junte os dois lábios e solte o som vibrando suavemente: B!', iconKey: 'bola', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-c-c', level: 'consoantes', title: 'Som do C', targetText: 'Câ... Casa!', instruction: 'Encoste o fundo da língua lá atrás e solte o som firme: Câ!', iconKey: 'casa', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-c-d', level: 'consoantes', title: 'Som do D', targetText: 'Ddd... Dado!', instruction: 'Bata a pontinha da língua atrás dos dentes de cima sentindo a voz vibrar.', iconKey: 'dado', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-c-f', level: 'consoantes', title: 'Som do F', targetText: 'Fff... Flor!', instruction: 'Sopre o ar devagar entre os dentes de cima e o lábio de baixo.', iconKey: 'flor', ageGroups: ['5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-c-g', level: 'consoantes', title: 'Som do G', targetText: 'Ggg... Gato!', instruction: 'Sinta uma cócega gostosa na garganta ao soltar o som do G.', iconKey: 'gato', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-c-h', level: 'consoantes', title: 'Som do H', targetText: 'Hipopótamo!', instruction: 'O H no início das palavras é silencioso e deixa o som da vogal brilhar!', iconKey: 'hipopotamo', ageGroups: ['5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-c-j', level: 'consoantes', title: 'Som do J', targetText: 'Jjj... Jacaré!', instruction: 'Faça biquinho leve e sopre sentindo a voz vibrar como um motorzinho.', iconKey: 'jacare', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-c-k', level: 'consoantes', title: 'Som do K', targetText: 'Kkk... Kiwi!', instruction: 'Solte um som rápido e firme lá do fundo da boca, igual ao C de casa.', iconKey: 'kiwi', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-c-l', level: 'consoantes', title: 'Som do L', targetText: 'Lll... Lua!', instruction: 'Levante a ponta da língua até o céu da boca atrás dos dentes.', iconKey: 'lua', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-c-m', level: 'consoantes', title: 'Som do M', targetText: 'Mmm... Mamãe!', instruction: 'Encoste os lábios com suavidade e sinta o nariz vibrar.', iconKey: 'mamae', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-c-n', level: 'consoantes', title: 'Som do N', targetText: 'Nnn... Navio!', instruction: 'Cole a ponta da língua atrás dos dentes de cima e deixe o som sair pelo nariz.', iconKey: 'navio', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-c-p', level: 'consoantes', title: 'Som do P', targetText: 'Ppp... Pato!', instruction: 'Feche os dois lábios juntos e solte um soprinho rápido para fora.', iconKey: 'pato', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-c-q', level: 'consoantes', title: 'Som do Q', targetText: 'Quê... Queijo!', instruction: 'O Q gosta da vogal U bem pertinho: articule firme lá atrás!', iconKey: 'queijo', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-c-r', level: 'consoantes', title: 'Som do R Vibrado', targetText: 'Arara azul!', instruction: 'Faça a pontinha da língua tremer levemente no céu da boca.', iconKey: 'passaro', ageGroups: ['5-7', '8-12'], difficulty: 'desafio' },
  { id: 'p-c-s', level: 'consoantes', title: 'Som do S', targetText: 'Sss... Sol!', instruction: 'Junte os dentes de leve e sopre fininho como uma cobrinha feliz.', iconKey: 'sol', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-c-t', level: 'consoantes', title: 'Som do T', targetText: 'Ttt... Tartaruga!', instruction: 'Bata a ponta da língua rapidinho atrás dos dentes de cima sem voz na garganta.', iconKey: 'tartaruga', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-c-v', level: 'consoantes', title: 'Som do V', targetText: 'Vvv... Vaca!', instruction: 'Encoste os dentes de cima no lábio de baixo fazendo um motorzinho vibrar.', iconKey: 'vaca', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-c-w', level: 'consoantes', title: 'Som do W', targetText: 'W... Waffle!', instruction: 'Em algumas palavras o W soa como U (Uaffle) e em outras como V!', iconKey: 'waffle', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-c-x', level: 'consoantes', title: 'Som do X', targetText: 'Shhh... Xícara!', instruction: 'Faça biquinho suave e sopre o ar como quem pede silêncio: shhh.', iconKey: 'xicara', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-c-y', level: 'consoantes', title: 'Som do Y', targetText: 'Iii... Yakult!', instruction: 'Dê um sorriso largo: o Y tem o mesmo som clarinho da vogal I.', iconKey: 'estrela', ageGroups: ['5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-c-z', level: 'consoantes', title: 'Som do Z', targetText: 'Zzz... Zebra!', instruction: 'Deixe o ar passar pelos dentes com o zumbido da abelhinha: Zzzz.', iconKey: 'zebra', ageGroups: ['5-7', '8-12'], difficulty: 'desafio' },

  // 3. SÍLABAS (todas as famílias silábicas do alfabeto)
  { id: 'p-s-ba', level: 'silabas', title: 'Família do B', targetText: 'Ba, Be, Bi, Bo, Bu!', instruction: 'Bata os lábios com alegria para cada sílaba.', iconKey: 'bola', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-s-ca', level: 'silabas', title: 'Família do C', targetText: 'Ca, Ce, Ci, Co, Cu!', instruction: 'Perceba o som firme em Ca, Co, Cu e o soprinho de S em Ce, Ci.', iconKey: 'casa', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-s-da', level: 'silabas', title: 'Família do D', targetText: 'Da, De, Di, Do, Du!', instruction: 'Toque a pontinha da língua atrás dos dentes de cima em cada sílaba.', iconKey: 'dado', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-s-fa', level: 'silabas', title: 'Família do F', targetText: 'Fa, Fe, Fi, Fo, Fu!', instruction: 'Encoste os dentes de cima no lábio de baixo e sopre suave com cada vogal.', iconKey: 'foca', ageGroups: ['5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-s-ga', level: 'silabas', title: 'Família do G', targetText: 'Ga, Ge, Gi, Go, Gu!', instruction: 'Note o som na garganta em Ga, Go, Gu e vibrado em Ge, Gi.', iconKey: 'gato', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-s-ha', level: 'silabas', title: 'Família do H', targetText: 'Ha, He, Hi, Ho, Hu!', instruction: 'Como o H inicial não tem som, pronuncie as vogais bem abertas e claras.', iconKey: 'hipopotamo', ageGroups: ['5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-s-ja', level: 'silabas', title: 'Família do J', targetText: 'Ja, Je, Ji, Jo, Ju!', instruction: 'Faça biquinho leve e sinta a voz vibrar em todas as cinco sílabas.', iconKey: 'jacare', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-s-ka', level: 'silabas', title: 'Família do K', targetText: 'Ka, Ke, Ki, Ko, Ku!', instruction: 'Articule com energia lá atrás da língua em todas as vogais.', iconKey: 'kiwi', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-s-la', level: 'silabas', title: 'Família do L', targetText: 'La, Le, Li, Lo, Lu!', instruction: 'Encoste a ponta da língua atrás dos dentes de cima.', iconKey: 'lua', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-s-ma', level: 'silabas', title: 'Família do M', targetText: 'Ma, Me, Mi, Mo, Mu!', instruction: 'Junte os lábios com carinho antes de abrir para cada vogal.', iconKey: 'mala', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-s-na', level: 'silabas', title: 'Família do N', targetText: 'Na, Ne, Ni, No, Nu!', instruction: 'Suba a ponta da língua atrás dos dentes sentindo o som passar pelo nariz.', iconKey: 'navio', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-s-pa', level: 'silabas', title: 'Família do P', targetText: 'Pa, Pe, Pi, Po, Pu!', instruction: 'Solte um soprinho rápido ao abrir os lábios.', iconKey: 'pato', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-s-qa', level: 'silabas', title: 'Família do Q', targetText: 'Qua, Que, Qui, Quo!', instruction: 'Pronuncie com clareza o som do Q junto das vogais.', iconKey: 'queijo', ageGroups: ['5-7', '8-12'], difficulty: 'desafio' },
  { id: 'p-s-ra', level: 'silabas', title: 'Família do R', targetText: 'Ra, Re, Ri, Ro, Ru!', instruction: 'Solte o sopro forte da garganta no R inicial de cada sílaba.', iconKey: 'rato', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-s-sa', level: 'silabas', title: 'Família do S', targetText: 'Sa, Se, Si, So, Su!', instruction: 'Comece cada sílaba com um soprinho fininho de cobrinha Sss.', iconKey: 'sapo', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-s-ta', level: 'silabas', title: 'Família do T', targetText: 'Ta, Te, Ti, To, Tu!', instruction: 'Dê uma batidinha rápida da língua atrás dos dentes em cada sílaba.', iconKey: 'tartaruga', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-s-va', level: 'silabas', title: 'Família do V', targetText: 'Va, Ve, Vi, Vo, Vu!', instruction: 'Encoste os dentes no lábio inferior vibrando suavemente em cada sílaba.', iconKey: 'vaca', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-s-wa', level: 'silabas', title: 'Família do W', targetText: 'Wa, We, Wi, Wo, Wu!', instruction: 'Treine cada sílaba suavemente começando com boquinha arredondada.', iconKey: 'waffle', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-s-xa', level: 'silabas', title: 'Família do X', targetText: 'Xa, Xe, Xi, Xo, Xu!', instruction: 'Faça biquinho leve soprando shhh antes de cada vogal.', iconKey: 'xicara', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-s-ya', level: 'silabas', title: 'Família do Y', targetText: 'Ya, Ye, Yi, Yo, Yu!', instruction: 'Comece sorrindo no som de I e deslize rápido para cada vogal.', iconKey: 'estrela', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-s-za', level: 'silabas', title: 'Família do Z', targetText: 'Za, Ze, Zi, Zo, Zu!', instruction: 'Faça o zumbido da abelhinha Zzz antes de abrir para a vogal.', iconKey: 'zebra', ageGroups: ['5-7', '8-12'], difficulty: 'desafio' },

  // 4. PALAVRAS (organizadas por dificuldade: Fácil -> Médio -> Desafio)
  { id: 'p-w-bola', level: 'palavras', title: 'Palavra Bola', targetText: 'Bo-la!', instruction: 'Junte os lábios no Bo e levante a ponta da língua no la.', iconKey: 'bola', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-w-bebe', level: 'palavras', title: 'Palavra Bebê', targetText: 'Be-bê!', instruction: 'Junte os dois lábios com alegria nos dois pedacinhos: Be e bê fechado.', iconKey: 'bebe', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-w-casa', level: 'palavras', title: 'Palavra Casa', targetText: 'Ca-sa!', instruction: 'Separe em duas sílabas calmas e junte depois.', iconKey: 'casa', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-w-dado', level: 'palavras', title: 'Palavra Dado', targetText: 'Da-do!', instruction: 'Bata a pontinha da língua atrás dos dentes duas vezes: Da e do.', iconKey: 'dado', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-w-foca', level: 'palavras', title: 'Palavra Foca', targetText: 'Fo-ca!', instruction: 'Sopre suave o F no Fo e termine firme no ca.', iconKey: 'foca', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-w-gato', level: 'palavras', title: 'Palavra Gato', targetText: 'Ga-to!', instruction: 'Sinta a garganta vibrar no Ga e bata a língua atrás dos dentes no to.', iconKey: 'gato', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-w-lata', level: 'palavras', title: 'Palavra Lata', targetText: 'La-ta!', instruction: 'Levante a ponta da língua no La e bata firme no ta.', iconKey: 'lata', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-w-mala', level: 'palavras', title: 'Palavra Mala', targetText: 'Ma-la!', instruction: 'Feche os lábios no Ma e suba a ponta da língua no la.', iconKey: 'mala', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-w-pato', level: 'palavras', title: 'Palavra Pato', targetText: 'Pa-to!', instruction: 'Solte um soprinho curto nos lábios para o Pa e bata a língua no to.', iconKey: 'pato', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-w-rato', level: 'palavras', title: 'Palavra Rato', targetText: 'Ra-to!', instruction: 'Sopre forte na garganta para o Ra e fale to bem claro.', iconKey: 'rato', ageGroups: ['5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-w-sapato', level: 'palavras', title: 'Palavra Sapato', targetText: 'Sa-pa-to!', instruction: 'Comece com a cobrinha Sss no Sa e fale pa - to com calma.', iconKey: 'sapato', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-w-banana', level: 'palavras', title: 'Palavra Banana', targetText: 'Ba-na-na!', instruction: 'Bata os lábios no Ba e repita na - na com ritmo gostoso.', iconKey: 'banana', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-w-boneca', level: 'palavras', title: 'Palavra Boneca', targetText: 'Bo-ne-ca!', instruction: 'Fale cada pedacinho devagar: Bo, ne e ca.', iconKey: 'boneca', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-w-cachorro', level: 'palavras', title: 'Palavra Cachorro', targetText: 'Ca-chor-ro!', instruction: 'Faça o soprinho shhh no chor e sopre forte na garganta no rro.', iconKey: 'cachorro', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-w-chocolate', level: 'palavras', title: 'Palavra Chocolate', targetText: 'Cho-co-la-te!', instruction: 'Sopre shhh no Cho, suba a língua no la e termine claro no te.', iconKey: 'chocolate', ageGroups: ['5-7', '8-12'], difficulty: 'desafio' },
  { id: 'p-w-borb', level: 'palavras', title: 'Palavra Borboleta', targetText: 'Bor-bo-le-ta!', instruction: 'Fale cada pedacinho batendo palmas devagar.', iconKey: 'borboleta', ageGroups: ['5-7', '8-12'], difficulty: 'desafio' },
  { id: 'p-w-telefone', level: 'palavras', title: 'Palavra Telefone', targetText: 'Te-le-fo-ne!', instruction: 'Separe os quatro pedacinhos com clareza: Te, le, fo, ne.', iconKey: 'telefone', ageGroups: ['5-7', '8-12'], difficulty: 'desafio' },
  { id: 'p-w-abacaxi', level: 'palavras', title: 'Palavra Abacaxi', targetText: 'A-ba-ca-xi!', instruction: 'Abra bem no A e termine soprando suavemente no xi.', iconKey: 'abacaxi', ageGroups: ['5-7', '8-12'], difficulty: 'desafio' },

  // 5. FRASES CURTAS
  { id: 'p-fc-1', level: 'frases-curtas', title: 'O Gato Mia', targetText: 'O gato bebe leite.', instruction: 'Leia e repita mantendo o ritmo entre as palavras.', iconKey: 'gato', ageGroups: ['5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-fc-2', level: 'frases-curtas', title: 'Bola Colorida', targetText: 'A bola azul rola rápido.', instruction: 'Capriche no som do L e do R em rola rápido.', iconKey: 'bola', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-fc-3', level: 'frases-curtas', title: 'Eu Sou Feliz', targetText: 'Eu sou feliz.', instruction: 'Fale com sorriso alegre e termine com o soprinho suave no Z de feliz.', iconKey: 'estrela', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-fc-4', level: 'frases-curtas', title: 'Gosto de Brincar', targetText: 'Eu gosto de brincar.', instruction: 'Articule bem o encontro BR em brincar sem pressa.', iconKey: 'brinquedo', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-fc-5', level: 'frases-curtas', title: 'Carinho com a Mamãe', targetText: 'Mamãe, eu te amo.', instruction: 'Junte os lábios com doçura em Mamãe e amo.', iconKey: 'mamae', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-fc-6', level: 'frases-curtas', title: 'Chamando o Papai', targetText: 'Papai, vem aqui.', instruction: 'Fale Papai bem claro e faça pausa curtinha antes de vem aqui.', iconKey: 'papai', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-fc-7', level: 'frases-curtas', title: 'Quero Água', targetText: 'Quero água.', instruction: 'Diga as duas palavras devagar abrindo bem a boca no Á de água.', iconKey: 'agua', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-fc-8', level: 'frases-curtas', title: 'Quero Brincar', targetText: 'Quero brincar.', instruction: 'Capriche na tremidinha da língua em Quero e no BR de brincar.', iconKey: 'carrinho', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-fc-9', level: 'frases-curtas', title: 'O Gato Pulou', targetText: 'O gato pulou.', instruction: 'Pronuncie firme o P e o L em pulou.', iconKey: 'gato', ageGroups: ['5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-fc-10', level: 'frases-curtas', title: 'Bebê Feliz', targetText: 'O bebê está feliz.', instruction: 'Articule cada palavra separadamente mantendo o ritmo suave.', iconKey: 'bebe', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-fc-11', level: 'frases-curtas', title: 'Minha Bola é Azul', targetText: 'Minha bola é azul.', instruction: 'Encoste o meio da língua no nha de Minha e capriche em azul.', iconKey: 'bola', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-fc-12', level: 'frases-curtas', title: 'Gosto de Banana', targetText: 'Eu gosto de banana.', instruction: 'Fale com ritmo calmo dando atenção às três sílabas de banana.', iconKey: 'banana', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-fc-13', level: 'frases-curtas', title: 'Menina Sorrindo', targetText: 'A menina está sorrindo.', instruction: 'Sopre forte no começo de sorrindo e feche suave no final.', iconKey: 'prima', ageGroups: ['5-7', '8-12'], difficulty: 'desafio' },
  { id: 'p-fc-14', level: 'frases-curtas', title: 'Cachorro Correndo', targetText: 'O cachorro está correndo.', instruction: 'Respire antes de falar e articule bem o chor e o rren.', iconKey: 'cachorro', ageGroups: ['5-7', '8-12'], difficulty: 'desafio' },

  // 6. COTIDIANO
  { id: 'p-co-1', level: 'frases-cotidiano', title: 'Pedindo com Carinho', targetText: 'Por favor, eu quero água.', instruction: 'Fale de forma clara e pausada para todos entenderem bem.', iconKey: 'agua', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-co-2', level: 'frases-cotidiano', title: 'Convidando para Brincar', targetText: 'Você quer brincar comigo agora?', instruction: 'Dê uma entonação alegre de pergunta no final!', iconKey: 'boneca', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-co-3', level: 'frases-cotidiano', title: 'Bom Dia!', targetText: 'Bom dia!', instruction: 'Comece com os lábios juntinhos no Bom e dê um sorriso alegre no dia.', iconKey: 'sol', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-co-4', level: 'frases-cotidiano', title: 'Boa Tarde!', targetText: 'Boa tarde!', instruction: 'Abra a boca no Bo-a e bata a língua atrás dos dentes em tarde.', iconKey: 'sol', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-co-5', level: 'frases-cotidiano', title: 'Boa Noite!', targetText: 'Boa noite!', instruction: 'Fale suave e calmo antes de descansar.', iconKey: 'lua', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-co-6', level: 'frases-cotidiano', title: 'Tudo Bem?', targetText: 'Tudo bem?', instruction: 'Suba um pouquinho o tom da voz no final mostrando pergunta.', iconKey: 'rosto', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-co-7', level: 'frases-cotidiano', title: 'Como Você Está?', targetText: 'Como você está?', instruction: 'Articule cada palavra com calma olhando para quem você conversa.', iconKey: 'irmao', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-co-8', level: 'frases-cotidiano', title: 'Meu Nome É...', targetText: 'Meu nome é...', instruction: 'Fale "Meu nome é" e depois diga o seu próprio nome bem alto e claro!', iconKey: 'mochila', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-co-9', level: 'frases-cotidiano', title: 'Quero Comer', targetText: 'Quero comer.', instruction: 'Fale com clareza na hora do lanche ou das refeições.', iconKey: 'prato', ageGroups: ['2-4', '5-7'], difficulty: 'facil' },
  { id: 'p-co-10', level: 'frases-cotidiano', title: 'Quero Beber Água', targetText: 'Quero beber água.', instruction: 'Junte bem os lábios em beber e abra bem no água.', iconKey: 'copo', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-co-11', level: 'frases-cotidiano', title: 'Vamos Brincar?', targetText: 'Vamos brincar?', instruction: 'Sinta a vibração do V em Vamos e dê tom alegre de convite.', iconKey: 'bola', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-co-12', level: 'frases-cotidiano', title: 'Muito Obrigado!', targetText: 'Muito obrigado!', instruction: 'Fale pausadamente agradecendo com gentileza.', iconKey: 'flor', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-co-13', level: 'frases-cotidiano', title: 'Por Favor', targetText: 'Por favor.', instruction: 'Capriche no P inicial de Por e no sopro do F e V em favor.', iconKey: 'mao', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-co-14', level: 'frases-cotidiano', title: 'Até Amanhã!', targetText: 'Até amanhã!', instruction: 'Fale com sorriso simpático na hora de se despedir.', iconKey: 'estrela', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-co-15', level: 'frases-cotidiano', title: 'Estou Feliz', targetText: 'Estou feliz.', instruction: 'Respire tranquilo e compartilhe esse sentimento bom.', iconKey: 'arco-iris', ageGroups: ['2-4', '5-7', '8-12'], difficulty: 'facil' },
  { id: 'p-co-16', level: 'frases-cotidiano', title: 'Preciso de Ajuda', targetText: 'Preciso de ajuda.', instruction: 'Fale cada sílaba devagar quando quiser pedir apoio a alguém.', iconKey: 'mao', ageGroups: ['5-7', '8-12'], difficulty: 'desafio' },

  // 7. PEQUENOS TEXTOS
  { id: 'p-tx-1', level: 'pequenos-textos', title: 'Manhã no Jardim', targetText: 'O sol nasceu quentinho. O passarinho cantou na árvore verde e a flor se abriu.', instruction: 'Respire fundo entre as frases e leia com calma.', iconKey: 'arvore', ageGroups: ['8-12'], difficulty: 'medio' },
  { id: 'p-tx-2', level: 'pequenos-textos', title: 'Passeio no Parque', targetText: 'Lucas levou sua bola amarela para o parque. Ele brincou com o cachorro e tomou suco de maçã.', instruction: 'Pronuncie cada final de palavra com clareza.', iconKey: 'cachorro', ageGroups: ['8-12'], difficulty: 'desafio' },
  { id: 'p-tx-3', level: 'pequenos-textos', title: 'Texto 1 – Minha família', targetText: 'Minha família é muito especial. Eu amo minha mamãe, meu papai e meus irmãos.', instruction: 'Faça uma pequena pausa no ponto final e fale com carinho.', iconKey: 'mamae', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-tx-4', level: 'pequenos-textos', title: 'Texto 2 – O cachorrinho', targetText: 'O cachorrinho gosta de correr, brincar e passear. Ele é muito feliz.', instruction: 'Articule bem as ações correr, brincar e passear com ritmo tranquilo.', iconKey: 'cachorro', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-tx-5', level: 'pequenos-textos', title: 'Texto 3 – A natureza', targetText: 'O sol brilha no céu. Os pássaros cantam e as flores deixam o jardim bonito.', instruction: 'Respire fundo entre as duas frases e pronuncie cada palavra devagar.', iconKey: 'jardim', ageGroups: ['5-7', '8-12'], difficulty: 'desafio' },
  { id: 'p-tx-6', level: 'pequenos-textos', title: 'Texto 4 – Meu dia', targetText: 'Eu acordo, escovo os dentes, tomo café e vou brincar.', instruction: 'Conte cada parte do seu dia fazendo pequenas pausas nas vírgulas.', iconKey: 'escova', ageGroups: ['5-7', '8-12'], difficulty: 'medio' },
  { id: 'p-tx-7', level: 'pequenos-textos', title: 'Texto 5 – A escola', targetText: 'Na escola eu aprendo, desenho, canto e brinco com meus amigos.', instruction: 'Fale com entonação alegre e clara do começo ao fim.', iconKey: 'mochila', ageGroups: ['5-7', '8-12'], difficulty: 'desafio' },
];

export type OralExerciseMode =
  | 'protrusion'
  | 'lateral'
  | 'nose-chin'
  | 'palate-suction'
  | 'tongue-click'
  | 'open-close'
  | 'smile-relax';

export interface OralMotorExercise {
  id: OralExerciseMode;
  title: string;
  instruction: string;
  cueText: string;
  color: string;
}

export const ORAL_MOTOR_EXERCISES: OralMotorExercise[] = [
  {
    id: 'protrusion',
    title: '1. Protrusão da língua',
    instruction: 'Coloque a pontinha da língua para fora devagar e depois recolha para dentro da boca.',
    cueText: 'Língua para fora... e volta para dentro!',
    color: '#EC4899',
  },
  {
    id: 'lateral',
    title: '2. Lateralizar a língua',
    instruction: 'Leve a ponta da língua até o cantinho direito da boca e depois para o cantinho esquerdo.',
    cueText: 'Para a direita... para a esquerda!',
    color: '#0284C7',
  },
  {
    id: 'nose-chin',
    title: '3. Língua no nariz e queixo',
    instruction: 'Aponte a língua para cima em direção ao nariz e depois para baixo em direção ao queixo.',
    cueText: 'Para cima no nariz... para baixo no queixo!',
    color: '#F59E0B',
  },
  {
    id: 'palate-suction',
    title: '4. Acoplar a língua no palato',
    instruction: 'Encoste toda a língua coladinha no céu da boca fazendo uma leve sucção e segure.',
    cueText: 'Cola a língua no céu da boca e segura!',
    color: '#8B5CF6',
  },
  {
    id: 'tongue-click',
    title: '5. Estalar a língua',
    instruction: 'Cole a língua no céu da boca e puxe rápido fazendo o som de estalo igual ao cavalinho.',
    cueText: 'Estala a língua: tlc, tlc, tlc!',
    color: '#10B981',
  },
  {
    id: 'open-close',
    title: '6. Abrir e fechar a boca',
    instruction: 'Abra a boca bem grandona como um leão bocejando e depois feche suavemente.',
    cueText: 'Abre bem a boca... e fecha devagar!',
    color: '#F97316',
  },
  {
    id: 'smile-relax',
    title: '7. Sorriso e relaxamento dos lábios',
    instruction: 'Dê um sorrisão bem largo mostrando alegria e depois relaxe os lábios em biquinho suave.',
    cueText: 'Sorrisão largo... e relaxa os lábios!',
    color: '#0EA5E9',
  },
];

export type AnimalCategory =
  | 'Animais Domésticos'
  | 'Animais da Fazenda'
  | 'Animais Selvagens'
  | 'Animais da Floresta'
  | 'Animais Aquáticos'
  | 'Aves'
  | 'Insetos';

export const ANIMAL_CATEGORIES: ('Todos' | AnimalCategory)[] = [
  'Todos',
  'Animais Domésticos',
  'Animais da Fazenda',
  'Animais Selvagens',
  'Animais da Floresta',
  'Animais Aquáticos',
  'Aves',
  'Insetos',
];

export interface AnimalSoundItem {
  id: string;
  name: string;
  onomatopoeia: string;
  speechPhrase: string;
  categories: AnimalCategory[];
  audioSrc: string;
  color: string;
}

export const ANIMAL_SOUNDS: AnimalSoundItem[] = [
  {
    id: 'cachorro',
    name: 'Cachorro',
    onomatopoeia: 'Au au!',
    speechPhrase: 'O cachorro faz au au!',
    categories: ['Animais Domésticos'],
    audioSrc: '/audio/animals/cachorro.mp3',
    color: '#F97316',
  },
  {
    id: 'gato',
    name: 'Gato',
    onomatopoeia: 'Miau!',
    speechPhrase: 'O gato faz miau!',
    categories: ['Animais Domésticos'],
    audioSrc: '/audio/animals/gato.mp3',
    color: '#8B5CF6',
  },
  {
    id: 'vaca',
    name: 'Vaca',
    onomatopoeia: 'Muuu!',
    speechPhrase: 'A vaca faz muuu!',
    categories: ['Animais da Fazenda'],
    audioSrc: '/audio/animals/vaca.mp3',
    color: '#10B981',
  },
  {
    id: 'porco',
    name: 'Porco',
    onomatopoeia: 'Oinc oinc!',
    speechPhrase: 'O porco faz oinc oinc!',
    categories: ['Animais da Fazenda'],
    audioSrc: '/audio/animals/porco.mp3',
    color: '#EC4899',
  },
  {
    id: 'cavalo',
    name: 'Cavalo',
    onomatopoeia: 'Relincho!',
    speechPhrase: 'O cavalo relincha!',
    categories: ['Animais da Fazenda'],
    audioSrc: '/audio/animals/cavalo.mp3',
    color: '#0284C7',
  },
  {
    id: 'ovelha',
    name: 'Ovelha',
    onomatopoeia: 'Mééé!',
    speechPhrase: 'A ovelha faz mééé!',
    categories: ['Animais da Fazenda'],
    audioSrc: '/audio/animals/ovelha.mp3',
    color: '#0EA5E9',
  },
  {
    id: 'cabra',
    name: 'Cabra',
    onomatopoeia: 'Mééé!',
    speechPhrase: 'A cabra faz mééé!',
    categories: ['Animais da Fazenda'],
    audioSrc: '/audio/animals/cabra.mp3',
    color: '#14B8A6',
  },
  {
    id: 'galinha',
    name: 'Galinha',
    onomatopoeia: 'Có có có!',
    speechPhrase: 'A galinha faz có có có!',
    categories: ['Animais da Fazenda', 'Aves'],
    audioSrc: '/audio/animals/galinha.mp3',
    color: '#EF4444',
  },
  {
    id: 'galo',
    name: 'Galo',
    onomatopoeia: 'Cocoricó!',
    speechPhrase: 'O galo canta cocoricó!',
    categories: ['Animais da Fazenda', 'Aves'],
    audioSrc: '/audio/animals/galo.mp3',
    color: '#DC2626',
  },
  {
    id: 'pato',
    name: 'Pato',
    onomatopoeia: 'Quá quá!',
    speechPhrase: 'O pato faz quá quá!',
    categories: ['Animais da Fazenda', 'Animais Aquáticos', 'Aves'],
    audioSrc: '/audio/animals/pato.mp3',
    color: '#CA8A04',
  },
  {
    id: 'pintinho',
    name: 'Pintinho',
    onomatopoeia: 'Piu piu!',
    speechPhrase: 'O pintinho faz piu piu!',
    categories: ['Animais da Fazenda', 'Aves'],
    audioSrc: '/audio/animals/pintinho.mp3',
    color: '#D97706',
  },
  {
    id: 'burro',
    name: 'Burro',
    onomatopoeia: 'Ió ió!',
    speechPhrase: 'O burro faz ió ió!',
    categories: ['Animais da Fazenda'],
    audioSrc: '/audio/animals/burro.mp3',
    color: '#6366F1',
  },
  {
    id: 'leao',
    name: 'Leão',
    onomatopoeia: 'Roooar!',
    speechPhrase: 'O leão ruge roooar!',
    categories: ['Animais Selvagens'],
    audioSrc: '/audio/animals/leao.mp3',
    color: '#F59E0B',
  },
  {
    id: 'tigre',
    name: 'Tigre',
    onomatopoeia: 'Grrrr!',
    speechPhrase: 'O tigre faz grrrr!',
    categories: ['Animais Selvagens'],
    audioSrc: '/audio/animals/tigre.mp3',
    color: '#EA580C',
  },
  {
    id: 'elefante',
    name: 'Elefante',
    onomatopoeia: 'Trombeta!',
    speechPhrase: 'O elefante toca a tromba!',
    categories: ['Animais Selvagens'],
    audioSrc: '/audio/animals/elefante.mp3',
    color: '#0284C7',
  },
  {
    id: 'macaco',
    name: 'Macaco',
    onomatopoeia: 'Uh uh ah ah!',
    speechPhrase: 'O macaco faz uh uh ah ah!',
    categories: ['Animais Selvagens', 'Animais da Floresta'],
    audioSrc: '/audio/animals/macaco.mp3',
    color: '#B45309',
  },
  {
    id: 'lobo',
    name: 'Lobo',
    onomatopoeia: 'Uuuuu!',
    speechPhrase: 'O lobo uiva uuuuu!',
    categories: ['Animais Selvagens', 'Animais da Floresta'],
    audioSrc: '/audio/animals/lobo.mp3',
    color: '#475569',
  },
  {
    id: 'urso',
    name: 'Urso',
    onomatopoeia: 'Grunhido!',
    speechPhrase: 'O urso faz um grunhido forte!',
    categories: ['Animais Selvagens', 'Animais da Floresta'],
    audioSrc: '/audio/animals/urso.mp3',
    color: '#92400E',
  },
  {
    id: 'sapo',
    name: 'Sapo',
    onomatopoeia: 'Croac croac!',
    speechPhrase: 'O sapo faz croac croac!',
    categories: ['Animais da Floresta', 'Animais Aquáticos'],
    audioSrc: '/audio/animals/sapo.mp3',
    color: '#16A34A',
  },
  {
    id: 'cobra',
    name: 'Cobra',
    onomatopoeia: 'Sssss!',
    speechPhrase: 'A cobra faz sssss!',
    categories: ['Animais Selvagens', 'Animais da Floresta'],
    audioSrc: '/audio/animals/cobra.mp3',
    color: '#15803D',
  },
  {
    id: 'coruja',
    name: 'Coruja',
    onomatopoeia: 'Uhu uhu!',
    speechPhrase: 'A coruja faz uhu uhu!',
    categories: ['Animais da Floresta', 'Aves'],
    audioSrc: '/audio/animals/coruja.mp3',
    color: '#7C3AED',
  },
  {
    id: 'papagaio',
    name: 'Papagaio',
    onomatopoeia: 'Reproduz sons e palavras!',
    speechPhrase: 'O papagaio adora imitar sons e palavras!',
    categories: ['Animais Domésticos', 'Animais da Floresta', 'Aves'],
    audioSrc: '/audio/animals/papagaio.mp3',
    color: '#059669',
  },
  {
    id: 'passaro',
    name: 'Pássaro',
    onomatopoeia: 'Piu piu!',
    speechPhrase: 'O pássaro canta piu piu!',
    categories: ['Animais Domésticos', 'Animais da Floresta', 'Aves'],
    audioSrc: '/audio/animals/passaro.mp3',
    color: '#0EA5E9',
  },
  {
    id: 'pomba',
    name: 'Pomba',
    onomatopoeia: 'Gru gru!',
    speechPhrase: 'A pomba faz gru gru!',
    categories: ['Aves'],
    audioSrc: '/audio/animals/pomba.mp3',
    color: '#64748B',
  },
  {
    id: 'aguia',
    name: 'Águia',
    onomatopoeia: 'Pio!',
    speechPhrase: 'A águia dá um pio bem alto!',
    categories: ['Animais Selvagens', 'Aves'],
    audioSrc: '/audio/animals/aguia.mp3',
    color: '#B45309',
  },
  {
    id: 'golfinho',
    name: 'Golfinho',
    onomatopoeia: 'Cliques e assobios!',
    speechPhrase: 'O golfinho faz cliques e assobios!',
    categories: ['Animais Aquáticos'],
    audioSrc: '/audio/animals/golfinho.mp3',
    color: '#0284C7',
  },
  {
    id: 'baleia',
    name: 'Baleia',
    onomatopoeia: 'Cantos!',
    speechPhrase: 'A baleia faz lindos cantos no mar!',
    categories: ['Animais Aquáticos'],
    audioSrc: '/audio/animals/baleia.mp3',
    color: '#1D4ED8',
  },
  {
    id: 'foca',
    name: 'Foca',
    onomatopoeia: 'Latidos e grunhidos!',
    speechPhrase: 'A foca faz latidos e grunhidos!',
    categories: ['Animais Aquáticos'],
    audioSrc: '/audio/animals/foca.mp3',
    color: '#0F766E',
  },
  {
    id: 'abelha',
    name: 'Abelha',
    onomatopoeia: 'Zum zum!',
    speechPhrase: 'A abelha faz zum zum!',
    categories: ['Insetos', 'Animais da Floresta'],
    audioSrc: '/audio/animals/abelha.mp3',
    color: '#CA8A04',
  },
  {
    id: 'grilo',
    name: 'Grilo',
    onomatopoeia: 'Cri cri!',
    speechPhrase: 'O grilo faz cri cri!',
    categories: ['Insetos', 'Animais da Floresta'],
    audioSrc: '/audio/animals/grilo.mp3',
    color: '#16A34A',
  },
  {
    id: 'cigarra',
    name: 'Cigarra',
    onomatopoeia: 'Ziiii!',
    speechPhrase: 'A cigarra faz ziiii!',
    categories: ['Insetos', 'Animais da Floresta'],
    audioSrc: '/audio/animals/cigarra.mp3',
    color: '#65A30D',
  },
];

export type DailyPhraseCategory =
  | 'Cumprimentos'
  | 'Educação'
  | 'Família'
  | 'Alimentação'
  | 'Necessidades'
  | 'Sentimentos'
  | 'Brincadeiras'
  | 'Escola'
  | 'Socialização'
  | 'Perguntas'
  | 'Despedidas';

export const DAILY_PHRASE_CATEGORIES: ('Todos' | DailyPhraseCategory)[] = [
  'Todos',
  'Cumprimentos',
  'Educação',
  'Família',
  'Alimentação',
  'Necessidades',
  'Sentimentos',
  'Brincadeiras',
  'Escola',
  'Socialização',
  'Perguntas',
  'Despedidas',
];

export interface DailyPhraseItem {
  id: string;
  phrase: string;
  context: string;
  categories: DailyPhraseCategory[];
  iconKey: string;
  color: string;
}

export const DAILY_PHRASES: DailyPhraseItem[] = [
  // Cumprimentos
  { id: 'bom-dia', phrase: 'Bom dia!', context: 'Ao acordar com alegria', categories: ['Cumprimentos'], iconKey: 'sol', color: '#F59E0B' },
  { id: 'boa-tarde', phrase: 'Boa tarde!', context: 'Ao encontrar alguém à tarde', categories: ['Cumprimentos'], iconKey: 'sol', color: '#F97316' },
  { id: 'boa-noite', phrase: 'Boa noite!', context: 'À noite ou antes de dormir', categories: ['Cumprimentos', 'Despedidas'], iconKey: 'lua', color: '#6366F1' },
  { id: 'ola', phrase: 'Olá!', context: 'Cumprimento alegre ao chegar', categories: ['Cumprimentos'], iconKey: 'tchau', color: '#0EA5E9' },
  { id: 'oi-tudo-bem', phrase: 'Oi, tudo bem?', context: 'Cumprimentando um amigo com carinho', categories: ['Cumprimentos'], iconKey: 'amigos', color: '#10B981' },
  { id: 'como-voce-esta', phrase: 'Como você está?', context: 'Perguntando com educação como a pessoa está', categories: ['Cumprimentos'], iconKey: 'feliz', color: '#0284C7' },
  { id: 'que-bom-te-ver', phrase: 'Que bom te ver!', context: 'Demonstrando alegria ao reencontrar alguém', categories: ['Cumprimentos'], iconKey: 'coracao', color: '#EC4899' },
  { id: 'tudo-bem-comigo', phrase: 'Tudo bem comigo!', context: 'Respondendo quando perguntam como você está', categories: ['Cumprimentos'], iconKey: 'feliz', color: '#16A34A' },

  // Educação
  { id: 'por-favor', phrase: 'Por favor.', context: 'Ao pedir algo com educação', categories: ['Educação'], iconKey: 'flor', color: '#10B981' },
  { id: 'obrigado', phrase: 'Obrigado!', context: 'Agradecendo por uma ajuda ou presente', categories: ['Educação'], iconKey: 'estrela', color: '#F59E0B' },
  { id: 'muito-obrigado', phrase: 'Muito obrigado!', context: 'Agradecendo com muita gentileza', categories: ['Educação'], iconKey: 'flor', color: '#10B981' },
  { id: 'com-licenca', phrase: 'Com licença.', context: 'Pedindo passagem ou para falar com respeito', categories: ['Educação'], iconKey: 'porta', color: '#0284C7' },
  { id: 'desculpe', phrase: 'Desculpe!', context: 'Pedindo perdão quando acontecer um engano', categories: ['Educação'], iconKey: 'abraco', color: '#EC4899' },
  { id: 'me-desculpe', phrase: 'Me desculpe.', context: 'Mostrando cuidado após um esbarrão', categories: ['Educação'], iconKey: 'coracao', color: '#F43F5E' },
  { id: 'posso-entrar', phrase: 'Posso entrar?', context: 'Antes de entrar em um ambiente', categories: ['Educação'], iconKey: 'porta', color: '#8B5CF6' },
  { id: 'posso-brincar', phrase: 'Posso brincar?', context: 'Pedindo gentilmente para participar da brincadeira', categories: ['Educação'], iconKey: 'brinquedo', color: '#F97316' },
  { id: 'de-nada', phrase: 'De nada!', context: 'Respondendo quando alguém agradece a você', categories: ['Educação'], iconKey: 'feliz', color: '#14B8A6' },
  { id: 'muito-prazer', phrase: 'Muito prazer!', context: 'Ao conhecer uma pessoa nova', categories: ['Educação', 'Socialização'], iconKey: 'amigos', color: '#0EA5E9' },

  // Família
  { id: 'mamae-te-amo', phrase: 'Mamãe, eu te amo!', context: 'Mostrando carinho pela mamãe', categories: ['Família'], iconKey: 'mamae', color: '#EC4899' },
  { id: 'papai-vem-aqui', phrase: 'Papai, vem aqui!', context: 'Chamando o papai para mostrar algo', categories: ['Família'], iconKey: 'papai', color: '#0284C7' },
  { id: 'vem-ca', phrase: 'Vem cá!', context: 'Pedindo companhia por perto', categories: ['Família'], iconKey: 'mamae', color: '#EC4899' },
  { id: 'falar-com-vovo', phrase: 'Quero falar com a vovó.', context: 'Chamando a vovó para conversar', categories: ['Família'], iconKey: 'vovo_f', color: '#8B5CF6' },
  { id: 'cade-meu-irmao', phrase: 'Cadê meu irmão?', context: 'Procurando seu irmão em casa', categories: ['Família'], iconKey: 'irmao', color: '#F97316' },
  { id: 'vamos-brincar-juntos', phrase: 'Vamos brincar juntos?', context: 'Convidando para se divertir em companhia', categories: ['Família', 'Brincadeiras'], iconKey: 'brinquedo', color: '#10B981' },
  { id: 'quero-um-abraco', phrase: 'Quero um abraço.', context: 'Pedindo carinho e aconchego', categories: ['Família'], iconKey: 'abraco', color: '#F43F5E' },
  { id: 'bom-dia-mamae', phrase: 'Bom dia, mamãe!', context: 'Saudando a mamãe ao acordar', categories: ['Família'], iconKey: 'mamae', color: '#F59E0B' },
  { id: 'boa-noite-papai', phrase: 'Boa noite, papai!', context: 'Despedindo-se do papai antes de dormir', categories: ['Família'], iconKey: 'papai', color: '#6366F1' },

  // Alimentação
  { id: 'estou-fome', phrase: 'Estou com fome.', context: 'Na hora do lanchinho ou refeição', categories: ['Alimentação'], iconKey: 'maca', color: '#EF4444' },
  { id: 'estou-sede', phrase: 'Estou com sede.', context: 'Quando precisar beber algo', categories: ['Alimentação'], iconKey: 'copo', color: '#0284C7' },
  { id: 'quero-agua', phrase: 'Quero água.', context: 'Pedindo um copo de água fresquinha', categories: ['Alimentação'], iconKey: 'agua', color: '#0EA5E9' },
  { id: 'quero-leite', phrase: 'Quero leite.', context: 'Na hora do café da manhã ou lanche', categories: ['Alimentação'], iconKey: 'leite', color: '#3B82F6' },
  { id: 'quero-comer', phrase: 'Quero comer.', context: 'Avisando que quer se alimentar', categories: ['Alimentação'], iconKey: 'prato', color: '#F97316' },
  { id: 'quero-uma-fruta', phrase: 'Quero uma fruta.', context: 'Escolhendo uma frutinha gostosa', categories: ['Alimentação'], iconKey: 'banana', color: '#CA8A04' },
  { id: 'esta-gostoso', phrase: 'Está gostoso!', context: 'Elogiando a comida preparada com carinho', categories: ['Alimentação'], iconKey: 'bolo', color: '#EC4899' },
  { id: 'mais-um-pouquinho', phrase: 'Mais um pouquinho.', context: 'Pedindo mais comida ou bebida', categories: ['Alimentação'], iconKey: 'colher', color: '#10B981' },
  { id: 'ja-terminei', phrase: 'Já terminei.', context: 'Avisando que acabou de comer', categories: ['Alimentação'], iconKey: 'prato', color: '#16A34A' },
  { id: 'nao-quero-mais', phrase: 'Não quero mais.', context: 'Avisando com calma que já está satisfeito', categories: ['Alimentação'], iconKey: 'copo', color: '#64748B' },

  // Necessidades
  { id: 'quero-ir-banheiro', phrase: 'Quero ir ao banheiro.', context: 'Avisando quando precisa usar o banheiro', categories: ['Necessidades'], iconKey: 'banheiro', color: '#0284C7' },
  { id: 'preciso-de-ajuda', phrase: 'Preciso de ajuda.', context: 'Pedindo auxílio para fazer algo', categories: ['Necessidades'], iconKey: 'mao', color: '#8B5CF6' },
  { id: 'me-ajuda', phrase: 'Me ajuda!', context: 'Quando precisar de apoio rapidinho', categories: ['Necessidades'], iconKey: 'mao', color: '#7C3AED' },
  { id: 'estou-com-frio', phrase: 'Estou com frio.', context: 'Pedindo um agasalho ou cobertor', categories: ['Necessidades'], iconKey: 'frio', color: '#0EA5E9' },
  { id: 'estou-com-calor', phrase: 'Estou com calor.', context: 'Avisando que está muito quente', categories: ['Necessidades'], iconKey: 'sol', color: '#F97316' },
  { id: 'quero-descansar', phrase: 'Quero descansar.', context: 'Quando o corpo pedir uma pausa', categories: ['Necessidades'], iconKey: 'cama', color: '#14B8A6' },
  { id: 'estou-com-sono', phrase: 'Estou com sono.', context: 'Avisando que está na hora de dormir', categories: ['Necessidades'], iconKey: 'lua', color: '#6366F1' },
  { id: 'quero-sentar', phrase: 'Quero sentar.', context: 'Pedindo um lugar para se acomodar', categories: ['Necessidades'], iconKey: 'cadeira', color: '#D97706' },
  { id: 'quero-levantar', phrase: 'Quero levantar.', context: 'Avisando que quer sair da cadeira ou cama', categories: ['Necessidades'], iconKey: 'pe', color: '#10B981' },
  { id: 'nao-estou-bem', phrase: 'Não estou bem.', context: 'Contando quando sentir algum desconforto', categories: ['Necessidades'], iconKey: 'coracao', color: '#EF4444' },
  { id: 'pode-me-ajudar', phrase: 'Pode me ajudar?', context: 'Perguntando com gentileza se alguém pode ajudar', categories: ['Necessidades'], iconKey: 'mao', color: '#0284C7' },

  // Sentimentos
  { id: 'estou-feliz', phrase: 'Estou feliz!', context: 'Compartilhando um sorriso alegre', categories: ['Sentimentos'], iconKey: 'feliz', color: '#EAB308' },
  { id: 'estou-triste', phrase: 'Estou triste.', context: 'Expressando quando algo deixou você chateado', categories: ['Sentimentos'], iconKey: 'triste', color: '#0284C7' },
  { id: 'estou-animado', phrase: 'Estou animado!', context: 'Mostrando empolgação com algo legal', categories: ['Sentimentos'], iconKey: 'estrela', color: '#F97316' },
  { id: 'estou-com-medo', phrase: 'Estou com medo.', context: 'Contando para um adulto quando ficar assustado', categories: ['Sentimentos'], iconKey: 'medo', color: '#8B5CF6' },
  { id: 'estou-bravo', phrase: 'Estou bravo.', context: 'Nomeando a raiva com palavras calmas', categories: ['Sentimentos'], iconKey: 'bravo', color: '#EF4444' },
  { id: 'estou-tranquilo', phrase: 'Estou tranquilo.', context: 'Sentindo paz e serenidade', categories: ['Sentimentos'], iconKey: 'calmo', color: '#14B8A6' },
  { id: 'estou-com-vergonha', phrase: 'Estou com vergonha.', context: 'Falando quando se sentir tímido', categories: ['Sentimentos'], iconKey: 'vergonha', color: '#EC4899' },
  { id: 'gosto-de-voce', phrase: 'Gosto de você!', context: 'Demonstrando carinho por alguém especial', categories: ['Sentimentos', 'Socialização'], iconKey: 'coracao', color: '#F43F5E' },
  { id: 'estou-muito-feliz', phrase: 'Estou muito feliz!', context: 'Comemorando uma alegria enorme', categories: ['Sentimentos'], iconKey: 'feliz', color: '#F59E0B' },
  { id: 'preciso-de-um-abraco', phrase: 'Preciso de um abraço.', context: 'Pedindo carinho para se sentir melhor', categories: ['Sentimentos'], iconKey: 'abraco', color: '#EC4899' },

  // Brincadeiras
  { id: 'vamos-brincar', phrase: 'Vamos brincar?', context: 'Chamando amigos ou família para brincar', categories: ['Brincadeiras'], iconKey: 'bola', color: '#10B981' },
  { id: 'quero-brincar', phrase: 'Quero brincar.', context: 'Mostrando vontade de se divertir', categories: ['Brincadeiras'], iconKey: 'boneca', color: '#F97316' },
  { id: 'vamos-jogar-bola', phrase: 'Vamos jogar bola?', context: 'Convidando para uma partida divertida', categories: ['Brincadeiras'], iconKey: 'bola', color: '#0284C7' },
  { id: 'e-minha-vez', phrase: 'É minha vez!', context: 'Combinando a ordem na brincadeira', categories: ['Brincadeiras'], iconKey: 'dado', color: '#8B5CF6' },
  { id: 'agora-e-sua-vez', phrase: 'Agora é sua vez!', context: 'Passando a vez com amizade', categories: ['Brincadeiras'], iconKey: 'dado', color: '#14B8A6' },
  { id: 'vamos-correr', phrase: 'Vamos correr?', context: 'Brincando ao ar livre', categories: ['Brincadeiras'], iconKey: 'sapato', color: '#EF4444' },
  { id: 'quero-brincar-tambem', phrase: 'Quero brincar também.', context: 'Pedindo para entrar na roda', categories: ['Brincadeiras'], iconKey: 'carrinho', color: '#F59E0B' },
  { id: 'que-divertido', phrase: 'Que divertido!', context: 'Comemorando uma brincadeira bem legal', categories: ['Brincadeiras'], iconKey: 'estrela', color: '#EC4899' },
  { id: 'vamos-passear', phrase: 'Vamos passear?', context: 'Convidando para dar uma volta', categories: ['Brincadeiras'], iconKey: 'arvore', color: '#16A34A' },
  { id: 'eu-consegui', phrase: 'Eu consegui!', context: 'Vibrando com uma nova conquista', categories: ['Brincadeiras'], iconKey: 'estrela', color: '#EAB308' },

  // Escola
  { id: 'bom-dia-professora', phrase: 'Bom dia, professora!', context: 'Cumprimentando ao chegar à escola', categories: ['Escola'], iconKey: 'escola', color: '#0284C7' },
  { id: 'quero-aprender', phrase: 'Quero aprender.', context: 'Mostrando curiosidade na sala de aula', categories: ['Escola'], iconKey: 'livro', color: '#10B981' },
  { id: 'posso-fazer-pergunta', phrase: 'Posso fazer uma pergunta?', context: 'Levantando a mão para tirar uma dúvida', categories: ['Escola'], iconKey: 'pergunta', color: '#6366F1' },
  { id: 'nao-entendi', phrase: 'Não entendi.', context: 'Pedindo ajuda quando algo ficar difícil', categories: ['Escola'], iconKey: 'pergunta', color: '#8B5CF6' },
  { id: 'pode-repetir', phrase: 'Pode repetir?', context: 'Pedindo para ouvir mais uma vez', categories: ['Escola'], iconKey: 'orelha', color: '#0EA5E9' },
  { id: 'quero-participar', phrase: 'Quero participar.', context: 'Mostrando vontade de entrar na atividade', categories: ['Escola'], iconKey: 'mao', color: '#F97316' },
  { id: 'terminei-atividade', phrase: 'Terminei a atividade.', context: 'Avisando que concluiu a tarefa', categories: ['Escola'], iconKey: 'lapis', color: '#16A34A' },
  { id: 'posso-beber-agua', phrase: 'Posso beber água?', context: 'Pedindo licença na aula para beber água', categories: ['Escola'], iconKey: 'agua', color: '#0284C7' },
  { id: 'vamos-desenhar', phrase: 'Vamos desenhar?', context: 'Convidando os colegas para criar arte', categories: ['Escola'], iconKey: 'lapis', color: '#EC4899' },
  { id: 'ate-amanha-professora', phrase: 'Até amanhã, professora!', context: 'Despedindo-se na hora de ir embora', categories: ['Escola'], iconKey: 'mochila', color: '#F59E0B' },

  // Socialização
  { id: 'qual-seu-nome', phrase: 'Qual é seu nome?', context: 'Conhecendo um novo amiguinho', categories: ['Socialização'], iconKey: 'amigos', color: '#0EA5E9' },
  { id: 'meu-nome-e', phrase: 'Meu nome é...', context: 'Apresentando-se para outra criança', categories: ['Socialização'], iconKey: 'rosto', color: '#8B5CF6' },
  { id: 'quantos-anos-tem', phrase: 'Quantos anos você tem?', context: 'Conversando e fazendo amizade', categories: ['Socialização'], iconKey: 'bolo', color: '#F97316' },
  { id: 'vamos-ser-amigos', phrase: 'Vamos ser amigos?', context: 'Começando uma nova amizade', categories: ['Socialização'], iconKey: 'amigos', color: '#10B981' },
  { id: 'posso-brincar-com-voce', phrase: 'Posso brincar com você?', context: 'Chamando outro colega para brincar junto', categories: ['Socialização'], iconKey: 'brinquedo', color: '#0284C7' },
  { id: 'voce-quer-brincar', phrase: 'Você quer brincar?', context: 'Convidando um amigo que está pertinho', categories: ['Socialização'], iconKey: 'bola', color: '#16A34A' },
  { id: 'vamos-compartilhar', phrase: 'Vamos compartilhar?', context: 'Dividindo brinquedos com carinho', categories: ['Socialização'], iconKey: 'boneca', color: '#EC4899' },
  { id: 'obrigado-pela-amizade', phrase: 'Obrigado pela amizade!', context: 'Agradecendo por ter um amigo legal', categories: ['Socialização'], iconKey: 'coracao', color: '#F43F5E' },

  // Perguntas
  { id: 'o-que-e-isso', phrase: 'O que é isso?', context: 'Descobrindo o nome de coisas novas', categories: ['Perguntas'], iconKey: 'pergunta', color: '#6366F1' },
  { id: 'onde-esta', phrase: 'Onde está?', context: 'Procurando algo que você precisa', categories: ['Perguntas'], iconKey: 'pergunta', color: '#0284C7' },
  { id: 'quem-e', phrase: 'Quem é?', context: 'Perguntando quem chegou ou falou', categories: ['Perguntas'], iconKey: 'olho', color: '#8B5CF6' },
  { id: 'cade-bola', phrase: 'Cadê minha bola?', context: 'Procurando um brinquedo querido', categories: ['Perguntas'], iconKey: 'bola', color: '#0EA5E9' },
  { id: 'que-horas-sao', phrase: 'Que horas são?', context: 'Perguntando a hora do dia', categories: ['Perguntas'], iconKey: 'relogio', color: '#F59E0B' },
  { id: 'por-que-aconteceu', phrase: 'Por que isso aconteceu?', context: 'Entendendo como as coisas funcionam', categories: ['Perguntas'], iconKey: 'livro', color: '#10B981' },
  { id: 'voce-pode-me-ajudar', phrase: 'Você pode me ajudar?', context: 'Pedindo auxílio com educação', categories: ['Perguntas'], iconKey: 'mao', color: '#F97316' },
  { id: 'podemos-brincar', phrase: 'Podemos brincar?', context: 'Perguntando se já é hora de brincar', categories: ['Perguntas'], iconKey: 'brinquedo', color: '#EC4899' },
  { id: 'onde-esta-mamae', phrase: 'Onde está a mamãe?', context: 'Perguntando pela mamãe', categories: ['Perguntas'], iconKey: 'mamae', color: '#F43F5E' },
  { id: 'o-que-vamos-fazer', phrase: 'O que vamos fazer?', context: 'Perguntando qual será a próxima atividade', categories: ['Perguntas'], iconKey: 'estrela', color: '#14B8A6' },

  // Despedidas
  { id: 'tchau', phrase: 'Tchau!', context: 'Acenando ao ir embora', categories: ['Despedidas'], iconKey: 'tchau', color: '#F59E0B' },
  { id: 'ate-logo', phrase: 'Até logo!', context: 'Quando vai se ver novamente em breve', categories: ['Despedidas'], iconKey: 'tchau', color: '#0EA5E9' },
  { id: 'ate-amanha', phrase: 'Até amanhã!', context: 'Despedindo-se até o próximo dia', categories: ['Despedidas'], iconKey: 'sol', color: '#F97316' },
  { id: 'ate-depois', phrase: 'Até depois!', context: 'Combinando de se reencontrar mais tarde', categories: ['Despedidas'], iconKey: 'relogio', color: '#8B5CF6' },
  { id: 'foi-muito-divertido', phrase: 'Foi muito divertido!', context: 'Contando que adorou o passeio ou brincadeira', categories: ['Despedidas'], iconKey: 'feliz', color: '#10B981' },
  { id: 'ate-a-proxima', phrase: 'Até a próxima!', context: 'Despedida simpática ao final da visita', categories: ['Despedidas'], iconKey: 'estrela', color: '#0284C7' },
  { id: 'tchau-mamae', phrase: 'Tchau, mamãe!', context: 'Mandando beijo para a mamãe ao sair', categories: ['Despedidas'], iconKey: 'mamae', color: '#EC4899' },
  { id: 'tchau-papai', phrase: 'Tchau, papai!', context: 'Acenando com carinho para o papai', categories: ['Despedidas'], iconKey: 'papai', color: '#3B82F6' },
  { id: 'ate-mais', phrase: 'Até mais!', context: 'Despedida leve para amigos e família', categories: ['Despedidas'], iconKey: 'amigos', color: '#16A34A' },
];

export interface StoryQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  encouragement: string;
}

export interface StoryItem {
  id: string;
  title: string;
  ageHint: string;
  coverImage: string;
  accent: string;
  paragraphs: string[];
  questions: StoryQuestion[];
  matchingWord: { prompt: string; targetWord: string; distractors: string[] };
}

export const STORIES: StoryItem[] = [
  {
    id: 'sol-jardim',
    title: 'O Sol e o Jardim Colorido',
    ageHint: '2 a 7 anos',
    coverImage: '/src/assets/images/story_sol_floresta_1794804100006.jpg',
    accent: '#F59E0B',
    paragraphs: [
      'De manhã bem cedo, o Sol acordou sorrindo atrás das montanhas verdes.',
      'Ele mandou raios quentinhos para acordar a pequena árvore e as flores do jardim.',
      'Logo chegaram quatro borboletas coloridas voando devagar pelo ar.',
      'A árvore balançou suas folhas e disse bem alto: Bom dia, amigos!',
      'Todo o jardim respondeu com alegria, pronto para mais um dia de brincadeiras.',
    ],
    questions: [
      {
        question: 'Quem acordou sorrindo atrás das montanhas?',
        options: ['O Sol', 'A Lua', 'O Pato'],
        correctIndex: 0,
        encouragement: 'Isso mesmo! Foi o Sol quem acordou iluminando o jardim.',
      },
      {
        question: 'O que a pequena árvore disse aos amigos?',
        options: ['Boa noite', 'Bom dia, amigos!', 'Até amanhã'],
        correctIndex: 1,
        encouragement: 'Muito bem! A árvore deu um alegre bom dia para todos.',
      },
    ],
    matchingWord: {
      prompt: 'Qual palavra aparece no céu brilhando na história?',
      targetWord: 'Sol',
      distractors: ['Carro', 'Sapato'],
    },
  },
  {
    id: 'patinho-lago',
    title: 'O Patinho Curioso no Lago',
    ageHint: '2 a 9 anos',
    coverImage: '/src/assets/images/story_patinho_lago_1794804100382.jpg',
    accent: '#0284C7',
    paragraphs: [
      'No lago azul cheio de pedrinhas coloridas, vivia um patinho amarelo muito curioso.',
      'Toda manhã ele nadava entre as folhas verdes fazendo quá-quá bem animado.',
      'Um dia ele encontrou uma flor amarela descansando sobre a água fresquinha.',
      'O patinho chamou seus amigos para contar as bolhinhas na água: um, dois, três!',
      'Quando o vento soprou suave, todos deram risada e bateram as asinhas felizes.',
    ],
    questions: [
      {
        question: 'Qual som o patinho fazia no lago?',
        options: ['Miau', 'Quá-quá', 'Muu'],
        correctIndex: 1,
        encouragement: 'Parabéns! O patinho faz quá-quá!',
      },
      {
        question: 'De que cor era a flor que ele encontrou na água?',
        options: ['Amarela', 'Roxa', 'Preta'],
        correctIndex: 0,
        encouragement: 'Acertou! Era uma linda flor amarela.',
      },
    ],
    matchingWord: {
      prompt: 'Quem é o personagem principal desta história?',
      targetWord: 'Pato',
      distractors: ['Leão', 'Mesa'],
    },
  },
  {
    id: 'lua-estrelas',
    title: 'A Lua e a Casinha das Estrelas',
    ageHint: '4 a 12 anos',
    coverImage: '/src/assets/images/story_lua_estrelas_1794804100512.jpg',
    accent: '#8B5CF6',
    paragraphs: [
      'Quando o céu ficou azul escuro, a Lua apareceu bem tranquila lá no alto.',
      'Ao redor dela, dezenas de estrelas douradas piscavam como lanterninhas suaves.',
      'Na colina, uma casinha acolhedora acendeu suas janelas quentes de luz amarela.',
      'Pequenos vaga-lumes dançavam no caminho de pedra ouvindo a cantiga do vento.',
      'Era hora de agradecer pelo dia vivido e descansar em paz até o amanhecer.',
    ],
    questions: [
      {
        question: 'O que piscava ao redor da Lua no céu?',
        options: ['Estrelas douradas', 'Peixes', 'Carros'],
        correctIndex: 0,
        encouragement: 'Isso! As estrelas douradas iluminavam a noite.',
      },
      {
        question: 'Quem dançava no caminho perto da casinha?',
        options: ['Vaga-lumes', 'Elefantes', 'Cavalos'],
        correctIndex: 0,
        encouragement: 'Muito bem! Os vaga-lumes brilhavam no jardim.',
      },
    ],
    matchingWord: {
      prompt: 'O que apareceu tranquila no céu da noite?',
      targetWord: 'Lua',
      distractors: ['Banana', 'Bola'],
    },
  },
];

export interface MedalDefinition {
  id: string;
  title: string;
  description: string;
  requirementText: string;
  color: string;
  checkUnlocked: (stats: {
    starsTotal: number;
    practicedWordsCount: number;
    exploredLettersCount: number;
    gamesCompleted: number;
    storiesReadCount: number;
    oralExercisesDone: number;
    participationDaysCount: number;
  }) => boolean;
}

export const MEDALS: MedalDefinition[] = [
  {
    id: 'primeira-estrela',
    title: 'Primeira Conquista',
    description: 'Completou sua primeira atividade no FalaKids.',
    requirementText: 'Ganhe 1 estrela',
    color: '#F59E0B',
    checkUnlocked: (s) => s.starsTotal >= 1,
  },
  {
    id: 'colecionador-palavras',
    title: 'Amigo das Palavras',
    description: 'Praticou pelo menos 5 palavras diferentes.',
    requirementText: '5 palavras praticadas',
    color: '#0284C7',
    checkUnlocked: (s) => s.practicedWordsCount >= 5,
  },
  {
    id: 'explorador-letras',
    title: 'Explorador do Alfabeto',
    description: 'Descobriu os sons de 5 ou mais letras.',
    requirementText: '5 letras exploradas',
    color: '#EC4899',
    checkUnlocked: (s) => s.exploredLettersCount >= 5,
  },
  {
    id: 'campeao-jogos',
    title: 'Mestre da Diversão',
    description: 'Concluiu 3 jogos educativos com alegria.',
    requirementText: '3 jogos realizados',
    color: '#10B981',
    checkUnlocked: (s) => s.gamesCompleted >= 3,
  },
  {
    id: 'ouvinte-historias',
    title: 'Amante das Histórias',
    description: 'Acompanhou e respondeu uma história completa.',
    requirementText: '1 história concluída',
    color: '#8B5CF6',
    checkUnlocked: (s) => s.storiesReadCount >= 1,
  },
  {
    id: 'boca-saudavel',
    title: 'Ginástica Divertida',
    description: 'Praticou exercícios de língua e boca no modelo 3D.',
    requirementText: '2 exercícios orais',
    color: '#F97316',
    checkUnlocked: (s) => s.oralExercisesDone >= 2,
  },
];

export function getAgeRecommendations(ageGroup: AgeGroup): {
  title: string;
  subtitle: string;
  suggestedSections: { section: 'first-words' | 'alphabet' | 'pronunciation' | 'oral-motor' | 'animal-sounds' | 'daily-phrases' | 'games' | 'stories'; label: string; reason: string }[];
} {
  if (ageGroup === '2-4') {
    return {
      title: 'Sugestões para 2 a 4 anos',
      subtitle: 'Descoberta de sons, primeiras palavras e bichinhos com toques grandes.',
      suggestedSections: [
        { section: 'first-words', label: 'Primeiras Palavras', reason: 'Vocabulário do dia a dia com áudio claro' },
        { section: 'animal-sounds', label: 'Sons dos Animais', reason: 'Imitar sons divertidos estimula a fala' },
        { section: 'daily-phrases', label: 'Frases do Dia a Dia', reason: 'Pedidos simples como "Quero água"' },
      ],
    };
  }
  if (ageGroup === '5-7') {
    return {
      title: 'Sugestões para 5 a 7 anos',
      subtitle: 'Vogais, alfabeto, sílabas e jogos de associação.',
      suggestedSections: [
        { section: 'alphabet', label: 'Vogais e Alfabeto', reason: 'Sons das letras com imagens' },
        { section: 'pronunciation', label: 'Treinamento de Pronúncia', reason: 'Sílabas e palavras articuladas' },
        { section: 'games', label: 'Jogos Educativos', reason: 'Memória, Complete a Palavra e Monte a Frase' },
      ],
    };
  }
  return {
    title: 'Sugestões para 8 a 12 anos',
    subtitle: 'Frases completas, leitura sincronizada de histórias e consciência sonora.',
    suggestedSections: [
      { section: 'stories', label: 'Histórias Infantis', reason: 'Leitura sincronizada e compreensão' },
      { section: 'pronunciation', label: 'Treinamento de Pronúncia', reason: 'Frases do cotidiano e pequenos textos' },
      { section: 'oral-motor', label: 'Anatomia 3D do Trato Vocal', reason: 'Articulação da fala e estruturas em 3D' },
    ],
  };
}
