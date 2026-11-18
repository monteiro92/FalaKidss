import React from 'react';
import {
  Play,
  BookOpen,
  Gamepad2,
  BookMarked,
  ShieldCheck,
  Star,
  Volume2,
} from 'lucide-react';
import { AppSection, AudioSettings, ChildProfile, ProgressState, ThemeId } from '../types/app';
import { ContentCatalogResponse } from '../types/premium';
import { getAgeRecommendations } from '../data/curriculum';
import { APP_THEMES } from '../data/themes';
import { ThemePicker } from '../components/ThemePicker';
import { playFeedbackTone, speakPtBr } from '../utils/speech';

interface HomeViewProps {
  themeId: ThemeId;
  profile: ChildProfile;
  progress: ProgressState;
  audioSettings: AudioSettings;
  catalogCounts?: ContentCatalogResponse['counts'];
  onNavigate: (section: AppSection) => void;
  onSelectTheme: (id: ThemeId) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  themeId,
  profile,
  progress,
  audioSettings,
  catalogCounts,
  onNavigate,
  onSelectTheme,
}) => {
  const recs = getAgeRecommendations(profile.ageGroup);
  const theme = APP_THEMES[themeId];
  const gameCounts = catalogCounts?.byCategory.game ?? { total: 12, free: 10, premium: 2 };
  const storyCounts = catalogCounts?.byCategory.story ?? { total: 5, free: 3, premium: 2 };
  const activityCounts = catalogCounts?.byCategory.activity ?? { total: 4, free: 0, premium: 4 };

  const handleNav = (section: AppSection) => {
    playFeedbackTone('click', audioSettings.volume);
    onNavigate(section);
  };

  return (
    <div className="space-y-8">
      {/* Hero section with mascot Tuca and active theme */}
      <section className={`relative overflow-hidden rounded-3xl border p-6 md:p-10 shadow-sm ${theme.heroFrameClass}`}>
        {theme.backgroundImage && (
          <>
            <img
              src={theme.backgroundImage}
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 w-full h-full ${theme.imageCropClass}`}
            />
            <div className={`absolute inset-0 ${theme.heroScrimClass}`} />
          </>
        )}

        <div className="relative z-10 max-w-3xl space-y-5">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
              Olá! Vamos aprender brincando?
            </h1>

            <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl">
              “Cada criança tem seu tempo. Cada palavra é uma conquista. Vamos aprender brincando!”
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleNav(recs.suggestedSections[0].section)}
                className={`inline-flex items-center gap-2.5 rounded-2xl px-6 py-4 text-base font-bold shadow-sm active:scale-[0.98] transition min-h-[54px] ${theme.primaryBtnClass}`}
              >
                <Play className="w-5 h-5 fill-current" aria-hidden="true" />
                <span>COMEÇAR</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  speakPtBr(
                    `Olá ${profile.name}! Vamos aprender brincando? Cada criança tem seu tempo. Cada palavra é uma conquista!`,
                    audioSettings
                  )
                }
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition min-h-[54px]"
              >
                <Volume2 className="w-5 h-5 text-sky-600" aria-hidden="true" />
                <span>Ouvir o Tuca</span>
              </button>
            </div>
        </div>
      </section>

      {/* Main 4 action buttons requested on home screen (COMEÇAR is hero primary CTA above) */}
      <section aria-label="Menu principal" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => handleNav('activities')}
          className="group rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 text-left hover:bg-emerald-100/70 transition min-h-[132px] flex flex-col justify-between"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
            <BookOpen className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="mt-4">
            <h2 className="text-lg font-extrabold text-slate-900">MINHAS ATIVIDADES</h2>
            <p className="text-sm text-slate-600 mt-1">
              Trilhas gratuitas e {activityCounts.premium} exclusivas Premium
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleNav('games')}
          className="group rounded-3xl border border-amber-200 bg-amber-50/70 p-6 text-left hover:bg-amber-100/70 transition min-h-[132px] flex flex-col justify-between"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center">
            <Gamepad2 className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="mt-4">
            <h2 className="text-lg font-extrabold text-slate-900">JOGOS EDUCATIVOS</h2>
            <p className="text-sm text-slate-600 mt-1">
              {gameCounts.premium > 0
                ? `${gameCounts.free} gratuitos + ${gameCounts.premium} exclusivos Premium`
                : `${gameCounts.free} jogos divertidos com estrelinhas`}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleNav('stories')}
          className="group rounded-3xl border border-violet-200 bg-violet-50/70 p-6 text-left hover:bg-violet-100/70 transition min-h-[132px] flex flex-col justify-between"
        >
          <div className="w-12 h-12 rounded-2xl bg-violet-600 text-white flex items-center justify-center">
            <BookMarked className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="mt-4">
            <h2 className="text-lg font-extrabold text-slate-900">HISTÓRIAS</h2>
            <p className="text-sm text-slate-600 mt-1">
              {storyCounts.premium > 0
                ? `${storyCounts.free} gratuitas + ${storyCounts.premium} exclusivas Premium`
                : `${storyCounts.free} contos narrados e sincronizados`}
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleNav('parents')}
          className="group rounded-3xl border border-slate-200 bg-white p-6 text-left hover:bg-slate-50 transition min-h-[132px] flex flex-col justify-between"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" aria-hidden="true" />
          </div>
          <div className="mt-4">
            <h2 className="text-lg font-extrabold text-slate-900">ÁREA DOS PAIS</h2>
            <p className="text-sm text-slate-600 mt-1">Perfil, conquistas, áudio e privacidade</p>
          </div>
        </button>
      </section>

      {/* Daily achievement */}
      <section>
        <div className="rounded-3xl border border-amber-200 bg-white p-6 flex flex-col justify-between gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Conquista de hoje</h2>
              <p className="text-sm text-slate-600 mt-1">
                Você já juntou estrelinhas aprendendo no seu ritmo!
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <Star className="w-6 h-6 fill-amber-400 text-amber-500" aria-hidden="true" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="rounded-2xl bg-slate-50 p-3 text-center">
              <div className="text-2xl font-extrabold text-amber-600 tabular-nums">
                {progress.todayStars}
              </div>
              <div className="text-xs font-medium text-slate-600 mt-0.5">Hoje</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3 text-center">
              <div className="text-2xl font-extrabold text-sky-700 tabular-nums">
                {progress.practicedWords.length}
              </div>
              <div className="text-xs font-medium text-slate-600 mt-0.5">Palavras</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3 text-center">
              <div className="text-2xl font-extrabold text-emerald-700 tabular-nums">
                {progress.participationDays.length}
              </div>
              <div className="text-xs font-medium text-slate-600 mt-0.5">Dias ativos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Theme Picker */}
      <ThemePicker
        activeThemeId={themeId}
        audioSettings={audioSettings}
        onSelectTheme={onSelectTheme}
      />
    </div>
  );
};
