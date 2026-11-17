import React from 'react';
import { Check, Palette } from 'lucide-react';
import { APP_THEMES, THEME_LIST } from '../data/themes';
import { AudioSettings, ThemeId } from '../types/app';
import { playFeedbackTone } from '../utils/speech';

interface ThemePickerProps {
  activeThemeId: ThemeId;
  audioSettings: AudioSettings;
  onSelectTheme: (id: ThemeId) => void;
}

export const ThemePicker: React.FC<ThemePickerProps> = ({
  activeThemeId,
  audioSettings,
  onSelectTheme,
}) => {
  const activeTheme = APP_THEMES[activeThemeId] || APP_THEMES['sol-dourado'];

  return (
    <section className={`rounded-3xl border bg-white p-6 space-y-4 ${activeTheme.cardBorderClass}`}>
      <div className="flex items-center gap-2.5">
        <Palette className={`w-5 h-5 ${activeTheme.iconPrimaryClass}`} aria-hidden="true" />
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Tema do Aplicativo</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Escolha o tema visual para todas as telas e atividades.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {THEME_LIST.map((theme) => {
          const isSelected = theme.id === activeThemeId;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => {
                playFeedbackTone('click', audioSettings.volume);
                onSelectTheme(theme.id);
              }}
              aria-pressed={isSelected}
              className={`rounded-2xl border p-3.5 text-left transition flex items-center gap-3 min-h-[76px] ${
                isSelected
                  ? theme.selectedCardClass
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              {/* Visual theme swatch / artwork thumbnail */}
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 relative">
                <img
                  src={theme.backgroundImage}
                  alt={`Prévia do tema ${theme.name}`}
                  className={`w-full h-full ${theme.imageCropClass}`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-extrabold text-slate-900 truncate">
                    {theme.name}
                  </span>
                  {isSelected && (
                    <span className={`inline-flex items-center gap-1 text-xs font-bold shrink-0 ${theme.accentTextClass}`}>
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Ativo</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 truncate mt-0.5">{theme.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
