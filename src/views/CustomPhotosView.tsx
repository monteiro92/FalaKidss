import React, { useEffect, useRef, useState } from 'react';
import { Camera, Lock, ShieldCheck, Trash2, Upload, Volume2, PlusCircle } from 'lucide-react';
import { AudioSettings, ChildProfile, CustomPhotoCard } from '../types/app';
import { deleteCustomPhoto, getCustomPhotos, saveCustomPhoto } from '../utils/storage';
import { PracticeRecorder } from '../components/PracticeRecorder';
import { playFeedbackTone, speakPtBr } from '../utils/speech';

interface CustomPhotosViewProps {
  profile: ChildProfile;
  audioSettings: AudioSettings;
  onPracticeWord: (word: string) => void;
  onGoToParents: () => void;
}

const CATEGORIES: { id: CustomPhotoCard['category']; label: string }[] = [
  { id: 'objeto', label: 'Objeto' },
  { id: 'alimento', label: 'Alimento' },
  { id: 'familiar', label: 'Familiar' },
  { id: 'brinquedo', label: 'Brinquedo' },
  { id: 'lugar', label: 'Lugar' },
];

export const CustomPhotosView: React.FC<CustomPhotosViewProps> = ({
  profile,
  audioSettings,
  onPracticeWord,
  onGoToParents,
}) => {
  const [photos, setPhotos] = useState<CustomPhotoCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<CustomPhotoCard | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [newCategory, setNewCategory] = useState<CustomPhotoCard['category']>('objeto');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    getCustomPhotos().then((list) => {
      setPhotos(list);
      if (list.length > 0) setSelectedCard(list[0]);
    });
  }, []);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFormError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Resize cleanly on client canvas to avoid unnecessary storage footprint
        const maxDim = 640;
        const ratio = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setPreviewDataUrl(canvas.toDataURL('image/jpeg', 0.8));
        }
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !previewDataUrl) {
      setFormError('Adicione uma foto e escreva o nome para a criança praticar.');
      return;
    }

    const card: CustomPhotoCard = {
      id: `photo-${Date.now()}`,
      label: newLabel.trim(),
      category: newCategory,
      dataUrl: previewDataUrl,
      createdAt: new Date().toISOString(),
    };

    await saveCustomPhoto(card);
    const updated = [card, ...photos];
    setPhotos(updated);
    setSelectedCard(card);
    setNewLabel('');
    setPreviewDataUrl(null);
    setShowAddForm(false);
    playFeedbackTone('star', audioSettings.volume);
    speakPtBr(card.label, audioSettings);
  };

  const handleDelete = async (id: string) => {
    await deleteCustomPhoto(id);
    const next = photos.filter((p) => p.id !== id);
    setPhotos(next);
    if (selectedCard?.id === id) {
      setSelectedCard(next[0] || null);
    }
    playFeedbackTone('click', audioSettings.volume);
  };

  if (!profile.cameraAuthorized || !profile.lgpdConsentAccepted) {
    return (
      <div className="max-w-2xl mx-auto rounded-3xl border border-slate-200 bg-white p-6 md:p-8 text-center space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto">
          <Lock className="w-7 h-7" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Autorização do Responsável Necessária
        </h1>
        <p className="text-sm md:text-base text-slate-600 leading-relaxed">
          Para proteger a privacidade da criança conforme a LGPD, a ferramenta de câmera e fotografias personalizadas só é liberada após o consentimento e autorização na <strong>Área dos Pais</strong>. As imagens permanecem apenas neste dispositivo e nunca são compartilhadas publicamente.
        </p>
        <button
          type="button"
          onClick={onGoToParents}
          className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-sky-700 min-h-[48px]"
        >
          <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          <span>Autorizar na Área dos Pais</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Minhas Fotos e Objetos
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            Pratique nomes de objetos, brinquedos, alimentos, familiares e lugares do dia a dia.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-700 transition min-h-[46px] self-start"
        >
          <PlusCircle className="w-4 h-4" aria-hidden="true" />
          <span>{showAddForm ? 'Fechar formulário' : 'Fotografar ou enviar'}</span>
        </button>
      </div>

      {/* Privacy notice */}
      <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 flex items-start gap-3 text-xs sm:text-sm text-cyan-950">
        <ShieldCheck className="w-5 h-5 text-cyan-700 shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          <strong>Privacidade protegida:</strong> todas as fotos são guardadas somente no armazenamento local deste dispositivo, sem envio para servidores públicos, e podem ser apagadas a qualquer momento.
        </p>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleSaveCard}
          className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 max-w-2xl"
        >
          <h2 className="text-lg font-extrabold text-slate-900">Novo cartão com foto</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="photo-label" className="block text-xs font-bold text-slate-700 mb-1.5">
                Nome para a criança falar
              </label>
              <input
                id="photo-label"
                type="text"
                maxLength={40}
                placeholder="Ex: Meu ursinho, Vovó Ana, Copo azul"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="photo-category" className="block text-xs font-bold text-slate-700 mb-1.5">
                Categoria
              </label>
              <select
                id="photo-category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as CustomPhotoCard['category'])}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFilePick}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 min-h-[46px]"
            >
              <Camera className="w-4 h-4 text-cyan-700" aria-hidden="true" />
              <span>Tirar foto / Escolher imagem</span>
            </button>

            {previewDataUrl && (
              <img
                src={previewDataUrl}
                alt="Pré-visualização da foto"
                className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
              />
            )}
          </div>

          {formError && <p className="text-sm font-semibold text-rose-600">{formError}</p>}

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 min-h-[46px]"
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
            <span>Salvar cartão no dispositivo</span>
          </button>
        </form>
      )}

      {photos.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center space-y-3">
          <Camera className="w-10 h-10 text-slate-400 mx-auto" aria-hidden="true" />
          <h2 className="text-lg font-bold text-slate-800">Nenhuma foto salva ainda</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Os responsáveis podem fotografar brinquedos favoritos, alimentos ou familiares para a criança praticar a nomeação.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {photos.map((card) => {
              const active = selectedCard?.id === card.id;
              return (
                <div
                  key={card.id}
                  className={`rounded-3xl border overflow-hidden bg-white flex flex-col justify-between transition ${
                    active ? 'border-cyan-500 shadow-sm' : 'border-slate-200'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCard(card);
                      speakPtBr(card.label, audioSettings);
                    }}
                    className="text-left focus:outline-none"
                  >
                    <div className="aspect-square bg-slate-100 overflow-hidden">
                      <img
                        src={card.dataUrl}
                        alt={card.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <div className="font-extrabold text-slate-900 truncate">{card.label}</div>
                      <div className="text-xs text-slate-500 capitalize">{card.category}</div>
                    </div>
                  </button>
                  <div className="px-3 pb-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDelete(card.id)}
                      aria-label={`Apagar foto ${card.label}`}
                      className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 min-h-[36px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Apagar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedCard && (
            <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white p-6 space-y-5">
              <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={selectedCard.dataUrl}
                  alt={selectedCard.label}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-cyan-700 capitalize">{selectedCard.category}</p>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">{selectedCard.label}</h2>
              </div>

              <button
                type="button"
                onClick={() => speakPtBr(selectedCard.label, audioSettings)}
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-700 min-h-[46px]"
              >
                <Volume2 className="w-4 h-4" aria-hidden="true" />
                <span>Ouvir nome</span>
              </button>

              <PracticeRecorder
                targetText={selectedCard.label}
                audioSettings={audioSettings}
                onSuccess={() => onPracticeWord(selectedCard.label)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
