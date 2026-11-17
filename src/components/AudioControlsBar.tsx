import React, { useEffect, useState } from 'react';
import { Captions, Gauge, Volume2 } from 'lucide-react';
import { APP_THEMES, AppTheme } from '../data/themes';
import { AudioSettings } from '../types/app';
import { subscribeSubtitles } from '../utils/speech';

interface AudioControlsBarProps {
  settings: AudioSettings;
  theme?: AppTheme;
  onChange: (next: AudioSettings) => void;
}

export const AudioControlsBar: React.FC<AudioControlsBarProps> = ({
  settings,
  theme = APP_THEMES['sol-dourado'],
  onChange,
}) => {
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);

  useEffect(() => {
    return subscribeSubtitles(setActiveSubtitle);
  }, []);

  return (
    <>
      {activeSubtitle && settings.subtitlesEnabled && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[calc(100%-2rem)] rounded-2xl bg-slate-900/95 px-5 py-3 text-center text-base font-semibold text-white shadow-xl border border-slate-700"
        >
          {activeSubtitle}
        </div>
      )}

      <div
        className={`flex flex-wrap items-center gap-3 rounded-2xl border bg-white px-4 py-2.5 text-xs font-medium text-slate-700 shadow-xs ${theme.cardBorderClass}`}
      >
        <div className="flex items-center gap-2">
          <Gauge className={`w-4 h-4 ${theme.iconPrimaryClass}`} aria-hidden="true" />
          <span className="text-slate-600">Velocidade:</span>
          <div className="inline-flex rounded-xl bg-slate-100 p-0.5">
            {[
              { label: 'Devagar', rate: 0.7 },
              { label: 'Normal', rate: 1.0 },
              { label: 'Rápido', rate: 1.2 },
            ].map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => onChange({ ...settings, rate: opt.rate })}
                className={`px-2.5 py-1 rounded-lg transition whitespace-nowrap min-h-[32px] ${
                  Math.abs(settings.rate - opt.rate) < 0.05
                    ? theme.controlSubActiveClass
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Volume2 className={`w-4 h-4 ${theme.iconPrimaryClass}`} aria-hidden="true" />
          <label htmlFor="audio-volume-slider" className="text-slate-600">
            Volume:
          </label>
          <input
            id="audio-volume-slider"
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={settings.volume}
            onChange={(e) => onChange({ ...settings, volume: parseFloat(e.target.value) })}
            className={`w-20 cursor-pointer ${theme.sliderAccentClass}`}
          />
          <span className="tabular-nums w-8 text-slate-700">{Math.round(settings.volume * 100)}%</span>
        </div>

        <button
          type="button"
          onClick={() => onChange({ ...settings, subtitlesEnabled: !settings.subtitlesEnabled })}
          aria-pressed={settings.subtitlesEnabled}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 border transition min-h-[34px] ${
            settings.subtitlesEnabled
              ? theme.controlPillActiveClass
              : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}
        >
          <Captions className="w-4 h-4" aria-hidden="true" />
          <span>Legendas: {settings.subtitlesEnabled ? 'Ativas' : 'Ocultas'}</span>
        </button>
      </div>
    </>
  );
};
