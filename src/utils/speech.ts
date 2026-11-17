import { AudioSettings } from '../types/app';

let audioCtx: AudioContext | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesListenerAttached = false;

function refreshVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    cachedVoices = voices;
  }
  return cachedVoices;
}

function attachVoicesListener(): void {
  if (voicesListenerAttached || typeof window === 'undefined' || !window.speechSynthesis) return;
  voicesListenerAttached = true;
  refreshVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    refreshVoices();
  });
}

function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new Ctx();
  }
  return audioCtx;
}

function withRunningAudioContext(fn: (ctx: AudioContext) => void): void {
  const ctx = getOrCreateAudioContext();
  if (!ctx) return;

  if (ctx.state === 'running') {
    try {
      fn(ctx);
    } catch {
      // Ignore Web Audio transient errors
    }
    return;
  }

  ctx
    .resume()
    .then(() => {
      if (ctx.state === 'running') {
        try {
          fn(ctx);
        } catch {
          // Ignore Web Audio transient errors
        }
      }
    })
    .catch(() => {
      // Browser blocked audio context before user gesture
    });
}

export function unlockAudioEngine(): void {
  const ctx = getOrCreateAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    attachVoicesListener();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }
}

export function playFeedbackTone(
  type: 'star' | 'success' | 'click' | 'tryAgain' | 'tongueClick',
  volume = 0.7
): void {
  const safeVol = Math.min(1, Math.max(0, volume));
  if (safeVol <= 0) return;

  withRunningAudioContext((ctx) => {
    const now = ctx.currentTime + 0.01;
    const master = ctx.createGain();
    master.gain.value = Math.min(1, Math.max(0.06, safeVol * 0.35));
    master.connect(ctx.destination);

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.06);
      g.gain.setValueAtTime(0.4, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
      osc.connect(g).connect(master);
      osc.start(now);
      osc.stop(now + 0.08);
      return;
    }

    if (type === 'star' || type === 'success') {
      const notes = type === 'success' ? [523.25, 659.25, 783.99, 1046.5] : [587.33, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        const t = now + idx * 0.08;
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.6, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
        osc.connect(g).connect(master);
        osc.start(t);
        osc.stop(t + 0.3);
      });
      return;
    }

    if (type === 'tryAgain') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.linearRampToValueAtTime(290, now + 0.18);
      g.gain.setValueAtTime(0.35, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(g).connect(master);
      osc.start(now);
      osc.stop(now + 0.24);
      return;
    }

    if (type === 'tongueClick') {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.045);
      g.gain.setValueAtTime(0.9, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
      osc.connect(g).connect(master);
      osc.start(now);
      osc.stop(now + 0.06);
    }
  });
}

export function playAnimalSynth(animalId: string, volume = 0.8): void {
  const safeVol = Math.min(1, Math.max(0, volume));
  if (safeVol <= 0) return;

  withRunningAudioContext((ctx) => {
    const now = ctx.currentTime + 0.015;
    const master = ctx.createGain();
    master.gain.value = Math.min(1, Math.max(0.08, safeVol * 0.45));
    master.connect(ctx.destination);

    switch (animalId) {
      case 'cachorro': {
        [0, 0.23].forEach((offset) => {
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const g = ctx.createGain();
          osc.type = 'sawtooth';
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(950, now + offset);
          osc.frequency.setValueAtTime(280, now + offset);
          osc.frequency.exponentialRampToValueAtTime(145, now + offset + 0.14);
          g.gain.setValueAtTime(0.01, now + offset);
          g.gain.linearRampToValueAtTime(0.55, now + offset + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.16);
          osc.connect(filter).connect(g).connect(master);
          osc.start(now + offset);
          osc.stop(now + offset + 0.18);
        });
        break;
      }
      case 'gato': {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.linearRampToValueAtTime(860, now + 0.18);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.52);
        g.gain.setValueAtTime(0.01, now);
        g.gain.linearRampToValueAtTime(0.6, now + 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.54);
        osc.connect(g).connect(master);
        osc.start(now);
        osc.stop(now + 0.56);
        break;
      }
      case 'vaca': {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(620, now);
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(160, now + 0.25);
        osc.frequency.linearRampToValueAtTime(125, now + 0.65);
        g.gain.setValueAtTime(0.01, now);
        g.gain.linearRampToValueAtTime(0.5, now + 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.68);
        osc.connect(filter).connect(g).connect(master);
        osc.start(now);
        osc.stop(now + 0.7);
        break;
      }
      case 'pato': {
        [0, 0.22].forEach((offset) => {
          const osc = ctx.createOscillator();
          const filter = ctx.createBiquadFilter();
          const g = ctx.createGain();
          osc.type = 'square';
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(1100, now + offset);
          filter.Q.setValueAtTime(2.5, now + offset);
          osc.frequency.setValueAtTime(420, now + offset);
          osc.frequency.exponentialRampToValueAtTime(280, now + offset + 0.14);
          g.gain.setValueAtTime(0.01, now + offset);
          g.gain.linearRampToValueAtTime(0.45, now + offset + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.16);
          osc.connect(filter).connect(g).connect(master);
          osc.start(now + offset);
          osc.stop(now + offset + 0.18);
        });
        break;
      }
      case 'galinha': {
        [0, 0.15, 0.3].forEach((offset, idx) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(idx === 2 ? 720 : 540, now + offset);
          osc.frequency.exponentialRampToValueAtTime(360, now + offset + 0.09);
          g.gain.setValueAtTime(0.5, now + offset);
          g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
          osc.connect(g).connect(master);
          osc.start(now + offset);
          osc.stop(now + offset + 0.11);
        });
        break;
      }
      case 'leao': {
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(750, now);
        osc.frequency.setValueAtTime(185, now);
        osc.frequency.exponentialRampToValueAtTime(78, now + 0.6);
        g.gain.setValueAtTime(0.01, now);
        g.gain.linearRampToValueAtTime(0.65, now + 0.09);
        g.gain.exponentialRampToValueAtTime(0.001, now + 0.64);
        osc.connect(filter).connect(g).connect(master);
        osc.start(now);
        osc.stop(now + 0.66);
        break;
      }
      case 'cavalo': {
        [0, 0.14, 0.3, 0.44].forEach((offset, i) => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(i % 2 === 0 ? 520 : 390, now + offset);
          osc.frequency.exponentialRampToValueAtTime(175, now + offset + 0.065);
          g.gain.setValueAtTime(0.6, now + offset);
          g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.075);
          osc.connect(g).connect(master);
          osc.start(now + offset);
          osc.stop(now + offset + 0.085);
        });
        break;
      }
      default:
        playFeedbackTone('click', safeVol);
    }
  });
}

