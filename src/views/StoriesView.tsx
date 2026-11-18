import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Volume2, RotateCcw, CheckCircle2, Sparkles, BookOpen, Star, Lock } from 'lucide-react';
import { STORIES, StoryItem } from '../data/curriculum';
import { AudioSettings } from '../types/app';
import { CatalogItemDTO, ContentTier, PremiumStoryPayload } from '../types/premium';
import { ContentTierBadge } from '../components/ContentTierBadge';
import { playFeedbackTone, speakPtBr, stopSpeaking } from '../utils/speech';
import oceanoCover from '../assets/images/story_premium_oceano_1795006076054.jpg';
import nuvemCover from '../assets/images/story_premium_nuvem_1795006076383.jpg';

const PREMIUM_COVER_MAP: Record<string, string> = {
  'prem-oceano-coral': oceanoCover,
  'prem-nuvem-arcoiris': nuvemCover,
};

const PREMIUM_STORY_PREVIEWS = [
  {
    id: 'prem-oceano-coral',
    title: 'O Oceano Encantado de Coral',
    ageHint: '3 a 10 anos',
    coverImage: oceanoCover,
  },
  {
    id: 'prem-nuvem-arcoiris',
    title: 'A Nuvem Viajante e o Arco-Íris',
    ageHint: '4 a 12 anos',
    coverImage: nuvemCover,
  },
];

interface StoriesViewProps {
  audioSettings: AudioSettings;
  storiesRead: string[];
  hasPremiumAccess?: boolean;
  loadingCatalog?: boolean;
  catalogItems?: CatalogItemDTO[];
  exclusiveStories?: PremiumStoryPayload[];
  onGoToPremium?: () => void;
  onFinishStory: (storyId: string, storyTitle: string) => void;
}

