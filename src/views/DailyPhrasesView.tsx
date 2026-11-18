import React, { useMemo, useState } from 'react';
import {
  Volume2,
  Turtle,
  Heart,
  CheckCircle2,
  Mic,
  Sparkles,
  BarChart3,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Star,
  Clock,
} from 'lucide-react';
import {
  DAILY_PHRASES,
  DAILY_PHRASE_CATEGORIES,
  DailyPhraseCategory,
  DailyPhraseItem,
} from '../data/curriculum';
import { ActivityHistoryItem, AudioSettings } from '../types/app';
import { IllustratedArt } from '../components/IllustratedArt';
import { PracticeRecorder } from '../components/PracticeRecorder';
import { playFeedbackTone, speakPtBr } from '../utils/speech';

interface DailyPhrasesViewProps {
  audioSettings: AudioSettings;
  practicedPhraseIds: string[];
  favoritePhraseIds: string[];
  exploredPhraseCategories: string[];
  activitiesCompleted: number;
  phraseHistory: ActivityHistoryItem[];
  onPracticePhrase: (item: DailyPhraseItem) => void;
  onTogglePracticedPhrase: (item: DailyPhraseItem) => void;
  onToggleFavoritePhrase: (phraseId: string) => void;
  onExploreCategory: (category: string) => void;
}

type CategoryFilter = 'Todos' | 'Favoritas' | DailyPhraseCategory;
type ViewTab = 'explorar' | 'pratica' | 'progresso';

