import React, { useEffect, useMemo, useState } from 'react';
import {
  Gamepad2,
  RotateCcw,
  Sparkles,
  Star,
  Volume2,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { ALPHABET_ITEMS, ANIMAL_SOUNDS, FIRST_WORDS } from '../data/curriculum';
import { AudioSettings } from '../types/app';
import { IllustratedArt } from '../components/IllustratedArt';
import { playAnimalAudio, playFeedbackTone, speakPtBr, stopAnimalAudio } from '../utils/speech';

interface GamesHubViewProps {
  audioSettings: AudioSettings;
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
  | 'descubra-objeto';

const GAMES_LIST: {
  id: GameId;
  title: string;
  description: string;
  accent: string;
}[] = [
  { id: 'memoria', title: '1. Jogo da Memória', description: 'Encontre os pares de imagens iguais', accent: '#0284C7' },
  { id: 'encontre-imagem', title: '2. Encontre a Imagem', description: 'Ouça o nome e toque na figura certa', accent: '#EC4899' },
  { id: 'complete-palavra', title: '3. Complete a Palavra', description: 'Escolha a letra ou sílaba que falta', accent: '#F59E0B' },
  { id: 'qual-animal', title: '4. Qual é o Animal?', description: 'Ouça o som e descubra o bichinho', accent: '#10B981' },
  { id: 'acerte-letra', title: '5. Acerte a Letra', description: 'Descubra com qual letra a palavra começa', accent: '#8B5CF6' },
  { id: 'ouca-escolha', title: '6. Ouça e Escolha', description: 'Atenção aos sons parecidos', accent: '#0EA5E9' },
  { id: 'monte-frase', title: '7. Monte a Frase', description: 'Coloque as palavras na ordem correta', accent: '#F97316' },
  { id: 'ligue-imagem', title: '8. Ligue a Imagem à Palavra', description: 'Conecte cada desenho ao seu nome', accent: '#10B981' },
  { id: 'descubra-objeto', title: '9. Descubra o Objeto', description: 'Ouça as pistas para revelar o segredo', accent: '#6366F1' },
];

export const GamesHubView: React.FC<GamesHubViewProps> = ({
  audioSettings,
  onCompleteGame,
}) => {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const openGame = (g: (typeof GAMES_LIST)[number]) => {
    setFeedback(null);
    setActiveGame(g.id);
    playFeedbackTone('click', audioSettings.volume);
  };

  if (!activeGame) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Jogos Educativos</h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            Aprenda brincando! Cada acerto ganha estrelinhas e ninguém perde pontos ao tentar.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {GAMES_LIST.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => openGame(g)}
              className="rounded-3xl border border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50/40 p-6 text-left flex flex-col justify-between min-h-[156px] transition"
            >
              <div className="flex items-center justify-between">
                <div
                  className="w-11 h-11 rounded-2xl text-white flex items-center justify-center"
                  style={{ backgroundColor: g.accent }}
                >
                  <Gamepad2 className="w-5 h-5" aria-hidden="true" />
                </div>
              </div>

              <div className="mt-4">
                <h2 className="text-lg font-extrabold text-slate-900">{g.title}</h2>
                <p className="text-sm text-slate-600 mt-1">{g.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            setActiveGame(null);
            setFeedback(null);
          }}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Voltar aos jogos</span>
        </button>

        <span className="text-sm font-bold text-slate-800">
          {GAMES_LIST.find((x) => x.id === activeGame)?.title}
        </span>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8">
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

const HitLetterGame: React.FC<SubGameProps> = ({ audioSettings, onWin, setFeedback }) => {
  const [idx, setIdx] = useState(0);
  const target = ALPHABET_ITEMS[idx % ALPHABET_ITEMS.length];
  const choices = useMemo(() => {
    const others = ALPHABET_ITEMS.filter((x) => x.letter !== target.letter).slice(idx % 5, (idx % 5) + 3);
    return [target, ...others].sort((a, b) => a.letter.localeCompare(b.letter));
  }, [target, idx]);

  const handlePick = (chosen: (typeof ALPHABET_ITEMS)[number]) => {
    if (chosen.letter === target.letter) {
      playFeedbackTone('success', audioSettings.volume);
      setFeedback(`Isso mesmo! ${target.phrase}!`);
      speakPtBr(target.phrase, audioSettings);
      onWin();
      window.setTimeout(() => {
        setFeedback(null);
        setIdx((p) => p + 2);
      }, 1200);
    } else {
      playFeedbackTone('tryAgain', audioSettings.volume);
      setFeedback(`Essa é a letra ${chosen.letter}. Vamos tentar de novo!`);
    }
  };

  return (
    <div className="space-y-6 text-center max-w-2xl mx-auto">
      <IllustratedArt artKey={target.iconKey} label={target.exampleWord} size={112} className="mx-auto" />
      <h2 className="text-2xl font-extrabold text-slate-900">
        Qual é a primeira letra de <span className="text-violet-700">{target.exampleWord}</span>?
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {choices.map((c) => (
          <button
            key={c.letter}
            type="button"
            onClick={() => handlePick(c)}
            className="rounded-3xl border-2 border-slate-200 bg-violet-50/50 py-6 text-3xl font-extrabold font-display text-slate-900 hover:border-violet-400 hover:bg-violet-100 transition"
          >
            {c.letter}
          </button>
        ))}
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
