import React, { useCallback, useEffect, useState } from 'react';
import {
  Home,
  BookOpen,
  Gamepad2,
  BookMarked,
  ShieldCheck,
  ArrowLeft,
  Star,
  Menu,
} from 'lucide-react';
import { AppPersistedState, AppSection, GameProgressEntry, ThemeId } from './types/app';
import { APP_THEMES } from './data/themes';
import {
  clearAllUserData,
  getTodayISO,
  loadPersistedState,
  savePersistedState,
} from './utils/storage';
import { usePWAInstall } from './hooks/usePWAInstall';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { StarCelebration } from './components/StarCelebration';
import { MenuDrawer } from './components/MenuDrawer';
import { HomeView } from './views/HomeView';
import { ActivitiesHubView } from './views/ActivitiesHubView';
import { FirstWordsView } from './views/FirstWordsView';
import { AlphabetView } from './views/AlphabetView';
import { PronunciationView } from './views/PronunciationView';
import { OralMotor3DView } from './views/OralMotor3DView';
import { AnimalSoundsView } from './views/AnimalSoundsView';
import { DailyPhrasesView } from './views/DailyPhrasesView';
import { GamesHubView } from './views/GamesHubView';
import { StoriesView } from './views/StoriesView';
import { CustomPhotosView } from './views/CustomPhotosView';
import { ParentsAreaView } from './views/ParentsAreaView';
import { AdminPortal } from './views/admin/AdminPortal';
import { AdminAppConfig } from './types/admin';
import {
  loadAdminAppConfig,
  syncCurrentUserWithServer,
} from './utils/adminStore';
import {
  CatalogItemDTO,
  ContentCatalogResponse,
  PremiumExclusiveContentPayload,
  PremiumStatusResponse,
} from './types/premium';
import {
  fetchContentCatalog,
  fetchPremiumExclusiveContent,
  fetchPremiumStatus,
} from './utils/premiumStore';
import { buildFallbackCatalogItems } from './data/contentCatalogDefaults';
import { playFeedbackTone, stopAnimalAudio, stopSpeaking } from './utils/speech';
import tucaAppIcon from './assets/images/tuca_app_icon.png';
import { Crown, Lock } from 'lucide-react';

function isAdminPath(path: string): boolean {
  const clean = path.toLowerCase();
  return clean === '/admin' || clean.startsWith('/admin/');
}

