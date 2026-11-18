import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Wrench,
  Megaphone,
  Sliders,
  Save,
  Crown,
  RefreshCw,
  Lock,
  AlertTriangle,
} from 'lucide-react';
import { APP_THEMES } from '../../data/themes';
import { AdminAppConfig } from '../../types/admin';
import { ThemeId } from '../../types/app';
import { ContentCategory, ContentTier } from '../../types/premium';
import { APP_MODULES_CATALOG, AdminContentCatalogResponse } from '../../utils/adminStore';
import { ContentTierBadge } from '../../components/ContentTierBadge';

interface AdminAppSettingsViewProps {
  config: AdminAppConfig;
  contentCatalog?: AdminContentCatalogResponse | null;
  loadingCatalog?: boolean;
  savingCatalogId?: string | null;
  catalogNotice?: string | null;
  catalogError?: string | null;
  onSaveConfig: (next: AdminAppConfig) => void;
  onRefreshCatalog?: () => Promise<void>;
  onToggleContentTier?: (id: string, nextTier: ContentTier) => Promise<void>;
}

const CATEGORY_LABELS: Record<'all' | ContentCategory, string> = {
  all: 'Todos',
  module: 'Módulos',
  activity: 'Atividades Exclusivas',
  game: 'Jogos Educativos',
  story: 'Histórias Infantis',
};

