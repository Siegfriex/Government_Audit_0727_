import { useLayoutEffect, useRef } from 'react';

export function useReturnFocus(enabled: boolean) {
  const returnTarget = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!enabled) return;
    returnTarget.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return () => {
      const target = returnTarget.current;
      window.requestAnimationFrame(() => {
        if (target?.isConnected) {
          target.focus();
          return;
        }
        const fallback = document.querySelector<HTMLElement>([
          '#atlas-list-heading',
          '#atlas-node-list-unavailable-title',
          '#atlas-controls select:not([disabled])',
          '[data-testid="atlas-chart"] h2',
          '#main-content',
        ].join(','));
        fallback?.focus();
      });
    };
  }, [enabled]);
}
