import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Mic,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Trophy,
} from 'lucide-react';
import {
  ANIMAL_CATEGORIES,
  ANIMAL_SOUNDS,
  AnimalCategory,
  AnimalSoundItem,
} from '../data/curriculum';
import { AudioSettings } from '../types/app';
import { IllustratedArt } from '../components/IllustratedArt';
import { PracticeRecorder } from '../components/PracticeRecorder';
import {
  playAnimalAudio,
  playFeedbackTone,
  speakPtBr,
  stopAnimalAudio,
  stopSpeaking,
  unlockAudioEngine,
} from '../utils/speech';

interface AnimalSoundsViewProps {
  audioSettings: AudioSettings;
  practicedAnimals: string[];
  onPracticeAnimal: (animalId: string, animalName: string) => void;
  onUpdateVolume: (volume: number) => void;
}

type ActivityMode = 'explore' | 'imitate' | 'guess';

export const AnimalSoundsView: React.FC<AnimalSoundsViewProps> = ({
  audioSettings,
  practicedAnimals,
  onPracticeAnimal,
  onUpdateVolume,
}) => {
  const [mode, setMode] = useState<ActivityMode>('explore');
  const [selectedCategory, setSelectedCategory] = useState<'Todos' | AnimalCategory>('Todos');
  const [selectedId, setSelectedId] = useState<string>(ANIMAL_SOUNDS[0].id);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [bouncingId, setBouncingId] = useState<string | null>(null);

  // Modo Imite o Animal
  const [imitateIndex, setImitateIndex] = useState(0);

  // Modo Adivinhe o Animal
  const [guessIndex, setGuessIndex] = useState(0);
  const [guessSolved, setGuessSolved] = useState(false);
  const [guessFeedback, setGuessFeedback] = useState<string | null>(null);
  const [guessScore, setGuessScore] = useState(0);

  const studioRef = useRef<HTMLDivElement | null>(null);
  const bounceTimerRef = useRef<number | null>(null);
  const guessTimerRef = useRef<number | null>(null);

  const clearViewTimers = useCallback(() => {
    if (bounceTimerRef.current !== null) {
      window.clearTimeout(bounceTimerRef.current);
      bounceTimerRef.current = null;
    }
    if (guessTimerRef.current !== null) {
      window.clearTimeout(guessTimerRef.current);
      guessTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearViewTimers();
      stopAnimalAudio();
      stopSpeaking();
    };
  }, [clearViewTimers]);

  const filteredAnimals = useMemo(() => {
    if (selectedCategory === 'Todos') return ANIMAL_SOUNDS;
    return ANIMAL_SOUNDS.filter((animal) => animal.categories.includes(selectedCategory));
  }, [selectedCategory]);

  const selectedAnimal = useMemo(() => {
    return (
      filteredAnimals.find((a) => a.id === selectedId) ||
      ANIMAL_SOUNDS.find((a) => a.id === selectedId) ||
      filteredAnimals[0] ||
      ANIMAL_SOUNDS[0]
    );
  }, [filteredAnimals, selectedId]);

  const imitateAnimal = useMemo(() => {
    const pool = filteredAnimals.length > 0 ? filteredAnimals : ANIMAL_SOUNDS;
    return pool[imitateIndex % pool.length];
  }, [filteredAnimals, imitateIndex]);

  const guessTarget = useMemo(() => {
    return ANIMAL_SOUNDS[guessIndex % ANIMAL_SOUNDS.length];
  }, [guessIndex]);

  const guessChoices = useMemo(() => {
    const othersPool = ANIMAL_SOUNDS.filter((a) => a.id !== guessTarget.id);
    const step = (guessIndex * 7 + 3) % othersPool.length;
    const optionA = othersPool[step];
    const optionB = othersPool[(step + 11) % othersPool.length];
    const trio = [guessTarget, optionA, optionB];
    return trio.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [guessTarget, guessIndex]);

  const markAnimalPracticed = useCallback(
    (animal: AnimalSoundItem) => {
      if (!practicedAnimals.includes(animal.id)) {
        onPracticeAnimal(animal.id, animal.name);
      }
    },
    [practicedAnimals, onPracticeAnimal]
  );

  const triggerBounce = useCallback((animalId: string) => {
    setBouncingId(animalId);
    if (bounceTimerRef.current !== null) {
      window.clearTimeout(bounceTimerRef.current);
    }
    bounceTimerRef.current = window.setTimeout(() => {
      setBouncingId((curr) => (curr === animalId ? null : curr));
    }, 650);
  }, []);

  const playRealSound = useCallback(
    (animal: AnimalSoundItem, opts?: { markPracticed?: boolean; selectCard?: boolean }) => {
      stopSpeaking();
      unlockAudioEngine();

      if (opts?.selectCard !== false) {
        setSelectedId(animal.id);
      }
      setPlayingId(animal.id);
      triggerBounce(animal.id);

      playAnimalAudio(animal.audioSrc, animal.id, audioSettings.volume, () => {
        setPlayingId((curr) => (curr === animal.id ? null : curr));
      });

      if (opts?.markPracticed) {
        markAnimalPracticed(animal);
      }
    },
    [audioSettings.volume, markAnimalPracticed, triggerBounce]
  );

  const speakAnimalPhrase = useCallback(
    (animal: AnimalSoundItem) => {
      stopAnimalAudio();
      unlockAudioEngine();
      setSelectedId(animal.id);
      triggerBounce(animal.id);
      speakPtBr(animal.speechPhrase, audioSettings);
    },
    [audioSettings, triggerBounce]
  );

  const handleOpenImitateForCard = (animal: AnimalSoundItem) => {
    setSelectedId(animal.id);
    playRealSound(animal, { markPracticed: true });
    studioRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleSelectCategory = (cat: 'Todos' | AnimalCategory) => {
    setSelectedCategory(cat);
    setImitateIndex(0);
    const nextList =
      cat === 'Todos'
        ? ANIMAL_SOUNDS
        : ANIMAL_SOUNDS.filter((a) => a.categories.includes(cat));
    if (nextList.length > 0 && !nextList.some((a) => a.id === selectedId)) {
      setSelectedId(nextList[0].id);
    }
  };

  const handleSwitchMode = (nextMode: ActivityMode) => {
    clearViewTimers();
    stopAnimalAudio();
    stopSpeaking();
    setPlayingId(null);
    setMode(nextMode);

    if (nextMode === 'guess') {
      setGuessSolved(false);
      setGuessFeedback(null);
      window.setTimeout(() => {
        playRealSound(guessTarget, { markPracticed: false, selectCard: false });
      }, 150);
    }
  };

  const handleNextGuess = useCallback(() => {
    clearViewTimers();
    stopAnimalAudio();
    stopSpeaking();
    const nextIdx = (guessIndex + 1) % ANIMAL_SOUNDS.length;
    const nextAnimal = ANIMAL_SOUNDS[nextIdx];
    setGuessIndex(nextIdx);
    setGuessSolved(false);
    setGuessFeedback(null);
    window.setTimeout(() => {
      playAnimalAudio(nextAnimal.audioSrc, nextAnimal.id, audioSettings.volume, () => {
        setPlayingId((curr) => (curr === nextAnimal.id ? null : curr));
      });
      setPlayingId(nextAnimal.id);
    }, 150);
  }, [audioSettings.volume, clearViewTimers, guessIndex]);

  const handleGuessChoice = (chosen: AnimalSoundItem) => {
    if (guessSolved) return;
    clearViewTimers();
    stopAnimalAudio();
    stopSpeaking();
    unlockAudioEngine();

    if (chosen.id === guessTarget.id) {
      setGuessSolved(true);
      setGuessScore((prev) => prev + 1);
      playFeedbackTone('success', audioSettings.volume);
      setGuessFeedback(`Isso mesmo! O ${guessTarget.name} faz "${guessTarget.onomatopoeia}"!`);
      markAnimalPracticed(guessTarget);
      speakPtBr(`Isso mesmo! ${guessTarget.speechPhrase}`, audioSettings, {
        skipFallbackTone: true,
      });

      guessTimerRef.current = window.setTimeout(() => {
        handleNextGuess();
      }, 2600);
    } else {
      playFeedbackTone('tryAgain', audioSettings.volume);
      setGuessFeedback(
        `Esse bichinho é ${chosen.name}! Ouça o som mais uma vez e tente de novo com calma.`
      );
      speakPtBr(`Esse é ${chosen.name}. Ouça o som e tente novamente!`, audioSettings, {
        skipFallbackTone: true,
      });
    }
  };

  const practicedCount = practicedAnimals.length;
  const totalCount = ANIMAL_SOUNDS.length;
  const progressPercent = Math.min(100, Math.round((practicedCount / totalCount) * 100));

  return (
    <div className="space-y-6">
      {/* Cabeçalho + Progresso + Volume */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              Sons dos Animais
            </h1>
            <p className="text-sm md:text-base text-slate-600 mt-1">
              Toque nos bichinhos para ouvir e imitar seus sons divertidos!
            </p>
          </div>

          {/* Controle de Volume */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => onUpdateVolume(audioSettings.volume > 0 ? 0 : 0.8)}
              aria-label={audioSettings.volume > 0 ? 'Silenciar áudio' : 'Ativar áudio'}
              className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-emerald-700 hover:bg-emerald-50 transition shrink-0"
            >
              {audioSettings.volume > 0 ? (
                <Volume2 className="w-5 h-5" aria-hidden="true" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" aria-hidden="true" />
              )}
            </button>
            <div className="flex flex-col min-w-[130px]">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Volume</span>
                <span className="tabular-nums">{Math.round(audioSettings.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={audioSettings.volume}
                aria-label="Volume dos sons dos animais"
                onChange={(e) => onUpdateVolume(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer mt-1"
              />
            </div>
          </div>
        </div>

        {/* Barra de progresso e troca de modo */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1 border-t border-slate-100">
          <div className="flex-1 max-w-md space-y-1.5">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-slate-700">
              <span>Progresso dos bichinhos</span>
              <span className="text-emerald-700 tabular-nums">
                {practicedCount} de {totalCount} praticados
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div
            className="inline-flex flex-wrap rounded-2xl bg-slate-100 p-1 gap-1 self-start"
            role="tablist"
            aria-label="Modos de atividade"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'explore'}
              onClick={() => handleSwitchMode('explore')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition min-h-[44px] ${
                mode === 'explore'
                  ? 'bg-white text-sky-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Volume2 className="w-4 h-4" aria-hidden="true" />
              <span>Ouvir e Explorar</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'imitate'}
              onClick={() => handleSwitchMode('imitate')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition min-h-[44px] ${
                mode === 'imitate'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mic className="w-4 h-4" aria-hidden="true" />
              <span>Imite o Animal</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'guess'}
              onClick={() => handleSwitchMode('guess')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition min-h-[44px] ${
                mode === 'guess'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-4 h-4" aria-hidden="true" />
              <span>Adivinhe o Animal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtros por Categoria (Explore e Imite o Animal) */}
      {mode !== 'guess' && (
        <div
          className="flex flex-wrap items-center gap-2"
          aria-label="Filtrar animais por categoria"
        >
          {ANIMAL_CATEGORIES.map((category) => {
            const count =
              category === 'Todos'
                ? ANIMAL_SOUNDS.length
                : ANIMAL_SOUNDS.filter((a) => a.categories.includes(category)).length;
            const active = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleSelectCategory(category)}
                className={`rounded-2xl border px-3.5 py-2 text-xs sm:text-sm font-bold transition min-h-[40px] inline-flex items-center gap-1.5 ${
                  active
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50'
                }`}
              >
                <span>{category}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
                    active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* MODO 1: OUVIR E EXPLORAR */}
      {mode === 'explore' && (
        <div className="space-y-6">
          {/* Painel Interativo do Bichinho Selecionado */}
          <div
            ref={studioRef}
            className="rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-sky-50/70 p-5 md:p-7 shadow-xs"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-5 text-center sm:text-left">
                <motion.div
                  animate={
                    bouncingId === selectedAnimal.id || playingId === selectedAnimal.id
                      ? { scale: [1, 1.1, 0.96, 1.05, 1], rotate: [0, -4, 4, -2, 0] }
                      : { scale: 1, rotate: 0 }
                  }
                  transition={{ duration: 0.55 }}
                  className="shrink-0"
                >
                  <IllustratedArt
                    artKey={selectedAnimal.id}
                    label={selectedAnimal.name}
                    size={126}
                  />
                </motion.div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                    {selectedAnimal.categories.map((cat) => (
                      <span
                        key={cat}
                        className="rounded-full bg-white border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold text-slate-600"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                    {selectedAnimal.name}
                  </h2>
                  <p
                    className="text-xl md:text-2xl font-extrabold"
                    style={{ color: selectedAnimal.color }}
                  >
                    “{selectedAnimal.onomatopoeia}”
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => playRealSound(selectedAnimal, { markPracticed: true })}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition min-h-[44px]"
                    >
                      <Volume2 className="w-4 h-4" aria-hidden="true" />
                      <span>
                        {playingId === selectedAnimal.id ? 'Tocando som...' : 'Ouvir som real'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => playRealSound(selectedAnimal, { markPracticed: true })}
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50 active:scale-[0.98] transition min-h-[44px]"
                    >
                      <RotateCcw className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                      <span>Repetir</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => speakAnimalPhrase(selectedAnimal)}
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-sm font-bold text-sky-800 hover:bg-sky-100 active:scale-[0.98] transition min-h-[44px]"
                    >
                      <MessageCircle className="w-4 h-4" aria-hidden="true" />
                      <span>Ouvir frase</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-2.5">
                <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Mic className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span>
                    Imite o som do(a) {selectedAnimal.name} e ouça sua própria voz:
                  </span>
                </p>
                <PracticeRecorder
                  targetText={`${selectedAnimal.name} faz ${selectedAnimal.onomatopoeia}`}
                  audioSettings={audioSettings}
                  onSuccess={() => markAnimalPracticed(selectedAnimal)}
                />
              </div>
            </div>
          </div>

          {/* Grade de Cartões Interativos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredAnimals.map((animal) => {
              const isSelected = selectedAnimal.id === animal.id;
              const isPlaying = playingId === animal.id;
              const isBouncing = bouncingId === animal.id;
              const isPracticed = practicedAnimals.includes(animal.id);

              return (
                <motion.div
                  key={animal.id}
                  animate={
                    isBouncing || isPlaying
                      ? { scale: [1, 1.04, 0.98, 1.02, 1] }
                      : { scale: 1 }
                  }
                  transition={{ duration: 0.45 }}
                  className={`relative rounded-3xl border p-5 text-center transition flex flex-col items-center justify-between gap-3 ${
                    isPlaying
                      ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300 shadow-sm'
                      : isSelected
                      ? 'bg-sky-50/60 border-sky-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  {isPracticed && (
                    <span
                      title="Bichinho praticado"
                      className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[11px] font-bold absolute top-3.5 right-3.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Praticado</span>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => playRealSound(animal, { markPracticed: true })}
                    className="w-full flex flex-col items-center gap-2.5 pt-2 focus-visible:outline-2 focus-visible:outline-emerald-600 rounded-2xl"
                  >
                    <motion.div
                      animate={
                        isPlaying
                          ? { y: [0, -6, 0, -4, 0], rotate: [0, -3, 3, 0] }
                          : { y: 0, rotate: 0 }
                      }
                      transition={{ duration: 0.6 }}
                    >
                      <IllustratedArt artKey={animal.id} label={animal.name} size={108} />
                    </motion.div>

                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900">{animal.name}</h3>
                      <p className="text-base font-bold mt-0.5" style={{ color: animal.color }}>
                        “{animal.onomatopoeia}”
                      </p>
                    </div>
                  </button>

                  <div className="w-full flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => playRealSound(animal, { markPracticed: true })}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-2xl px-3.5 py-2 text-xs font-bold transition min-h-[40px] flex-1 ${
                        isPlaying
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      <Volume2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>{isPlaying ? 'Tocando...' : 'Ouvir som'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => playRealSound(animal, { markPracticed: true })}
                      aria-label={`Repetir som de ${animal.name}`}
                      title="Repetir som"
                      className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition min-h-[40px]"
                    >
                      <RotateCcw className="w-4 h-4" aria-hidden="true" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenImitateForCard(animal)}
                      aria-label={`Imitar ${animal.name}`}
                      title="Imitar com microfone"
                      className="inline-flex items-center justify-center gap-1 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 transition min-h-[40px]"
                    >
                      <Mic className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Imitar</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODO 2: IMITE O ANIMAL */}
      {mode === 'imitate' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 max-w-3xl mx-auto space-y-6 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                stopAnimalAudio();
                setImitateIndex(
                  (prev) => (prev - 1 + filteredAnimals.length) % filteredAnimals.length
                );
              }}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 min-h-[44px]"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              <span>Anterior</span>
            </button>

            <span className="text-xs sm:text-sm font-bold text-slate-500 tabular-nums">
              Bichinho {(imitateIndex % filteredAnimals.length) + 1} de {filteredAnimals.length}
            </span>

            <button
              type="button"
              onClick={() => {
                stopAnimalAudio();
                setImitateIndex((prev) => (prev + 1) % filteredAnimals.length);
              }}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 min-h-[44px]"
            >
              <span>Próximo</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <motion.div
              key={imitateAnimal.id}
              initial={{ scale: 0.92, opacity: 0.5 }}
              animate={
                playingId === imitateAnimal.id
                  ? { scale: [1, 1.1, 0.97, 1.04, 1], opacity: 1 }
                  : { scale: 1, opacity: 1 }
              }
              transition={{ duration: 0.45 }}
            >
              <IllustratedArt artKey={imitateAnimal.id} label={imitateAnimal.name} size={140} />
            </motion.div>

            <div>
              <h2 className="text-3xl font-extrabold text-slate-900">{imitateAnimal.name}</h2>
              <p className="text-2xl font-extrabold mt-1" style={{ color: imitateAnimal.color }}>
                “{imitateAnimal.onomatopoeia}”
              </p>
              <p className="text-sm text-slate-600 mt-1">
                1. Ouça o som real · 2. Grave sua imitação · 3. Escute como ficou!
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => playRealSound(imitateAnimal, { markPracticed: false })}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-base font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition min-h-[48px]"
              >
                <Volume2 className="w-5 h-5" aria-hidden="true" />
                <span>
                  {playingId === imitateAnimal.id ? 'Tocando som...' : 'Ouvir som real'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => playRealSound(imitateAnimal, { markPracticed: false })}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-base font-bold text-slate-800 hover:bg-slate-100 active:scale-[0.98] transition min-h-[48px]"
              >
                <RotateCcw className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                <span>Repetir som</span>
              </button>
            </div>
          </div>

          <div className="pt-2">
            <PracticeRecorder
              targetText={`${imitateAnimal.name}: ${imitateAnimal.onomatopoeia}`}
              audioSettings={audioSettings}
              onSuccess={() => markAnimalPracticed(imitateAnimal)}
            />
          </div>

          {/* Mini barra rápida para escolher outro animal da categoria */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2.5">
              Escolher outro bichinho:
            </p>
            <div className="flex flex-wrap gap-2">
              {filteredAnimals.map((animal, idx) => {
                const isCurrent = animal.id === imitateAnimal.id;
                const done = practicedAnimals.includes(animal.id);
                return (
                  <button
                    key={animal.id}
                    type="button"
                    onClick={() => {
                      stopAnimalAudio();
                      setImitateIndex(idx);
                    }}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition inline-flex items-center gap-1 ${
                      isCurrent
                        ? 'bg-amber-500 border-amber-500 text-white'
                        : done
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-amber-300'
                    }`}
                  >
                    {done && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
                    <span>{animal.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODO 3: ADIVINHE O ANIMAL */}
      {mode === 'guess' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 max-w-3xl mx-auto space-y-6 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-emerald-800">
              <Trophy className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span className="tabular-nums">Acertos: {guessScore}</span>
            </span>

            <button
              type="button"
              onClick={handleNextGuess}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 min-h-[40px]"
            >
              <span>Outro bichinho</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {guessSolved
                ? `Era ${guessTarget.name} (${guessTarget.onomatopoeia})!`
                : 'Ouça com atenção... Que bichinho faz esse som?'}
            </h2>

            <motion.button
              type="button"
              onClick={() => playRealSound(guessTarget, { markPracticed: false, selectCard: false })}
              animate={
                playingId === guessTarget.id ? { scale: [1, 1.06, 1] } : { scale: 1 }
              }
              transition={{ repeat: playingId === guessTarget.id ? Infinity : 0, duration: 0.7 }}
              className="inline-flex items-center gap-2.5 rounded-2xl bg-emerald-600 px-7 py-4 text-base font-extrabold text-white hover:bg-emerald-700 active:scale-[0.98] transition min-h-[52px] shadow-xs"
            >
              <Volume2 className="w-5 h-5" aria-hidden="true" />
              <span>
                {playingId === guessTarget.id ? 'Tocando som misterioso...' : 'Ouvir o som do animal'}
              </span>
            </motion.button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {guessChoices.map((choice) => {
              const isWinner = guessSolved && choice.id === guessTarget.id;
              return (
                <motion.button
                  key={choice.id}
                  type="button"
                  disabled={guessSolved}
                  onClick={() => handleGuessChoice(choice)}
                  animate={isWinner ? { scale: [1, 1.08, 1.02] } : { scale: 1 }}
                  className={`rounded-3xl border-2 p-6 flex flex-col items-center gap-3 transition ${
                    isWinner
                      ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300 shadow-sm'
                      : guessSolved
                      ? 'border-slate-200 bg-slate-50 opacity-55'
                      : 'border-slate-200 bg-slate-50/60 hover:border-emerald-400 hover:bg-emerald-50/70 active:scale-[0.98]'
                  }`}
                >
                  <IllustratedArt artKey={choice.id} label={choice.name} size={114} />
                  <span className="text-lg font-extrabold text-slate-900">{choice.name}</span>
                  {isWinner && (
                    <span className="text-sm font-extrabold" style={{ color: choice.color }}>
                      “{choice.onomatopoeia}”
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {guessFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                role="status"
                className={`rounded-2xl border p-4 text-center text-base font-bold flex flex-col sm:flex-row items-center justify-center gap-3 ${
                  guessSolved
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles
                    className={`w-5 h-5 shrink-0 ${
                      guessSolved ? 'text-emerald-600' : 'text-amber-500'
                    }`}
                    aria-hidden="true"
                  />
                  <span>{guessFeedback}</span>
                </div>
                {guessSolved && (
                  <button
                    type="button"
                    onClick={handleNextGuess}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition shrink-0"
                  >
                    Próximo bichinho
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
