import React, { useMemo, useState } from 'react';
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
  Star,
  Lock,
  Volume2,
  CheckCircle2,
  Crown,
} from 'lucide-react';
import { APP_THEMES } from '../data/themes';
import { DEFAULT_CONTENT_CATALOG } from '../data/contentCatalogDefaults';
import { ThemePicker } from '../components/ThemePicker';
import { ContentTierBadge } from '../components/ContentTierBadge';
import { AppSection, AudioSettings, ChildProfile, ThemeId } from '../types/app';
import { CatalogItemDTO, PremiumActivityTrack } from '../types/premium';
import { playFeedbackTone, speakPtBr } from '../utils/speech';

interface ActivitiesHubViewProps {
  profile: ChildProfile;
  themeId: ThemeId;
  audioSettings: AudioSettings;
  enabledModules?: Record<string, boolean>;
  hasPremiumAccess?: boolean;
  loadingCatalog?: boolean;
  catalogItems?: CatalogItemDTO[];
  exclusiveActivities?: PremiumActivityTrack[];
  onGoToPremium?: () => void;
  onPracticeExclusiveActivity?: (title: string) => void;
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

const EXCLUSIVE_ACTIVITY_STORAGE_KEY = 'fk_completed_exclusive_activities_v1';

function loadCompletedExclusiveIds(): string[] {
  try {
    const raw = localStorage.getItem(EXCLUSIVE_ACTIVITY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const ActivitiesHubView: React.FC<ActivitiesHubViewProps> = ({
  profile,
  themeId,
  audioSettings,
  enabledModules,
  hasPremiumAccess = false,
  loadingCatalog = false,
  catalogItems = [],
  exclusiveActivities = [],
  onGoToPremium,
  onPracticeExclusiveActivity,
  onNavigate,
  onSelectTheme,
}) => {
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [completedExclusiveIds, setCompletedExclusiveIds] = useState<string[]>(() =>
    loadCompletedExclusiveIds()
  );
  const activeTheme = APP_THEMES[themeId] || APP_THEMES['sol-dourado'];

  const catalogById = useMemo(() => {
    const map = new Map<string, CatalogItemDTO>();
    for (const item of catalogItems) {
      map.set(item.id, item);
    }
    return map;
  }, [catalogItems]);

  const activityCards = useMemo(() => {
    const fromCatalog = catalogItems.filter((item) => item.category === 'activity');
    if (fromCatalog.length > 0) return fromCatalog;
    return DEFAULT_CONTENT_CATALOG.filter((item) => item.category === 'activity').map((def) => ({
      id: def.id,
      category: 'activity' as const,
      title: def.title,
      subtitle: def.subtitle,
      tier: def.defaultTier,
      unlocked: def.defaultTier === 'GRATUITO' || hasPremiumAccess,
      accessReason:
        def.defaultTier === 'GRATUITO'
          ? ('free' as const)
          : hasPremiumAccess
          ? ('paid_subscription' as const)
          : ('premium_required' as const),
      order: def.order,
    }));
  }, [catalogItems, hasPremiumAccess]);

  const payloadById = useMemo(() => {
    const map = new Map<string, PremiumActivityTrack>();
    for (const track of exclusiveActivities) {
      map.set(track.id, track);
    }
    return map;
  }, [exclusiveActivities]);

  const globallyAvailableModules = MODULES.filter(
    (m) => m.configKey === 'camera' || enabledModules?.[m.configKey] !== false
  );
  const configuredModules = globallyAvailableModules.filter(
    (m) => m.configKey === 'camera' || profile.selectedModules.includes(m.configKey)
  );
  const hasHiddenTracks = configuredModules.length < globallyAvailableModules.length;
  const displayedModules = showAllTracks ? globallyAvailableModules : configuredModules;

  const markExclusiveDone = (id: string, title: string) => {
    playFeedbackTone('star', audioSettings.volume);
    if (!completedExclusiveIds.includes(id)) {
      const next = [...completedExclusiveIds, id];
      setCompletedExclusiveIds(next);
      try {
        localStorage.setItem(EXCLUSIVE_ACTIVITY_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore storage quota errors
      }
      onPracticeExclusiveActivity?.(title);
    }
  };

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
          const catalogEntry = catalogById.get(mod.id);
          const tier = mod.id === 'oral-motor' ? 'GRATUITO' : catalogEntry?.tier || 'GRATUITO';
          const unlocked =
            mod.id === 'oral-motor'
              ? catalogEntry?.unlocked !== false
              : catalogEntry
              ? catalogEntry.unlocked
              : tier === 'GRATUITO' || hasPremiumAccess;

          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => {
                if (!unlocked && onGoToPremium) {
                  onGoToPremium();
                  return;
                }
                onNavigate(mod.id);
              }}
              className={`rounded-3xl border p-6 text-left transition flex flex-col justify-between min-h-[168px] shadow-xs ${
                unlocked
                  ? mod.colorClass
                  : 'border-amber-300 bg-[#FFFDF7] hover:bg-amber-50/70'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl ${
                    unlocked ? mod.iconBg : 'bg-amber-500'
                  } text-white flex items-center justify-center shrink-0`}
                >
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </div>
                <div className="flex items-center gap-2">
                  <ContentTierBadge tier={tier} unlocked={unlocked} />
                  {unlocked ? (
                    <ArrowRight
                      className={`w-5 h-5 ${activeTheme.iconPrimaryClass}`}
                      aria-hidden="true"
                    />
                  ) : (
                    <Lock className="w-4 h-4 text-amber-700" aria-hidden="true" />
                  )}
                </div>
              </div>

              <div className="mt-4">
                <h2 className="text-lg font-extrabold text-slate-900">{mod.title}</h2>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  {unlocked
                    ? mod.subtitle
                    : 'Disponível para assinantes ativos do FalaKids Premium.'}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Atividades Educativas Exclusivas · FalaKids Premium */}
      <section className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-[#FFFDF7] via-[#FEF6E4] to-[#FFF4E0] p-6 space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-900">
              <Crown className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
              <span>Atividades Educativas Exclusivas · FalaKids Premium</span>
            </div>
            <h2 className="text-xl font-extrabold text-[#0F2942]">
              Treinos Especiais de Respiração, Ritmo e Fluência
            </h2>
          </div>

          {!hasPremiumAccess && onGoToPremium && (
            <button
              type="button"
              onClick={onGoToPremium}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 px-4 py-2.5 text-sm font-extrabold text-white hover:from-orange-700 hover:to-amber-600 transition min-h-[44px] self-start"
            >
              <Star className="w-4 h-4 fill-white" aria-hidden="true" />
              <span>Assinar FalaKids Premium</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activityCards.map((card) => {
            const unlocked = card.unlocked;
            const payload = payloadById.get(card.id);
            const done = completedExclusiveIds.includes(card.id);

            return (
              <div
                key={card.id}
                className="rounded-2xl border border-amber-200 bg-white p-5 flex flex-col justify-between gap-4 shadow-2xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <ContentTierBadge tier={card.tier} unlocked={unlocked} />
                    {unlocked && done && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                        <span>Praticada</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-extrabold text-[#0F2942]">{card.title}</h3>
                  <p className="text-xs text-slate-600">{card.subtitle}</p>

                  {unlocked && payload ? (
                    <>
                      <div className="rounded-xl bg-amber-50/70 border border-amber-200 px-3.5 py-2.5 text-sm font-bold text-slate-900">
                        “{payload.phrase}”
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        <strong>Dica:</strong> {payload.tip}
                      </p>
                    </>
                  ) : unlocked && loadingCatalog ? (
                    <div className="rounded-xl bg-amber-50/60 border border-amber-200 px-3.5 py-3 text-xs font-semibold text-amber-900">
                      Carregando atividade liberada...
                    </div>
                  ) : (
                    <div className="rounded-xl bg-slate-50 border border-amber-200 px-3.5 py-3 text-xs font-semibold text-slate-600 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                      <span>Conteúdo exclusivo para assinantes ativos do FalaKids Premium.</span>
                    </div>
                  )}
                </div>

                {unlocked && payload ? (
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => speakPtBr(payload.phrase, audioSettings)}
                      className="inline-flex items-center gap-1.5 rounded-2xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition min-h-[44px]"
                    >
                      <Volume2 className="w-4 h-4" aria-hidden="true" />
                      <span>Ouvir frase</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => markExclusiveDone(card.id, card.title)}
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-4 py-2.5 text-xs sm:text-sm font-bold text-amber-950 transition min-h-[44px]"
                    >
                      <Star className="w-4 h-4 fill-amber-400 text-amber-600" aria-hidden="true" />
                      <span>{done ? 'Praticado!' : 'Concluir (+1 ★)'}</span>
                    </button>
                  </div>
                ) : (
                  onGoToPremium && (
                    <button
                      type="button"
                      onClick={onGoToPremium}
                      disabled={unlocked && loadingCatalog}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-4 py-2.5 text-xs sm:text-sm font-bold text-amber-950 transition min-h-[44px] disabled:opacity-60"
                    >
                      <Lock className="w-4 h-4 text-amber-700" aria-hidden="true" />
                      <span>
                        {unlocked && loadingCatalog
                          ? 'Carregando...'
                          : 'Desbloquear na Área dos Pais'}
                      </span>
                    </button>
                  )
                )}
              </div>
            );
          })}
        </div>
      </section>

      <ThemePicker
        activeThemeId={themeId}
        audioSettings={audioSettings}
        onSelectTheme={onSelectTheme}
      />
    </div>
  );
};

