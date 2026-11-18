import React from 'react';
import { Crown, Lock, Sparkles } from 'lucide-react';
import { ContentTier } from '../types/premium';

interface ContentTierBadgeProps {
  tier: ContentTier;
  unlocked?: boolean;
  overlay?: boolean;
  compact?: boolean;
}

export const ContentTierBadge: React.FC<ContentTierBadgeProps> = ({
  tier,
  unlocked = true,
  overlay = false,
  compact = false,
}) => {
  if (tier === 'PREMIUM') {
    if (overlay) {
      return (
        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-xs">
          {unlocked ? (
            <Crown className="w-3 h-3 text-white" aria-hidden="true" />
          ) : (
            <Lock className="w-3 h-3 text-white" aria-hidden="true" />
          )}
          <span>PREMIUM</span>
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-100 font-extrabold uppercase tracking-wider text-amber-950 ${
          compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-[11px]'
        }`}
      >
        {unlocked ? (
          <Crown className="w-3 h-3 text-amber-700" aria-hidden="true" />
        ) : (
          <Lock className="w-3 h-3 text-amber-700" aria-hidden="true" />
        )}
        <span>PREMIUM</span>
      </span>
    );
  }

  if (overlay) {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-xs">
        <Sparkles className="w-3 h-3 text-white" aria-hidden="true" />
        <span>GRATUITO</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-100 font-extrabold uppercase tracking-wider text-emerald-900 ${
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-[11px]'
      }`}
    >
      <span>GRATUITO</span>
    </span>
  );
};
