import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  X,
  Home,
  BookOpen,
  Gamepad2,
  BookMarked,
  ShieldCheck,
  Sparkles,
  Type,
  Mic,
  Smile,
  Dog,
  MessageCircleHeart,
  Camera,
} from 'lucide-react';
import { AppTheme } from '../data/themes';
import { AppSection } from '../types/app';
import { CatalogItemDTO } from '../types/premium';
import { ContentTierBadge } from './ContentTierBadge';
import tucaAppIcon from '../assets/images/tuca_app_icon.png';

interface MenuDrawerProps {
  open: boolean;
  currentSection: AppSection;
  theme: AppTheme;
  catalogItems?: CatalogItemDTO[];
  onClose: () => void;
  onNavigate: (section: AppSection) => void;
}

interface DrawerNavItem {
  id: AppSection;
  label: string;
  Icon: React.FC<{ className?: string }>;
}

const MAIN_SECTIONS: DrawerNavItem[] = [
  { id: 'home', label: 'Início', Icon: Home },
  { id: 'activities', label: 'Minhas Atividades', Icon: BookOpen },
  { id: 'games', label: 'Jogos Educativos', Icon: Gamepad2 },
  { id: 'stories', label: 'Histórias Infantis', Icon: BookMarked },
  { id: 'parents', label: 'Área dos Pais', Icon: ShieldCheck },
];

const ACTIVITY_SECTIONS: DrawerNavItem[] = [
  { id: 'first-words', label: 'Primeiras Palavras', Icon: Sparkles },
  { id: 'alphabet', label: 'Vogais e Alfabeto', Icon: Type },
  { id: 'pronunciation', label: 'Treinamento de Pronúncia', Icon: Mic },
  { id: 'oral-motor', label: 'Anatomia 3D do Trato Vocal', Icon: Smile },
  { id: 'animal-sounds', label: 'Sons dos Animais', Icon: Dog },
  { id: 'daily-phrases', label: 'Frases do Dia a Dia', Icon: MessageCircleHeart },
  { id: 'camera', label: 'Minhas Fotos', Icon: Camera },
];

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  open,
  currentSection,
  theme,
  catalogItems,
  onClose,
  onNavigate,
}) => {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  const handleSelect = (id: AppSection) => {
    onNavigate(id);
    onClose();
  };

  const renderItem = (item: DrawerNavItem) => {
    const Icon = item.Icon;
    const isActive = currentSection === item.id;
    const modCatalog = catalogItems?.find(
      (entry) => entry.category === 'module' && entry.id === item.id
    );
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleSelect(item.id)}
        aria-current={isActive ? 'page' : undefined}
        className={`w-full flex items-center justify-between gap-2 rounded-2xl border px-3.5 py-2.5 text-left text-sm font-semibold transition min-h-[44px] ${
          isActive
            ? `${theme.selectedCardClass} ${theme.accentTextClass} font-bold`
            : 'border-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <span className="flex items-center gap-3 min-w-0">
          <Icon
            className={`w-5 h-5 shrink-0 ${isActive ? theme.iconPrimaryClass : 'text-slate-500'}`}
            aria-hidden="true"
          />
          <span className="truncate">{item.label}</span>
        </span>
        {modCatalog && (
          <span className="shrink-0">
            <ContentTierBadge tier={modCatalog.tier} unlocked={modCatalog.unlocked} compact />
          </span>
        )}
      </button>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Menu de navegação">
          {/* Backdrop: click outside to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            aria-hidden="true"
          />

          {/* Slide-over lateral menu */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 34 }}
            className={`relative z-10 w-[300px] sm:w-[320px] max-w-[86vw] h-full bg-white border-r shadow-2xl flex flex-col ${theme.cardBorderClass}`}
          >
            {/* Drawer Header */}
            <div className={`px-5 py-4 border-b flex items-center justify-between gap-3 ${theme.headerClass}`}>
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-10 h-10 rounded-xl overflow-hidden shadow-xs shrink-0 inline-flex items-center justify-center bg-amber-400">
                  <img
                    src={tucaAppIcon}
                    alt=""
                    aria-hidden="true"
                    className="w-full h-full object-cover"
                  />
                </span>
                <div className="min-w-0">
                  <div className={`text-lg font-extrabold font-display tracking-tight truncate ${theme.brandTextClass}`}>
                    FalaKids
                  </div>
                  <p className="text-xs text-slate-500 truncate">Cada palavra é uma conquista!</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar menu"
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center shrink-0 transition"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable navigation list */}
            <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5" aria-label="Menu lateral">
              <div className="space-y-1">
                <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Navegação Principal
                </div>
                {MAIN_SECTIONS.map(renderItem)}
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100">
                <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Trilhas e Exercícios
                </div>
                {ACTIVITY_SECTIONS.map(renderItem)}
              </div>
            </nav>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