export const DailyPhrasesView: React.FC<DailyPhrasesViewProps> = ({
  audioSettings,
  practicedPhraseIds,
  favoritePhraseIds,
  exploredPhraseCategories,
  activitiesCompleted,
  phraseHistory,
  onPracticePhrase,
  onTogglePracticedPhrase,
  onToggleFavoritePhrase,
  onExploreCategory,
}) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('explorar');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('Todos');
  const [selected, setSelected] = useState<DailyPhraseItem>(DAILY_PHRASES[0]);
  const [guidedStepDone, setGuidedStepDone] = useState<{ heard: boolean; recorded: boolean }>({
    heard: false,
    recorded: false,
  });

  const realCategories = useMemo(
    () => DAILY_PHRASE_CATEGORIES.filter((c): c is DailyPhraseCategory => c !== 'Todos'),
    []
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Todos: DAILY_PHRASES.length,
      Favoritas: favoritePhraseIds.length,
    };
    realCategories.forEach((cat) => {
      counts[cat] = DAILY_PHRASES.filter((p) => p.categories.includes(cat)).length;
    });
    return counts;
  }, [favoritePhraseIds.length, realCategories]);

  const filteredPhrases = useMemo(() => {
    if (selectedCategory === 'Todos') return DAILY_PHRASES;
    if (selectedCategory === 'Favoritas') {
      return DAILY_PHRASES.filter((p) => favoritePhraseIds.includes(p.id));
    }
    return DAILY_PHRASES.filter((p) => p.categories.includes(selectedCategory));
  }, [selectedCategory, favoritePhraseIds]);

  const activePhrase = useMemo(() => {
    if (filteredPhrases.length === 0) return selected;
    return filteredPhrases.some((p) => p.id === selected.id) ? selected : filteredPhrases[0];
  }, [filteredPhrases, selected]);

  const activeIndex = useMemo(
    () => filteredPhrases.findIndex((p) => p.id === activePhrase.id),
    [filteredPhrases, activePhrase.id]
  );

  const handleSelectCategory = (cat: CategoryFilter) => {
    playFeedbackTone('click', audioSettings.volume);
    setSelectedCategory(cat);
    if (cat !== 'Todos' && cat !== 'Favoritas') {
      onExploreCategory(cat);
    }
    const nextList =
      cat === 'Todos'
        ? DAILY_PHRASES
        : cat === 'Favoritas'
        ? DAILY_PHRASES.filter((p) => favoritePhraseIds.includes(p.id))
        : DAILY_PHRASES.filter((p) => p.categories.includes(cat));
    if (nextList.length > 0 && !nextList.some((p) => p.id === selected.id)) {
      setSelected(nextList[0]);
      setGuidedStepDone({ heard: false, recorded: false });
    }
  };

  const handlePick = (item: DailyPhraseItem) => {
    setSelected(item);
    setGuidedStepDone({ heard: true, recorded: false });
    item.categories.forEach((c) => onExploreCategory(c));
    playFeedbackTone('click', audioSettings.volume);
    speakPtBr(item.phrase, audioSettings);
  };

  const handleListen = (item: DailyPhraseItem, slow = false) => {
    setGuidedStepDone((prev) => ({ ...prev, heard: true }));
    item.categories.forEach((c) => onExploreCategory(c));
    speakPtBr(item.phrase, audioSettings, slow ? { rateOverride: 0.7 } : undefined);
  };

  const handleStepCard = (delta: number) => {
    if (filteredPhrases.length === 0) return;
    const baseIdx = activeIndex >= 0 ? activeIndex : 0;
    const nextIdx = (baseIdx + delta + filteredPhrases.length) % filteredPhrases.length;
    const nextItem = filteredPhrases[nextIdx];
    setSelected(nextItem);
    setGuidedStepDone({ heard: false, recorded: false });
    playFeedbackTone('click', audioSettings.volume);
  };

  const overallPercent = Math.round((practicedPhraseIds.length / DAILY_PHRASES.length) * 100);
  const isPracticed = practicedPhraseIds.includes(activePhrase.id);
  const isFavorite = favoritePhraseIds.includes(activePhrase.id);

  const favoritePhrasesList = useMemo(
    () => DAILY_PHRASES.filter((p) => favoritePhraseIds.includes(p.id)),
    [favoritePhraseIds]
  );

  return (
    <div className="space-y-6">
      {/* Header & Top Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Frases do Dia a Dia</h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            Toque nos cartões para ouvir e praticar expressões úteis de comunicação!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('explorar')}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition min-h-[44px] ${
              activeTab === 'explorar'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid className="w-4 h-4" aria-hidden="true" />
            <span>Cartões</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pratica')}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition min-h-[44px] ${
              activeTab === 'pratica'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Mic className="w-4 h-4" aria-hidden="true" />
            <span>Modo Prática</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('progresso')}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition min-h-[44px] ${
              activeTab === 'progresso'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-4 h-4" aria-hidden="true" />
            <span>Progresso</span>
          </button>
        </div>
      </div>

      {/* Progress Banner */}
      <div className="rounded-3xl border border-sky-200 bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700">
            <span>Progresso nas frases cotidianas</span>
            <span className="tabular-nums text-sky-700">
              {practicedPhraseIds.length} / {DAILY_PHRASES.length} praticadas ({overallPercent}%)
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${Math.max(overallPercent, practicedPhraseIds.length > 0 ? 3 : 0)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="rounded-2xl bg-amber-50 border border-amber-200 px-3.5 py-2 text-center">
            <div className="text-base font-extrabold text-amber-700 tabular-nums">
              {exploredPhraseCategories.length}/11
            </div>
            <div className="text-[11px] font-semibold text-amber-900">Categorias</div>
          </div>
          <div className="rounded-2xl bg-rose-50 border border-rose-200 px-3.5 py-2 text-center">
            <div className="text-base font-extrabold text-rose-700 tabular-nums">
              {favoritePhraseIds.length}
            </div>
            <div className="text-[11px] font-semibold text-rose-900">Favoritas</div>
          </div>
        </div>
      </div>

      {/* Category Filter Strip (shared by Cartões & Modo Prática) */}
      {activeTab !== 'progresso' && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categorias de frases">
          {DAILY_PHRASE_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => handleSelectCategory(cat)}
                className={`inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-bold transition min-h-[40px] ${
                  active
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50/60'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-lg tabular-nums ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {categoryCounts[cat]}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'Favoritas'}
            onClick={() => handleSelectCategory('Favoritas')}
            className={`inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs sm:text-sm font-bold transition min-h-[40px] ${
              selectedCategory === 'Favoritas'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'border border-rose-200 bg-rose-50/70 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${selectedCategory === 'Favoritas' ? 'fill-white' : 'fill-rose-500 text-rose-500'}`}
              aria-hidden="true"
            />
            <span>Favoritas</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-lg tabular-nums ${
                selectedCategory === 'Favoritas' ? 'bg-white/20 text-white' : 'bg-white text-rose-700'
              }`}
            >
              {categoryCounts.Favoritas}
            </span>
          </button>
        </div>
      )}

      {/* TAB 1: EXPLORAR CARTÕES */}
      {activeTab === 'explorar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Cards Grid */}
          <div className="lg:col-span-7">
            {filteredPhrases.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center space-y-3">
                <Heart className="w-10 h-10 text-rose-300 mx-auto" aria-hidden="true" />
                <h2 className="text-lg font-extrabold text-slate-900">
                  Nenhuma frase favorita ainda
                </h2>
                <p className="text-sm text-slate-600">
                  Toque no coração de qualquer frase para salvá-la aqui e praticar rapidinho!
                </p>
                <button
                  type="button"
                  onClick={() => handleSelectCategory('Todos')}
                  className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white min-h-[44px]"
                >
                  Explorar todas as frases
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {filteredPhrases.map((item) => {
                  const active = activePhrase.id === item.id;
                  const cardPracticed = practicedPhraseIds.includes(item.id);
                  const cardFav = favoritePhraseIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => handlePick(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handlePick(item);
                        }
                      }}
                      className={`group cursor-pointer rounded-3xl border p-4 text-left flex flex-col justify-between gap-3 transition min-h-[132px] ${
                        active
                          ? 'bg-sky-50 border-sky-400 shadow-sm'
                          : cardPracticed
                          ? 'bg-emerald-50/40 border-emerald-200 hover:border-sky-300'
                          : 'bg-white border-slate-200 hover:border-sky-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <IllustratedArt
                          artKey={item.iconKey}
                          label={item.phrase}
                          size={62}
                          className="shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="inline-block rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                              {item.categories[0]}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              {cardPracticed && (
                                <span
                                  title="Frase praticada"
                                  className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                                  <span>Praticada</span>
                                </span>
                              )}
                              <button
                                type="button"
                                aria-label={cardFav ? `Remover ${item.phrase} dos favoritos` : `Favoritar ${item.phrase}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onToggleFavoritePhrase(item.id);
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                                  cardFav
                                    ? 'bg-rose-100 text-rose-600'
                                    : 'bg-slate-100 text-slate-400 hover:text-rose-500'
                                }`}
                              >
                                <Heart
                                  className={`w-4 h-4 ${cardFav ? 'fill-rose-500 text-rose-500' : ''}`}
                                  aria-hidden="true"
                                />
                              </button>
                            </div>
                          </div>

                          <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-1.5 leading-snug">
                            {item.phrase}
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                            {item.context}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelected(item);
                            handleListen(item);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-sky-100 px-3 py-1.5 text-xs font-bold text-sky-900 hover:bg-sky-200 transition min-h-[36px]"
                        >
                          <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Ouvir</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onTogglePracticedPhrase(item);
                          }}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition min-h-[36px] ${
                            cardPracticed
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-200 bg-white text-slate-700 hover:bg-emerald-50 hover:border-emerald-300'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{cardPracticed ? 'Praticada ✓' : 'Marcar praticada'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Card Detail & Practice Panel */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 rounded-3xl border border-slate-200 bg-white p-6 space-y-5 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-4">
                <IllustratedArt
                  artKey={activePhrase.iconKey}
                  label={activePhrase.phrase}
                  size={92}
                  className="shrink-0"
                />
                <div>
                  <div className="flex flex-wrap items-center gap-1.5 mb-1">
                    {activePhrase.categories.map((c) => (
                      <span
                        key={c}
                        className="rounded-lg bg-sky-50 border border-sky-200 px-2.5 py-0.5 text-xs font-bold text-sky-800"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
                    {activePhrase.phrase}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">{activePhrase.context}</p>
                </div>
              </div>

              <button
                type="button"
                aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                onClick={() => onToggleFavoritePhrase(activePhrase.id)}
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 transition ${
                  isFavorite
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:text-rose-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} aria-hidden="true" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => handleListen(activePhrase)}
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white hover:bg-sky-700 transition min-h-[46px]"
              >
                <Volume2 className="w-4 h-4" aria-hidden="true" />
                <span>Ouvir frase</span>
              </button>

              <button
                type="button"
                onClick={() => handleListen(activePhrase)}
                className="inline-flex items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-bold text-sky-900 hover:bg-sky-100 transition min-h-[46px]"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Repetir</span>
              </button>

              <button
                type="button"
                onClick={() => handleListen(activePhrase, true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition min-h-[46px]"
              >
                <Turtle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>Devagar</span>
              </button>
            </div>

            <PracticeRecorder
              targetText={activePhrase.phrase}
              audioSettings={audioSettings}
              onSuccess={() => {
                setGuidedStepDone((prev) => ({ ...prev, recorded: true }));
                onPracticePhrase(activePhrase);
              }}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onTogglePracticedPhrase(activePhrase)}
                className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition min-h-[44px] ${
                  isPracticed
                    ? 'bg-emerald-600 text-white'
                    : 'border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>{isPracticed ? 'Frase praticada ✓' : 'Marcar como praticada'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStepCard(-1)}
                  aria-label="Frase anterior"
                  className="w-11 h-11 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-50"
                >
                  <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => handleStepCard(1)}
                  aria-label="Próxima frase"
                  className="w-11 h-11 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-50"
                >
                  <ChevronRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MODO PRÁTICA GUIADO (7 passos) */}
      {activeTab === 'pratica' && (
        <div className="max-w-3xl mx-auto space-y-5">
          {filteredPhrases.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center space-y-3">
              <h2 className="text-lg font-extrabold text-slate-900">
                Selecione uma categoria para praticar
              </h2>
              <button
                type="button"
                onClick={() => handleSelectCategory('Todos')}
                className="rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white min-h-[44px]"
              >
                Mostrar todas as frases
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-emerald-200 bg-white p-6 md:p-8 space-y-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-800">
                  <Sparkles className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>
                    Modo Prática · Cartão {(activeIndex >= 0 ? activeIndex : 0) + 1} de {filteredPhrases.length}
                  </span>
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStepCard(-1)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 min-h-[40px]"
                  >
                    <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                    <span>Anterior</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStepCard(1)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 min-h-[40px]"
                  >
                    <span>Próxima</span>
                    <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {/* Guided checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
                <div
                  className={`rounded-2xl border px-3 py-2 text-center ${
                    guidedStepDone.heard
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  1. Ouvir áudio {guidedStepDone.heard ? '✓' : ''}
                </div>
                <div className="rounded-2xl border border-sky-200 bg-sky-50 px-3 py-2 text-center text-sky-900">
                  2. Repetir em voz alta
                </div>
                <div
                  className={`rounded-2xl border px-3 py-2 text-center ${
                    guidedStepDone.recorded
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  3. Gravar e ouvir {guidedStepDone.recorded ? '✓' : ''}
                </div>
                <div
                  className={`rounded-2xl border px-3 py-2 text-center ${
                    isPracticed
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-slate-50 text-slate-600'
                  }`}
                >
                  4. Marcar praticada {isPracticed ? '✓' : ''}
                </div>
              </div>

              {/* Active card showcase */}
              <div className="flex flex-col sm:flex-row items-center gap-5 rounded-3xl bg-sky-50/60 border border-sky-100 p-5">
                <IllustratedArt
                  artKey={activePhrase.iconKey}
                  label={activePhrase.phrase}
                  size={112}
                  className="shrink-0"
                />
                <div className="text-center sm:text-left space-y-2 flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                    {activePhrase.categories.map((c) => (
                      <span
                        key={c}
                        className="rounded-lg bg-white border border-sky-200 px-2.5 py-0.5 text-xs font-bold text-sky-800"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {activePhrase.phrase}
                  </h2>
                  <p className="text-sm text-slate-600">{activePhrase.context}</p>
                </div>
              </div>

              {/* Audio listen & slow buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => handleListen(activePhrase)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-6 py-3.5 text-base font-bold text-white hover:bg-sky-700 transition min-h-[48px]"
                >
                  <Volume2 className="w-5 h-5" aria-hidden="true" />
                  <span>Ouvir frase</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleListen(activePhrase, true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-bold text-slate-800 hover:bg-slate-100 transition min-h-[48px]"
                >
                  <Turtle className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                  <span>Repetir devagar</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleFavoritePhrase(activePhrase.id)}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3.5 text-sm font-bold transition min-h-[48px] ${
                    isFavorite
                      ? 'border-rose-300 bg-rose-50 text-rose-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-rose-50'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} aria-hidden="true" />
                  <span>{isFavorite ? 'Favorita' : 'Favoritar'}</span>
                </button>
              </div>

              {/* Voice recording & playback */}
              <PracticeRecorder
                targetText={activePhrase.phrase}
                audioSettings={audioSettings}
                onSuccess={() => {
                  setGuidedStepDone((prev) => ({ ...prev, recorded: true }));
                  onPracticePhrase(activePhrase);
                }}
              />

              {/* Complete / Next */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onTogglePracticedPhrase(activePhrase)}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition min-h-[46px] ${
                    isPracticed
                      ? 'bg-emerald-600 text-white'
                      : 'border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  <span>{isPracticed ? 'Praticada ✓' : 'Marcar como praticada'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleStepCard(1)}
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-white hover:bg-amber-600 transition min-h-[46px]"
                >
                  <span>Próxima frase</span>
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PROGRESSO */}
      {activeTab === 'progresso' && (
        <div className="space-y-6">
          {/* 4 Main Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-3xl border border-emerald-200 bg-white p-5 space-y-1">
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                Frases praticadas
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {practicedPhraseIds.length}
                <span className="text-base font-bold text-slate-400"> / {DAILY_PHRASES.length}</span>
              </div>
              <p className="text-xs text-slate-600">Expressões treinadas em voz alta</p>
            </div>

            <div className="rounded-3xl border border-sky-200 bg-white p-5 space-y-1">
              <div className="text-xs font-bold text-sky-700 uppercase tracking-wide">
                Categorias exploradas
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {exploredPhraseCategories.length}
                <span className="text-base font-bold text-slate-400"> / 11</span>
              </div>
              <p className="text-xs text-slate-600">Situações do dia a dia descobertas</p>
            </div>

            <div className="rounded-3xl border border-amber-200 bg-white p-5 space-y-1">
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                Total de atividades concluídas
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {activitiesCompleted}
              </div>
              <p className="text-xs text-slate-600">Conquistas acumuladas no aplicativo</p>
            </div>

            <div className="rounded-3xl border border-rose-200 bg-white p-5 space-y-1">
              <div className="text-xs font-bold text-rose-700 uppercase tracking-wide">
                Frases favoritas
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tabular-nums">
                {favoritePhraseIds.length}
              </div>
              <p className="text-xs text-slate-600">Cartões salvos com coração</p>
            </div>
          </div>

          {/* Explored Categories Grid */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900">Categorias exploradas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {realCategories.map((cat) => {
                const explored = exploredPhraseCategories.includes(cat);
                const catTotal = categoryCounts[cat];
                const catPracticed = DAILY_PHRASES.filter(
                  (p) => p.categories.includes(cat) && practicedPhraseIds.includes(p.id)
                ).length;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      handleSelectCategory(cat);
                      setActiveTab('explorar');
                    }}
                    className={`rounded-2xl border p-3.5 text-left transition ${
                      explored
                        ? 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-400'
                        : 'border-slate-200 bg-slate-50/70 hover:border-sky-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900">{cat}</span>
                      {explored && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                      )}
                    </div>
                    <div className="text-xs text-slate-600 mt-1 tabular-nums">
                      {catPracticed} de {catTotal} praticadas
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Favorites List */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-rose-500" aria-hidden="true" />
                <h2 className="text-lg font-extrabold text-slate-900">Frases favoritas</h2>
              </div>

              {favoritePhrasesList.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Você ainda não marcou nenhuma frase favorita. Toque no coração de um cartão para salvá-la aqui!
                </p>
              ) : (
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {favoritePhrasesList.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <IllustratedArt artKey={item.iconKey} label={item.phrase} size={44} className="shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 truncate">{item.phrase}</div>
                          <div className="text-xs text-slate-500">{item.categories[0]}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(item);
                          setActiveTab('pratica');
                          speakPtBr(item.phrase, audioSettings);
                        }}
                        className="rounded-xl bg-sky-600 px-3 py-2 text-xs font-bold text-white shrink-0 min-h-[36px]"
                      >
                        Praticar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Practice History */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-sky-600" aria-hidden="true" />
                <h2 className="text-lg font-extrabold text-slate-900">Histórico de prática</h2>
              </div>

              {phraseHistory.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Suas frases praticadas aparecerão aqui conforme você ouvir, gravar ou concluir cartões!
                </p>
              ) : (
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {phraseHistory.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3"
                    >
                      <div>
                        <div className="text-sm font-bold text-slate-900">{h.title}</div>
                        <div className="text-xs text-slate-500">
                          {new Date(h.timestamp).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-xl bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" aria-hidden="true" />
                        <span>+{h.starsEarned}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
