import React, { useState } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  let posClasses = '-top-12 left-1/2 -translate-x-1/2';
  if (position === 'bottom') posClasses = 'top-full left-1/2 -translate-x-1/2 mt-2';
  if (position === 'left') posClasses = 'right-full top-1/2 -translate-y-1/2 mr-2';
  if (position === 'right') posClasses = 'left-full top-1/2 -translate-y-1/2 ml-2';

  return (
    <div
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-[var(--z-modal)] px-3 py-1.5 text-xs font-mono bg-[var(--color-ink)] text-[var(--color-paper)] border border-[var(--color-neutral-700)] rounded shadow-md whitespace-nowrap pointer-events-none transition-opacity duration-150 ${posClasses}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};
