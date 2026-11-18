import React, { useMemo, useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Award,
  Clock,
  Trash2,
  CheckCircle2,
  Camera,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { MEDALS, getAgeRecommendations } from '../data/curriculum';
import { AppPersistedState, AppSection } from '../types/app';
import { CatalogItemDTO, ContentCatalogResponse, PremiumStatusResponse } from '../types/premium';
import { ageToGroup } from '../utils/storage';
import { ThemePicker } from '../components/ThemePicker';
import { PremiumSection } from '../components/PremiumSection';
import { ContentTierBadge } from '../components/ContentTierBadge';

interface ParentsAreaViewProps {
  state: AppPersistedState;
  premiumStatus: PremiumStatusResponse | null;
  loadingPremium: boolean;
  catalogItems?: CatalogItemDTO[];
  catalogCounts?: ContentCatalogResponse['counts'];
  onRefreshPremium: (sync?: boolean) => Promise<void>;
  onPremiumStatusChange: (nextStatus: PremiumStatusResponse) => void;
  onNavigate?: (section: AppSection) => void;
  onUpdateState: (updater: (prev: AppPersistedState) => AppPersistedState) => void;
  onDeleteAllData: () => Promise<void>;
}

const SELECTABLE_MODULES = [
  { id: 'first-words', label: 'Primeiras Palavras' },
  { id: 'alphabet', label: 'Vogais e Alfabeto' },
  { id: 'pronunciation', label: 'Treinamento de Pronúncia' },
  { id: 'oral-motor', label: 'Anatomia 3D do Trato Vocal' },
  { id: 'animal-sounds', label: 'Sons dos Animais' },
  { id: 'daily-phrases', label: 'Frases do Dia a Dia' },
  { id: 'games', label: 'Jogos Educativos' },
  { id: 'stories', label: 'Histórias Infantis' },
];

export const ParentsAreaView: React.FC<ParentsAreaViewProps> = ({
  state,
  premiumStatus,
  loadingPremium,
  catalogItems,
  catalogCounts,
  onRefreshPremium,
  onPremiumStatusChange,
  onNavigate,
  onUpdateState,
  onDeleteAllData,
}) => {
  const [unlocked, setUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [mathChallenge] = useState(() => {
    const a = 4 + Math.floor(Math.random() * 5);
    const b = 3 + Math.floor(Math.random() * 5);
    return { a, b, answer: a + b };
  });
  const [mathInput, setMathInput] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const statsSummary = useMemo(
    () => ({
      starsTotal: state.progress.starsTotal,
      practicedWordsCount: state.progress.practicedWords.length,
      exploredLettersCount: state.progress.exploredLetters.length,
      gamesCompleted: state.progress.gamesCompleted,
      storiesReadCount: state.progress.storiesRead.length,
      oralExercisesDone: state.progress.oralExercisesDone,
      participationDaysCount: state.progress.participationDays.length,
    }),
    [state.progress]
  );

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === state.profile.parentPin || Number(mathInput) === mathChallenge.answer) {
      setUnlocked(true);
      setPinError(null);
    } else {
      setPinError('Verificação incorreta. Use o PIN dos pais (padrão 1234) ou resolva a soma.');
    }
  };

  const toggleModule = (modId: string) => {
    onUpdateState((prev) => {
      const exists = prev.profile.selectedModules.includes(modId);
      const next = exists
        ? prev.profile.selectedModules.filter((m) => m !== modId)
        : [...prev.profile.selectedModules, modId];
      return {
        ...prev,
        profile: { ...prev.profile, selectedModules: next },
      };
    });
  };

  if (!unlocked) {
    return (
      <div className="max-w-lg mx-auto rounded-3xl border border-slate-200 bg-white p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Área dos Pais</h1>
            <p className="text-sm text-slate-600">Espaço protegido para responsáveis</p>
          </div>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">
          Para manter as configurações, o histórico educativo e os controles de privacidade protegidos da navegação infantil, confirme que você é um adulto responsável.
        </p>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <label htmlFor="parent-math" className="block text-xs font-bold text-slate-700 mb-1.5">
              Verificação rápida: quanto é {mathChallenge.a} + {mathChallenge.b}?
            </label>
            <input
              id="parent-math"
              type="number"
              inputMode="numeric"
              value={mathInput}
              onChange={(e) => setMathInput(e.target.value)}
              placeholder="Digite a resposta"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="text-center text-xs text-slate-400 font-semibold">ou</div>

          <div>
            <label htmlFor="parent-pin" className="block text-xs font-bold text-slate-700 mb-1.5">
              PIN dos responsáveis (padrão inicial: 1234)
            </label>
            <input
              id="parent-pin"
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="••••"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {pinError && <p className="text-sm font-semibold text-rose-600">{pinError}</p>}

          <button
            type="submit"
            className="w-full rounded-2xl bg-slate-900 py-3.5 text-sm font-bold text-white hover:bg-slate-800 transition min-h-[48px]"
          >
            Entrar na Área dos Pais
          </button>
        </form>
      </div>
    );
  }

  const ageRecs = getAgeRecommendations(state.profile.ageGroup);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            Área dos Pais e Responsáveis
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Gerencie o perfil da criança, acompanhe conquistas educativas e controle a privacidade (LGPD).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setUnlocked(false)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 min-h-[44px] self-start"
        >
          Bloquear área
        </button>
      </div>

      {/* Educational disclaimer — NO speech diagnosis */}
      <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-sm text-sky-950 leading-relaxed">
          <strong>Acompanhamento positivo e sem diagnósticos:</strong> o FalaKids celebra a participação da criança. Nossas métricas nunca classificam crianças como atrasadas nem substituem avaliação de um fonoaudiólogo.
        </p>
      </div>

      {/* FalaKids Premium — Assinatura e Gerenciamento */}
      <PremiumSection
        profile={state.profile}
        progress={state.progress}
        premiumStatus={premiumStatus}
        loadingPremium={loadingPremium}
        catalogCounts={catalogCounts}
        onRefreshPremium={onRefreshPremium}
        onStatusUpdated={onPremiumStatusChange}
        onNavigate={onNavigate}
      />

      {/* LGPD Verifiable Parental Consent */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <UserCheck className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          <h2 className="text-xl font-bold text-slate-900">Consentimento LGPD e Proteção Infantil</h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Seguimos a Lei Geral de Proteção de Dados (Art. 14 - Proteção de Crianças e Adolescentes): coleta mínima, sem anúncios comportamentais, sem chat público, sem compartilhamento de fotos e armazenamento local privado no dispositivo.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-50 border border-slate-200 p-4">
          <div className="text-sm">
            <div className="font-bold text-slate-900">
              Consentimento verificável do responsável:{' '}
              {state.profile.lgpdConsentAccepted ? 'Confirmado' : 'Pendente'}
            </div>
            {state.profile.lgpdConsentDate && (
              <div className="text-xs text-slate-500 mt-0.5">
                Registrado em {new Date(state.profile.lgpdConsentDate).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() =>
              onUpdateState((prev) => ({
                ...prev,
                profile: {
                  ...prev.profile,
                  lgpdConsentAccepted: !prev.profile.lgpdConsentAccepted,
                  lgpdConsentDate: !prev.profile.lgpdConsentAccepted
                    ? new Date().toISOString()
                    : null,
                },
              }))
            }
            className={`rounded-2xl px-4 py-2.5 text-sm font-bold transition min-h-[44px] ${
              state.profile.lgpdConsentAccepted
                ? 'bg-emerald-600 text-white'
                : 'bg-sky-600 text-white hover:bg-sky-700'
            }`}
          >
            {state.profile.lgpdConsentAccepted ? 'Consentimento Ativo' : 'Confirmar Consentimento'}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-50 border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <Camera className="w-5 h-5 text-cyan-700" aria-hidden="true" />
            <div>
              <div className="text-sm font-bold text-slate-900">
                Autorizar ferramenta de câmera e fotos locais
              </div>
              <div className="text-xs text-slate-600">
                Permite fotografar objetos da casa para cartões de nomeação privados.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              onUpdateState((prev) => ({
                ...prev,
                profile: { ...prev.profile, cameraAuthorized: !prev.profile.cameraAuthorized },
              }))
            }
            className={`rounded-2xl px-4 py-2 text-sm font-bold min-h-[44px] ${
              state.profile.cameraAuthorized
                ? 'bg-cyan-600 text-white'
                : 'bg-white border border-slate-300 text-slate-700'
            }`}
          >
            {state.profile.cameraAuthorized ? 'Autorizada' : 'Desativada'}
          </button>
        </div>
      </section>

      {/* Child Profile + Age + PIN + Activity selection */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 rounded-3xl border border-slate-200 bg-white p-6 space-y-5">
          <h2 className="text-xl font-bold text-slate-900">Perfil da Criança</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="child-name" className="block text-xs font-bold text-slate-700 mb-1.5">
                Nome ou apelido carinhoso (sem sobrenome necessário)
              </label>
              <input
                id="child-name"
                type="text"
                maxLength={32}
                value={state.profile.name}
                onChange={(e) =>
                  onUpdateState((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, name: e.target.value },
                  }))
                }
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="child-age" className="block text-xs font-bold text-slate-700 mb-1.5">
                  Idade (2 a 12 anos)
                </label>
                <select
                  id="child-age"
                  value={state.profile.age}
                  onChange={(e) => {
                    const age = Number(e.target.value);
                    onUpdateState((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, age, ageGroup: ageToGroup(age) },
                    }));
                  }}
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm bg-white"
                >
                  {Array.from({ length: 11 }, (_, i) => i + 2).map((age) => (
                    <option key={age} value={age}>
                      {age} anos
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="new-pin" className="block text-xs font-bold text-slate-700 mb-1.5">
                  PIN da Área dos Pais
                </label>
                <input
                  id="new-pin"
                  type="text"
                  maxLength={6}
                  value={state.profile.parentPin}
                  onChange={(e) =>
                    onUpdateState((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, parentPin: e.target.value.replace(/\D/g, '') || '1234' },
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm font-mono"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-700">
              <strong>Adaptação ativa ({ageRecs.title}):</strong> {ageRecs.subtitle}
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 rounded-3xl border border-slate-200 bg-white p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Seleção de Atividades Visíveis</h2>
          <p className="text-sm text-slate-600">
            Escolha quais trilhas ficam disponíveis para a criança na área de atividades:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SELECTABLE_MODULES.map((mod) => {
              const checked = state.profile.selectedModules.includes(mod.id);
              const catalogMod = catalogItems?.find(
                (entry) => entry.category === 'module' && entry.id === mod.id
              );
              const hubSummary =
                mod.id === 'games'
                  ? `${catalogCounts?.byCategory.game.free ?? 10} gratuitos · ${
                      catalogCounts?.byCategory.game.premium ?? 2
                    } Premium`
                  : mod.id === 'stories'
                  ? `${catalogCounts?.byCategory.story.free ?? 3} gratuitas · ${
                      catalogCounts?.byCategory.story.premium ?? 2
                    } Premium`
                  : null;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  className={`rounded-2xl border px-3.5 py-3 text-left text-sm font-semibold flex items-center justify-between gap-2 transition min-h-[48px] ${
                    checked
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}
                >
                  <div className="min-w-0 space-y-1">
                    <div className="truncate">{mod.label}</div>
                    {catalogMod ? (
                      <ContentTierBadge
                        tier={catalogMod.tier}
                        unlocked={catalogMod.unlocked}
                        compact
                      />
                    ) : hubSummary ? (
                      <div className="text-[11px] font-bold text-slate-500">{hubSummary}</div>
                    ) : null}
                  </div>
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${checked ? 'text-emerald-600' : 'text-slate-300'}`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Progress, Medals, Usage Time, Practiced Words & History */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">Progresso e Conquistas Educativas</h2>
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Clock className="w-4 h-4 text-sky-600" aria-hidden="true" />
            <span className="tabular-nums">Tempo de uso: {state.progress.totalMinutesUsed} min</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Atividades concluídas', value: state.progress.activitiesCompleted },
            { label: 'Palavras praticadas', value: state.progress.practicedWords.length },
            { label: 'Letras exploradas', value: state.progress.exploredLetters.length },
            { label: 'Jogos realizados', value: state.progress.gamesCompleted },
            { label: 'Histórias lidas', value: state.progress.storiesRead.length },
            { label: 'Dias de participação', value: state.progress.participationDays.length },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
              <div className="text-2xl font-extrabold text-slate-900 tabular-nums">{kpi.value}</div>
              <div className="text-xs font-medium text-slate-600 mt-1">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Medals */}
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-3">Medalhas e Conquistas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MEDALS.map((medal) => {
              const unlockedMedal = medal.checkUnlocked(statsSummary);
              return (
                <div
                  key={medal.id}
                  className={`rounded-2xl border p-4 flex items-start gap-3 ${
                    unlockedMedal ? 'bg-amber-50/60 border-amber-300' : 'bg-slate-50 border-slate-200 opacity-70'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: unlockedMedal ? medal.color : '#94A3B8' }}
                  >
                    <Award className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{medal.title}</div>
                    <div className="text-xs text-slate-600 mt-0.5">{medal.description}</div>
                    <div className="text-[11px] font-semibold text-slate-500 mt-1">
                      {unlockedMedal ? 'Conquistada!' : medal.requirementText}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Practiced Words & Recent Activity History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Palavras Praticadas</h3>
            {state.progress.practicedWords.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma palavra praticada ainda.</p>
            ) : (
              <p className="text-sm text-slate-700 leading-relaxed">
                {state.progress.practicedWords.join(' · ')}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Histórico Recente</h3>
            {state.progress.history.length === 0 ? (
              <p className="text-sm text-slate-500">As atividades realizadas aparecerão aqui.</p>
            ) : (
              <ul className="divide-y divide-slate-100 text-sm">
                {state.progress.history.slice(0, 6).map((item) => (
                  <li key={item.id} className="py-2 flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-800 truncate">
                      {item.module} · {item.title}
                    </span>
                    <span className="text-xs text-slate-500 tabular-nums shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Theme Picker */}
      <ThemePicker
        activeThemeId={state.themeId}
        audioSettings={state.audio}
        onSelectTheme={(nextTheme) =>
          onUpdateState((prev) => ({ ...prev, themeId: nextTheme }))
        }
      />

      {/* Complete Data Deletion (LGPD) */}
      <section className="rounded-3xl border border-rose-200 bg-rose-50/40 p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-rose-800">
          <AlertTriangle className="w-5 h-5" aria-hidden="true" />
          <h2 className="text-lg font-extrabold">Exclusão de Conta e Dados (LGPD)</h2>
        </div>
        <p className="text-sm text-slate-700">
          Você pode apagar permanentemente o perfil infantil, o histórico de atividades, o progresso e todas as fotografias armazenadas neste dispositivo.
        </p>

        {!confirmDelete ? (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-rose-300 bg-white px-5 py-3 text-sm font-bold text-rose-700 hover:bg-rose-50 min-h-[46px]"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span>Excluir todos os dados</span>
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={async () => {
                await onDeleteAllData();
                setConfirmDelete(false);
                setUnlocked(false);
              }}
              className="rounded-2xl bg-rose-600 px-5 py-3 text-sm font-bold text-white hover:bg-rose-700 min-h-[46px]"
            >
              Confirmar exclusão definitiva
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 min-h-[46px]"
            >
              Cancelar
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
