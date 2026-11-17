import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 active:scale-[0.98] transition whitespace-nowrap shrink-0 min-h-[44px]"
      >
        <Download className="w-4 h-4" aria-hidden="true" />
        <span>Instalar App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className="inline-flex items-center gap-2 rounded-2xl border border-sky-200 bg-sky-50 px-3.5 py-2 text-sm font-semibold text-sky-800 hover:bg-sky-100 transition whitespace-nowrap shrink-0 min-h-[44px]"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>Instalar no iOS</span>
        </button>

        {showGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" role="dialog" aria-modal="true" aria-label="Instalar no iPhone ou iPad">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-slate-900">Instalar no iPhone / iPad</h3>
                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  aria-label="Fechar instruções"
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ol className="mt-3 space-y-2 text-sm text-slate-700 list-decimal pl-5">
                <li>Toque no botão <strong>Compartilhar</strong> na barra do Safari.</li>
                <li>Role para baixo e toque em <strong>Adicionar à Tela de Início</strong>.</li>
              </ol>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="mt-5 w-full rounded-2xl bg-sky-600 py-3 text-sm font-semibold text-white hover:bg-sky-700 min-h-[44px]"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
