import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star } from 'lucide-react';

interface StarCelebrationProps {
  visible: boolean;
  message?: string;
}

export const StarCelebration: React.FC<StarCelebrationProps> = ({
  visible,
  message = 'Parabéns! Mais uma conquista!',
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -12 }}
          transition={{ duration: 0.2 }}
          className="fixed top-20 right-4 md:right-8 z-50 flex items-center gap-3 rounded-2xl bg-amber-400 px-5 py-3.5 text-slate-950 font-bold shadow-xl border-2 border-amber-200"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-white text-white" aria-hidden="true" />
            <Star className="w-6 h-6 fill-white text-white" aria-hidden="true" />
          </div>
          <span className="text-sm md:text-base">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
