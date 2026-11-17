import React, { useState } from 'react';
import { CheckCircle2, Wrench, Megaphone, Sliders, Save } from 'lucide-react';
import { APP_THEMES } from '../../data/themes';
import { AdminAppConfig } from '../../types/admin';
import { ThemeId } from '../../types/app';
import { APP_MODULES_CATALOG } from '../../utils/adminStore';

interface AdminAppSettingsViewProps {
  config: AdminAppConfig;
  onSaveConfig: (next: AdminAppConfig) => void;
}

export const AdminAppSettingsView: React.FC<AdminAppSettingsViewProps> = ({
  config,
  onSaveConfig,
}) => {
  const [draft, setDraft] = useState<AdminAppConfig>(config);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(draft);
    setSavedNotice(true);
    window.setTimeout(() => setSavedNotice(false), 3000);
  };

  const toggleModule = (moduleId: string) => {
    setDraft((prev) => ({
      ...prev,
      enabledModules: {
        ...prev.enabledModules,
        [moduleId]: prev.enabledModules[moduleId] === false,
      },
    }));
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Gerenciamento do Aplicativo
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Controle módulos disponíveis, avisos globais, tema padrão e modo de manutenção.
          </p>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition min-h-[44px] self-start sm:self-auto"
        >
          <Save className="w-4 h-4" aria-hidden="true" />
          <span>Salvar configurações</span>
        </button>
      </div>

      {savedNotice && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>Configurações globais do aplicativo atualizadas com sucesso!</span>
        </div>
      )}

      {/* Maintenance & Registration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <Wrench className="w-5 h-5 text-amber-600" aria-hidden="true" />
            <h2 className="text-base font-extrabold text-slate-900">
              Operação e Manutenção
            </h2>
          </div>

          <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 cursor-pointer">
            <div>
              <div className="text-sm font-bold text-slate-900">Modo de manutenção</div>
              <div className="text-xs text-slate-600 mt-0.5">
                Exibe aviso de manutenção na área do usuário sem bloquear a rota /admin.
              </div>
            </div>
            <input
              type="checkbox"
              checked={draft.maintenanceMode}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, maintenanceMode: e.target.checked }))
              }
              className="w-5 h-5 mt-0.5 accent-indigo-600 shrink-0"
            />
          </label>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
              Mensagem de manutenção
            </label>
            <textarea
              rows={2}
              value={draft.maintenanceMessage}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, maintenanceMessage: e.target.value }))
              }
              className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm"
            />
          </div>

          <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 cursor-pointer">
            <div>
              <div className="text-sm font-bold text-slate-900">Permitir novos cadastros</div>
              <div className="text-xs text-slate-600 mt-0.5">
                Habilita ou pausa a criação de novas contas familiares.
              </div>
            </div>
            <input
              type="checkbox"
              checked={draft.registrationOpen}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, registrationOpen: e.target.checked }))
              }
              className="w-5 h-5 mt-0.5 accent-indigo-600 shrink-0"
            />
          </label>
        </div>

        {/* Global Announcement & Default Theme */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <Megaphone className="w-5 h-5 text-indigo-600" aria-hidden="true" />
            <h2 className="text-base font-extrabold text-slate-900">
              Comunicado e Aparência Padrão
            </h2>
          </div>

          <label className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 cursor-pointer">
            <div>
              <div className="text-sm font-bold text-slate-900">Exibir banner informativo</div>
              <div className="text-xs text-slate-600 mt-0.5">
                Mostra um aviso discreto no topo da área dos usuários quando ativo.
              </div>
            </div>
            <input
              type="checkbox"
              checked={draft.announcementEnabled}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, announcementEnabled: e.target.checked }))
              }
              className="w-5 h-5 mt-0.5 accent-indigo-600 shrink-0"
            />
          </label>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
              Texto do comunicado
            </label>
            <input
              type="text"
              value={draft.announcementText}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, announcementText: e.target.value }))
              }
              className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-slate-600 mb-1">
              Tema padrão do aplicativo
            </label>
            <select
              value={draft.defaultThemeId}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  defaultThemeId: e.target.value as ThemeId,
                }))
              }
              className="w-full rounded-2xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white"
            >
              {Object.values(APP_THEMES).map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Modules Visibility Control */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <Sliders className="w-5 h-5 text-indigo-600" aria-hidden="true" />
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Controle Global de Módulos
            </h2>
            <p className="text-xs text-slate-500">
              Ative ou desative trilhas educativas exibidas para os usuários.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {APP_MODULES_CATALOG.map((mod) => {
            const enabled = draft.enabledModules[mod.id] !== false;
            return (
              <label
                key={mod.id}
                className={`rounded-2xl border p-4 cursor-pointer transition flex flex-col justify-between gap-2 ${
                  enabled
                    ? 'border-indigo-200 bg-indigo-50/40'
                    : 'border-slate-200 bg-slate-50 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900">{mod.label}</span>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => toggleModule(mod.id)}
                    className="w-4 h-4 mt-0.5 accent-indigo-600 shrink-0"
                  />
                </div>
                <p className="text-xs text-slate-600">{mod.description}</p>
              </label>
            );
          })}
        </div>
      </div>
    </form>
  );
};