let activeAnimalAudio: HTMLAudioElement | null = null;
let animalAudioGeneration = 0;

export function stopAnimalAudio(): void {
  animalAudioGeneration += 1;
  if (activeAnimalAudio) {
    try {
      activeAnimalAudio.pause();
      activeAnimalAudio.currentTime = 0;
    } catch {
      // Ignore cleanup error
    }
    activeAnimalAudio = null;
  }
}

export function playAnimalAudio(
  audioSrc: string | undefined,
  animalId: string,
  volume = 0.8,
  onEnd?: () => void
): void {
  const safeVol = Math.min(1, Math.max(0, volume));
  stopAnimalAudio();
  const currentGen = animalAudioGeneration;

  if (safeVol <= 0) {
    if (onEnd) {
      window.setTimeout(() => {
        if (animalAudioGeneration === currentGen) onEnd();
      }, 300);
    }
    return;
  }

  if (!audioSrc || typeof Audio === 'undefined') {
    playAnimalSynth(animalId, safeVol);
    if (onEnd) {
      window.setTimeout(() => {
        if (animalAudioGeneration === currentGen) onEnd();
      }, 900);
    }
    return;
  }

  try {
    const audio = new Audio(audioSrc);
    audio.volume = safeVol;
    audio.preload = 'auto';
    activeAnimalAudio = audio;

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      if (activeAnimalAudio === audio) {
        activeAnimalAudio = null;
      }
      if (animalAudioGeneration === currentGen) {
        onEnd?.();
      }
    };

    audio.addEventListener('ended', finish, { once: true });
    audio.addEventListener(
      'error',
      () => {
        if (animalAudioGeneration !== currentGen) return;
        playAnimalSynth(animalId, safeVol);
        window.setTimeout(finish, 900);
      },
      { once: true }
    );

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        if (animalAudioGeneration !== currentGen) return;
        playAnimalSynth(animalId, safeVol);
        window.setTimeout(finish, 900);
      });
    }
  } catch {
    playAnimalSynth(animalId, safeVol);
    if (onEnd) {
      window.setTimeout(() => {
        if (animalAudioGeneration === currentGen) onEnd();
      }, 900);
    }
  }
}

type SubtitleListener = (text: string | null) => void;
const subtitleListeners = new Set<SubtitleListener>();
let subtitleClearTimeout: number | null = null;
let queuedSpeakTimeout: number | null = null;
let fallbackToneTimeout: number | null = null;
let speakGeneration = 0;
// Keep strong reference to active utterance to prevent Chromium GC from cutting off speech/onend
let activeUtteranceRef: SpeechSynthesisUtterance | null = null;

export function subscribeSubtitles(listener: SubtitleListener): () => void {
  subtitleListeners.add(listener);
  return () => subtitleListeners.delete(listener);
}

function emitSubtitle(text: string | null) {
  subtitleListeners.forEach((fn) => fn(text));
}

