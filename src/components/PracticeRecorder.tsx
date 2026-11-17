import React, { useEffect, useRef, useState } from 'react';
import { Mic, Square, Play, Sparkles, CheckCircle2 } from 'lucide-react';
import { AudioSettings } from '../types/app';
import { playFeedbackTone, speakPtBr } from '../utils/speech';

interface PracticeRecorderProps {
  targetText: string;
  audioSettings: AudioSettings;
  onSuccess?: (transcript?: string) => void;
}

export const PracticeRecorder: React.FC<PracticeRecorderProps> = ({
  targetText,
  audioSettings,
  onSuccess,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [practicedDone, setPracticedDone] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [recordedUrl]);

  useEffect(() => {
    setPracticedDone(false);
    setStatusMessage(null);
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl);
      setRecordedUrl(null);
    }
  }, [targetText]);

  const startPractice = async () => {
    playFeedbackTone('click', audioSettings.volume);
    setStatusMessage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // Graceful fallback when microphone API is unavailable in sandboxed browsers
      setPracticedDone(true);
      setStatusMessage('Ótima tentativa! Continue repetindo em voz alta.');
      playFeedbackTone('star', audioSettings.volume);
      onSuccess?.();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const preferredMime =
        typeof MediaRecorder.isTypeSupported === 'function'
          ? ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/aac'].find((mime) =>
              MediaRecorder.isTypeSupported(mime)
            )
          : undefined;
      const recorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const detectedType = recorder.mimeType || chunksRef.current[0]?.type || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: detectedType });
        const url = URL.createObjectURL(blob);
        setRecordedUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return url;
        });
        stream.getTracks().forEach((t) => t.stop());
        setPracticedDone(true);
        setStatusMessage('Muito bem! Ouça sua gravação para comparar com o áudio.');
        playFeedbackTone('star', audioSettings.volume);
        onSuccess?.();
      };

      recorder.start();
      setIsRecording(true);
      setStatusMessage('Pode falar agora! Estou ouvindo você...');

      window.setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, 6000);
    } catch {
      setPracticedDone(true);
      setStatusMessage('Sem problema! Pratique em voz alta e toque em "Eu falei!" para ganhar sua estrela.');
      playFeedbackTone('star', audioSettings.volume);
      onSuccess?.();
    }
  };

  const stopPractice = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const playOwnRecording = () => {
    if (!recordedUrl) return;
    const audio = new Audio(recordedUrl);
    audio.volume = audioSettings.volume;
    audio.play().catch(() => {
      setStatusMessage('Toque novamente para reproduzir sua gravação.');
    });
  };

  const markSpokenOutLoud = () => {
    setPracticedDone(true);
    setStatusMessage('Cada palavra é uma conquista! Estrelinha ganha!');
    playFeedbackTone('star', audioSettings.volume);
    speakPtBr(`Muito bem! ${targetText}`, audioSettings);
    onSuccess?.();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-2.5">
        {!isRecording ? (
          <button
            type="button"
            onClick={startPractice}
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 active:scale-[0.98] transition min-h-[44px]"
          >
            <Mic className="w-4 h-4" aria-hidden="true" />
            <span>Gravar minha voz</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={stopPractice}
            className="inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 transition min-h-[44px]"
          >
            <Square className="w-4 h-4" aria-hidden="true" />
            <span>Parar gravação</span>
          </button>
        )}

        {recordedUrl && (
          <button
            type="button"
            onClick={playOwnRecording}
            className="inline-flex items-center gap-2 rounded-2xl bg-sky-100 px-4 py-2.5 text-sm font-semibold text-sky-900 hover:bg-sky-200 transition min-h-[44px]"
          >
            <Play className="w-4 h-4" aria-hidden="true" />
            <span>Ouvir minha voz</span>
          </button>
        )}

        <button
          type="button"
          onClick={markSpokenOutLoud}
          className="inline-flex items-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100 transition min-h-[44px]"
        >
          <Sparkles className="w-4 h-4 text-amber-600" aria-hidden="true" />
          <span>Eu falei!</span>
        </button>
      </div>

      {statusMessage && (
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
          {practicedDone && <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" aria-hidden="true" />}
          <span>{statusMessage}</span>
        </div>
      )}
    </div>
  );
};