export const StoriesView: React.FC<StoriesViewProps> = ({
  audioSettings,
  storiesRead,
  hasPremiumAccess = false,
  loadingCatalog = false,
  catalogItems = [],
  exclusiveStories = [],
  onGoToPremium,
  onFinishStory,
}) => {
  const [activeStory, setActiveStory] = useState<StoryItem | null>(null);
  const [currentLine, setCurrentLine] = useState<number>(-1);
  const [isNarrating, setIsNarrating] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [matchDone, setMatchDone] = useState(false);
  const [comprehensionMsg, setComprehensionMsg] = useState<string | null>(null);
  const narratingCancelRef = useRef(false);

  const catalogById = useMemo(() => {
    const map = new Map<string, CatalogItemDTO>();
    for (const item of catalogItems) {
      map.set(item.id, item);
    }
    return map;
  }, [catalogItems]);

  const exclusiveStoryById = useMemo(() => {
    const map = new Map<string, PremiumStoryPayload>();
    for (const s of exclusiveStories) {
      map.set(s.id, s);
    }
    return map;
  }, [exclusiveStories]);

  const getStoryAccess = (storyId: string, defaultTier: ContentTier) => {
    const entry = catalogById.get(storyId);
    const tier: ContentTier = entry?.tier || defaultTier;
    const unlocked = entry ? entry.unlocked : tier === 'GRATUITO' || hasPremiumAccess;
    return { tier, unlocked };
  };

  useEffect(() => {
    return () => {
      narratingCancelRef.current = true;
      stopSpeaking();
    };
  }, []);

  const startNarration = (story: StoryItem, fromIndex = 0) => {
    narratingCancelRef.current = false;
    setIsNarrating(true);

    const speakNext = (idx: number) => {
      if (narratingCancelRef.current || idx >= story.paragraphs.length) {
        setIsNarrating(false);
        setCurrentLine(-1);
        return;
      }
      setCurrentLine(idx);
      speakPtBr(story.paragraphs[idx], audioSettings, {
        onEnd: () => {
          if (!narratingCancelRef.current) {
            speakNext(idx + 1);
          }
        },
      });
    };

    speakNext(fromIndex);
  };

  const stopNarration = () => {
    narratingCancelRef.current = true;
    stopSpeaking();
    setIsNarrating(false);
    setCurrentLine(-1);
  };

  const openStory = (story: StoryItem, defaultTier: ContentTier) => {
    const { unlocked } = getStoryAccess(story.id, defaultTier);
    if (!unlocked) {
      onGoToPremium?.();
      return;
    }
    stopNarration();
    setActiveStory(story);
    setAnswers({});
    setMatchDone(false);
    setComprehensionMsg(null);
  };

  const handleAnswerQuestion = (qIdx: number, optIdx: number, story: StoryItem) => {
    const q = story.questions[qIdx];
    if (optIdx === q.correctIndex) {
      playFeedbackTone('star', audioSettings.volume);
      const nextAnswers = { ...answers, [qIdx]: optIdx };
      setAnswers(nextAnswers);
      setComprehensionMsg(q.encouragement);
      speakPtBr(q.encouragement, audioSettings);
      if (Object.keys(nextAnswers).length === story.questions.length && matchDone) {
        onFinishStory(story.id, story.title);
      }
    } else {
      playFeedbackTone('tryAgain', audioSettings.volume);
      setComprehensionMsg('Quase lá! Releia ou ouça a história novamente para descobrir.');
    }
  };

  const handleMatchWord = (word: string, story: StoryItem) => {
    if (word === story.matchingWord.targetWord) {
      setMatchDone(true);
      playFeedbackTone('success', audioSettings.volume);
      setComprehensionMsg(`Excelente! Você identificou a palavra ${word}!`);
      speakPtBr(`Muito bem! ${word}!`, audioSettings);
      onFinishStory(story.id, story.title);
    } else {
      playFeedbackTone('tryAgain', audioSettings.volume);
      setComprehensionMsg(`Essa é a palavra ${word}. Tente encontrar a palavra da história!`);
    }
  };

  if (!activeStory) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Histórias Infantis</h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            Ouça contos ilustrados com texto sincronizado e responda perguntas divertidas!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STORIES.map((story) => {
            const alreadyRead = storiesRead.includes(story.id);
            const { tier, unlocked } = getStoryAccess(story.id, 'GRATUITO');

            return (
              <div
                key={story.id}
                className={`rounded-3xl border bg-white overflow-hidden flex flex-col justify-between shadow-sm ${
                  unlocked ? 'border-slate-200' : 'border-amber-300'
                }`}
              >
                <div>
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    <img
                      src={story.coverImage}
                      alt={story.title}
                      referrerPolicy="no-referrer"
                      className={`w-full h-full object-cover ${unlocked ? '' : 'opacity-85'}`}
                    />
                    <div className="absolute top-3 left-3">
                      <ContentTierBadge tier={tier} unlocked={unlocked} overlay />
                    </div>
                    {alreadyRead && (
                      <div className="absolute top-3 right-3 rounded-xl bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                        Lida
                      </div>
                    )}
                    {!unlocked && (
                      <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
                        <span className="inline-flex items-center gap-1.5 rounded-2xl bg-white/95 border border-amber-300 px-3 py-1.5 text-xs font-extrabold text-[#0F2942] shadow-sm">
                          <Lock className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                          <span>Disponível no FalaKids Premium</span>
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-500">
                        Faixa sugerida · {story.ageHint}
                      </p>
                      <ContentTierBadge tier={tier} unlocked={unlocked} compact />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900 mt-1.5">{story.title}</h2>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  {unlocked ? (
                    <button
                      type="button"
                      onClick={() => openStory(story, 'GRATUITO')}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-700 transition min-h-[46px]"
                    >
                      <BookOpen className="w-4 h-4" aria-hidden="true" />
                      <span>Ler e Ouvir História</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onGoToPremium?.()}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 hover:bg-amber-100 py-3 text-sm font-bold text-amber-950 transition min-h-[46px]"
                    >
                      <Lock className="w-4 h-4 text-amber-700" aria-hidden="true" />
                      <span>Desbloquear na Área dos Pais</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Histórias Exclusivas · FalaKids Premium */}
        <section className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-[#FFFDF7] via-[#FEF6E4] to-[#FFF4E0] p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-900">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-600" aria-hidden="true" />
                <span>Histórias Exclusivas · FalaKids Premium</span>
              </div>
              <h2 className="text-xl font-extrabold text-[#0F2942]">
                Contos Especiais para Assinantes
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PREMIUM_STORY_PREVIEWS.map((preview) => {
              const alreadyRead = storiesRead.includes(preview.id);
              const { tier, unlocked } = getStoryAccess(preview.id, 'PREMIUM');
              const payload = exclusiveStoryById.get(preview.id);
              const resolvedCover = PREMIUM_COVER_MAP[preview.id] || preview.coverImage;
              const isReady = unlocked && Boolean(payload);
              const isLoading = unlocked && !payload && loadingCatalog;

              return (
                <div
                  key={preview.id}
                  className="rounded-3xl border border-amber-300 bg-white overflow-hidden flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="relative aspect-video bg-amber-50 overflow-hidden">
                      <img
                        src={resolvedCover}
                        alt={preview.title}
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover ${isReady ? '' : 'opacity-85'}`}
                      />
                      <div className="absolute top-3 left-3">
                        <ContentTierBadge tier={tier} unlocked={unlocked} overlay />
                      </div>
                      {alreadyRead && (
                        <div className="absolute top-3 right-3 rounded-xl bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Lida</span>
                        </div>
                      )}
                      {!unlocked && (
                        <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
                          <span className="inline-flex items-center gap-1.5 rounded-2xl bg-white/95 border border-amber-300 px-3.5 py-2 text-xs font-extrabold text-[#0F2942] shadow-sm">
                            <Lock className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                            <span>Disponível no FalaKids Premium</span>
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-amber-800">
                          Faixa sugerida · {preview.ageHint}
                        </p>
                        <ContentTierBadge tier={tier} unlocked={unlocked} compact />
                      </div>
                      <h3 className="text-xl font-extrabold text-[#0F2942] mt-1.5">
                        {preview.title}
                      </h3>
                    </div>
                  </div>

                  <div className="px-5 pb-5">
                    {isReady && payload ? (
                      <button
                        type="button"
                        onClick={() =>
                          openStory({ ...payload, coverImage: resolvedCover }, 'PREMIUM')
                        }
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 py-3 text-sm font-bold text-white transition min-h-[46px]"
                      >
                        <BookOpen className="w-4 h-4" aria-hidden="true" />
                        <span>Ler e Ouvir História Exclusiva</span>
                      </button>
                    ) : isLoading ? (
                      <div className="w-full inline-flex items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 py-3 text-sm font-bold text-amber-900 min-h-[46px]">
                        Carregando história...
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onGoToPremium?.()}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 hover:bg-amber-100 py-3 text-sm font-bold text-amber-950 transition min-h-[46px]"
                      >
                        <Lock className="w-4 h-4 text-amber-700" aria-hidden="true" />
                        <span>Desbloquear na Área dos Pais</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  const matchChoices = [
    activeStory.matchingWord.targetWord,
    ...activeStory.matchingWord.distractors,
  ].sort();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            stopNarration();
            setActiveStory(null);
          }}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 min-h-[44px]"
        >
          ← Todas as histórias
        </button>

        <div className="flex items-center gap-2.5">
          {!isNarrating ? (
            <button
              type="button"
              onClick={() => startNarration(activeStory, 0)}
              className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700 min-h-[44px]"
            >
              <Volume2 className="w-4 h-4" aria-hidden="true" />
              <span>Ouvir história completa</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={stopNarration}
              className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700 min-h-[44px]"
            >
              <span>Pausar narração</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              stopNarration();
              startNarration(activeStory, 0);
            }}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Repetir</span>
          </button>
        </div>
      </div>

      {/* Illustrated cover & synchronized text */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="aspect-video max-h-[340px] w-full overflow-hidden bg-slate-100">
          <img
            src={activeStory.coverImage}
            alt={activeStory.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-6 md:p-8 space-y-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            {activeStory.title}
          </h1>

          <div className="space-y-3">
            {activeStory.paragraphs.map((p, idx) => {
              const highlighted = currentLine === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    stopNarration();
                    setCurrentLine(idx);
                    speakPtBr(p, audioSettings, { onEnd: () => setCurrentLine(-1) });
                  }}
                  className={`w-full text-left rounded-2xl p-4 text-base md:text-lg leading-relaxed transition border ${
                    highlighted
                      ? 'bg-amber-50 border-amber-300 text-slate-950 font-semibold shadow-sm'
                      : 'bg-slate-50/70 border-transparent text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-500">
            Dica: toque em qualquer frase para ouvi-la novamente!
          </p>
        </div>
      </div>

      {/* Comprehension questions + activity */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 space-y-6">
        <h2 className="text-xl font-extrabold text-slate-900">Perguntas sobre a história</h2>

        <div className="space-y-5">
          {activeStory.questions.map((q, qIdx) => (
            <div key={qIdx} className="space-y-2.5">
              <p className="font-bold text-slate-800">{qIdx + 1}. {q.question}</p>
              <div className="flex flex-wrap gap-2.5">
                {q.options.map((opt, optIdx) => {
                  const isCorrectPicked = answers[qIdx] === optIdx;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleAnswerQuestion(qIdx, optIdx, activeStory)}
                      className={`rounded-2xl border px-4 py-2.5 text-sm font-semibold transition min-h-[44px] ${
                        isCorrectPicked
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-violet-400'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="text-base font-extrabold text-slate-900">
            Atividade de compreensão: {activeStory.matchingWord.prompt}
          </h3>
          <div className="flex flex-wrap gap-3">
            {matchChoices.map((word) => (
              <button
                key={word}
                type="button"
                onClick={() => handleMatchWord(word, activeStory)}
                className={`rounded-2xl border px-5 py-3 text-base font-bold transition min-h-[48px] ${
                  matchDone && word === activeStory.matchingWord.targetWord
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-violet-50 border-violet-200 text-violet-900 hover:bg-violet-100'
                }`}
              >
                {word}
              </button>
            ))}
          </div>
        </div>

        {comprehensionMsg && (
          <div
            role="status"
            className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm md:text-base font-semibold text-slate-900 flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" aria-hidden="true" />
            <span>{comprehensionMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
