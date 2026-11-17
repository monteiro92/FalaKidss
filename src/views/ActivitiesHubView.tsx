import React, { useState } from 'react';
import {
  BookOpen,
  Type,
  Mic,
  Smile,
  Dog,
  MessageCircleHeart,
  Camera,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { APP_THEMES } from '../data/themes';
import { ThemePicker } from '../components/ThemePicker';
import { AppSection, AudioSettings, ChildProfile, ThemeId } from '../types/app';

interface ActivitiesHubViewProps {
  profile: ChildProfile;
  themeId: ThemeId;
  audioSettings: AudioSettings;
  enabledModules?: Record<string, boolean>;
  onNavigate: (section: AppSection) => void;
  onSelectTheme: (id: ThemeId) => void;
}

const MODULES: {
  id: AppSection;
  configKey: string;
  title: string;
  subtitle: string;
  colorClass: string;
  iconBg: string;
  Icon: React.FC<{ className?: string }>;
}[] = [
  {
    id: 'first-words',
    configKey: 'first-words',
    title: 'Primeiras Palavras',
    subtitle: 'Família, alimentos, animais, objetos, corpo e natureza',
    colorClass: 'border-pink-200 bg-white/95 hover:bg-pink-50/70',
    iconBg: 'bg-pink-600',
    Icon: BookOpen,
  },
  {
    id: 'alphabet',
    configKey: 'alphabet',
    title: 'Vogais e Alfabeto',
    subtitle: 'Vogais A–U, alfabeto completo e sons das letras',
    colorClass: 'border-amber-200 bg-white/95 hover:bg-amber-50/70',
    iconBg: 'bg-amber-500',
    Icon: Type,
  },
  {
    id: 'pronunciation',
    configKey: 'pronunciation',
    title: 'Treinamento de Pronúncia',
    subtitle: 'Vogais, consoantes, sílabas, frases e Teste 3D Gratuito',
    colorClass: 'border-sky-200 bg-white/95 hover:bg-sky-50/70',
    iconBg: 'bg-sky-600',
    Icon: Mic,
  },
  {
    id: 'oral-motor',
    configKey: 'oral-motor',
    title: 'Anatomia 3D do Trato Vocal',
    subtitle: 'Modelo 3D interativo e Teste 3D Gratuito (Papai / Mamãe)',
    colorClass: 'border-violet-200 bg-white/95 hover:bg-violet-50/70',
    iconBg: 'bg-violet-600',
    Icon: Smile,
  },
  {
    id: 'animal-sounds',
    configKey: 'animal-sounds',
    title: 'Sons dos Animais',
    subtitle: 'Ouça, imite e descubra qual animal fez o som',
    colorClass: 'border-emerald-200 bg-white/95 hover:bg-emerald-50/70',
    iconBg: 'bg-emerald-600',
    Icon: Dog,
  },
  {
    id: 'daily-phrases',
    configKey: 'daily-phrases',
    title: 'Frases do Dia a Dia',
    subtitle: 'Expressões úteis para pedir, agradecer e brincar',
    colorClass: 'border-orange-200 bg-white/95 hover:bg-orange-50/70',
    iconBg: 'bg-orange-500',
    Icon: MessageCircleHeart,
  },
  {
    id: 'camera',
    configKey: 'camera',
    title: 'Minhas Fotos e Objetos',
    subtitle: 'Cartões personalizados criados pelos responsáveis',
    colorClass: 'border-cyan-200 bg-white/95 hover:bg-cyan-50/70',
    iconBg: 'bg-cyan-600',
    Icon: Camera,
  },
];

export const ActivitiesHubView: React.FC<ActivitiesHubViewProps> = ({
  profile,
  themeId,
  audioSettings,
  enabledModules,
  onNavigate,
  onSelectTheme,
}) => {
  const [showAllTracks, setShowAllTracks] = useState(false);
  const activeTheme = APP_THEMES[themeId] || APP_THEMES['sol-dourado'];

  const globallyAvailableModules = MODULES.filter(
    (m) => m.configKey === 'camera' || enabledModules?.[m.configKey] !== false
  );
  const configuredModules = globallyAvailableModules.filter(
    (m) => m.configKey === 'camera' || profile.selectedModules.includes(m.configKey)
  );
  const hasHiddenTracks = configuredModules.length < globallyAvailableModules.length;
  const displayedModules = showAllTracks ? globallyAvailableModules : configuredModules;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Minhas Atividades</h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            Escolha uma trilha para aprender sons, palavras e frases no seu ritmo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAllTracks(true)}
            className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-semibold border transition min-h-[44px] ${
              showAllTracks || !hasHiddenTracks
                ? activeTheme.tabSolidActiveClass
                : `bg-white text-slate-700 ${activeTheme.cardBorderClass}`
            }`}
          >
            <Layers className="w-4 h-4" aria-hidden="true" />
            <span>Todos ({globallyAvailableModules.length})</span>
          </button>
          {hasHiddenTracks && (
            <button
              type="button"
              onClick={() => setShowAllTracks(false)}
              className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-semibold border transition min-h-[44px] ${
                !showAllTracks
                  ? activeTheme.tabSolidActiveClass
                  : `bg-white text-slate-700 ${activeTheme.cardBorderClass}`
              }`}
            >
              <span>Recomendadas ({configuredModules.length})</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedModules.map((mod) => {
          const Icon = mod.Icon;
          const isFree3D = mod.id === 'oral-motor';
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => onNavigate(mod.id)}
              className={`rounded-3xl border p-6 text-left transition flex flex-col justify-between min-h-[164px] shadow-xs ${mod.colorClass}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className={`w-12 h-12 rounded-2xl ${mod.iconBg} text-white flex items-center justify-center shrink-0`}>
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </div>
                <div className="flex items-center gap-2">
                  {isFree3D && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-900">
                      <Sparkles className="w-3 h-3" aria-hidden="true" />
                      <span>Gratuito</span>
                    </span>
                  )}
                  <ArrowRight className={`w-5 h-5 ${activeTheme.iconPrimaryClass}`} aria-hidden="true" />
                </div>
              </div>

              <div className="mt-4">
                <h2 className="text-lg font-extrabold text-slate-900">{mod.title}</h2>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">{mod.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>

      <ThemePicker
        activeThemeId={themeId}
        audioSettings={audioSettings}
        onSelectTheme={onSelectTheme}
      />
    </div>
  );
};
