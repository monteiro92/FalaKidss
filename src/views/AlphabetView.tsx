import React, { useMemo, useState } from 'react';
import { Volume2, Gamepad2, Sparkles, CheckCircle2 } from 'lucide-react';
import { ALPHABET_ITEMS, AlphabetItem } from '../data/curriculum';
import { AudioSettings } from '../types/app';
import { IllustratedArt } from '../components/IllustratedArt';
import { PracticeRecorder } from '../components/PracticeRecorder';
import { playFeedbackTone, speakPtBr } from '../utils/speech';

interface AlphabetViewProps {
  audioSettings: AudioSettings;
  exploredLetters: string[];
  onExploreLetter: (letter: string) => void;
}

export const AlphabetView: React.FC<AlphabetViewProps> = ({
  audioSettings,
  exploredLetters,
  onExploreLetter,
}) => {
  const [filter, setFilter] = useState<'vogais' | 'alfabeto' | 'jogo'>('vogais');
  const [selected, setSelected] = useState<AlphabetItem>(ALPHABET_ITEMS[0]);
  const [quizTargetIndex, setQuizTargetIndex] = useState(0);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const visibleItems = useMemo(() => {
    if (filter === 'vogais') return ALPHABET_ITEMS.filter((i) => i.isVowel);
    return ALPHABET_ITEMS;
  }, [filter]);

  const quizTarget = ALPHABET_ITEMS[quizTargetIndex % ALPHABET_ITEMS.length];

  const quizChoices = useMemo(() => {
    const others = ALPHABET_ITEMS.filter((x) => x.letter !== quizTarget.letter)
      .slice(quizTargetIndex % 5, (quizTargetIndex % 5) + 3);
    return [quizTarget, ...others].sort((a, b) => a.letter.localeCompare(b.letter));
  }, [quizTarget, quizTargetIndex]);

  const handleSelectLetter = (item: AlphabetItem) => {
    setSelected(item);
    playFeedbackTone('click', audioSettings.volume);
    speakPtBr(item.phrase, audioSettings);
    onExploreLetter(item.letter);
  };

  const handleAnswerQuiz = (chosen: AlphabetItem) => {
    if (chosen.letter === quizTarget.letter) {
      playFeedbackTone('success', audioSettings.volume);
      setQuizFeedback(`Acertou! ${quizTarget.phrase}!`);
      speakPtBr(`Muito bem! ${quizTarget.phrase}!`, audioSettings);
      onExploreLetter(quizTarget.letter);
      window.setTimeout(() => {
        setQuizFeedback(null);
        setQuizTargetIndex((prev) => (prev + 3) % ALPHABET_ITEMS.length);
      }, 1300);
    } else {
      playFeedbackTone('tryAgain', audioSettings.volume);
      setQuizFeedback(`Essa é a letra ${chosen.letter} (${chosen.exampleWord}). Vamos tentar novamente!`);
      speakPtBr(`Essa é a letra ${chosen.letter}. Procure a letra de ${quizTarget.exampleWord}!`, audioSettings);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Vogais e Alfabeto</h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            Descubra os sons das letras e associe cada letra à sua figura!
          </p>
        </div>

        <div className="inline-flex rounded-2xl bg-slate-100 p-1 self-start">
          <button
            type="button"
            onClick={() => setFilter('vogais')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition min-h-[44px] ${
              filter === 'vogais' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Vogais (A E I O U)
          </button>
          <button
            type="button"
            onClick={() => setFilter('alfabeto')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition min-h-[44px] ${
              filter === 'alfabeto' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Alfabeto (A–Z)
          </button>
          <button
            type="button"
            onClick={() => {
              setFilter('jogo');
              setQuizFeedback(null);
              speakPtBr(`Onde está a letra ${quizTarget.letter} de ${quizTarget.exampleWord}?`, audioSettings);
            }}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition min-h-[44px] ${
              filter === 'jogo' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            <Gamepad2 className="w-4 h-4" aria-hidden="true" />
            <span>Reconhecer</span>
          </button>
        </div>
      </div>

      {filter !== 'jogo' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7">
            <div
              className={`grid gap-3 ${
                filter === 'vogais'
                  ? 'grid-cols-2 sm:grid-cols-5'
                  : 'grid-cols-4 sm:grid-cols-6 md:grid-cols-7'
              }`}
            >
              {visibleItems.map((item) => {
                const isActive = selected.letter === item.letter;
                const explored = exploredLetters.includes(item.letter);
                return (
                  <button
                    key={item.letter}
                    type="button"
                    onClick={() => handleSelectLetter(item)}
                    className={`relative rounded-2xl border p-3.5 flex flex-col items-center justify-center gap-1 transition min-h-[82px] ${
                      isActive
                        ? 'bg-sky-600 border-sky-700 text-white shadow-sm'
                        : item.isVowel
                        ? 'bg-amber-50/70 border-amber-200 text-slate-900 hover:border-amber-400'
                        : 'bg-white border-slate-200 text-slate-900 hover:border-sky-300'
                    }`}
                  >
                    {explored && !isActive && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 absolute top-2 right-2" aria-hidden="true" />
                    )}
                    <span className="text-2xl md:text-3xl font-extrabold font-display">{item.letter}</span>
                    <span className={`text-[11px] font-semibold truncate max-w-full ${isActive ? 'text-sky-100' : 'text-slate-500'}`}>
                      {item.exampleWord}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div
                className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl font-extrabold text-white shrink-0 font-display"
                style={{ backgroundColor: selected.color }}
              >
                {selected.letter}
              </div>
              <IllustratedArt artKey={selected.iconKey} label={selected.exampleWord} size={88} />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">{selected.phrase}</h2>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                {selected.phoneticHint}
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => speakPtBr(selected.phrase, audioSettings)}
                className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white hover:bg-sky-700 transition min-h-[46px]"
              >
                <Volume2 className="w-4 h-4" aria-hidden="true" />
                <span>Ouvir som e palavra</span>
              </button>

              <button
                type="button"
                onClick={() => speakPtBr(`${selected.letter}! ${selected.letter}!`, audioSettings, { rateOverride: 0.72 })}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition min-h-[46px]"
              >
                <span>Repetir devagar</span>
              </button>
            </div>

            <PracticeRecorder
              targetText={selected.phrase}
              audioSettings={audioSettings}
              onSuccess={() => onExploreLetter(selected.letter)}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 max-w-3xl mx-auto space-y-6">
          <div className="flex flex-col items-center text-center gap-3">
            <IllustratedArt artKey={quizTarget.iconKey} label={quizTarget.exampleWord} size={112} />
            <h2 className="text-2xl font-extrabold text-slate-900">
              Qual letra começa a palavra <span className="text-sky-600">{quizTarget.exampleWord}</span>?
            </h2>
            <button
              type="button"
              onClick={() => speakPtBr(`Qual letra começa a palavra ${quizTarget.exampleWord}?`, audioSettings)}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-100 px-4 py-2.5 text-sm font-bold text-sky-900 hover:bg-sky-200 transition min-h-[44px]"
            >
              <Volume2 className="w-4 h-4" aria-hidden="true" />
              <span>Ouvir novamente</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {quizChoices.map((choice) => (
              <button
                key={choice.letter}
                type="button"
                onClick={() => handleAnswerQuiz(choice)}
                className="rounded-3xl border-2 border-slate-200 bg-slate-50 py-6 text-4xl font-extrabold font-display text-slate-900 hover:border-sky-400 hover:bg-sky-50 active:scale-[0.97] transition"
              >
                {choice.letter}
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
        </div>
      )}
    </div>
  );
};
