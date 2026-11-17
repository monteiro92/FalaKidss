import { ThemeId } from '../types/app';

const makeLayeredPaperSvg = (c1: string, c2: string, c3: string, c4: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="none">
    <rect width="1200" height="800" fill="${c1}"/>
    <polygon points="0,120 1200,40 1200,800 0,800" fill="${c2}"/>
    <polygon points="320,240 1200,150 1200,800 180,800" fill="${c3}" opacity="0.9"/>
    <polygon points="680,410 1200,290 1200,800 540,800" fill="${c4}" opacity="0.85"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export interface AppTheme {
  id: ThemeId;
  name: string;
  subtitle: string;
  themeColorHex: string;
  swatches: [string, string, string];
  backgroundImage: string;
  imageCropClass: string;
  pageBgClass: string;
  headerClass: string;
  brandTextClass: string;
  navActiveClass: string;
  primaryBtnClass: string;
  heroFrameClass: string;
  heroScrimClass: string;
  accentTextClass: string;
  mobileActiveClass: string;
  footerClass: string;
  cardBorderClass: string;
  backBtnClass: string;
  iconPrimaryClass: string;
  controlSubActiveClass: string;
  controlPillActiveClass: string;
  sliderAccentClass: string;
  tabSolidActiveClass: string;
  selectedCardClass: string;
}

export const APP_THEMES: Record<ThemeId, AppTheme> = {
  'sol-dourado': {
    id: 'sol-dourado',
    name: 'Sol Dourado',
    subtitle: 'Camadas quentes de amarelo e âmbar ensolarado',
    themeColorHex: '#F59E0B',
    swatches: ['#FDE047', '#F59E0B', '#D97706'],
    backgroundImage: '/assets/aistudio/image_3dbc8fb0.png',
    imageCropClass: 'object-cover scale-105',
    pageBgClass: 'bg-[#FFFDF5]',
    headerClass: 'bg-[#FFFBEB]/95 border-amber-200',
    brandTextClass: 'text-amber-700',
    navActiveClass: 'border-amber-500 text-amber-800 font-bold',
    primaryBtnClass: 'bg-amber-500 hover:bg-amber-600 text-slate-950',
    heroFrameClass: 'border-amber-300 bg-amber-50',
    heroScrimClass: 'bg-gradient-to-r from-white/95 via-amber-50/90 to-amber-100/60',
    accentTextClass: 'text-amber-700',
    mobileActiveClass: 'text-amber-600 font-bold',
    footerClass: 'border-amber-200 text-amber-900/70',
    cardBorderClass: 'border-amber-200',
    backBtnClass: 'border-amber-200 bg-white text-slate-800 hover:bg-amber-50',
    iconPrimaryClass: 'text-amber-600',
    controlSubActiveClass: 'bg-white text-amber-800 font-semibold shadow-sm',
    controlPillActiveClass: 'bg-amber-50 border-amber-300 text-amber-900 font-semibold',
    sliderAccentClass: 'accent-amber-500',
    tabSolidActiveClass: 'bg-amber-500 border-amber-500 text-slate-950 shadow-sm',
    selectedCardClass: 'bg-amber-50 border-amber-400 shadow-sm',
  },
  'ceu-azul': {
    id: 'ceu-azul',
    name: 'Céu Azul',
    subtitle: 'Camadas suaves de azul celeste para brincar',
    themeColorHex: '#0EA5E9',
    swatches: ['#BAE6FD', '#38BDF8', '#0284C7'],
    backgroundImage: '/assets/aistudio/image_14175330.png',
    imageCropClass: 'object-cover object-top scale-125',
    pageBgClass: 'bg-[#F4FBFF]',
    headerClass: 'bg-[#F0F9FF]/95 border-sky-200',
    brandTextClass: 'text-sky-700',
    navActiveClass: 'border-sky-600 text-sky-700 font-bold',
    primaryBtnClass: 'bg-sky-600 hover:bg-sky-700 text-white',
    heroFrameClass: 'border-sky-200 bg-sky-50',
    heroScrimClass: 'bg-gradient-to-r from-white/95 via-sky-50/90 to-sky-100/60',
    accentTextClass: 'text-sky-700',
    mobileActiveClass: 'text-sky-600 font-bold',
    footerClass: 'border-sky-200 text-sky-900/70',
    cardBorderClass: 'border-sky-200',
    backBtnClass: 'border-sky-200 bg-white text-slate-800 hover:bg-sky-50',
    iconPrimaryClass: 'text-sky-600',
    controlSubActiveClass: 'bg-white text-sky-700 font-semibold shadow-sm',
    controlPillActiveClass: 'bg-sky-50 border-sky-200 text-sky-800 font-semibold',
    sliderAccentClass: 'accent-sky-600',
    tabSolidActiveClass: 'bg-sky-600 border-sky-600 text-white shadow-sm',
    selectedCardClass: 'bg-sky-50 border-sky-400 shadow-sm',
  },
  'jardim-verde': {
    id: 'jardim-verde',
    name: 'Jardim Verde',
    subtitle: 'Folhas frescas e camadas da natureza',
    themeColorHex: '#10B981',
    swatches: ['#A7F3D0', '#34D399', '#059669'],
    backgroundImage: makeLayeredPaperSvg('#D1FAE5', '#A7F3D0', '#6EE7B7', '#34D399'),
    imageCropClass: 'object-cover scale-105',
    pageBgClass: 'bg-[#F4FBF7]',
    headerClass: 'bg-[#F0FDF4]/95 border-emerald-200',
    brandTextClass: 'text-emerald-700',
    navActiveClass: 'border-emerald-600 text-emerald-800 font-bold',
    primaryBtnClass: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    heroFrameClass: 'border-emerald-200 bg-emerald-50',
    heroScrimClass: 'bg-gradient-to-r from-white/95 via-emerald-50/90 to-emerald-100/60',
    accentTextClass: 'text-emerald-700',
    mobileActiveClass: 'text-emerald-600 font-bold',
    footerClass: 'border-emerald-200 text-emerald-900/70',
    cardBorderClass: 'border-emerald-200',
    backBtnClass: 'border-emerald-200 bg-white text-slate-800 hover:bg-emerald-50',
    iconPrimaryClass: 'text-emerald-600',
    controlSubActiveClass: 'bg-white text-emerald-700 font-semibold shadow-sm',
    controlPillActiveClass: 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold',
    sliderAccentClass: 'accent-emerald-600',
    tabSolidActiveClass: 'bg-emerald-600 border-emerald-600 text-white shadow-sm',
    selectedCardClass: 'bg-emerald-50 border-emerald-400 shadow-sm',
  },
  'lavanda-suave': {
    id: 'lavanda-suave',
    name: 'Lavanda Suave',
    subtitle: 'Camadas lilás acolhedoras e tranquilas',
    themeColorHex: '#8B5CF6',
    swatches: ['#DDD6FE', '#A78BFA', '#7C3AED'],
    backgroundImage: makeLayeredPaperSvg('#EDE9FE', '#DDD6FE', '#C4B5FD', '#A78BFA'),
    imageCropClass: 'object-cover scale-105',
    pageBgClass: 'bg-[#FAF8FF]',
    headerClass: 'bg-[#F5F3FF]/95 border-violet-200',
    brandTextClass: 'text-violet-700',
    navActiveClass: 'border-violet-600 text-violet-800 font-bold',
    primaryBtnClass: 'bg-violet-600 hover:bg-violet-700 text-white',
    heroFrameClass: 'border-violet-200 bg-violet-50',
    heroScrimClass: 'bg-gradient-to-r from-white/95 via-violet-50/90 to-violet-100/60',
    accentTextClass: 'text-violet-700',
    mobileActiveClass: 'text-violet-600 font-bold',
    footerClass: 'border-violet-200 text-violet-900/70',
    cardBorderClass: 'border-violet-200',
    backBtnClass: 'border-violet-200 bg-white text-slate-800 hover:bg-violet-50',
    iconPrimaryClass: 'text-violet-600',
    controlSubActiveClass: 'bg-white text-violet-700 font-semibold shadow-sm',
    controlPillActiveClass: 'bg-violet-50 border-violet-200 text-violet-800 font-semibold',
    sliderAccentClass: 'accent-violet-600',
    tabSolidActiveClass: 'bg-violet-600 border-violet-600 text-white shadow-sm',
    selectedCardClass: 'bg-violet-50 border-violet-400 shadow-sm',
  },
};

export const THEME_LIST: AppTheme[] = [
  APP_THEMES['sol-dourado'],
  APP_THEMES['ceu-azul'],
  APP_THEMES['jardim-verde'],
  APP_THEMES['lavanda-suave'],
];