export const AdminAppSettingsView: React.FC<AdminAppSettingsViewProps> = ({
  config,
  contentCatalog,
  loadingCatalog = false,
  savingCatalogId = null,
  catalogNotice = null,
  catalogError = null,
  onSaveConfig,
  onRefreshCatalog,
  onToggleContentTier,
}) => {
  const [draft, setDraft] = useState<AdminAppConfig>(config);
  const [savedNotice, setSavedNotice] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | ContentCategory>('all');

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

  const filteredCatalogItems = useMemo(() => {
    const items = contentCatalog?.items || [];
    if (selectedCategory === 'all') return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [contentCatalog?.items, selectedCategory]);

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-[#0F2942]">
            Gerenciamento do Aplicativo
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Controle módulos disponíveis, classificação Gratuito/Premium, avisos globais e manutenção.
          </p>
        </div>

        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-700 transition min-h-[44px] self-start sm:self-auto shadow-xs"
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
        <div className="rounded-3xl border border-amber-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Wrench className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="text-base font-extrabold text-[#0F2942]">
              Operação e Manutenção
            </h2>
          </div>

          <label className="flex items-start justify-between gap-4 rounded-2xl border border-amber-200 bg-[#FFFDF7] p-4 cursor-pointer">
            <div>
              <div className="text-sm font-bold text-[#0F2942]">Modo de manutenção</div>
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
              className="w-5 h-5 mt-0.5 accent-orange-600 shrink-0"
            />
          </label>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#0F2942] mb-1">
              Mensagem de manutenção
            </label>
            <textarea
              rows={2}
              value={draft.maintenanceMessage}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, maintenanceMessage: e.target.value }))
              }
              className="w-full rounded-2xl border border-amber-200 bg-[#FFFDF7] px-3.5 py-2.5 text-sm text-[#0F2942] focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <label className="flex items-start justify-between gap-4 rounded-2xl border border-amber-200 bg-[#FFFDF7] p-4 cursor-pointer">
            <div>
              <div className="text-sm font-bold text-[#0F2942]">Permitir novos cadastros</div>
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
              className="w-5 h-5 mt-0.5 accent-orange-600 shrink-0"
            />
          </label>
        </div>

        {/* Global Announcement & Default Theme */}
        <div className="rounded-3xl border border-amber-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Megaphone className="w-5 h-5" aria-hidden="true" />
            </div>
            <h2 className="text-base font-extrabold text-[#0F2942]">
              Comunicado e Aparência Padrão
            </h2>
          </div>

          <label className="flex items-start justify-between gap-4 rounded-2xl border border-amber-200 bg-[#FFFDF7] p-4 cursor-pointer">
            <div>
              <div className="text-sm font-bold text-[#0F2942]">Exibir banner informativo</div>
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
              className="w-5 h-5 mt-0.5 accent-orange-600 shrink-0"
            />
          </label>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#0F2942] mb-1">
              Texto do comunicado
            </label>
            <input
              type="text"
              value={draft.announcementText}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, announcementText: e.target.value }))
              }
              className="w-full rounded-2xl border border-amber-200 bg-[#FFFDF7] px-3.5 py-2.5 text-sm text-[#0F2942] focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-[#0F2942] mb-1">
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
              className="w-full rounded-2xl border border-amber-200 bg-[#FFFDF7] px-3.5 py-2.5 text-sm text-[#0F2942] focus:outline-none focus:ring-2 focus:ring-orange-400"
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
      <div className="rounded-3xl border border-amber-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-orange-600 flex items-center justify-center">
            <Sliders className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#0F2942]">
              Controle Global de Módulos
            </h2>
            <p className="text-xs text-slate-600">
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
                    ? 'border-amber-300 bg-[#FFFBEB]'
                    : 'border-slate-200 bg-slate-50 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-bold text-[#0F2942]">{mod.label}</span>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => toggleModule(mod.id)}
                    className="w-4 h-4 mt-0.5 accent-orange-600 shrink-0"
                  />
                </div>
                <p className="text-xs text-slate-600">{mod.description}</p>
              </label>
            );
          })}
        </div>
      </div>

      {/* Persisted Content Classification: GRATUITO vs PREMIUM */}
      <div className="rounded-3xl border border-amber-200 bg-white p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Crown className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#0F2942]">
                Classificação de Conteúdos (Gratuito / Premium)
              </h2>
              <p className="text-xs text-slate-600">
                Fonte oficial sincronizada com servidor e regras de acesso · Plano mensal{' '}
                <strong>
                  {(contentCatalog?.monthlyValue ?? 29.99).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </strong>
              </p>
            </div>
          </div>

          {onRefreshCatalog && (
            <button
              type="button"
              disabled={loadingCatalog}
              onClick={() => onRefreshCatalog()}
              className="inline-flex items-center gap-1.5 rounded-2xl border border-amber-200 bg-[#FFFDF7] px-3.5 py-2 text-xs font-bold text-[#0F2942] hover:bg-amber-50 transition min-h-[40px] self-start sm:self-auto disabled:opacity-60"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingCatalog ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>Atualizar catálogo</span>
            </button>
          )}
        </div>

        {/* Summary KPIs */}
        {contentCatalog && (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xl font-extrabold text-[#0F2942] tabular-nums">
                {contentCatalog.counts.total}
              </div>
              <div className="text-xs font-semibold text-slate-600">Total de conteúdos</div>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3">
              <div className="text-xl font-extrabold text-emerald-800 tabular-nums">
                {contentCatalog.counts.free}
              </div>
              <div className="text-xs font-semibold text-emerald-900">Classificados GRATUITO</div>
            </div>
            <div className="rounded-2xl border border-amber-300 bg-amber-50/80 px-4 py-3">
              <div className="text-xl font-extrabold text-amber-900 tabular-nums">
                {contentCatalog.counts.premium}
              </div>
              <div className="text-xs font-semibold text-amber-950">Exclusivos PREMIUM</div>
            </div>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'module', 'activity', 'game', 'story'] as const).map((cat) => {
            const active = selectedCategory === cat;
            const catCount =
              cat === 'all'
                ? contentCatalog?.counts.total
                : contentCatalog?.counts.byCategory[cat]?.total;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-2xl border px-3.5 py-2 text-xs font-bold transition min-h-[38px] ${
                  active
                    ? 'bg-[#0F2942] border-[#0F2942] text-white'
                    : 'bg-[#FFFDF7] border-amber-200 text-[#0F2942] hover:bg-amber-50'
                }`}
              >
                {CATEGORY_LABELS[cat]}
                {typeof catCount === 'number' ? ` (${catCount})` : ''}
              </button>
            );
          })}
        </div>

        {catalogNotice && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
            <span>{catalogNotice}</span>
          </div>
        )}

        {catalogError && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" aria-hidden="true" />
            <span>{catalogError}</span>
          </div>
        )}

        {/* Catalog List */}
        {loadingCatalog && !contentCatalog ? (
          <div className="rounded-2xl border border-amber-200 bg-[#FFFDF7] p-6 text-center text-sm text-slate-600">
            Carregando classificação real dos conteúdos...
          </div>
        ) : filteredCatalogItems.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
            Nenhum conteúdo encontrado nesta categoria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCatalogItems.map((item) => {
              const isSaving = savingCatalogId === item.id;
              const nextTier: ContentTier = item.tier === 'PREMIUM' ? 'GRATUITO' : 'PREMIUM';
              return (
                <div
                  key={`${item.category}:${item.id}`}
                  className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.tier === 'PREMIUM'
                      ? 'border-amber-300 bg-[#FFFBEB]/80'
                      : 'border-slate-200 bg-[#FFFDF7]'
                  }`}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <ContentTierBadge tier={item.tier} unlocked={item.tier === 'GRATUITO'} compact />
                      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        {CATEGORY_LABELS[item.category]}
                      </span>
                    </div>
                    <div className="text-sm font-extrabold text-[#0F2942] truncate">
                      {item.title}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{item.subtitle}</p>
                  </div>

                  <div className="shrink-0">
                    {item.lockedFree ? (
                      <span className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-900">
                        <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Gratuito fixo</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isSaving || !onToggleContentTier}
                        onClick={() => onToggleContentTier?.(item.id, nextTier)}
                        className={`rounded-xl border px-3.5 py-2 text-xs font-extrabold transition min-h-[38px] disabled:opacity-60 ${
                          item.tier === 'PREMIUM'
                            ? 'border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50'
                            : 'border-amber-300 bg-amber-100 text-amber-950 hover:bg-amber-200'
                        }`}
                      >
                        {isSaving
                          ? 'Salvando...'
                          : item.tier === 'PREMIUM'
                          ? 'Tornar GRATUITO'
                          : 'Tornar PREMIUM'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </form>
  );
};

