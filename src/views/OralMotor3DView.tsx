import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  RotateCcw,
  Volume2,
  BookmarkPlus,
  Star,
  Eraser,
  Trash2,
  AlertTriangle,
  Plus,
  Play,
  Square,
  ListPlus,
} from 'lucide-react';
import {
  ANATOMY_PARTS,
  AnatomyPartId,
  CameraPresetId,
  PHRASE_BATCHES,
} from '../data/vocalTractData';
import { AudioSettings } from '../types/app';
import { Mouth3DCanvas } from '../components/Mouth3DCanvas';
import { PracticeRecorder } from '../components/PracticeRecorder';
import { playFeedbackTone, speakPtBr, stopSpeaking } from '../utils/speech';

interface OralMotor3DViewProps {
  audioSettings: AudioSettings;
  onCompleteExercise: (title: string) => void;
}

interface SavedPhraseItem {
  id: string;
  text: string;
  tip?: string;
  favorite: boolean;
}

const STORAGE_SAVED_KEY = 'fala_melhor_vocal_saved_phrases_v1';

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25] as const;

function loadSavedPhrases(): SavedPhraseItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_SAVED_KEY);
    if (!raw) {
      return [
        {
          id: 'default-vamos',
          text: 'Vamos embora!',
          tip: 'Abertura vocal ampla e fechamento labial suave no M e B.',
          favorite: false,
        },
      ];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : [
          {
            id: 'default-vamos',
            text: 'Vamos embora!',
            tip: 'Abertura vocal ampla e fechamento labial suave no M e B.',
            favorite: false,
          },
        ];
  } catch {
    return [
      {
        id: 'default-vamos',
        text: 'Vamos embora!',
        tip: 'Abertura vocal ampla e fechamento labial suave no M e B.',
        favorite: false,
      },
    ];
  }
}

