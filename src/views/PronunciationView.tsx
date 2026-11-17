import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Volume2,
  Turtle,
  RotateCcw,
  CheckCircle2,
  Award,
  BookOpen,
  MessageSquare,
  FileText,
} from 'lucide-react';
import {
  PRONUNCIATION_EXERCISES,
  PRONUNCIATION_LEVELS,
  PronunciationExercise,
} from '../data/curriculum';
import { APP_THEMES, AppTheme } from '../data/themes';
import { AgeGroup, AudioSettings } from '../types/app';
import { IllustratedArt } from '../components/IllustratedArt';
import { PracticeRecorder } from '../components/PracticeRecorder';
import { playFeedbackTone, speakPtBr, stopSpeaking } from '../utils/speech';

interface PronunciationViewProps {
  ageGroup: AgeGroup;
  audioSettings: AudioSettings;
  theme?: AppTheme;
  practicedIds: string[];
  onCompleteExercise: (exercise: PronunciationExercise) => void;
}

type PronunciationFilter = 'todos' | PronunciationExercise['level'];

const DIFFICULTY_BADGE: Record<
  NonNullable<PronunciationExercise['difficulty']>,
  { label: string; className: string }
> = {
  facil: { label: 'Iniciante', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  medio: { label: 'Intermediário', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  desafio: { label: 'Desafio', className: 'bg-violet-50 text-violet-800 border-violet-200' },
};

export const PronunciationView: React.FC<PronunciationViewProps> = ({
  ageGroup,
  audioSettings,
  theme = APP_THEMES['sol-dourado'],
  practicedIds,
  onCompleteExercise,
}) => {
  const [level, setLevel] = useState<PronunciationFilter>('todos');
  const stageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const exercisesInLevel = useMemo(
    () =>
      level === 'todos'
        ? PRONUNCIATION_EXERCISES
        : PRONUNCIATION_EXERCISES.filter((e) => e.level === level),
    [level]
  );

  const [selectedId, setSelectedId] = useState<string>(exercisesInLevel[0]?.id || 'p-v-a');

  const currentExercise =
    exercisesInLevel.find((e) => e.id === selectedId) || exercisesInLevel[0];

  const practicedSet = useMemo(() => new Set(practicedIds), [practicedIds]);

  const progressStats = useMemo(() => {
    const total = PRONUNCIATION_EXERCISES.length;
    const completed = PRONUNCIATION_EXERCISES.filter((e) => practicedSet.has(e.id)).length;

    const wordList = PRONUNCIATION_EXERCISES.filter((e) => e.level === 'palavras');
    const wordsDone = wordList.filter((e) => practicedSet.has(e.id)).length;

    const phraseList = PRONUNCIATION_EXERCISES.filter(
      (e) => e.level === 'frases-curtas' || e.level === 'frases-cotidiano'
    );
    const phrasesDone = phraseList.filter((e) => practicedSet.has(e.id)).length;

    const textList = PRONUNCIATION_EXERCISES.filter((e) => e.level === 'pequenos-textos');
    const textsDone = textList.filter((e) => practicedSet.has(e.id)).length;

    const byCategory = PRONUNCIATION_LEVELS.map((lvl) => {
      const items = PRONUNCIATION_EXERCISES.filter((e) => e.level === lvl.id);
      const done = items.filter((e) => practicedSet.has(e.id)).length;
      const pct = items.length ? Math.round((done / items.length) * 100) : 0;
      return { id: lvl.id, label: lvl.label, done, total: items.length, pct };
    });

    return {
      total,
      completed,
      overallPct: total ? Math.round((completed / total) * 100) : 0,
      wordsDone,
      wordsTotal: wordList.length,
      phrasesDone,
      phrasesTotal: phraseList.length,
      textsDone,
      textsTotal: textList.length,
      byCategory,
    };
  }, [practicedSet]);

  const activeCategoryStats = useMemo(() => {
    const done = exercisesInLevel.filter((e) => practicedSet.has(e.id)).length;
    const total = exercisesInLevel.length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    const label =
      level === 'todos'
        ? 'Geral (Todas as categorias)'
        : PRONUNCIATION_LEVELS.find((l) => l.id === level)?.label || '';
    return { done, total, pct, label };
  }, [exercisesInLevel, level, practicedSet]);

  const handleSelectLevel = (nextLevel: PronunciationFilter) => {
    playFeedbackTone('click', audioSettings.volume);
    setLevel(nextLevel);
    const first =
      nextLevel === 'todos'
        ? PRONUNCIATION_EXERCISES[0]
        : PRONUNCIATION_EXERCISES.find((e) => e.level === nextLevel);
    if (first) setSelectedId(first.id);
  };

  const handleSelectExercise = (ex: PronunciationExercise) => {
    playFeedbackTone('click', audioSettings.volume);
    setSelectedId(ex.id);
    speakPtBr(ex.targetText, audioSettings);
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      stageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleRepeatExercise = (ex: PronunciationExercise) => {
    playFeedbackTone('click', audioSettings.volume);
    speakPtBr(ex.targetText, audioSettings);
    onCompleteExercise(ex);
  };

  const levelChips: { id: PronunciationFilter; label: string; done: number; total: number }[] = [
    {
      id: 'todos',
      label: 'Todos',
      done: progressStats.completed,
      total: progressStats.total,
    },
    ...progressStats.byCategory.map((cat) => ({
      id: cat.id as PronunciationFilter,
      label: cat.label,
      done: cat.done,
      total: cat.total,
    })),
  ];

  const isCurrentPracticed = currentExercise ? practicedSet.has(currentExercise.id) : false;
  const currentDiffBadge = currentExercise?.difficulty
    ? DIFFICULTY_BADGE[currentExercise.difficulty]
    : null;
  const currentLevelLabel = currentExercise
    ? PRONUNCIATION_LEVELS.find((l) => l.id === currentExercise.level)?.label
    : '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Pratique · Treinamento de Pronúncia
        </h1>
        <p className="text-sm md:text-base text-slate-600 mt-1">
          Pratique vogais, consoantes, sílabas, palavras, frases e pequenos textos no seu ritmo.
        </p>
      </div>

      {/* Progress Dashboard */}
      <section
        aria-label="Acompanhamento do progresso"
        className={`rounded-3xl border bg-white p-4 sm:p-5 space-y-4 shadow-xs ${theme.cardBorderClass}`}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums">
                {progressStats.completed}/{progressStats.total}
              </div>
              <div className="text-xs font-semibold text-slate-600 truncate">
                Exercícios concluídos
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums">
                {progressStats.wordsDone}/{progressStats.wordsTotal}
              </div>
              <div className="text-xs font-semibold text-slate-600 truncate">
                Palavras praticadas
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums">
                {progressStats.phrasesDone}/{progressStats.phrasesTotal}
              </div>
              <div className="text-xs font-semibold text-slate-600 truncate">
                Frases praticadas
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-lg sm:text-xl font-extrabold text-slate-900 tabular-nums">
                {progressStats.textsDone}/{progressStats.textsTotal}
              </div>
              <div className="text-xs font-semibold text-slate-600 truncate">
                Textos concluídos
              </div>
            </div>
          </div>
        </div>

        {/* Category progress bar + compact per-category progress */}
        <div className="space-y-2.5 pt-1 border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-700">
            <span>Progresso em {activeCategoryStats.label}</span>
            <span className="tabular-nums text-sky-800">
              {activeCategoryStats.done} de {activeCategoryStats.total} ({activeCategoryStats.pct}%)
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${activeCategoryStats.pct}%` }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
            {progressStats.byCategory.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleSelectLevel(cat.id)}
                className={`rounded-xl border px-2.5 py-2 text-left transition ${
                  level === cat.id
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-1 text-[11px] font-bold text-slate-700">
                  <span className="truncate">{cat.label}</span>
                  <span className="tabular-nums text-sky-800">
                    {cat.done}/{cat.total}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all duration-300"
                    style={{ width: `${cat.pct}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Level tabs including Todos */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categorias de pronúncia">
        {levelChips.map((lvl) => {
          const active = lvl.id === level;
          return (
            <button
              key={lvl.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleSelectLevel(lvl.id)}
              className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-semibold border transition min-h-[44px] ${
                active
                  ? theme.tabSolidActiveClass
                  : `bg-white text-slate-700 hover:bg-slate-50 ${theme.cardBorderClass}`
              }`}
            >
              <span>{lvl.label}</span>
              <span
                className={`text-xs tabular-nums ${
                  active ? 'opacity-90' : 'text-slate-500'
                }`}
              >
                ({lvl.done}/{lvl.total})
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-3 max-h-[580px] overflow-y-auto pr-1">
          {exercisesInLevel.map((ex) => {
            const active = currentExercise?.id === ex.id;
            const practiced = practicedSet.has(ex.id);
            const recommendedForAge = ex.ageGroups.includes(ageGroup);
            const diffBadge = ex.difficulty ? DIFFICULTY_BADGE[ex.difficulty] : null;

            return (
              <button
                key={ex.id}
                type="button"
                onClick={() => handleSelectExercise(ex)}
                className={`w-full rounded-2xl border p-4 text-left flex items-center gap-3.5 transition ${
                  active
                    ? theme.selectedCardClass
                    : practiced
                      ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <IllustratedArt artKey={ex.iconKey} label={ex.title} size={56} className="shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 truncate">{ex.title}</span>
                    {practiced && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Praticado</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 truncate mt-0.5">{ex.targetText}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {diffBadge && (
                      <span
                        className={`rounded-lg border px-1.5 py-0.5 text-[10px] font-bold ${diffBadge.className}`}
                      >
                        {diffBadge.label}
                      </span>
                    )}
                    {recommendedForAge && (
                      <span className="text-[11px] font-semibold text-emerald-700">
                        Indicado para sua faixa etária
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div
          ref={stageRef}
          className={`lg:col-span-7 rounded-3xl border bg-white p-5 sm:p-6 space-y-5 ${theme.cardBorderClass}`}
        >
          {currentExercise && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <IllustratedArt
                  artKey={currentExercise.iconKey}
                  label={currentExercise.title}
                  size={96}
                  className="shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {currentLevelLabel && (
                      <span className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                        {currentLevelLabel}
                      </span>
                    )}
                    {currentDiffBadge && (
                      <span
                        className={`rounded-xl border px-2.5 py-0.5 text-xs font-bold ${currentDiffBadge.className}`}
                      >
                        {currentDiffBadge.label}
                      </span>
                    )}
                    {isCurrentPracticed && (
                      <span className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-900">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Exercício praticado</span>
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{currentExercise.title}</h2>
                  <p className={`text-2xl md:text-3xl font-extrabold mt-1 leading-snug ${theme.accentTextClass}`}>
                    “{currentExercise.targetText}”
                  </p>
                </div>
              </div>

              <div className={`rounded-2xl border p-4 text-sm text-slate-700 ${theme.controlPillActiveClass}`}>
                <strong>Como fazer:</strong> {currentExercise.instruction}
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => speakPtBr(currentExercise.targetText, audioSettings)}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition min-h-[46px] ${theme.primaryBtnClass}`}
                >
                  <Volume2 className="w-4 h-4" aria-hidden="true" />
                  <span>Ouvir pronúncia</span>
                </button>

                <button
                  type="button"
                  onClick={() => speakPtBr(currentExercise.targetText, audioSettings)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-900 hover:bg-sky-100 transition min-h-[46px]"
                >
                  <RotateCcw className="w-4 h-4 text-sky-600" aria-hidden="true" />
                  <span>Repetir áudio</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    speakPtBr(currentExercise.targetText, audioSettings, { rateOverride: 0.68 })
                  }
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition min-h-[46px]"
                >
                  <Turtle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>Bem devagar</span>
                </button>
              </div>

              <PracticeRecorder
                targetText={currentExercise.targetText}
                audioSettings={audioSettings}
                onSuccess={() => onCompleteExercise(currentExercise)}
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500">
                  Cada vez que você pratica, ganha uma estrelinha no seu ritmo!
                </span>
                <button
                  type="button"
                  onClick={() => handleRepeatExercise(currentExercise)}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold transition min-h-[44px] ${
                    isCurrentPracticed
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
                      : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  {isCurrentPracticed ? (
                    <>
                      <RotateCcw className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                      <span>Repetir exercício</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                      <span>Marcar como praticado</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