function clearSpeechTimers(): void {
  if (subtitleClearTimeout !== null) {
    window.clearTimeout(subtitleClearTimeout);
    subtitleClearTimeout = null;
  }
  if (queuedSpeakTimeout !== null) {
    window.clearTimeout(queuedSpeakTimeout);
    queuedSpeakTimeout = null;
  }
  if (fallbackToneTimeout !== null) {
    window.clearTimeout(fallbackToneTimeout);
    fallbackToneTimeout = null;
  }
}

function pickPortugueseVoice(): SpeechSynthesisVoice | null {
  const voices = refreshVoices();
  if (!voices.length) return null;
  return (
    voices.find(
      (v) =>
        v.lang.toLowerCase() === 'pt-br' &&
        /google|luciana|maria|daniel|francisca|fernanda|thalita|antonio/i.test(v.name)
    ) ||
    voices.find((v) => v.lang.toLowerCase() === 'pt-br') ||
    voices.find((v) => v.lang.toLowerCase().startsWith('pt')) ||
    null
  );
}

export interface SpeakOptions {
  rateOverride?: number;
  skipFallbackTone?: boolean;
  onEnd?: () => void;
  onStart?: () => void;
}

export function stopSpeaking(): void {
  speakGeneration += 1;
  clearSpeechTimers();
  activeUtteranceRef = null;
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
    } catch {
      // Ignore cancel errors in restricted sandboxes
    }
  }
  emitSubtitle(null);
}

export function speakPtBr(
  text: string,
  settings: AudioSettings,
  options?: SpeakOptions
): void {
  if (!text.trim()) return;

  unlockAudioEngine();
  speakGeneration += 1;
  const currentGen = speakGeneration;
  clearSpeechTimers();

  const safeVolume = Math.min(1, Math.max(0, settings.volume));
  const safeRate = Math.min(2, Math.max(0.5, options?.rateOverride ?? settings.rate));

  emitSubtitle(settings.subtitlesEnabled ? text : null);

  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (!options?.skipFallbackTone && safeVolume > 0) {
      playFeedbackTone('click', safeVolume);
    }
    options?.onStart?.();
    subtitleClearTimeout = window.setTimeout(() => {
      if (speakGeneration !== currentGen) return;
      emitSubtitle(null);
      options?.onEnd?.();
    }, Math.max(1400, text.length * 65));
    return;
  }

  const synth = window.speechSynthesis;
  const needsCancel = synth.speaking || synth.pending;

  if (needsCancel) {
    try {
      synth.cancel();
    } catch {
      // Ignore cancel failure
    }
  }

  const startUtterance = () => {
    if (speakGeneration !== currentGen) return;

    const utterance = new SpeechSynthesisUtterance(text);
    activeUtteranceRef = utterance;
    utterance.lang = 'pt-BR';
    utterance.rate = safeRate;
    utterance.volume = safeVolume;
    utterance.pitch = 1.08;

    const voice = pickPortugueseVoice();
    if (voice) {
      utterance.voice = voice;
    }

    let started = false;
    let settled = false;

    const finish = () => {
      if (settled || speakGeneration !== currentGen) return;
      settled = true;
      if (activeUtteranceRef === utterance) {
        activeUtteranceRef = null;
      }
      clearSpeechTimers();
      emitSubtitle(null);
      options?.onEnd?.();
    };

    utterance.onstart = () => {
      if (speakGeneration !== currentGen) return;
      started = true;
      if (fallbackToneTimeout !== null) {
        window.clearTimeout(fallbackToneTimeout);
        fallbackToneTimeout = null;
      }
      options?.onStart?.();
    };

    utterance.onend = finish;
    utterance.onerror = () => {
      if (speakGeneration !== currentGen) return;
      if (!started && !options?.skipFallbackTone && safeVolume > 0) {
        playFeedbackTone('click', safeVolume * 0.7);
      }
      // Keep subtitle visible briefly if speech errored instantly
      window.setTimeout(finish, started ? 0 : 1200);
    };

    try {
      if (synth.paused) {
        synth.resume();
      }
      synth.speak(utterance);

      // If browser has no TTS voices or blocks speech silently, play a gentle chime fallback
      fallbackToneTimeout = window.setTimeout(() => {
        if (speakGeneration !== currentGen || started || settled) return;
        options?.onStart?.();
        if (!options?.skipFallbackTone && safeVolume > 0) {
          playFeedbackTone('click', safeVolume * 0.7);
        }
      }, 420);

      // Safety cap so subtitles & story narration never stall
      const estimatedMs = Math.max(2000, Math.round((text.length * 90) / safeRate) + 1200);
      subtitleClearTimeout = window.setTimeout(finish, estimatedMs);
    } catch {
      if (!options?.skipFallbackTone && safeVolume > 0) {
        playFeedbackTone('click', safeVolume);
      }
      options?.onStart?.();
      subtitleClearTimeout = window.setTimeout(finish, 1400);
    }
  };

  // Chromium silently drops utterances spoken synchronously in the same tick right after cancel()
  if (needsCancel) {
    queuedSpeakTimeout = window.setTimeout(startUtterance, 40);
  } else {
    startUtterance();
  }
}