export const OralMotor3DView: React.FC<OralMotor3DViewProps> = ({
  audioSettings,
  onCompleteExercise,
}) => {
  // 3D Viewer & Anatomy inspection state
  const [selectedPart, setSelectedPart] = useState<AnatomyPartId>('lingua');
  const [cameraPreset, setCameraPreset] = useState<CameraPresetId>('tres-quartos');
  const [activeParts, setActiveParts] = useState<AnatomyPartId[]>([
    'labios',
    'lingua',
    'dentes',
    'mandibula',
  ]);
  const [phaseLabel, setPhaseLabel] = useState('Posição de repouso');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.5);

  // Phrase studio state
  const [phraseInput, setPhraseInput] = useState('Vamos embora!');
  const [activePhrase, setActivePhrase] = useState('Vamos embora!');
  const [savedPhrases, setSavedPhrases] = useState<SavedPhraseItem[]>(loadSavedPhrases);
  const [batchFeedback, setBatchFeedback] = useState<string | null>(null);

  // Frase em lote state
  const [batchText, setBatchText] = useState('');
  const [isBatchPlaying, setIsBatchPlaying] = useState(false);
  const [batchActiveIndex, setBatchActiveIndex] = useState<number | null>(null);
  const [batchComposerNotice, setBatchComposerNotice] = useState<string | null>(null);
  const batchRunIdRef = useRef(0);
  const batchTimeoutRef = useRef<number | null>(null);

  const clearBatchPlaybackTimers = () => {
    if (batchTimeoutRef.current !== null) {
      window.clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = null;
    }
  };

  const stopBatchPlayback = () => {
    batchRunIdRef.current += 1;
    clearBatchPlaybackTimers();
    setIsBatchPlaying(false);
    setBatchActiveIndex(null);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(savedPhrases));
    } catch {
      // Ignore storage quota errors
    }
  }, [savedPhrases]);

  useEffect(() => {
    return () => {
      batchRunIdRef.current += 1;
      clearBatchPlaybackTimers();
      stopSpeaking();
    };
  }, []);

  const batchLines = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    batchText
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .forEach((line) => {
        const key = line.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          result.push(line);
        }
      });
    return result;
  }, [batchText]);

  const isActivePhraseFavorite = useMemo(() => {
    const norm = activePhrase.trim().toLowerCase();
    return savedPhrases.some((s) => s.text.trim().toLowerCase() === norm && s.favorite);
  }, [activePhrase, savedPhrases]);

  const showToast = (msg: string) => {
    setBatchFeedback(msg);
    window.setTimeout(() => {
      setBatchFeedback((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const showBatchNotice = (msg: string) => {
    setBatchComposerNotice(msg);
    window.setTimeout(() => {
      setBatchComposerNotice((curr) => (curr === msg ? null : curr));
    }, 3500);
  };

  const speakPhraseWith3D = (text: string, rateOverride?: number) => {
    const clean = text.trim();
    if (!clean) return;

    stopBatchPlayback();
    setActivePhrase(clean);
    setPhraseInput(clean);
    setIsPlaying(true);

    speakPtBr(clean, audioSettings, {
      rateOverride: rateOverride ?? playbackSpeed,
      onStart: () => setIsPlaying(true),
      onEnd: () => {
        setIsPlaying(false);
        setPhaseLabel('Posição de repouso');
      },
    });
  };

  const handleHearActivePhrase = () => {
    const target = phraseInput.trim() || activePhrase.trim() || 'Vamos embora!';
    speakPhraseWith3D(target);
  };

  const handleRepeatExercise = () => {
    const target = activePhrase.trim() || phraseInput.trim() || 'Vamos embora!';
    speakPhraseWith3D(target);
  };

  const handleClearPhrase = () => {
    stopBatchPlayback();
    stopSpeaking();
    setIsPlaying(false);
    setPhaseLabel('Posição de repouso');
    setPhraseInput('');
  };

  const handleLoadBatchPreset = (presetPhrases: { text: string }[], title: string) => {
    stopBatchPlayback();
    playFeedbackTone('click', audioSettings.volume);
    setBatchText(presetPhrases.map((p) => p.text).join('\n'));
    showBatchNotice(`Modelo "${title}" carregado no campo de lote.`);
  };

  const handleAddBatchToList = () => {
    if (batchLines.length === 0) {
      showBatchNotice('Digite ou carregue pelo menos uma frase no campo acima.');
      return;
    }

    const existing = new Set(savedPhrases.map((s) => s.text.trim().toLowerCase()));
    const toAdd: SavedPhraseItem[] = [];
    batchLines.forEach((line, index) => {
      const norm = line.toLowerCase();
      if (!existing.has(norm)) {
        existing.add(norm);
        toAdd.push({
          id: `batch-custom-${Date.now()}-${index}`,
          text: line,
          favorite: false,
        });
      }
    });

    if (toAdd.length === 0) {
      showBatchNotice('Todas essas frases já estão na sua lista.');
      return;
    }

    playFeedbackTone('success', audioSettings.volume);
    setSavedPhrases((prev) => [...toAdd, ...prev]);
    showBatchNotice(`${toAdd.length} frase(s) adicionada(s) à Sua Lista de Frases!`);
  };

  const handleTogglePlayBatch = () => {
    if (isBatchPlaying) {
      stopBatchPlayback();
      stopSpeaking();
      setIsPlaying(false);
      setPhaseLabel('Posição de repouso');
      return;
    }

    if (batchLines.length === 0) {
      showBatchNotice('Digite ou carregue pelo menos uma frase para praticar em lote.');
      return;
    }

    const runId = batchRunIdRef.current + 1;
    batchRunIdRef.current = runId;
    clearBatchPlaybackTimers();
    setIsBatchPlaying(true);

    const speakStep = (index: number) => {
      if (batchRunIdRef.current !== runId) return;
      if (index >= batchLines.length) {
        setIsBatchPlaying(false);
        setBatchActiveIndex(null);
        setIsPlaying(false);
        setPhaseLabel('Posição de repouso');
        showBatchNotice('Prática do lote concluída!');
        return;
      }

      const phrase = batchLines[index];
      setBatchActiveIndex(index);
      setActivePhrase(phrase);
      setPhraseInput(phrase);
      setIsPlaying(true);

      speakPtBr(phrase, audioSettings, {
        rateOverride: playbackSpeed,
        onStart: () => {
          if (batchRunIdRef.current === runId) {
            setIsPlaying(true);
          }
        },
        onEnd: () => {
          if (batchRunIdRef.current !== runId) return;
          setIsPlaying(false);
          setPhaseLabel('Posição de repouso');
          batchTimeoutRef.current = window.setTimeout(() => {
            speakStep(index + 1);
          }, 550);
        },
      });
    };

    speakStep(0);
  };

  const handleClearBatch = () => {
    if (isBatchPlaying) {
      stopBatchPlayback();
      stopSpeaking();
      setIsPlaying(false);
      setPhaseLabel('Posição de repouso');
    }
    setBatchText('');
    setBatchComposerNotice(null);
  };

  const handleSavePhrase = () => {
    const clean = phraseInput.trim() || activePhrase.trim();
    if (!clean) return;
    playFeedbackTone('click', audioSettings.volume);
    setActivePhrase(clean);

    const exists = savedPhrases.some(
      (item) => item.text.trim().toLowerCase() === clean.toLowerCase()
    );
    if (exists) {
      showToast('Esta frase já está na sua lista!');
      return;
    }

    const newItem: SavedPhraseItem = {
      id: `custom-${Date.now()}`,
      text: clean,
      favorite: false,
    };
    setSavedPhrases((prev) => [newItem, ...prev]);
    showToast('Frase salva na sua lista!');
  };

  const handleToggleFavorite = () => {
    const clean = phraseInput.trim() || activePhrase.trim();
    if (!clean) return;
    playFeedbackTone('star', audioSettings.volume);
    setActivePhrase(clean);

    setSavedPhrases((prev) => {
      const idx = prev.findIndex((item) => item.text.trim().toLowerCase() === clean.toLowerCase());
      if (idx >= 0) {
        return prev.map((item, i) => (i === idx ? { ...item, favorite: !item.favorite } : item));
      }
      return [
        {
          id: `fav-${Date.now()}`,
          text: clean,
          favorite: true,
        },
        ...prev,
      ];
    });
  };

  const handleRemoveSavedPhrase = (id: string) => {
    setSavedPhrases((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="max-w-3xl">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Anatomia 3D do Trato Vocal
          </h1>
          <p className="mt-1.5 text-sm md:text-base text-slate-600 leading-relaxed">
            Gire, aproxime, digite suas próprias frases ou toque em cada estrutura para entender como lábios, dentes, língua, palato e cordas vocais produzem a fala.
          </p>
        </div>
      </div>

      {/* 3D Interactive Stage + Right Controls Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Interactive 3D Vocal Tract Canvas & Structure Inspector */}
        <div className="lg:col-span-7 space-y-3">
          <Mouth3DCanvas
            activePhraseText={activePhrase}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            selectedPart={selectedPart}
            cameraPreset={cameraPreset}
            onSelectPart={(part) => {
              playFeedbackTone('click', audioSettings.volume);
              setSelectedPart(part);
            }}
            onSelectCameraPreset={setCameraPreset}
            onPhasePulse={(label) => setPhaseLabel(label)}
            onActivePartsChange={setActiveParts}
          />
        </div>

        {/* Right: Playback, Speed, Custom Phrase, Highlight & Recorder */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-5 shadow-xs">
            {/* Ouvir frase + Repetir exercício */}
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={handleHearActivePhrase}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-bold text-white hover:bg-sky-700 active:scale-[0.99] transition min-h-[48px]"
              >
                <Volume2 className="w-4 h-4" aria-hidden="true" />
                <span>Ouvir frase</span>
              </button>
              <button
                type="button"
                onClick={handleRepeatExercise}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 hover:bg-slate-100 active:scale-[0.99] transition min-h-[48px]"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Repetir exercício</span>
              </button>
            </div>

            {/* Mobile volume hint */}
            <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/80 px-3.5 py-2.5 text-xs text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
              <span>
                Não está ouvindo o áudio? Verifique o volume do celular e o modo silencioso.
              </span>
            </div>

            {/* Speed selector */}
            <div className="space-y-2">
              <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">
                Velocidade: <span className="text-sky-700">{playbackSpeed}x</span>
              </span>
              <div className="grid grid-cols-4 gap-2">
                {SPEED_OPTIONS.map((spd) => {
                  const active = playbackSpeed === spd;
                  return (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`rounded-xl py-2 text-sm font-bold border transition min-h-[42px] tabular-nums ${
                        active
                          ? 'bg-sky-600 border-sky-700 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {spd}x
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom phrase input + Limpar / Salvar frase / Favorita */}
            <div className="space-y-2.5 pt-1 border-t border-slate-100">
              <label
                htmlFor="vocal-phrase-input"
                className="block text-xs font-bold uppercase tracking-wide text-slate-500"
              >
                Digite sua frase
              </label>
              <input
                id="vocal-phrase-input"
                type="text"
                value={phraseInput}
                onChange={(e) => {
                  setPhraseInput(e.target.value);
                  if (e.target.value.trim()) {
                    setActivePhrase(e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleHearActivePhrase();
                  }
                }}
                placeholder="Digite sua frase"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleClearPhrase}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 min-h-[40px]"
                >
                  <Eraser className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Limpar</span>
                </button>
                <button
                  type="button"
                  onClick={handleSavePhrase}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2 text-xs font-bold text-sky-900 hover:bg-sky-100 min-h-[40px]"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Salvar frase</span>
                </button>
                <button
                  type="button"
                  onClick={handleToggleFavorite}
                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition min-h-[40px] ${
                    isActivePhraseFavorite
                      ? 'border-amber-300 bg-amber-100 text-amber-900'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-amber-50'
                  }`}
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      isActivePhraseFavorite ? 'fill-amber-500 text-amber-600' : ''
                    }`}
                    aria-hidden="true"
                  />
                  <span>Favorita</span>
                </button>
              </div>

              {batchFeedback && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900">
                  {batchFeedback}
                </div>
              )}
            </div>

            {/* Frase em destaque */}
            <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wide text-sky-900">
                  Frase em destaque:
                </span>
                <span className="rounded-full bg-white border border-sky-200 px-2.5 py-1 text-xs font-bold text-slate-700">
                  {isPlaying ? phaseLabel : 'Posição de repouso'}
                </span>
              </div>

              <div className="text-xl font-extrabold text-slate-900 break-words">
                {activePhrase || 'Vamos embora!'}
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-600">Em movimento:</div>
                <div className="flex flex-wrap gap-1.5">
                  {(['labios', 'lingua', 'dentes', 'mandibula'] as AnatomyPartId[]).map(
                    (pid) => {
                      const moving = isPlaying && activeParts.includes(pid);
                      return (
                        <span
                          key={pid}
                          className={`rounded-xl px-2.5 py-1 text-xs font-bold border transition ${
                            moving
                              ? 'bg-sky-600 border-sky-700 text-white'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          {ANATOMY_PARTS[pid].label}
                        </span>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* Local voice recording */}
            <div className="space-y-2">
              <h2 className="text-sm font-extrabold text-slate-900">
                Gravação Local da Sua Voz
              </h2>
              <PracticeRecorder
                targetText={activePhrase || 'Vamos embora!'}
                audioSettings={audioSettings}
                onSuccess={() => onCompleteExercise(activePhrase || 'Trato vocal')}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Saved / Favorite Phrases Drawer Bar */}
      {savedPhrases.length > 0 && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-extrabold text-slate-900">
              Sua Lista de Frases ({savedPhrases.length})
            </h2>
            <span className="text-xs text-slate-500">
              Toque em uma frase para ouvir e animar o trato vocal em 3D
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {savedPhrases.map((item) => {
              const isSelected = activePhrase.trim().toLowerCase() === item.text.trim().toLowerCase();
              return (
                <div
                  key={item.id}
                  className={`inline-flex items-center gap-1 rounded-2xl border px-3 py-1.5 text-sm transition ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50 text-sky-950 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-sky-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => speakPhraseWith3D(item.text)}
                    className="inline-flex items-center gap-1.5 text-left py-0.5"
                  >
                    {item.favorite && (
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-600 shrink-0" aria-hidden="true" />
                    )}
                    <span>{item.text}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveSavedPhrase(item.id)}
                    aria-label={`Remover frase ${item.text}`}
                    className="ml-1 rounded-lg p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Frase em Lote */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 md:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Frase em Lote</h2>
            <p className="text-sm text-slate-600 mt-1">
              Digite ou cole várias frases (uma por linha) para praticar em sequência na Anatomia 3D ou salvar todas na sua lista.
            </p>
          </div>
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-2 text-xs font-extrabold text-sky-900 self-start sm:self-auto whitespace-nowrap tabular-nums">
            {batchLines.length} {batchLines.length === 1 ? 'frase no lote' : 'frases no lote'}
          </div>
        </div>

        {/* Quick-fill batch templates */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-1">Modelos rápidos:</span>
          {PHRASE_BATCHES.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleLoadBatchPreset(preset.phrases, preset.title)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-900 transition min-h-[36px]"
            >
              <ListPlus className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
              <span>{preset.title}</span>
            </button>
          ))}
        </div>

        {/* Multi-line batch input */}
        <div className="space-y-2">
          <label htmlFor="vocal-batch-input" className="block text-xs font-bold uppercase tracking-wide text-slate-500">
            Frases (uma por linha)
          </label>
          <textarea
            id="vocal-batch-input"
            rows={4}
            value={batchText}
            onChange={(e) => setBatchText(e.target.value)}
            placeholder={'Ex.:\nBom dia, mamãe!\nQuero beber um copo de água.\nVamos brincar de bola.'}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Batch action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleTogglePlayBatch}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition min-h-[44px] ${
              isBatchPlaying
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-sky-600 text-white hover:bg-sky-700'
            }`}
          >
            {isBatchPlaying ? (
              <>
                <Square className="w-4 h-4 fill-current" aria-hidden="true" />
                <span>Parar lote</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                <span>Praticar lote no 3D</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleAddBatchToList}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition min-h-[44px]"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Adicionar lote à lista</span>
          </button>

          {batchText.trim().length > 0 && (
            <button
              type="button"
              onClick={handleClearBatch}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition min-h-[44px]"
            >
              <Eraser className="w-4 h-4" aria-hidden="true" />
              <span>Limpar lote</span>
            </button>
          )}
        </div>

        {batchComposerNotice && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-emerald-900">
            {batchComposerNotice}
          </div>
        )}

        {/* Clickable parsed batch phrases */}
        {batchLines.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between gap-2 text-xs font-bold text-slate-600">
              <span>
                {isBatchPlaying && batchActiveIndex !== null
                  ? `Reproduzindo frase ${batchActiveIndex + 1} de ${batchLines.length}...`
                  : 'Toque em qualquer frase do lote para ouvir no 3D:'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {batchLines.map((line, index) => {
                const isRunningThis = isBatchPlaying && batchActiveIndex === index;
                const isSelected = activePhrase.trim().toLowerCase() === line.toLowerCase();
                return (
                  <button
                    key={`${index}-${line}`}
                    type="button"
                    onClick={() => {
                      speakPhraseWith3D(line);
                      onCompleteExercise(line);
                    }}
                    className={`inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-sm text-left transition ${
                      isRunningThis
                        ? 'border-sky-600 bg-sky-600 text-white font-bold shadow-xs'
                        : isSelected
                          ? 'border-sky-500 bg-sky-50 text-sky-950 font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-sky-300 hover:bg-white'
                    }`}
                  >
                    <span className="text-xs font-extrabold opacity-75 tabular-nums">
                      {index + 1}.
                    </span>
                    <span>{line}</span>
                    <Volume2 className="w-3.5 h-3.5 shrink-0 opacity-80" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
