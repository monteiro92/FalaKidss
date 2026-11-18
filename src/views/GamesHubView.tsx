import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  RotateCcw,
  Sparkles,
  Star,
  Volume2,
  ArrowLeft,
  CheckCircle2,
  Delete,
  Shuffle,
  Play,
  Trophy,
  Lock,
  Crown,
} from 'lucide-react';
import { ANIMAL_SOUNDS, FIRST_WORDS } from '../data/curriculum';
import { AudioSettings, GameDifficulty, GameProgressEntry } from '../types/app';
import { CatalogItemDTO, ContentTier, PremiumPhonemeRound, PremiumRhymeRound } from '../types/premium';
import { IllustratedArt } from '../components/IllustratedArt';
import { ContentTierBadge } from '../components/ContentTierBadge';
import { playAnimalAudio, playFeedbackTone, speakPtBr, stopAnimalAudio } from '../utils/speech';

interface GamesHubViewProps {
  audioSettings: AudioSettings;
  totalStars: number;
  gamesCompleted: number;
  gamesProgress: Record<string, GameProgressEntry>;
  hasPremiumAccess?: boolean;
  loadingCatalog?: boolean;
  catalogItems?: CatalogItemDTO[];
  phonemeRounds?: PremiumPhonemeRound[];
  rhymeRounds?: PremiumRhymeRound[];
  onGoToPremium?: () => void;
  onUpdateGameProgress: (gameId: string, entry: GameProgressEntry) => void;
  onCompleteGame: (gameTitle: string) => void;
}

type GameId =
  | 'memoria'
  | 'encontre-imagem'
  | 'complete-palavra'
  | 'qual-animal'
  | 'acerte-letra'
  | 'monte-frase'
  | 'ligue-imagem'
  | 'ouca-escolha'
  | 'descubra-objeto'
  | 'embaralha'
  | 'fonemas-especiais'
  | 'caca-rimas';

const GAMES_LIST: {
  id: GameId;
  title: string;
  description: string;
  accent: string;
  artKey: string;
}[] = [
  { id: 'memoria', title: '1. Jogo da Memória', description: 'Encontre os pares de imagens iguais', accent: '#0284C7', artKey: 'estrela' },
  { id: 'encontre-imagem', title: '2. Encontre a Imagem', description: 'Ouça o nome e toque na figura certa', accent: '#EC4899', artKey: 'olho' },
  { id: 'complete-palavra', title: '3. Complete a Palavra', description: 'Escolha a letra ou sílaba que falta', accent: '#F59E0B', artKey: 'lapis' },
  { id: 'qual-animal', title: '4. Qual é o Animal?', description: 'Ouça o som e descubra o bichinho', accent: '#10B981', artKey: 'cachorro' },
  { id: 'acerte-letra', title: '5. Acerte a Letra', description: 'Reconheça vogais e consoantes iniciais em 3 níveis', accent: '#8B5CF6', artKey: 'bola' },
  { id: 'ouca-escolha', title: '6. Ouça e Escolha', description: 'Atenção aos sons parecidos', accent: '#0EA5E9', artKey: 'orelha' },
  { id: 'monte-frase', title: '7. Monte a Frase', description: 'Coloque as palavras na ordem correta', accent: '#F97316', artKey: 'livro' },
  { id: 'ligue-imagem', title: '8. Ligue a Imagem à Palavra', description: 'Conecte cada desenho ao seu nome', accent: '#10B981', artKey: 'flor' },
  { id: 'descubra-objeto', title: '9. Descubra o Objeto', description: 'Ouça as pistas para revelar o segredo', accent: '#6366F1', artKey: 'pergunta' },
  { id: 'embaralha', title: '10. Embaralha', description: 'Organize as letras embaralhadas para formar palavras', accent: '#E11D48', artKey: 'brinquedo' },
];

const PREMIUM_GAMES_LIST: {
  id: 'fonemas-especiais' | 'caca-rimas';
  title: string;
  description: string;
  accent: string;
  artKey: string;
}[] = [
  {
    id: 'fonemas-especiais',
    title: '11. Desafio dos Fonemas Especiais',
    description: 'Pratique sons complexos (CH, LH, NH e encontros) com pistas faladas',
    accent: '#D97706',
    artKey: 'chocolate',
  },
  {
    id: 'caca-rimas',
    title: '12. Caça às Rimas Divertidas',
    description: 'Descubra palavras com sons finais parecidos e ganhe estrelas extras',
    accent: '#EA580C',
    artKey: 'leao',
  },
];

