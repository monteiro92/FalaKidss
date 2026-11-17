import React, { useState } from 'react';
import { Volume2, Turtle } from 'lucide-react';
import { DAILY_PHRASES, DailyPhraseItem } from '../data/curriculum';
import { AudioSettings } from '../types/app';
import { IllustratedArt } from '../components/IllustratedArt';
import { PracticeRecorder } from '../components/PracticeRecorder';
import { playFeedbackTone, speakPtBr } from '../utils/speech';

interface DailyPhrasesViewProps {
  audioSettings: AudioSettings;
  onPracticePhrase: (phrase: string) => void;
}

export const DailyPhrasesView: React.FC<DailyPhrasesViewProps> = ({
  audioSettings,
  onPracticePhrase,
}) => {
  const [selected, setSelected] = useState<DailyPhraseItem>(DAILY_PHRASES[0]);

  const handlePick = (item: DailyPhraseItem) => {
    setSelected(item);
    playFeedbackTone('click', audioSettings.volume);
    speakPtBr(item.phrase, audioSettings);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Frases do Dia a Dia</h1>
        <p className="text-sm md:text-base text-slate-600 mt-1">
          Toque nos cartões para ouvir e praticar expressões úteis de comunicação!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DAILY_PHRASES.map((item) => {
            const active = selected.id === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePick(item)}
                className={`rounded-3xl border p-4 text-left flex items-center gap-3.5 transition min-h-[96px] ${
                  active
                    ? 'bg-sky-50 border-sky-400 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-sky-300'
                }`}
              >
                <IllustratedArt artKey={item.iconKey} label={item.phrase} size={64} className="shrink-0" />
                <div>
                  <div className="text-base font-extrabold text-slate-900">{item.phrase}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{item.context}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex items-center gap-4">
            <IllustratedArt artKey={selected.iconKey} label={selected.phrase} size={96} className="shrink-0" />
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">{selected.phrase}</h2>
              <p className="text-sm text-slate-600 mt-1">{selected.context}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => speakPtBr(selected.phrase, audioSettings)}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 text-sm font-bold text-white hover:bg-sky-700 transition min-h-[46px]"
            >
              <Volume2 className="w-4 h-4" aria-hidden="true" />
              <span>Ouvir frase</span>
            </button>

            <button
              type="button"
              onClick={() => speakPtBr(selected.phrase, audioSettings, { rateOverride: 0.7 })}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition min-h-[46px]"
            >
              <Turtle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>Repetir devagar</span>
            </button>
          </div>

          <PracticeRecorder
            targetText={selected.phrase}
            audioSettings={audioSettings}
            onSuccess={() => onPracticePhrase(selected.phrase)}
          />
        </div>
      </div>
    </div>
  );
};