export default function App() {
  const [pathname, setPathname] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );
  const [adminConfig, setAdminConfig] = useState<AdminAppConfig>(() => loadAdminAppConfig());
  const [state, setState] = useState<AppPersistedState>(() => loadPersistedState());
  const [isUserBlocked, setIsUserBlocked] = useState(false);
  const [section, setSection] = useState<AppSection>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [celebrationMsg, setCelebrationMsg] = useState<string | null>(null);
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatusResponse | null>(null);
  const [loadingPremium, setLoadingPremium] = useState(false);
  const [premiumContent, setPremiumContent] = useState<PremiumExclusiveContentPayload | null>(null);
  const [contentCatalog, setContentCatalog] = useState<ContentCatalogResponse | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const { isInstallable, isIOS, isInstalled } = usePWAInstall();

  const showInstallBtn = !isInstalled && (isInstallable || isIOS);

  // Persist changes automatically
  useEffect(() => {
    savePersistedState(state);
  }, [state]);

  // Keep pathname synchronized with browser navigation (/admin vs user app)
  useEffect(() => {
    const handlePopState = () => {
      stopSpeaking();
      stopAnimalAudio();
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const syncPathname = useCallback((nextPath: string) => {
    if (typeof window !== 'undefined' && window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    setPathname(nextPath);
  }, []);

  // Server-authoritative user account sync (enforces admin block/unblock)
  useEffect(() => {
    if (isAdminPath(pathname)) return;

    const runSync = () => {
      syncCurrentUserWithServer({
        childAccountId: state.profile.childAccountId,
        childName: state.profile.name,
        childAge: state.profile.age,
        starsCount: state.progress.starsTotal,
        activitiesCount: state.progress.activitiesCompleted,
      })
        .then((syncRes) => {
          setIsUserBlocked(Boolean(syncRes.blocked));
        })
        .catch(() => {});
    };

    runSync();
    const onFocus = () => runSync();
    const interval = window.setInterval(runSync, 30000);
    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.clearInterval(interval);
    };
  }, [
    pathname,
    state.profile.childAccountId,
    state.profile.name,
    state.profile.age,
    state.progress.starsTotal,
    state.progress.activitiesCompleted,
  ]);

  const refreshContentCatalog = useCallback(async () => {
    if (isAdminPath(pathname)) return;
    setLoadingCatalog(true);
    try {
      const catalog = await fetchContentCatalog(state.profile.childAccountId);
      setContentCatalog(catalog);
    } catch {
      // Keep fallback or previous catalog on transient failure
    } finally {
      setLoadingCatalog(false);
    }
  }, [pathname, state.profile.childAccountId]);

  const refreshPremiumState = useCallback(
    async (sync = false) => {
      if (isAdminPath(pathname)) return;
      setLoadingPremium(true);
      try {
        const [nextStatus, nextCatalog] = await Promise.all([
          fetchPremiumStatus({
            sync,
            childAccountId: state.profile.childAccountId,
          }),
          fetchContentCatalog(state.profile.childAccountId).catch(() => null),
        ]);
        setPremiumStatus(nextStatus);
        if (nextCatalog) {
          setContentCatalog(nextCatalog);
        }
      } catch {
        // Keep previous state on transient network failure
      } finally {
        setLoadingPremium(false);
        setLoadingCatalog(false);
      }
    },
    [pathname, state.profile.childAccountId]
  );

  // Keep Premium subscription status & content catalog synchronized with server
  useEffect(() => {
    if (isAdminPath(pathname)) return;
    refreshPremiumState(false);
    const onFocus = () => refreshPremiumState(true);
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [pathname, refreshPremiumState]);

  // Fetch or clear exclusive Premium content strictly based on server-verified access
  const hasPremiumAccess = Boolean(premiumStatus?.hasPremiumAccess) && !isUserBlocked;

  useEffect(() => {
    if (isAdminPath(pathname)) return;
    if (!hasPremiumAccess) {
      setPremiumContent(null);
      return;
    }
    let cancelled = false;
    fetchPremiumExclusiveContent()
      .then((content) => {
        if (!cancelled) setPremiumContent(content);
      })
      .catch(() => {
        if (!cancelled) setPremiumContent(null);
      });
    return () => {
      cancelled = true;
    };
  }, [pathname, hasPremiumAccess]);

  const catalogItems: CatalogItemDTO[] =
    contentCatalog?.items && contentCatalog.items.length > 0
      ? contentCatalog.items
      : buildFallbackCatalogItems(hasPremiumAccess, isUserBlocked);

  const isSectionModuleLocked = useCallback(
    (sec: AppSection): boolean => {
      const modItem = catalogItems.find((it) => it.category === 'module' && it.id === sec);
      if (!modItem) return false;
      return !modItem.unlocked;
    },
    [catalogItems]
  );

  // Track real active usage minutes (user app only)
  useEffect(() => {
    if (isAdminPath(pathname)) return;
    const interval = window.setInterval(() => {
      setState((prev) => ({
        ...prev,
        progress: {
          ...prev.progress,
          totalMinutesUsed: prev.progress.totalMinutesUsed + 1,
        },
      }));
    }, 60000);
    return () => window.clearInterval(interval);
  }, [pathname]);

  const triggerCelebration = useCallback((msg: string) => {
    setCelebrationMsg(msg);
    window.setTimeout(() => {
      setCelebrationMsg((curr) => (curr === msg ? null : curr));
    }, 2600);
  }, []);

  const navigate = (next: AppSection) => {
    stopSpeaking();
    stopAnimalAudio();
    setSection(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const recordAchievement = useCallback(
    (
      module: string,
      title: string,
      opts?: {
        word?: string;
        letter?: string;
        game?: boolean;
        storyId?: string;
        oral?: boolean;
        pronunciationId?: string;
        animalId?: string;
        phraseId?: string;
        phraseCategories?: string[];
      }
    ) => {
      const today = getTodayISO();
      setState((prev) => {
        const practicedWords =
          opts?.word && !prev.progress.practicedWords.includes(opts.word)
            ? [...prev.progress.practicedWords, opts.word]
            : prev.progress.practicedWords;

        const exploredLetters =
          opts?.letter && !prev.progress.exploredLetters.includes(opts.letter)
            ? [...prev.progress.exploredLetters, opts.letter]
            : prev.progress.exploredLetters;

        const storiesRead =
          opts?.storyId && !prev.progress.storiesRead.includes(opts.storyId)
            ? [...prev.progress.storiesRead, opts.storyId]
            : prev.progress.storiesRead;

        const practicedPronunciationIds =
          opts?.pronunciationId &&
          !prev.progress.practicedPronunciationIds.includes(opts.pronunciationId)
            ? [...prev.progress.practicedPronunciationIds, opts.pronunciationId]
            : prev.progress.practicedPronunciationIds;

        const practicedAnimals =
          opts?.animalId && !prev.progress.practicedAnimals.includes(opts.animalId)
            ? [...prev.progress.practicedAnimals, opts.animalId]
            : prev.progress.practicedAnimals;

        const practicedPhraseIds =
          opts?.phraseId && !prev.progress.practicedPhraseIds.includes(opts.phraseId)
            ? [...prev.progress.practicedPhraseIds, opts.phraseId]
            : prev.progress.practicedPhraseIds;

        let exploredPhraseCategories = prev.progress.exploredPhraseCategories;
        if (opts?.phraseCategories && opts.phraseCategories.length > 0) {
          const merged = new Set(exploredPhraseCategories);
          opts.phraseCategories.forEach((c) => merged.add(c));
          exploredPhraseCategories = Array.from(merged);
        }

        const participationDays = prev.progress.participationDays.includes(today)
          ? prev.progress.participationDays
          : [...prev.progress.participationDays, today];

        const entry = {
          id: `act-${Date.now()}`,
          module,
          title,
          timestamp: new Date().toISOString(),
          starsEarned: 1,
        };

        return {
          ...prev,
          progress: {
            ...prev.progress,
            starsTotal: prev.progress.starsTotal + 1,
            todayStars: prev.progress.todayStars + 1,
            lastActiveDate: today,
            participationDays,
            activitiesCompleted: prev.progress.activitiesCompleted + 1,
            practicedWords,
            exploredLetters,
            gamesCompleted: opts?.game ? prev.progress.gamesCompleted + 1 : prev.progress.gamesCompleted,
            storiesRead,
            oralExercisesDone: opts?.oral ? prev.progress.oralExercisesDone + 1 : prev.progress.oralExercisesDone,
            practicedPronunciationIds,
            practicedAnimals,
            practicedPhraseIds,
            exploredPhraseCategories,
            history: [entry, ...prev.progress.history].slice(0, 40),
          },
        };
      });
      triggerCelebration(`+1 estrela · ${title}`);
    },
    [triggerCelebration]
  );

  const togglePracticedWord = useCallback(
    (word: string) => {
      if (state.progress.practicedWords.includes(word)) {
        setState((prev) => ({
          ...prev,
          progress: {
            ...prev.progress,
            practicedWords: prev.progress.practicedWords.filter((w) => w !== word),
          },
        }));
      } else {
        recordAchievement('Primeiras Palavras', word, { word });
      }
    },
    [state.progress.practicedWords, recordAchievement]
  );

  const togglePracticedPhrase = useCallback(
    (item: { id: string; phrase: string; categories: string[] }) => {
      if (state.progress.practicedPhraseIds.includes(item.id)) {
        setState((prev) => ({
          ...prev,
          progress: {
            ...prev.progress,
            practicedPhraseIds: prev.progress.practicedPhraseIds.filter((id) => id !== item.id),
          },
        }));
      } else {
        recordAchievement('Frases do Dia a Dia', item.phrase, {
          phraseId: item.id,
          phraseCategories: item.categories,
        });
      }
    },
    [state.progress.practicedPhraseIds, recordAchievement]
  );

  const toggleFavoritePhrase = useCallback((phraseId: string) => {
    setState((prev) => {
      const exists = prev.progress.favoritePhraseIds.includes(phraseId);
      return {
        ...prev,
        progress: {
          ...prev.progress,
          favoritePhraseIds: exists
            ? prev.progress.favoritePhraseIds.filter((id) => id !== phraseId)
            : [...prev.progress.favoritePhraseIds, phraseId],
        },
      };
    });
  }, []);

  const markExploredPhraseCategory = useCallback((category: string) => {
    if (!category || category === 'Todos' || category === 'Favoritas') return;
    setState((prev) => {
      if (prev.progress.exploredPhraseCategories.includes(category)) return prev;
      return {
        ...prev,
        progress: {
          ...prev.progress,
          exploredPhraseCategories: [...prev.progress.exploredPhraseCategories, category],
        },
      };
    });
  }, []);

  const updateGameProgress = useCallback((gameId: string, entry: GameProgressEntry) => {
    setState((prev) => ({
      ...prev,
      progress: {
        ...prev.progress,
        gamesProgress: {
          ...prev.progress.gamesProgress,
          [gameId]: entry,
        },
      },
    }));
  }, []);

  const handleDeleteAll = async () => {
    const fresh = await clearAllUserData();
    setState(fresh);
    setSection('home');
    triggerCelebration('Todos os dados foram excluídos com segurança.');
  };

  const activeTheme = APP_THEMES[state.themeId] || APP_THEMES['sol-dourado'];

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', activeTheme.themeColorHex);
    }
  }, [activeTheme.themeColorHex]);

  const handleSelectTheme = (nextTheme: ThemeId) => {
    setState((prev) => ({ ...prev, themeId: nextTheme }));
  };

  const navItems: { id: AppSection; label: string; Icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Início', Icon: Home },
    { id: 'activities', label: 'Atividades', Icon: BookOpen },
    { id: 'games', label: 'Jogos', Icon: Gamepad2 },
    { id: 'stories', label: 'Histórias', Icon: BookMarked },
    { id: 'parents', label: 'Pais', Icon: ShieldCheck },
  ];

  // Isolated Admin Area (/admin) — completely separated from regular user UI
  if (isAdminPath(pathname)) {
    return (
      <AdminPortal
        currentPathname={pathname}
        onSyncPathname={syncPathname}
        onConfigUpdated={(cfg) => setAdminConfig(cfg)}
        onExitToApp={() => {
          setAdminConfig(loadAdminAppConfig());
          syncPathname('/');
          setSection('home');
        }}
      />
    );
  }

  // Blocked user gate enforced by administrator (never blocks /admin)
  if (isUserBlocked) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl border border-rose-200 bg-white p-8 text-center shadow-sm space-y-3">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xs mx-auto bg-amber-400">
            <img
              src={tucaAppIcon}
              alt="FalaKids"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            FalaKids
          </h1>
          <p className="text-sm font-semibold text-rose-800 bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3">
            Acesso temporariamente bloqueado pelo administrador. Entre em contato com o suporte para desbloquear sua conta.
          </p>
        </div>
      </div>
    );
  }

  // Maintenance gate when enabled by admin (never blocks /admin)
  if (adminConfig.maintenanceMode) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm space-y-3">
          <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xs mx-auto bg-amber-400">
            <img
              src={tucaAppIcon}
              alt="FalaKids"
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            FalaKids
          </h1>
          <p className="text-sm font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            {adminConfig.maintenanceMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col text-slate-900 pb-8 relative ${activeTheme.pageBgClass}`}>
      {activeTheme.backgroundImage && (
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-25">
          <img
            src={activeTheme.backgroundImage}
            alt=""
            aria-hidden="true"
            className={`w-full h-full ${activeTheme.imageCropClass}`}
          />
        </div>
      )}

      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className={`sticky top-0 z-30 h-[54px] md:h-[68px] backdrop-blur-md border-b ${activeTheme.headerClass}`}>
        <div className="max-w-7xl mx-auto h-full px-3 sm:px-4 md:px-6 flex items-center justify-between gap-3 md:gap-8">
          {/* Zone 1: Hamburger trigger + Single-line brand wordmark */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 shrink-0">
            <button
              type="button"
              onClick={() => {
                playFeedbackTone('click', state.audio.volume);
                setMenuOpen(true);
              }}
              aria-label="Abrir menu"
              aria-expanded={menuOpen}
              className={`w-10 h-10 rounded-xl border bg-white/90 text-slate-700 hover:bg-white flex items-center justify-center transition shrink-0 focus-visible:outline-2 focus-visible:outline-sky-600 ${activeTheme.cardBorderClass}`}
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => navigate('home')}
              className={`inline-flex items-center gap-2 sm:gap-2.5 text-base sm:text-lg md:text-xl font-extrabold font-display tracking-tight whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-sky-600 rounded-xl ${activeTheme.brandTextClass}`}
            >
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden shadow-xs shrink-0 inline-flex items-center justify-center bg-amber-400">
                <img
                  src={tucaAppIcon}
                  alt=""
                  aria-hidden="true"
                  className="w-full h-full object-cover"
                />
              </span>
              <span>FalaKids</span>
            </button>
          </div>

          {/* Zone 2: 5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600" aria-label="Navegação principal">
            {navItems.map((item) => {
              const active =
                section === item.id ||
                (item.id === 'activities' &&
                  ['first-words', 'alphabet', 'pronunciation', 'oral-motor', 'animal-sounds', 'daily-phrases', 'camera'].includes(
                    section
                  ));
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.id)}
                  className={`py-1.5 border-b-2 transition whitespace-nowrap shrink-0 ${
                    active
                      ? activeTheme.navActiveClass
                      : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {item.label === 'Pais' ? 'Área dos Pais' : item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            {showInstallBtn ? (
              <PWAInstallButton />
            ) : (
              <button
                type="button"
                onClick={() => {
                  playFeedbackTone('click', state.audio.volume);
                  navigate(section === 'home' ? 'activities' : 'home');
                }}
                className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-sm font-bold transition whitespace-nowrap shrink-0 min-h-[40px] ${activeTheme.primaryBtnClass}`}
              >
                <Star className="w-4 h-4 fill-current" aria-hidden="true" />
                <span className="tabular-nums">{state.progress.starsTotal}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        {adminConfig.announcementEnabled && adminConfig.announcementText.trim() && (
          <div className="rounded-2xl border border-sky-200 bg-sky-50/95 px-4 py-2.5 text-center text-xs sm:text-sm font-semibold text-sky-950 shadow-xs">
            {adminConfig.announcementText}
          </div>
        )}

        {section !== 'home' && (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                if (
                  ['first-words', 'alphabet', 'pronunciation', 'oral-motor', 'animal-sounds', 'daily-phrases', 'camera'].includes(
                    section
                  )
                ) {
                  navigate('activities');
                } else {
                  navigate('home');
                }
              }}
              className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold self-start min-h-[44px] transition ${activeTheme.backBtnClass}`}
            >
              <ArrowLeft className="w-4 h-4" aria-hidden="true" />
              <span>Voltar</span>
            </button>
          </div>
        )}

        {section === 'home' && (
          <HomeView
            themeId={state.themeId}
            profile={state.profile}
            progress={state.progress}
            audioSettings={state.audio}
            catalogCounts={contentCatalog?.counts}
            onNavigate={navigate}
            onSelectTheme={handleSelectTheme}
          />
        )}

        {section === 'activities' && (
          <ActivitiesHubView
            profile={state.profile}
            themeId={state.themeId}
            audioSettings={state.audio}
            enabledModules={adminConfig.enabledModules}
            hasPremiumAccess={hasPremiumAccess}
            loadingCatalog={loadingCatalog}
            catalogItems={catalogItems}
            exclusiveActivities={
              premiumContent?.exclusiveActivities ||
              (contentCatalog ? Object.values(contentCatalog.unlockedPayloads.activities) : undefined)
            }
            onGoToPremium={() => navigate('parents')}
            onPracticeExclusiveActivity={(title) =>
              recordAchievement('Atividades Exclusivas', title)
            }
            onNavigate={navigate}
            onSelectTheme={handleSelectTheme}
          />
        )}

        {['first-words', 'alphabet', 'pronunciation', 'oral-motor', 'animal-sounds', 'daily-phrases', 'camera'].includes(section) &&
        isSectionModuleLocked(section) ? (
          <div className="max-w-xl mx-auto rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-[#FFFDF7] to-[#FEF6E4] p-8 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" aria-hidden="true" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-950">
              <Crown className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
              <span>PREMIUM</span>
            </span>
            <h1 className="text-2xl font-extrabold text-[#0F2942]">
              Conteúdo Exclusivo FalaKids Premium
            </h1>
            <p className="text-sm text-slate-600">
              Esta trilha está classificada como Premium e requer uma assinatura ativa ou concessão administrativa válida.
            </p>
            <button
              type="button"
              onClick={() => navigate('parents')}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-3 text-sm font-extrabold text-white hover:from-orange-700 hover:to-amber-600 transition min-h-[46px]"
            >
              <Lock className="w-4 h-4" aria-hidden="true" />
              <span>Desbloquear na Área dos Pais</span>
            </button>
          </div>
        ) : (
          <>
            {section === 'first-words' && (
              <FirstWordsView
                audioSettings={state.audio}
                practicedWords={state.progress.practicedWords}
                theme={activeTheme}
                onPracticeWord={(word) => recordAchievement('Primeiras Palavras', word, { word })}
                onTogglePracticeWord={togglePracticedWord}
              />
            )}

            {section === 'alphabet' && (
              <AlphabetView
                audioSettings={state.audio}
                exploredLetters={state.progress.exploredLetters}
                onExploreLetter={(letter) =>
                  recordAchievement('Vogais e Alfabeto', `Letra ${letter}`, { letter })
                }
              />
            )}

            {section === 'pronunciation' && (
              <PronunciationView
                ageGroup={state.profile.ageGroup}
                audioSettings={state.audio}
                theme={activeTheme}
                practicedIds={state.progress.practicedPronunciationIds}
                onCompleteExercise={(exercise) =>
                  recordAchievement('Pronúncia', exercise.title, {
                    pronunciationId: exercise.id,
                    word:
                      exercise.level === 'palavras'
                        ? exercise.title.replace(/^Palavra\s+/i, '')
                        : undefined,
                  })
                }
              />
            )}

            {section === 'oral-motor' && (
              <OralMotor3DView
                audioSettings={state.audio}
                onCompleteExercise={(title) =>
                  recordAchievement('Anatomia 3D', title, { oral: true })
                }
              />
            )}

            {section === 'animal-sounds' && (
              <AnimalSoundsView
                audioSettings={state.audio}
                practicedAnimals={state.progress.practicedAnimals}
                onUpdateVolume={(volume) =>
                  setState((prev) => ({
                    ...prev,
                    audio: { ...prev.audio, volume },
                  }))
                }
                onPracticeAnimal={(animalId, animalName) =>
                  recordAchievement('Sons dos Animais', animalName, {
                    animalId,
                    word: animalName,
                  })
                }
              />
            )}

            {section === 'daily-phrases' && (
              <DailyPhrasesView
                audioSettings={state.audio}
                practicedPhraseIds={state.progress.practicedPhraseIds}
                favoritePhraseIds={state.progress.favoritePhraseIds}
                exploredPhraseCategories={state.progress.exploredPhraseCategories}
                activitiesCompleted={state.progress.activitiesCompleted}
                phraseHistory={state.progress.history.filter((h) => h.module === 'Frases do Dia a Dia')}
                onPracticePhrase={(item) =>
                  recordAchievement('Frases do Dia a Dia', item.phrase, {
                    phraseId: item.id,
                    phraseCategories: item.categories,
                  })
                }
                onTogglePracticedPhrase={togglePracticedPhrase}
                onToggleFavoritePhrase={toggleFavoritePhrase}
                onExploreCategory={markExploredPhraseCategory}
              />
            )}

            {section === 'camera' && (
              <CustomPhotosView
                profile={state.profile}
                audioSettings={state.audio}
                onPracticeWord={(word) => recordAchievement('Minhas Fotos', word, { word })}
                onGoToParents={() => navigate('parents')}
              />
            )}
          </>
        )}

        {section === 'games' && (
          <GamesHubView
            audioSettings={state.audio}
            totalStars={state.progress.starsTotal}
            gamesCompleted={state.progress.gamesCompleted}
            gamesProgress={state.progress.gamesProgress}
            hasPremiumAccess={hasPremiumAccess}
            loadingCatalog={loadingCatalog}
            catalogItems={catalogItems}
            phonemeRounds={
              premiumContent?.phonemeRounds || contentCatalog?.unlockedPayloads.phonemeRounds
            }
            rhymeRounds={
              premiumContent?.rhymeRounds || contentCatalog?.unlockedPayloads.rhymeRounds
            }
            onGoToPremium={() => navigate('parents')}
            onUpdateGameProgress={updateGameProgress}
            onCompleteGame={(gameTitle) =>
              recordAchievement('Jogos Educativos', gameTitle, { game: true })
            }
          />
        )}

        {section === 'stories' && (
          <StoriesView
            audioSettings={state.audio}
            storiesRead={state.progress.storiesRead}
            hasPremiumAccess={hasPremiumAccess}
            loadingCatalog={loadingCatalog}
            catalogItems={catalogItems}
            exclusiveStories={
              premiumContent?.stories ||
              (contentCatalog ? Object.values(contentCatalog.unlockedPayloads.stories) : undefined)
            }
            onGoToPremium={() => navigate('parents')}
            onFinishStory={(storyId, storyTitle) =>
              recordAchievement('Histórias', storyTitle, { storyId })
            }
          />
        )}

        {section === 'parents' && (
          <ParentsAreaView
            state={state}
            premiumStatus={premiumStatus}
            loadingPremium={loadingPremium}
            catalogItems={catalogItems}
            catalogCounts={contentCatalog?.counts}
            onRefreshPremium={refreshPremiumState}
            onPremiumStatusChange={(next) => {
              setPremiumStatus(next);
              refreshContentCatalog();
            }}
            onNavigate={navigate}
            onUpdateState={setState}
            onDeleteAllData={handleDeleteAll}
          />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="relative z-10 max-w-7xl w-full mx-auto px-4 md:px-6 pt-2 pb-4">
        <div
          className={`rounded-2xl border bg-white/90 backdrop-blur-sm px-5 py-3.5 text-center text-xs text-slate-500 shadow-xs ${activeTheme.cardBorderClass}`}
        >
          <span>Recurso educativo lúdico · Não substitui acompanhamento fonoaudiológico.</span>
        </div>
      </footer>

      {/* Mobile Bottom Tab Bar (hidden as requested) */}
      <nav
        aria-label="Menu rápido mobile"
        className="hidden fixed bottom-0 left-0 right-0 z-40 h-[58px] bg-white/95 backdrop-blur-md border-t border-slate-200 grid-cols-5 items-center"
      >
        {navItems.map((item) => {
          const Icon = item.Icon;
          const active =
            section === item.id ||
            (item.id === 'activities' &&
              ['first-words', 'alphabet', 'pronunciation', 'oral-motor', 'animal-sounds', 'daily-phrases', 'camera'].includes(
                section
              ));
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center justify-center h-full transition ${
                active ? activeTheme.mobileActiveClass : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5" aria-hidden="true" />
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <MenuDrawer
        open={menuOpen}
        currentSection={section}
        theme={activeTheme}
        catalogItems={catalogItems}
        onClose={() => setMenuOpen(false)}
        onNavigate={(next) => {
          playFeedbackTone('click', state.audio.volume);
          navigate(next);
        }}
      />

      <StarCelebration visible={!!celebrationMsg} message={celebrationMsg || ''} />
      <OfflineIndicator />
    </div>
  );
}