export const GamesHubView: React.FC<GamesHubViewProps> = ({
  audioSettings,
  totalStars,
  gamesCompleted,
  gamesProgress,
  hasPremiumAccess = false,
  loadingCatalog = false,
  catalogItems = [],
  phonemeRounds = [],
  rhymeRounds = [],
  onGoToPremium,
  onUpdateGameProgress,
  onCompleteGame,
}) => {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const catalogById = useMemo(() => {
    const map = new Map<string, CatalogItemDTO>();
    for (const item of catalogItems) {
      map.set(item.id, item);
    }
    return map;
  }, [catalogItems]);

  const getGameAccess = (gameId: GameId, defaultTier: ContentTier) => {
    const entry = catalogById.get(gameId);
    const tier: ContentTier = entry?.tier || defaultTier;
    const unlocked = entry ? entry.unlocked : tier === 'GRATUITO' || hasPremiumAccess;
    return { tier, unlocked };
  };

  const openGame = (id: GameId, defaultTier: ContentTier) => {
    const { unlocked } = getGameAccess(id, defaultTier);
    if (!unlocked) {
      onGoToPremium?.();
      return;
    }
    setFeedback(null);
    setActiveGame(id);
    playFeedbackTone('click', audioSettings.volume);
  };

  if (!activeGame) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Jogos Educativos</h1>
            <p className="text-sm md:text-base text-slate-600 mt-1">
              Aprenda brincando! Cada acerto ganha estrelinhas e ninguém perde pontos ao tentar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 flex items-center gap-2">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" aria-hidden="true" />
              <div>
                <div className="text-sm font-extrabold text-amber-900 tabular-nums">{totalStars}</div>
                <div className="text-[11px] font-semibold text-amber-800">Estrelas</div>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              <div>
                <div className="text-sm font-extrabold text-emerald-900 tabular-nums">{gamesCompleted}</div>
                <div className="text-[11px] font-semibold text-emerald-800">Conquistas</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAMES_LIST.map((g) => {
            const saved = gamesProgress[g.id];
            const { tier, unlocked } = getGameAccess(g.id, 'GRATUITO');
            return (
              <div
                key={g.id}
                onClick={() => openGame(g.id, 'GRATUITO')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openGame(g.id, 'GRATUITO');
                  }
                }}
                className={`cursor-pointer rounded-3xl border p-5 text-left flex flex-col justify-between gap-4 min-h-[206px] transition shadow-xs ${
                  unlocked
                    ? 'border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/40'
                    : 'border-amber-300 bg-[#FFFDF7] hover:bg-amber-50/60'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <ContentTierBadge tier={tier} unlocked={unlocked} />
                    {!unlocked && <Lock className="w-4 h-4 text-amber-700" aria-hidden="true" />}
                  </div>

                  <div className="flex items-start gap-3">
                    <IllustratedArt artKey={g.artKey} label={g.title} size={64} className="shrink-0" />
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900 leading-snug">{g.title}</h2>
                      <p className="text-sm text-slate-600 mt-1">{g.description}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  {!unlocked ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900">
                      <Lock className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
                      <span>Exclusivo assinantes</span>
                    </span>
                  ) : saved && saved.attempts > 0 ? (
                    <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-900 tabular-nums">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" aria-hidden="true" />
                      <span>{saved.hits} acertos · {saved.stars} ★</span>
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500">Pronto para brincar</span>
                  )}

                  {unlocked ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openGame(g.id, 'GRATUITO');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs transition min-h-[40px]"
                      style={{ backgroundColor: g.accent }}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                      <span>Jogar</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onGoToPremium?.();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 text-xs font-bold text-amber-950 transition min-h-[40px]"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
                      <span>Desbloquear</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Jogos Especiais · FalaKids Premium */}
        <section className="rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-[#FFFDF7] via-[#FEF6E4] to-[#FFF4E0] p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-amber-900">
                <Crown className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                <span>Jogos Especiais · FalaKids Premium</span>
              </div>
              <h2 className="text-xl font-extrabold text-[#0F2942]">
                Desafios Avançados para Assinantes
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PREMIUM_GAMES_LIST.map((pg) => {
              const saved = gamesProgress[pg.id];
              const { tier, unlocked } = getGameAccess(pg.id, 'PREMIUM');
              const roundsReady =
                pg.id === 'fonemas-especiais' ? phonemeRounds.length > 0 : rhymeRounds.length > 0;
              const isLoadingRounds = unlocked && !roundsReady && loadingCatalog;
              const canPlay = unlocked && roundsReady;

              return (
                <div
                  key={pg.id}
                  className="rounded-3xl border border-amber-300 bg-white p-5 flex flex-col justify-between gap-4 min-h-[200px] shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <ContentTierBadge tier={tier} unlocked={unlocked} />
                      {!unlocked && <Lock className="w-4 h-4 text-amber-700" aria-hidden="true" />}
                    </div>

                    <div className="flex items-start gap-3">
                      <IllustratedArt artKey={pg.artKey} label={pg.title} size={64} className="shrink-0" />
                      <div>
                        <h3 className="text-lg font-extrabold text-[#0F2942] leading-snug">{pg.title}</h3>
                        <p className="text-sm text-slate-600 mt-1">{pg.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-amber-100">
                    {canPlay ? (
                      saved && saved.attempts > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-900 tabular-nums">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" aria-hidden="true" />
                          <span>{saved.hits} acertos · {saved.stars} ★</span>
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-800">Liberado no seu plano</span>
                      )
                    ) : isLoadingRounds ? (
                      <span className="text-xs font-semibold text-amber-800">Carregando desafio...</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600">
                        <Lock className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                        <span>Exclusivo assinantes</span>
                      </span>
                    )}

                    {canPlay ? (
                      <button
                        type="button"
                        onClick={() => openGame(pg.id, 'PREMIUM')}
                        className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs transition min-h-[42px]"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                        <span>Jogar Especial</span>
                      </button>
                    ) : isLoadingRounds ? (
                      <span className="inline-flex items-center rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800">
                        Carregando...
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onGoToPremium?.()}
                        className="inline-flex items-center gap-1.5 rounded-2xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-4 py-2 text-xs sm:text-sm font-bold text-amber-950 transition min-h-[42px]"
                      >
                        <Lock className="w-3.5 h-3.5 text-amber-700" aria-hidden="true" />
                        <span>Desbloquear</span>
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

  const activeAccess = getGameAccess(
    activeGame,
    activeGame === 'fonemas-especiais' || activeGame === 'caca-rimas' ? 'PREMIUM' : 'GRATUITO'
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            stopAnimalAudio();
            setActiveGame(null);
            setFeedback(null);
          }}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Voltar aos jogos</span>
        </button>

        <div className="flex items-center gap-2">
          <ContentTierBadge tier={activeAccess.tier} unlocked={activeAccess.unlocked} compact />
          <span className="text-sm font-bold text-slate-800">
            {GAMES_LIST.find((x) => x.id === activeGame)?.title ||
              PREMIUM_GAMES_LIST.find((x) => x.id === activeGame)?.title}
          </span>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
        {!activeAccess.unlocked ? (
          <div className="max-w-md mx-auto text-center space-y-4 py-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" aria-hidden="true" />
            </div>
            <h2 className="text-xl font-extrabold text-[#0F2942]">
              Jogo Exclusivo FalaKids Premium
            </h2>
            <p className="text-sm text-slate-600">
              Assine o plano Premium ou utilize uma concessão administrativa válida para jogar este desafio.
            </p>
            {onGoToPremium && (
              <button
                type="button"
                onClick={onGoToPremium}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-2.5 text-sm font-extrabold text-white"
              >
                <span>Desbloquear na Área dos Pais</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {activeGame === 'memoria' && (
              <MemoryGame
                audioSettings={audioSettings}
                onWin={() => onCompleteGame('Jogo da Memória')}
                setFeedback={setFeedback}
              />
            )}
            {activeGame === 'encontre-imagem' && (
              <FindImageGame
                audioSettings={audioSettings}
                onWin={() => onCompleteGame('Encontre a Imagem')}
                setFeedback={setFeedback}
              />
            )}
            {activeGame === 'complete-palavra' && (
              <CompleteWordGame
                audioSettings={audioSettings}
                onWin={() => onCompleteGame('Complete a Palavra')}
                setFeedback={setFeedback}
              />
            )}
            {activeGame === 'qual-animal' && (
              <WhichAnimalGame
                audioSettings={audioSettings}
                onWin={() => onCompleteGame('Qual é o Animal?')}
                setFeedback={setFeedback}
              />
            )}
            {activeGame === 'acerte-letra' && (
              <HitLetterGame
                audioSettings={audioSettings}
                savedProgress={gamesProgress['acerte-letra']}
                onSaveProgress={(entry) => onUpdateGameProgress('acerte-letra', entry)}
                onWin={() => onCompleteGame('Acerte a Letra')}
                setFeedback={setFeedback}
              />
            )}
            {activeGame === 'ouca-escolha' && (
              <ListenChooseGame
                audioSettings={audioSettings}
                onWin={() => onCompleteGame('Ouça e Escolha')}
                setFeedback={setFeedback}
              />
            )}
            {activeGame === 'monte-frase' && (
              <BuildPhraseGame
                audioSettings={audioSettings}
                onWin={() => onCompleteGame('Monte a Frase')}
                setFeedback={setFeedback}
              />
            )}
            {activeGame === 'ligue-imagem' && (
              <MatchPairsGame
                audioSettings={audioSettings}
                onWin={() => onCompleteGame('Ligue a Imagem à Palavra')}
                setFeedback={setFeedback}
              />
            )}
            {activeGame === 'descubra-objeto' && (
              <DiscoverObjectGame
                audioSettings={audioSettings}
                onWin={() => onCompleteGame('Descubra o Objeto')}
                setFeedback={setFeedback}
              />
            )}
            {activeGame === 'embaralha' && (
              <ScrambleWordGame
                audioSettings={audioSettings}
                savedProgress={gamesProgress['embaralha']}
                onSaveProgress={(entry) => onUpdateGameProgress('embaralha', entry)}
                onWin={() => onCompleteGame('Embaralha')}
                setFeedback={setFeedback}
              />
            )}
            {activeGame === 'fonemas-especiais' && phonemeRounds.length > 0 && (
              <SpecialPhonemeGame
                audioSettings={audioSettings}
                rounds={phonemeRounds}
                savedProgress={gamesProgress['fonemas-especiais']}
                onSaveProgress={(entry) => onUpdateGameProgress('fonemas-especiais', entry)}
                onWin={() => onCompleteGame('Desafio dos Fonemas Especiais')}
                setFeedback={setFeedback}
              />
            )}
            {activeGame === 'caca-rimas' && rhymeRounds.length > 0 && (
              <RhymeHuntGame
                audioSettings={audioSettings}
                rounds={rhymeRounds}
                savedProgress={gamesProgress['caca-rimas']}
                onSaveProgress={(entry) => onUpdateGameProgress('caca-rimas', entry)}
                onWin={() => onCompleteGame('Caça às Rimas Divertidas')}
                setFeedback={setFeedback}
              />
            )}
          </>
        )}

        {feedback && (
          <div
            role="status"
            className="mt-6 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-center text-base font-semibold text-slate-900 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" aria-hidden="true" />
            <span>{feedback}</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface SubGameProps {
  audioSettings: AudioSettings;
  onWin: () => void;
  setFeedback: (msg: string | null) => void;
}

const MemoryGame: React.FC<SubGameProps> = ({ audioSettings, onWin, setFeedback }) => {
  const baseWords = useMemo(() => FIRST_WORDS.slice(0, 4), []);

  const createDeck = () =>
    [...baseWords, ...baseWords]
      .map((item, idx) => ({ uid: `${item.id}-${idx}`, item }))
      .sort(() => Math.random() - 0.5);

  const [cards, setCards] = useState(createDeck);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);

  const handleFlip = (uid: string, item: (typeof baseWords)[number]) => {
    if (flipped.length >= 2 || flipped.includes(uid) || matchedIds.includes(item.id)) return;
    playFeedbackTone('click', audioSettings.volume);
    speakPtBr(item.word, audioSettings);
    const next = [...flipped, uid];
    setFlipped(next);

    if (next.length === 2) {
      const firstCard = cards.find((c) => c.uid === next[0]);
      if (firstCard && firstCard.item.id === item.id) {
        const nextMatched = [...matchedIds, item.id];
        setMatchedIds(nextMatched);
        setFlipped([]);
        playFeedbackTone('star', audioSettings.volume);
        setFeedback(`Par encontrado: ${item.word}!`);
        if (nextMatched.length === baseWords.length) {
          playFeedbackTone('success', audioSettings.volume);
          setFeedback('Parabéns! Você encontrou todos os pares!');
          speakPtBr('Parabéns! Você completou o jogo da memória!', audioSettings);
          onWin();
        }
      } else {
        window.setTimeout(() => {
          setFlipped([]);
          setFeedback('Quase lá! Tente lembrar onde estava o outro cartão.');
        }, 900);
      }
    }
  };

  const reset = () => {
    setCards(createDeck());
    setFlipped([]);
    setMatchedIds([]);
    setFeedback(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-600">
          Pares encontrados: <span className="tabular-nums text-sky-700">{matchedIds.length}/{baseWords.length}</span>
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 min-h-[40px]"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          Embaralhar
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 max-w-2xl mx-auto">
        {cards.map((card) => {
          const isOpen = flipped.includes(card.uid) || matchedIds.includes(card.item.id);
          return (
            <button
              key={card.uid}
              type="button"
              onClick={() => handleFlip(card.uid, card.item)}
              className={`rounded-3xl border-2 p-4 min-h-[140px] flex flex-col items-center justify-center gap-2 transition ${
                isOpen
                  ? 'bg-white border-sky-400 shadow-sm'
                  : 'bg-sky-600 border-sky-700 text-white hover:bg-sky-700'
              }`}
            >
              {isOpen ? (
                <>
                  <IllustratedArt artKey={card.item.id} label={card.item.word} size={74} />
                  <span className="text-sm font-extrabold text-slate-900">{card.item.word}</span>
                </>
              ) : (
                <Star className="w-8 h-8 text-amber-300 fill-amber-300" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const FindImageGame: React.FC<SubGameProps> = ({ audioSettings, onWin, setFeedback }) => {
  const pool = FIRST_WORDS;
  const [idx, setIdx] = useState(0);
  const target = pool[idx % pool.length];
  const choices = useMemo(() => {
    const others = pool.filter((w) => w.id !== target.id).slice(idx % 5, (idx % 5) + 2);
    return [target, ...others].sort((a, b) => a.word.localeCompare(b.word));
  }, [pool, target, idx]);

  useEffect(() => {
    speakPtBr(`Encontre a imagem: ${target.word}`, audioSettings);
  }, [idx]);

  const choose = (w: (typeof pool)[number]) => {
    if (w.id === target.id) {
      playFeedbackTone('success', audioSettings.volume);
      setFeedback(`Muito bem! Você achou ${target.word}!`);
      onWin();
      window.setTimeout(() => {
        setFeedback(null);
        setIdx((p) => p + 1);
      }, 1200);
    } else {
      playFeedbackTone('tryAgain', audioSettings.volume);
      setFeedback(`Essa figura é ${w.word}. Tente outra vez!`);
    }
  };

  return (
    <div className="space-y-6 text-center max-w-2xl mx-auto">
      <div className="space-y-3">
        <h2 className="text-2xl font-extrabold text-slate-900">
          Onde está: <span className="text-sky-600">{target.word}</span>?
        </h2>
        <button
          type="button"
          onClick={() => speakPtBr(`Onde está ${target.word}?`, audioSettings)}
          className="inline-flex items-center gap-2 rounded-2xl bg-sky-100 px-4 py-2.5 text-sm font-bold text-sky-900 min-h-[44px]"
        >
          <Volume2 className="w-4 h-4" aria-hidden="true" />
          Ouvir de novo
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {choices.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => choose(c)}
            className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-6 flex flex-col items-center gap-3 hover:border-sky-400 hover:bg-sky-50 transition"
          >
            <IllustratedArt artKey={c.id} label={c.word} size={108} />
          </button>
        ))}
      </div>
    </div>
  );
};

const COMPLETE_ITEMS = [
  { art: 'bola', display: '_ O L A', missing: 'B', options: ['B', 'M', 'P'], full: 'Bola' },
  { art: 'casa', display: '_ A S A', missing: 'C', options: ['C', 'L', 'T'], full: 'Casa' },
  { art: 'gato', display: 'G A _ O', missing: 'T', options: ['T', 'B', 'V'], full: 'Gato' },
  { art: 'pato', display: 'P A T _', missing: 'O', options: ['O', 'I', 'U'], full: 'Pato' },
  { art: 'sol', display: 'S _ L', missing: 'O', options: ['O', 'A', 'E'], full: 'Sol' },
];

const CompleteWordGame: React.FC<SubGameProps> = ({ audioSettings, onWin, setFeedback }) => {
  const [idx, setIdx] = useState(0);
  const item = COMPLETE_ITEMS[idx % COMPLETE_ITEMS.length];

  const handlePick = (letter: string) => {
    if (letter === item.missing) {
      playFeedbackTone('success', audioSettings.volume);
      setFeedback(`Parabéns! Formou a palavra ${item.full}!`);
      speakPtBr(item.full, audioSettings);
      onWin();
      window.setTimeout(() => {
        setFeedback(null);
        setIdx((p) => p + 1);
      }, 1300);
    } else {
      playFeedbackTone('tryAgain', audioSettings.volume);
      setFeedback(`Com a letra ${letter} não forma ${item.full}. Vamos tentar outra!`);
    }
  };

  return (
    <div className="space-y-6 text-center max-w-xl mx-auto">
      <IllustratedArt artKey={item.art} label={item.full} size={116} className="mx-auto" />
      <div className="text-4xl font-extrabold tracking-widest font-display text-slate-900">
        {item.display}
      </div>
      <button
        type="button"
        onClick={() => speakPtBr(`Qual letra completa a palavra ${item.full}?`, audioSettings)}
        className="inline-flex items-center gap-2 rounded-2xl bg-sky-100 px-4 py-2 text-sm font-bold text-sky-900 min-h-[44px]"
      >
        <Volume2 className="w-4 h-4" aria-hidden="true" />
        Ouvir palavra
      </button>
      <div className="grid grid-cols-3 gap-4">
        {item.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handlePick(opt)}
            className="rounded-3xl border-2 border-slate-200 bg-amber-50/50 py-5 text-3xl font-extrabold font-display text-slate-900 hover:border-amber-400 hover:bg-amber-100 transition"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

const WhichAnimalGame: React.FC<SubGameProps> = ({ audioSettings, onWin, setFeedback }) => {
  const [idx, setIdx] = useState(0);
  const timerRef = React.useRef<number | null>(null);
  const target = ANIMAL_SOUNDS[idx % ANIMAL_SOUNDS.length];
  const choices = useMemo(() => {
    const others = ANIMAL_SOUNDS.filter((a) => a.id !== target.id).slice(idx % 4, (idx % 4) + 2);
    return [target, ...others].sort((a, b) => a.name.localeCompare(b.name));
  }, [target, idx]);

  const playSound = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    playAnimalAudio(target.audioSrc, target.id, audioSettings.volume);
    timerRef.current = window.setTimeout(
      () => speakPtBr(`Qual animal faz ${target.onomatopoeia}?`, audioSettings, { skipFallbackTone: true }),
      1400
    );
  };

  useEffect(() => {
    playSound();
    return () => {
      stopAnimalAudio();
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [idx]);

  const guess = (chosen: (typeof ANIMAL_SOUNDS)[number]) => {
    if (chosen.id === target.id) {
      playFeedbackTone('success', audioSettings.volume);
      setFeedback(`Muito bem! É o ${target.name}!`);
      onWin();
      window.setTimeout(() => {
        setFeedback(null);
        setIdx((p) => p + 1);
      }, 1300);
    } else {
      playFeedbackTone('tryAgain', audioSettings.volume);
      setFeedback(`Esse é o ${chosen.name} (${chosen.onomatopoeia}). Tente outro!`);
    }
  };

  return (
    <div className="space-y-6 text-center max-w-2xl mx-auto">
      <h2 className="text-2xl font-extrabold text-slate-900">
        Qual animal faz “{target.onomatopoeia}”?
      </h2>
      <button
        type="button"
        onClick={playSound}
        className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white min-h-[46px]"
      >
        <Volume2 className="w-4 h-4" aria-hidden="true" />
        Ouvir som novamente
      </button>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {choices.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => guess(c)}
            className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-6 flex flex-col items-center gap-3 hover:border-emerald-400 hover:bg-emerald-50 transition"
          >
            <IllustratedArt artKey={c.id} label={c.name} size={104} />
            <span className="text-lg font-bold text-slate-900">{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

interface PersistedSubGameProps extends SubGameProps {
  savedProgress?: GameProgressEntry;
  onSaveProgress: (entry: GameProgressEntry) => void;
}

type LetterCaseMode = 'upper' | 'lower' | 'mixed';

interface HitLetterItem {
  word: string;
  letter: string;
  artKey: string;
  isVowel: boolean;
  distractors: string[];
}

const HIT_LETTER_BANK: Record<GameDifficulty, HitLetterItem[]> = {
  facil: [
    { word: 'Bola', letter: 'B', artKey: 'bola', isVowel: false, distractors: ['A', 'M'] },
    { word: 'Abelha', letter: 'A', artKey: 'abelha', isVowel: true, distractors: ['B', 'O'] },
    { word: 'Casa', letter: 'C', artKey: 'casa', isVowel: false, distractors: ['S', 'L'] },
    { word: 'Ovo', letter: 'O', artKey: 'ovo', isVowel: true, distractors: ['U', 'P'] },
    { word: 'Pato', letter: 'P', artKey: 'pato', isVowel: false, distractors: ['B', 'G'] },
    { word: 'Uva', letter: 'U', artKey: 'uva', isVowel: true, distractors: ['A', 'E'] },
    { word: 'Gato', letter: 'G', artKey: 'gato', isVowel: false, distractors: ['R', 'C'] },
    { word: 'Lua', letter: 'L', artKey: 'lua', isVowel: false, distractors: ['T', 'N'] },
    { word: 'Maçã', letter: 'M', artKey: 'maca', isVowel: false, distractors: ['P', 'A'] },
    { word: 'Sol', letter: 'S', artKey: 'sol', isVowel: false, distractors: ['F', 'Z'] },
    { word: 'Dado', letter: 'D', artKey: 'dado', isVowel: false, distractors: ['B', 'V'] },
    { word: 'Vaca', letter: 'V', artKey: 'vaca', isVowel: false, distractors: ['F', 'M'] },
  ],
  medio: [
    { word: 'Elefante', letter: 'E', artKey: 'elefante', isVowel: true, distractors: ['A', 'I', 'L'] },
    { word: 'Igreja', letter: 'I', artKey: 'igreja', isVowel: true, distractors: ['E', 'O', 'T'] },
    { word: 'Flor', letter: 'F', artKey: 'flor', isVowel: false, distractors: ['V', 'P', 'S'] },
    { word: 'Jacaré', letter: 'J', artKey: 'jacare', isVowel: false, distractors: ['G', 'Z', 'R'] },
    { word: 'Navio', letter: 'N', artKey: 'navio', isVowel: false, distractors: ['M', 'L', 'D'] },
    { word: 'Queijo', letter: 'Q', artKey: 'queijo', isVowel: false, distractors: ['C', 'G', 'O'] },
    { word: 'Rato', letter: 'R', artKey: 'rato', isVowel: false, distractors: ['L', 'P', 'S'] },
    { word: 'Tartaruga', letter: 'T', artKey: 'tartaruga', isVowel: false, distractors: ['D', 'P', 'C'] },
    { word: 'Xícara', letter: 'X', artKey: 'xicara', isVowel: false, distractors: ['S', 'Z', 'J'] },
    { word: 'Zebra', letter: 'Z', artKey: 'zebra', isVowel: false, distractors: ['S', 'X', 'N'] },
  ],
  dificil: [
    { word: 'Abacaxi', letter: 'A', artKey: 'abacaxi', isVowel: true, distractors: ['E', 'O', 'U'] },
    { word: 'Escova', letter: 'E', artKey: 'escova', isVowel: true, distractors: ['I', 'A', 'S'] },
    { word: 'Hipopótamo', letter: 'H', artKey: 'hipopotamo', isVowel: false, distractors: ['I', 'N', 'M'] },
    { word: 'Kiwi', letter: 'K', artKey: 'kiwi', isVowel: false, distractors: ['C', 'Q', 'R'] },
    { word: 'Borboleta', letter: 'B', artKey: 'borboleta', isVowel: false, distractors: ['P', 'D', 'V'] },
    { word: 'Cachorro', letter: 'C', artKey: 'cachorro', isVowel: false, distractors: ['G', 'Q', 'S'] },
    { word: 'Girafa', letter: 'G', artKey: 'girafa', isVowel: false, distractors: ['J', 'C', 'Q'] },
    { word: 'Morango', letter: 'M', artKey: 'morango', isVowel: false, distractors: ['N', 'B', 'P'] },
    { word: 'Papagaio', letter: 'P', artKey: 'papagaio', isVowel: false, distractors: ['B', 'T', 'D'] },
    { word: 'Waffle', letter: 'W', artKey: 'waffle', isVowel: false, distractors: ['V', 'U', 'M'] },
    { word: 'Telefone', letter: 'T', artKey: 'telefone', isVowel: false, distractors: ['D', 'F', 'L'] },
  ],
};

const DIFFICULTY_LABELS: Record<GameDifficulty, string> = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
};

const HitLetterGame: React.FC<PersistedSubGameProps> = ({
  audioSettings,
  savedProgress,
  onSaveProgress,
  onWin,
  setFeedback,
}) => {
  const [difficulty, setDifficulty] = useState<GameDifficulty>(savedProgress?.difficulty || 'facil');
  const [idx, setIdx] = useState<number>(savedProgress?.lastIndex || 0);
  const [hits, setHits] = useState<number>(savedProgress?.hits || 0);
  const [attempts, setAttempts] = useState<number>(savedProgress?.attempts || 0);
  const [stars, setStars] = useState<number>(savedProgress?.stars || 0);
  const [caseMode, setCaseMode] = useState<LetterCaseMode>('upper');
  const [answeredOption, setAnsweredOption] = useState<string | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const pool = HIT_LETTER_BANK[difficulty];
  const target = pool[idx % pool.length];

  const options = useMemo(() => {
    const raw = [target.letter, ...target.distractors];
    // Deterministic shuffle per round index so options vary nicely without flickering
    return [...raw].sort((a, b) => {
      const ha = (a.charCodeAt(0) * 31 + idx * 17) % 97;
      const hb = (b.charCodeAt(0) * 31 + idx * 17) % 97;
      return ha - hb;
    });
  }, [target, idx]);

  useEffect(() => {
    speakPtBr(target.word, audioSettings);
  }, [idx, difficulty]);

  const formatOption = (upperChar: string, optionIdx: number) => {
    if (caseMode === 'upper') return upperChar.toUpperCase();
    if (caseMode === 'lower') return upperChar.toLowerCase();
    return (idx + optionIdx) % 2 === 0 ? upperChar.toUpperCase() : upperChar.toLowerCase();
  };

  const handleDifficultyChange = (nextDiff: GameDifficulty) => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsAdvancing(false);
    setAnsweredOption(null);
    setFeedback(null);
    setDifficulty(nextDiff);
    setIdx(0);
    onSaveProgress({
      hits,
      attempts,
      stars,
      lastIndex: 0,
      difficulty: nextDiff,
    });
    playFeedbackTone('click', audioSettings.volume);
  };

  const handlePick = (chosenUpper: string, displayChar: string) => {
    if (isAdvancing) return;
    setIsAdvancing(true);
    setAnsweredOption(chosenUpper);

    const isCorrect = chosenUpper === target.letter;
    const nextAttempts = attempts + 1;
    const nextHits = isCorrect ? hits + 1 : hits;
    const nextStars = isCorrect ? stars + 1 : stars;
    const nextIdx = idx + 1;

    setAttempts(nextAttempts);
    setHits(nextHits);
    setStars(nextStars);

    onSaveProgress({
      hits: nextHits,
      attempts: nextAttempts,
      stars: nextStars,
      lastIndex: nextIdx,
      difficulty,
    });

    if (isCorrect) {
      playFeedbackTone('success', audioSettings.volume);
      setFeedback(`Isso mesmo! ${target.word} começa com a letra ${displayChar}!`);
      speakPtBr(`Muito bem! ${target.letter} de ${target.word}!`, audioSettings);
      onWin();
    } else {
      playFeedbackTone('tryAgain', audioSettings.volume);
      const correctDisplay =
        caseMode === 'lower' ? target.letter.toLowerCase() : target.letter.toUpperCase();
      setFeedback(`Boa tentativa! ${target.word} começa com a letra ${correctDisplay}.`);
      speakPtBr(`${target.word} começa com ${target.letter}`, audioSettings);
    }

    timerRef.current = window.setTimeout(() => {
      setAnsweredOption(null);
      setIsAdvancing(false);
      setFeedback(null);
      setIdx(nextIdx);
    }, isCorrect ? 1400 : 1800);
  };

  return (
    <div className="space-y-6 text-center max-w-2xl mx-auto">
      {/* Controls Bar: Difficulty + Letter Case + Score */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 border border-slate-200 p-3">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Nível de dificuldade">
          {(['facil', 'medio', 'dificil'] as GameDifficulty[]).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => handleDifficultyChange(lvl)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition min-h-[36px] ${
                difficulty === lvl
                  ? 'bg-violet-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-violet-50'
              }`}
            >
              {DIFFICULTY_LABELS[lvl]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Formato das letras">
          {(
            [
              { id: 'upper', label: 'ABC' },
              { id: 'lower', label: 'abc' },
              { id: 'mixed', label: 'Aa' },
            ] as { id: LetterCaseMode; label: string }[]
          ).map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => {
                setCaseMode(mode.id);
                playFeedbackTone('click', audioSettings.volume);
              }}
              className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition min-h-[36px] ${
                caseMode === mode.id
                  ? 'bg-sky-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-sky-50'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-bold tabular-nums">
          <span className="rounded-xl bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-emerald-800">
            Acertos: {hits}/{attempts}
          </span>
          <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 border border-amber-200 px-2.5 py-1 text-amber-800">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" aria-hidden="true" />
            {stars}
          </span>
        </div>
      </div>

      {/* Illustrative image & audio */}
      <div className="space-y-3">
        <IllustratedArt artKey={target.artKey} label={target.word} size={120} className="mx-auto" />
        <div className="flex items-center justify-center gap-2">
          <span className="rounded-full bg-violet-50 border border-violet-200 px-3 py-0.5 text-xs font-bold text-violet-800">
            {target.isVowel ? 'Vogal inicial' : 'Consoante inicial'}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Com qual letra começa <span className="text-violet-700">{target.word}</span>?
        </h2>
        <button
          type="button"
          onClick={() => speakPtBr(target.word, audioSettings)}
          className="inline-flex items-center gap-2 rounded-2xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-violet-700 transition min-h-[44px]"
        >
          <Volume2 className="w-4 h-4" aria-hidden="true" />
          <span>Ouvir palavra</span>
        </button>
      </div>

      {/* 3 or 4 Letter Options */}
      <div
        className={`grid gap-3.5 ${
          options.length === 3 ? 'grid-cols-3 max-w-md mx-auto' : 'grid-cols-2 sm:grid-cols-4'
        }`}
      >
        {options.map((upperChar, optionIdx) => {
          const displayChar = formatOption(upperChar, optionIdx);
          const isPicked = answeredOption === upperChar;
          const isRight = upperChar === target.letter;

          let cardClass =
            'border-slate-200 bg-violet-50/50 text-slate-900 hover:border-violet-400 hover:bg-violet-100';
          if (answeredOption !== null) {
            if (isRight) {
              cardClass = 'border-emerald-500 bg-emerald-100 text-emerald-900 shadow-sm';
            } else if (isPicked) {
              cardClass = 'border-amber-400 bg-amber-100 text-amber-900';
            } else {
              cardClass = 'border-slate-200 bg-slate-50 text-slate-400 opacity-70';
            }
          }

          return (
            <button
              key={upperChar}
              type="button"
              disabled={isAdvancing}
              onClick={() => handlePick(upperChar, displayChar)}
              className={`rounded-3xl border-2 py-6 text-4xl font-extrabold font-display transition ${cardClass}`}
            >
              {displayChar}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const MINIMAL_PAIRS = [
  { target: { id: 'pato', word: 'Pato' }, other: { id: 'gato', word: 'Gato' } },
  { target: { id: 'bola', word: 'Bola' }, other: { id: 'maca', word: 'Maçã' } },
  { target: { id: 'vaca', word: 'Vaca' }, other: { id: 'casa', word: 'Casa' } },
  { target: { id: 'sol', word: 'Sol' }, other: { id: 'lua', word: 'Lua' } },
];

const ListenChooseGame: React.FC<SubGameProps> = ({ audioSettings, onWin, setFeedback }) => {
  const [idx, setIdx] = useState(0);
  const pair = MINIMAL_PAIRS[idx % MINIMAL_PAIRS.length];
  const options = useMemo(
    () => [pair.target, pair.other].sort((a, b) => a.word.localeCompare(b.word)),
    [pair]
  );

  useEffect(() => {
    speakPtBr(`Ouça com atenção e escolha: ${pair.target.word}`, audioSettings);
  }, [idx]);

  const pick = (chosen: { id: string; word: string }) => {
    if (chosen.id === pair.target.id) {
      playFeedbackTone('success', audioSettings.volume);
      setFeedback(`Ouvido atento! Você escolheu ${pair.target.word}!`);
      onWin();
      window.setTimeout(() => {
        setFeedback(null);
        setIdx((p) => p + 1);
      }, 1200);
    } else {
      playFeedbackTone('tryAgain', audioSettings.volume);
      setFeedback(`Essa palavra é ${chosen.word}. Ouça mais uma vez!`);
    }
  };

  return (
    <div className="space-y-6 text-center max-w-xl mx-auto">
      <h2 className="text-2xl font-extrabold text-slate-900">Ouça e escolha a imagem correta</h2>
      <button
        type="button"
        onClick={() => speakPtBr(pair.target.word, audioSettings)}
        className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-6 py-3.5 text-base font-bold text-white min-h-[48px]"
      >
        <Volume2 className="w-5 h-5" aria-hidden="true" />
        Ouvir palavra
      </button>
      <div className="grid grid-cols-2 gap-4">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => pick(opt)}
            className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-6 flex flex-col items-center gap-3 hover:border-sky-400 hover:bg-sky-50 transition"
          >
            <IllustratedArt artKey={opt.id} label={opt.word} size={108} />
            <span className="text-lg font-bold text-slate-900">{opt.word}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const PHRASE_CHALLENGES = [
  { words: ['Eu', 'quero', 'água'], hint: 'Pedido para matar a sede' },
  { words: ['O', 'gato', 'faz', 'miau'], hint: 'Frase sobre o gatinho' },
  { words: ['Bom', 'dia', 'mamãe'], hint: 'Cumprimento da manhã' },
];

const BuildPhraseGame: React.FC<SubGameProps> = ({ audioSettings, onWin, setFeedback }) => {
  const [idx, setIdx] = useState(0);
  const challenge = PHRASE_CHALLENGES[idx % PHRASE_CHALLENGES.length];
  const shuffled = useMemo(
    () => [...challenge.words].sort(() => Math.random() - 0.5),
    [challenge]
  );
  const [selectedWords, setSelectedWords] = useState<string[]>([]);

  const handleAddWord = (w: string) => {
    if (selectedWords.includes(w)) return;
    const next = [...selectedWords, w];
    setSelectedWords(next);
    speakPtBr(w, audioSettings);

    if (next.length === challenge.words.length) {
      if (next.join(' ') === challenge.words.join(' ')) {
        playFeedbackTone('success', audioSettings.volume);
        setFeedback(`Frase montada: "${next.join(' ')}"!`);
        speakPtBr(next.join(' '), audioSettings);
        onWin();
        window.setTimeout(() => {
          setFeedback(null);
          setSelectedWords([]);
          setIdx((p) => p + 1);
        }, 1500);
      } else {
        playFeedbackTone('tryAgain', audioSettings.volume);
        setFeedback('Quase lá! Vamos tentar colocar as palavras em outra ordem.');
        window.setTimeout(() => setSelectedWords([]), 1000);
      }
    }
  };

  return (
    <div className="space-y-6 text-center max-w-xl mx-auto">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900">Monte a frase na ordem certa</h2>
        <p className="text-sm text-slate-600 mt-1">{challenge.hint}</p>
      </div>
      <button
        type="button"
        onClick={() => speakPtBr(challenge.words.join(' '), audioSettings)}
        className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white min-h-[44px]"
      >
        <Volume2 className="w-4 h-4" aria-hidden="true" />
        Ouvir frase modelo
      </button>

      <div className="min-h-[64px] rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-3 flex flex-wrap items-center justify-center gap-2">
        {selectedWords.length === 0 ? (
          <span className="text-sm text-slate-400">Toque nas palavras abaixo na ordem</span>
        ) : (
          selectedWords.map((w, i) => (
            <span key={i} className="rounded-xl bg-sky-600 px-4 py-2 text-base font-bold text-white">
              {w}
            </span>
          ))
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {shuffled.map((w) => {
          const used = selectedWords.includes(w);
          return (
            <button
              key={w}
              type="button"
              disabled={used}
              onClick={() => handleAddWord(w)}
              className={`rounded-2xl border px-5 py-3 text-base font-bold transition min-h-[48px] ${
                used
                  ? 'bg-slate-100 border-slate-200 text-slate-400'
                  : 'bg-white border-slate-300 text-slate-900 hover:border-orange-400 hover:bg-orange-50'
              }`}
            >
              {w}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const MatchPairsGame: React.FC<SubGameProps> = ({ audioSettings, onWin, setFeedback }) => {
  const items = useMemo(() => FIRST_WORDS.slice(0, 4), []);
  const shuffledWords = useMemo(() => [...items].sort((a, b) => a.word.localeCompare(b.word)), [items]);
  const [selectedArt, setSelectedArt] = useState<string | null>(null);
  const [paired, setPaired] = useState<string[]>([]);

  const handleWordClick = (id: string, word: string) => {
    if (!selectedArt) {
      setFeedback('Primeiro toque em uma imagem à esquerda!');
      return;
    }
    if (selectedArt === id) {
      const next = [...paired, id];
      setPaired(next);
      setSelectedArt(null);
      playFeedbackTone('star', audioSettings.volume);
      speakPtBr(word, audioSettings);
      setFeedback(`Ligado! ${word}!`);
      if (next.length === items.length) {
        playFeedbackTone('success', audioSettings.volume);
        setFeedback('Parabéns! Todas as imagens foram ligadas às palavras!');
        onWin();
      }
    } else {
      playFeedbackTone('tryAgain', audioSettings.volume);
      setFeedback('Essa palavra é de outra imagem. Tente novamente!');
      setSelectedArt(null);
    }
  };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <p className="text-center text-sm font-semibold text-slate-600">
        1. Toque em uma imagem · 2. Toque na palavra correspondente
      </p>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          {items.map((item) => {
            const done = paired.includes(item.id);
            const active = selectedArt === item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={done}
                onClick={() => {
                  setSelectedArt(item.id);
                  playFeedbackTone('click', audioSettings.volume);
                }}
                className={`w-full rounded-2xl border p-3 flex items-center justify-center transition ${
                  done
                    ? 'bg-emerald-50 border-emerald-200 opacity-60'
                    : active
                    ? 'bg-sky-50 border-sky-500 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-sky-300'
                }`}
              >
                <IllustratedArt artKey={item.id} label={item.word} size={64} />
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          {shuffledWords.map((item) => {
            const done = paired.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                disabled={done}
                onClick={() => handleWordClick(item.id, item.word)}
                className={`w-full rounded-2xl border p-4 min-h-[88px] flex items-center justify-center gap-2 text-lg font-extrabold transition ${
                  done
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-900 hover:border-emerald-400 hover:bg-emerald-50'
                }`}
              >
                {done && <CheckCircle2 className="w-5 h-5" aria-hidden="true" />}
                <span>{item.word}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const RIDDLES = [
  { id: 'sol', word: 'Sol', clue: 'Brilho amarelo no céu durante o dia e aqueço as plantas.', options: ['sol', 'lua', 'bola'] },
  { id: 'agua', word: 'Água', clue: 'Fico no copo e mato a sua sede todos os dias.', options: ['agua', 'pao', 'carro'] },
  { id: 'cachorro', word: 'Cachorro', clue: 'Sou um amigo peludo que abana o rabo e faz au-au.', options: ['cachorro', 'gato', 'pato'] },
];

const DiscoverObjectGame: React.FC<SubGameProps> = ({ audioSettings, onWin, setFeedback }) => {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const riddle = RIDDLES[idx % RIDDLES.length];

  const handleGuess = (id: string) => {
    if (id === riddle.id) {
      setRevealed(true);
      playFeedbackTone('success', audioSettings.volume);
      setFeedback(`Acertou! É ${riddle.word}!`);
      speakPtBr(`Acertou! É ${riddle.word}!`, audioSettings);
      onWin();
      window.setTimeout(() => {
        setRevealed(false);
        setFeedback(null);
        setIdx((p) => p + 1);
      }, 1600);
    } else {
      playFeedbackTone('tryAgain', audioSettings.volume);
      setFeedback('Ainda não é esse! Ouça a pista de novo.');
    }
  };

  return (
    <div className="space-y-6 text-center max-w-2xl mx-auto">
      <div className="mx-auto w-32 h-32 rounded-3xl border border-indigo-200 bg-indigo-50 flex items-center justify-center">
        {revealed ? (
          <IllustratedArt artKey={riddle.id} label={riddle.word} size={108} />
        ) : (
          <span className="text-5xl font-extrabold text-indigo-400 font-display">?</span>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-extrabold text-slate-900">“{riddle.clue}”</h2>
        <button
          type="button"
          onClick={() => speakPtBr(riddle.clue, audioSettings)}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white min-h-[44px]"
        >
          <Volume2 className="w-4 h-4" aria-hidden="true" />
          Ouvir pista
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {riddle.options.map((optId) => {
          const item = FIRST_WORDS.find((w) => w.id === optId);
          const label = item?.word || optId;
          return (
            <button
              key={optId}
              type="button"
              onClick={() => handleGuess(optId)}
              className="rounded-3xl border-2 border-slate-200 bg-slate-50 p-5 flex flex-col items-center gap-2 hover:border-indigo-400 hover:bg-indigo-50 transition"
            >
              <IllustratedArt artKey={optId} label={label} size={88} />
              <span className="text-base font-bold text-slate-900">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

interface ScrambleWordItem {
  word: string;
  letters: string;
  artKey: string;
  hint: string;
}

const SCRAMBLE_BANK: Record<GameDifficulty, ScrambleWordItem[]> = {
  facil: [
    { word: 'Casa', letters: 'CASA', artKey: 'casa', hint: 'Lugar onde moramos com a família' },
    { word: 'Bola', letters: 'BOLA', artKey: 'bola', hint: 'Brinquedo redondo para chutar' },
    { word: 'Pato', letters: 'PATO', artKey: 'pato', hint: 'Bichinho amarelo que faz quá-quá' },
    { word: 'Gato', letters: 'GATO', artKey: 'gato', hint: 'Faz miau e adora carinho' },
    { word: 'Sol', letters: 'SOL', artKey: 'sol', hint: 'Brilha bem forte no céu de dia' },
    { word: 'Lua', letters: 'LUA', artKey: 'lua', hint: 'Aparece no céu à noite' },
    { word: 'Uva', letters: 'UVA', artKey: 'uva', hint: 'Frutinha roxa em cachos' },
    { word: 'Ovo', letters: 'OVO', artKey: 'ovo', hint: 'Alimento branquinho com gema amarela' },
    { word: 'Dado', letters: 'DADO', artKey: 'dado', hint: 'Cubinho com pontinhos para brincar' },
    { word: 'Vaca', letters: 'VACA', artKey: 'vaca', hint: 'Faz muuu na fazenda' },
    { word: 'Foca', letters: 'FOCA', artKey: 'foca', hint: 'Bichinho que adora nadar no mar' },
    { word: 'Sapo', letters: 'SAPO', artKey: 'sapo', hint: 'Pula na lagoa fazendo croac' },
  ],
  medio: [
    { word: 'Livro', letters: 'LIVRO', artKey: 'livro', hint: 'Tem histórias e páginas para ler' },
    { word: 'Peixe', letters: 'PEIXE', artKey: 'peixe', hint: 'Nada rapidinho na água' },
    { word: 'Tigre', letters: 'TIGRE', artKey: 'tigre', hint: 'Felino listrado da selva' },
    { word: 'Zebra', letters: 'ZEBRA', artKey: 'zebra', hint: 'Tem listras pretas e brancas' },
    { word: 'Porta', letters: 'PORTA', artKey: 'porta', hint: 'Abrimos para entrar em casa' },
    { word: 'Chave', letters: 'CHAVE', artKey: 'chave', hint: 'Usada para abrir a porta' },
    { word: 'Carro', letters: 'CARRO', artKey: 'carro', hint: 'Anda com quatro rodas na rua' },
    { word: 'Macaco', letters: 'MACACO', artKey: 'macaco', hint: 'Adora pular nas árvores e comer banana' },
    { word: 'Banana', letters: 'BANANA', artKey: 'banana', hint: 'Fruta amarela bem docinha' },
    { word: 'Boneca', letters: 'BONECA', artKey: 'boneca', hint: 'Brinquedo querido para brincar de casinha' },
    { word: 'Sapato', letters: 'SAPATO', artKey: 'sapato', hint: 'Calçado para proteger os pés' },
    { word: 'Coruja', letters: 'CORUJA', artKey: 'coruja', hint: 'Ave sabida que faz uhu-uhu' },
  ],
  dificil: [
    { word: 'Abacaxi', letters: 'ABACAXI', artKey: 'abacaxi', hint: 'Fruta amarela com coroa verde' },
    { word: 'Morango', letters: 'MORANGO', artKey: 'morango', hint: 'Frutinha vermelha com pontinhos' },
    { word: 'Cenoura', letters: 'CENOURA', artKey: 'cenoura', hint: 'Legume laranja que o coelho adora' },
    { word: 'Galinha', letters: 'GALINHA', artKey: 'galinha', hint: 'Faz có-có-có no galinheiro' },
    { word: 'Mochila', letters: 'MOCHILA', artKey: 'mochila', hint: 'Levamos nas costas para a escola' },
    { word: 'Elefante', letters: 'ELEFANTE', artKey: 'elefante', hint: 'Animal grande com tromba comprida' },
    { word: 'Cachorro', letters: 'CACHORRO', artKey: 'cachorro', hint: 'Melhor amigo que faz au-au' },
    { word: 'Papagaio', letters: 'PAPAGAIO', artKey: 'papagaio', hint: 'Ave verdinha que imita palavras' },
    { word: 'Telefone', letters: 'TELEFONE', artKey: 'telefone', hint: 'Aparelho para falar e mandar recados' },
    { word: 'Borboleta', letters: 'BORBOLETA', artKey: 'borboleta', hint: 'Voa colorida pelas flores do jardim' },
  ],
};

interface LetterTile {
  uid: string;
  char: string;
}

function buildShuffledTiles(letters: string): LetterTile[] {
  const chars = letters.split('');
  const tiles = chars.map((char, i) => ({ uid: `${i}-${char}-${Math.random().toString(36).slice(2, 6)}`, char }));
  const uniqueCount = new Set(chars).size;
  let attempts = 0;
  do {
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    attempts++;
  } while (uniqueCount > 1 && tiles.map((t) => t.char).join('') === letters && attempts < 10);
  return tiles;
}

const ScrambleWordGame: React.FC<PersistedSubGameProps> = ({
  audioSettings,
  savedProgress,
  onSaveProgress,
  onWin,
  setFeedback,
}) => {
  const [difficulty, setDifficulty] = useState<GameDifficulty>(savedProgress?.difficulty || 'facil');
  const [idx, setIdx] = useState<number>(savedProgress?.lastIndex || 0);
  const [hits, setHits] = useState<number>(savedProgress?.hits || 0);
  const [attempts, setAttempts] = useState<number>(savedProgress?.attempts || 0);
  const [stars, setStars] = useState<number>(savedProgress?.stars || 0);

  const pool = SCRAMBLE_BANK[difficulty];
  const target = pool[idx % pool.length];

  const [tiles, setTiles] = useState<LetterTile[]>(() => buildShuffledTiles(target.letters));
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [completedRound, setCompletedRound] = useState(false);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  useEffect(() => {
    setTiles(buildShuffledTiles(target.letters));
    setSelectedUids([]);
    setCompletedRound(false);
    speakPtBr(target.word, audioSettings);
  }, [idx, difficulty]);

  const selectedTiles = useMemo(
    () => selectedUids.map((uid) => tiles.find((t) => t.uid === uid)).filter((t): t is LetterTile => Boolean(t)),
    [selectedUids, tiles]
  );

  const formedWord = selectedTiles.map((t) => t.char).join('');

  const handleDifficultyChange = (nextDiff: GameDifficulty) => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setFeedback(null);
    setDifficulty(nextDiff);
    setIdx(0);
    onSaveProgress({
      hits,
      attempts,
      stars,
      lastIndex: 0,
      difficulty: nextDiff,
    });
    playFeedbackTone('click', audioSettings.volume);
  };

  const handlePickTile = (tile: LetterTile) => {
    if (completedRound || selectedUids.includes(tile.uid)) return;
    playFeedbackTone('click', audioSettings.volume);

    const nextSelected = [...selectedUids, tile.uid];
    setSelectedUids(nextSelected);

    if (nextSelected.length === target.letters.length) {
      const assembled = nextSelected
        .map((uid) => tiles.find((t) => t.uid === uid)?.char || '')
        .join('');

      const nextAttempts = attempts + 1;

      if (assembled === target.letters) {
        const nextHits = hits + 1;
        const nextStars = stars + 1;
        const nextIdx = idx + 1;
        setCompletedRound(true);
        setHits(nextHits);
        setAttempts(nextAttempts);
        setStars(nextStars);

        onSaveProgress({
          hits: nextHits,
          attempts: nextAttempts,
          stars: nextStars,
          lastIndex: nextIdx,
          difficulty,
        });

        playFeedbackTone('success', audioSettings.volume);
        setFeedback(`Parabéns! Você formou a palavra ${target.word}!`);
        speakPtBr(target.word, audioSettings);
        onWin();

        timerRef.current = window.setTimeout(() => {
          setFeedback(null);
          setIdx(nextIdx);
        }, 1700);
      } else {
        setAttempts(nextAttempts);
        onSaveProgress({
          hits,
          attempts: nextAttempts,
          stars,
          lastIndex: idx,
          difficulty,
        });
        playFeedbackTone('tryAgain', audioSettings.volume);
        setFeedback(`Você formou ${assembled}. Que tal ouvir ${target.word} e tentar outra ordem?`);
        speakPtBr(target.word, audioSettings);
      }
    }
  };

  const handleBackspace = () => {
    if (completedRound || selectedUids.length === 0) return;
    playFeedbackTone('click', audioSettings.volume);
    setSelectedUids((prev) => prev.slice(0, -1));
    setFeedback(null);
  };

  const handleReshuffle = () => {
    if (completedRound) return;
    playFeedbackTone('click', audioSettings.volume);
    setTiles(buildShuffledTiles(target.letters));
    setSelectedUids([]);
    setFeedback(null);
  };

  return (
    <div className="space-y-6 text-center max-w-2xl mx-auto">
      {/* Top Controls Bar: Difficulty + Score */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 border border-slate-200 p-3">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Nível de dificuldade">
          {(['facil', 'medio', 'dificil'] as GameDifficulty[]).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => handleDifficultyChange(lvl)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition min-h-[36px] ${
                difficulty === lvl
                  ? 'bg-rose-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-rose-50'
              }`}
            >
              {DIFFICULTY_LABELS[lvl]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs font-bold tabular-nums">
          <span className="rounded-xl bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-emerald-800">
            Palavras: {hits}/{attempts}
          </span>
          <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 border border-amber-200 px-2.5 py-1 text-amber-800">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" aria-hidden="true" />
            {stars}
          </span>
        </div>
      </div>

      {/* Image Hint & Audio */}
      <div className="space-y-3">
        <IllustratedArt artKey={target.artKey} label={target.word} size={118} className="mx-auto" />
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">Organize as letras para formar a palavra</h2>
          <p className="text-sm text-slate-600 mt-1">Dica: {target.hint}</p>
        </div>

        <button
          type="button"
          onClick={() => speakPtBr(target.word, audioSettings)}
          className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-700 transition min-h-[44px]"
        >
          <Volume2 className="w-4 h-4" aria-hidden="true" />
          <span>Ouvir novamente</span>
        </button>
      </div>

      {/* Answer Slots */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 min-h-[68px] rounded-3xl border-2 border-dashed border-rose-200 bg-rose-50/40 p-4">
        {target.letters.split('').map((_, slotIdx) => {
          const tile = selectedTiles[slotIdx];
          return (
            <div
              key={slotIdx}
              className={`w-12 h-14 sm:w-14 sm:h-16 rounded-2xl border-2 flex items-center justify-center text-2xl sm:text-3xl font-extrabold font-display transition ${
                tile
                  ? completedRound
                    ? 'border-emerald-500 bg-emerald-100 text-emerald-900'
                    : 'border-rose-400 bg-white text-slate-900 shadow-xs'
                  : 'border-slate-300 bg-white/60 text-slate-300'
              }`}
            >
              {tile ? tile.char : ''}
            </div>
          );
        })}
      </div>

      {formedWord && (
        <div className="text-sm font-bold text-slate-600">
          Palavra formada até agora: <span className="text-rose-700 tracking-wider">{formedWord}</span>
        </div>
      )}

      {/* Shuffled Letter Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {tiles.map((tile) => {
          const used = selectedUids.includes(tile.uid);
          return (
            <button
              key={tile.uid}
              type="button"
              disabled={used || completedRound}
              onClick={() => handlePickTile(tile)}
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 text-2xl sm:text-3xl font-extrabold font-display transition ${
                used
                  ? 'border-slate-200 bg-slate-100 text-slate-300'
                  : 'border-rose-200 bg-white text-slate-900 hover:border-rose-400 hover:bg-rose-50 active:scale-95 shadow-xs'
              }`}
            >
              {tile.char}
            </button>
          );
        })}
      </div>

      {/* Action Buttons: Apagar última letra & Embaralhar novamente */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        <button
          type="button"
          onClick={handleBackspace}
          disabled={selectedUids.length === 0 || completedRound}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 min-h-[44px]"
        >
          <Delete className="w-4 h-4 text-rose-600" aria-hidden="true" />
          <span>Apagar última letra</span>
        </button>

        <button
          type="button"
          onClick={handleReshuffle}
          disabled={completedRound}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 min-h-[44px]"
        >
          <Shuffle className="w-4 h-4 text-sky-600" aria-hidden="true" />
          <span>Embaralhar novamente</span>
        </button>
      </div>
    </div>
  );
};

const SpecialPhonemeGame: React.FC<
  PersistedSubGameProps & { rounds: PremiumPhonemeRound[] }
> = ({ audioSettings, rounds, savedProgress, onSaveProgress, onWin, setFeedback }) => {
  const [idx, setIdx] = useState<number>(savedProgress?.lastIndex || 0);
  const [hits, setHits] = useState<number>(savedProgress?.hits || 0);
  const [attempts, setAttempts] = useState<number>(savedProgress?.attempts || 0);
  const [stars, setStars] = useState<number>(savedProgress?.stars || 0);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const round = rounds[idx % rounds.length];

  useEffect(() => {
    speakPtBr(`${round.prompt} ${round.spokenHint}`, audioSettings);
  }, [idx]);

  const handleChoose = (optWord: string) => {
    if (locked) return;
    const nextAttempts = attempts + 1;
    if (optWord === round.correctWord) {
      setLocked(true);
      const nextHits = hits + 1;
      const nextStars = stars + 1;
      const nextIdx = idx + 1;
      setHits(nextHits);
      setAttempts(nextAttempts);
      setStars(nextStars);
      onSaveProgress({
        hits: nextHits,
        attempts: nextAttempts,
        stars: nextStars,
        lastIndex: nextIdx,
        difficulty: 'medio',
      });
      playFeedbackTone('success', audioSettings.volume);
      setFeedback(`Excelente! ${round.correctWord} tem o som ${round.targetPhoneme}!`);
      speakPtBr(`Muito bem! ${round.correctWord}!`, audioSettings);
      onWin();
      timerRef.current = window.setTimeout(() => {
        setLocked(false);
        setFeedback(null);
        setIdx(nextIdx);
      }, 1500);
    } else {
      setAttempts(nextAttempts);
      onSaveProgress({
        hits,
        attempts: nextAttempts,
        stars,
        lastIndex: idx,
        difficulty: 'medio',
      });
      playFeedbackTone('tryAgain', audioSettings.volume);
      setFeedback(`Essa palavra é ${optWord}. Ouça a dica do som ${round.targetPhoneme}!`);
      speakPtBr(round.spokenHint, audioSettings);
    }
  };

  return (
    <div className="space-y-6 text-center max-w-2xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-900">
          <Crown className="w-4 h-4 text-amber-600" aria-hidden="true" />
          <span>Fonema Especial: {round.targetPhoneme}</span>
        </span>
        <span className="text-xs font-bold text-amber-900 tabular-nums">
          Acertos: {hits}/{attempts} · {stars} ★
        </span>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-900">{round.prompt}</h2>
        <p className="text-sm text-slate-600">{round.spokenHint}</p>
        <button
          type="button"
          onClick={() => speakPtBr(`${round.prompt} ${round.spokenHint}`, audioSettings)}
          className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 hover:bg-amber-600 px-5 py-2.5 text-sm font-bold text-white min-h-[44px]"
        >
          <Volume2 className="w-4 h-4" aria-hidden="true" />
          <span>Ouvir pista do som</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {round.options.map((opt) => (
          <button
            key={opt.word}
            type="button"
            disabled={locked}
            onClick={() => handleChoose(opt.word)}
            className="rounded-3xl border-2 border-amber-200 bg-[#FFFDF7] p-5 flex flex-col items-center gap-3 hover:border-orange-400 hover:bg-amber-50 transition"
          >
            <IllustratedArt artKey={opt.artKey} label={opt.word} size={96} />
            <span className="text-lg font-extrabold text-slate-900">{opt.word}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

const RhymeHuntGame: React.FC<
  PersistedSubGameProps & { rounds: PremiumRhymeRound[] }
> = ({ audioSettings, rounds, savedProgress, onSaveProgress, onWin, setFeedback }) => {
  const [idx, setIdx] = useState<number>(savedProgress?.lastIndex || 0);
  const [hits, setHits] = useState<number>(savedProgress?.hits || 0);
  const [attempts, setAttempts] = useState<number>(savedProgress?.attempts || 0);
  const [stars, setStars] = useState<number>(savedProgress?.stars || 0);
  const [locked, setLocked] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const round = rounds[idx % rounds.length];

  useEffect(() => {
    speakPtBr(`Qual palavra rima com ${round.baseWord}?`, audioSettings);
  }, [idx]);

  const handleChoose = (optWord: string) => {
    if (locked) return;
    const nextAttempts = attempts + 1;
    if (optWord === round.correctRhyme) {
      setLocked(true);
      const nextHits = hits + 1;
      const nextStars = stars + 1;
      const nextIdx = idx + 1;
      setHits(nextHits);
      setAttempts(nextAttempts);
      setStars(nextStars);
      onSaveProgress({
        hits: nextHits,
        attempts: nextAttempts,
        stars: nextStars,
        lastIndex: nextIdx,
        difficulty: 'facil',
      });
      playFeedbackTone('success', audioSettings.volume);
      setFeedback(`Rima perfeita! ${round.tip}`);
      speakPtBr(`Acertou! ${round.baseWord} rima com ${round.correctRhyme}!`, audioSettings);
      onWin();
      timerRef.current = window.setTimeout(() => {
        setLocked(false);
        setFeedback(null);
        setIdx(nextIdx);
      }, 1500);
    } else {
      setAttempts(nextAttempts);
      onSaveProgress({
        hits,
        attempts: nextAttempts,
        stars,
        lastIndex: idx,
        difficulty: 'facil',
      });
      playFeedbackTone('tryAgain', audioSettings.volume);
      setFeedback(`${optWord} tem outro final. Ouça o som final de ${round.baseWord}!`);
      speakPtBr(`${round.baseWord} e ${optWord}. Vamos tentar outra rima!`, audioSettings);
    }
  };

  return (
    <div className="space-y-6 text-center max-w-2xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-orange-50 border border-orange-200 px-4 py-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-orange-900">
          <Crown className="w-4 h-4 text-orange-600" aria-hidden="true" />
          <span>Caça às Rimas · FalaKids Premium</span>
        </span>
        <span className="text-xs font-bold text-orange-900 tabular-nums">
          Acertos: {hits}/{attempts} · {stars} ★
        </span>
      </div>

      <div className="space-y-3">
        <IllustratedArt artKey={round.baseArtKey} label={round.baseWord} size={108} className="mx-auto" />
        <h2 className="text-2xl font-extrabold text-slate-900">
          Qual palavra rima com <span className="text-orange-600">{round.baseWord}</span>?
        </h2>
        <button
          type="button"
          onClick={() => speakPtBr(`Qual palavra rima com ${round.baseWord}?`, audioSettings)}
          className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 hover:bg-orange-700 px-5 py-2.5 text-sm font-bold text-white min-h-[44px]"
        >
          <Volume2 className="w-4 h-4" aria-hidden="true" />
          <span>Ouvir palavra</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {round.options.map((opt) => (
          <button
            key={opt.word}
            type="button"
            disabled={locked}
            onClick={() => handleChoose(opt.word)}
            className="rounded-3xl border-2 border-orange-200 bg-[#FFFDF7] p-5 flex flex-col items-center gap-3 hover:border-orange-400 hover:bg-orange-50 transition"
          >
            <IllustratedArt artKey={opt.artKey} label={opt.word} size={96} />
            <span className="text-lg font-extrabold text-slate-900">{opt.word}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

