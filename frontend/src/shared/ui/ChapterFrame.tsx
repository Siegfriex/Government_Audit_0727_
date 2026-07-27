import React from 'react';
import { motion } from 'motion/react';
import { usePreferences } from '@/shared/hooks/usePreferences';

interface ChapterFrameProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  orderNumber?: string;
}

export const ChapterFrame: React.FC<ChapterFrameProps> = ({ id, children, className = '', orderNumber }) => {
  const { isReducedMotion } = usePreferences();

  return (
    <section id={id} className={`chapter-frame relative ${className}`} data-chapter-id={id}>
      {orderNumber && (
        <div className="flex items-baseline justify-between mb-8 pb-3 border-b border-[var(--color-neutral-200)]">
          <div className="flex items-center gap-3">
            {/* Evidence Line continuity tick — every chapter picks up the
                thread the previous chapter's line handed off. */}
            <motion.span
              aria-hidden="true"
              className="w-[var(--evidence-line-width)] bg-[var(--evidence-line-color)] self-stretch"
              style={{ transformOrigin: 'top' }}
              initial={isReducedMotion ? { scaleY: 1 } : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{
                duration: isReducedMotion ? 0 : 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
            />
            <span className="type-mono text-[11px] uppercase tracking-widest px-2 py-0.5 border border-[var(--color-neutral-700)] text-[var(--color-ink)] bg-[var(--color-surface)]">
              {orderNumber}
            </span>
            <span className="font-mono text-[11px] text-[var(--color-neutral-500)] tracking-widest uppercase hidden sm:inline">
              PUBLIC RECORD ARCHIVE
            </span>
          </div>
          <div aria-hidden="true" className="font-serif italic font-black text-3xl sm:text-4xl text-[var(--color-neutral-400)] select-none">
            {orderNumber.replace(/CHAPTER\s*/i, '')}
          </div>
        </div>
      )}
      {children}
    </section>
  );
};
