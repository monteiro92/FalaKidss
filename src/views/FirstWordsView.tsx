import React, { useMemo, useState } from 'react';
import { Volume2, Mic, Puzzle, CheckCircle2, Sparkles } from 'lucide-react';
import { FIRST_WORDS, WORD_CATEGORIES, WordItem } from '../data/curriculum';
import { APP_THEMES, AppTheme } from '../data/themes';
import { AudioSettings } from '../types/app';
import { IllustratedArt } from '../components/IllustratedArt';
import { PracticeRecorder } from '../components/PracticeRecorder';
import { playFeedbackTone, speakPtBr } from '../utils/speech';

interface FirstWordsViewProps {
  audioSettings: AudioSettings;
  practicedWords: string[];
  theme?: AppTheme;
  onPracticeWord: (word: string) => void;
  onTogglePracticeWord?: (word: string) => void;
}

type WordFilter = 'todos' | WordItem['category'];

export const FirstWordsView: React.FC<FirstWordsViewProps> = ({
  audioSettings,
  practicedWords,
  theme = APP_THEMES['sol-dourado'],
  onPracticeWord,
  onTogglePracticeWord,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<WordFilter>('todos');
  const [activeWord, setActiveWord] = useState<WordItem | null>(FIRST_WORDS[0]);
  const [mode, setMode] = useState<'explore' | 'match'>('explore');

  const categoryWords = useMemo(
    () =>
      FIRST_WORDS.filter(
        (w) =>
          selectedCategory === 'todos' ||
          w.category === selectedCategory ||
          w.extraCategories?.includes(selectedCategory)
      ),
    [selectedCategory]
  );

  const [quizIndex, setQuizIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const allInCategory = categoryWords;

  const currentTarget = categoryWords[quizIndex % Math.max(1, categoryWords.length)];

  const quizOptions = useMemo(() => {
    if (!currentTarget) return [];
    const others = categoryWords.filter((w) => w.id !== currentTarget.id).slice(0, 2);
    return [currentTarget, ...others].sort((a, b) => a.word.localeCompare(b.word));
  }, [categoryWords, currentTarget]);

  const handleSelectWord = (item: WordItem) => {
    setActiveWord(item);
    playFeedbackTone('click', audioSettings.volume);
    speakPtBr(item.word, audioSettings);
  };

  const handleQuizAnswer = (chosen: WordItem) => {
    if (!currentTarget) return;
    if (chosen.id === currentTarget.id) {
      playFeedbackTone('success', audioSettings.volume);
      setQuizFeedback(`Muito bem! Você encontrou ${currentTarget.word}!`);
      speakPtBr(`Muito bem! ${currentTarget.word}!`, audioSettings);
      onPracticeWord(currentTarget.word);
      window.setTimeout(() => {
        setQuizFeedback(null);
        setQuizIndex((prev) => (prev + 1) % categoryWords.length);
      }, 1400);
    } else {
      playFeedbackTone('tryAgain', audioSettings.volume);
      setQuizFeedback(`Quase lá! Essa figura é ${chosen.word}. Vamos tentar de novo!`);
      speakPtBr(`Essa é ${chosen.word}. Vamos procurar ${currentTarget.word}!`, audioSettings);
    }
  };

  const filterChips: { id: WordFilter; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    ...WORD_CATEGORIES,
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Primeiras Palavras</h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            Toque em cada cartão para ouvir, repetir e associar imagens às palavras.
          </p>
        </div>

        <div className="inline-flex rounded-2xl bg-slate-100 p-1 self-start">
          <button
            type="button"
            onClick={() => setMode('explore')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition min-h-[44px] ${
              mode === 'explore' ? theme.controlSubActiveClass : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Explorar Palavras
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('match');
              setQuizFeedback(null);
              if (currentTarget) {
                speakPtBr(`Onde está a palavra ${currentTarget.word}?`, audioSettings);
              }
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition min-h-[44px] ${
              mode === 'match' ? 'bg-white text-emerald-700 font-semibold shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Puzzle className="w-4 h-4" aria-hidden="true" />
            <span>Associar Imagem</span>
          </button>
        </div>
      </div>

      {/* Categories selector including Todos */}
      <div className="flex flex-wrap gap-2">
        {filterChips.map((cat) => {
          const active = cat.id === selectedCategory;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                setQuizIndex(0);
                setQuizFeedback(null);
                const catId = cat.id;
                const firstFree =
                  catId === 'todos'
                    ? FIRST_WORDS[0]
                    : FIRST_WORDS.find(
                        (w) => w.category === catId || w.extraCategories?.includes(catId)
                      );
                if (firstFree) setActiveWord(firstFree);
              }}
              className={`rounded-2xl px-4 py-2.5 text-sm font-semibold border transition min-h-[44px] ${
                active
                  ? theme.tabSolidActiveClass
                  : `bg-white text-slate-700 hover:bg-slate-50 ${theme.cardBorderClass}`
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {mode === 'explore' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Grid of cards */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {allInCategory.map((item) => {
              const isSelected = activeWord?.id === item.id;
              const isPracticed = practicedWords.includes(item.word);

              return (
                <div key={item.id} className="relative">
                  <button
                    type="button"
                    onClick={() => handleSelectWord(item)}
                    className={`w-full rounded-3xl border p-4 text-center transition flex flex-col items-center gap-2.5 min-h-[168px] ${
                      isSelected
                        ? theme.selectedCardClass
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <IllustratedArt artKey={item.id} label={item.word} size={84} />
                    <div>
                      <div className="text-lg font-extrabold text-slate-900">{item.word}</div>
                      <div className="text-xs font-medium text-slate-500">{item.syllables}</div>
                    </div>
                  </button>

                  {onTogglePracticeWord ? (
                    <button
                      type="button"
                      onClick={() => {
                        playFeedbackTone('click', audioSettings.volume);
                        onTogglePracticeWord(item.word);
                      }}
                      aria-pressed={isPracticed}
                      aria-label={
                        isPracticed
                          ? `Desmarcar ${item.word} como praticada`
                          : `Marcar ${item.word} como praticada`
                      }
                      title={
                        isPracticed
                          ? 'Palavra praticada (toque para desmarcar)'
                          : 'Marcar como praticada'
                      }
                      className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition ${
                        isPracticed
                          ? 'text-emerald-600 bg-emerald-50/95 hover:bg-emerald-100'
                          : 'text-slate-300 hover:text-emerald-600 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                    </button>
                  ) : (
                    isPracticed && (
                      <CheckCircle2
                        className="w-5 h-5 text-emerald-600 absolute top-3 right-3 pointer-events-none"
                        aria-label="Palavra praticada"
                      />
                    )
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Word Detail & Practice Panel */}
          <div className={`lg:col-span-5 rounded-3xl border bg-white p-6 space-y-5 ${theme.cardBorderClass}`}>
            {activeWord ? (
              <>
                <div className="flex items-center gap-4">
                  <IllustratedArt artKey={activeWord.id} label={activeWord.word} size={100} />
                  <div>
                    <h2 className="text-3xl font-extrabold text-slate-900">{activeWord.word}</h2>
                    <p className={`text-base font-semibold mt-0.5 ${theme.accentTextClass}`}>
                      {activeWord.syllables}
                    </p>
                  </div>
                </div>

                <p className={`text-sm text-slate-700 rounded-2xl p-3.5 border ${theme.controlPillActiveClass}`}>
                  <strong>Dica amigável:</strong> {activeWord.tip}
                </p>

                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => speakPtBr(activeWord.word, audioSettings)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition min-h-[46px] ${theme.primaryBtnClass}`}
                  >
                    <Volume2 className="w-4 h-4" aria-hidden="true" />
                    <span>Ouvir novamente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      speakPtBr(`${activeWord.syllables.replace(/-/g, ', ')}. ${activeWord.word}!`, audioSettings, {
                        rateOverride: 0.72,
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition min-h-[46px]"
                  >
                    <Mic className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                    <span>Ouvir em sílabas</span>
                  </button>

                  {onTogglePracticeWord && (
                    <button
                      type="button"
                      onClick={() => {
                        playFeedbackTone('click', audioSettings.volume);
                        onTogglePracticeWord(activeWord.word);
                      }}
                      aria-pressed={practicedWords.includes(activeWord.word)}
                      className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition min-h-[46px] ${
                        practicedWords.includes(activeWord.word)
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          practicedWords.includes(activeWord.word) ? 'text-emerald-600' : 'text-slate-400'
                        }`}
                        aria-hidden="true"
                      />
                      <span>
                        {practicedWords.includes(activeWord.word)
                          ? 'Palavra praticada'
                          : 'Marcar como praticada'}
                      </span>
                    </button>
                  )}
                </div>

                <div className="pt-2 space-y-2">
                  <h3 className="text-sm font-bold text-slate-800">Hora de praticar:</h3>
                  <PracticeRecorder
                    targetText={activeWord.word}
                    audioSettings={audioSettings}
                    onSuccess={() => onPracticeWord(activeWord.word)}
                  />
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : (
        /* Image-word association activity */
        <div className={`rounded-3xl border bg-white p-6 md:p-8 space-y-6 max-w-3xl mx-auto ${theme.cardBorderClass}`}>
          {currentTarget && (
            <>
              <div className="text-center space-y-3">
                <p className="text-sm font-semibold text-emerald-700">
                  Atividade de Associação · Imagem e Palavra
                </p>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                  Toque na imagem que mostra: <span className={theme.accentTextClass}>{currentTarget.word}</span>
                </h2>
                <button
                  type="button"
                  onClick={() => speakPtBr(`Onde está ${currentTarget.word}?`, audioSettings)}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-2.5 text-sm font-bold transition min-h-[44px] ${theme.controlPillActiveClass}`}
                >
                  <Volume2 className="w-4 h-4" aria-hidden="true" />
                  <span>Ouvir pergunta</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {quizOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleQuizAnswer(opt)}
                    className="rounded-3xl border-2 border-slate-200 bg-slate-50/50 p-6 flex flex-col items-center gap-3 hover:border-slate-400 hover:bg-slate-50 active:scale-[0.98] transition"
                  >
                    <IllustratedArt artKey={opt.id} label={opt.word} size={110} />
                    <span className="text-lg font-bold text-slate-800">{opt.word}</span>
                  </button>
                ))}
              </div>

              {quizFeedback && (
                <div
                  role="status"
                  className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-center text-base font-semibold text-slate-900 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-5 h-5 text-amber-500 shrink-0" aria-hidden="true" />
                  <span>{quizFeedback}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
