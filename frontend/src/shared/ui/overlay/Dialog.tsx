import { useEffect, useRef } from 'react';
import { useBodyScrollLock } from '@/shared/hooks/useBodyScrollLock';
import { useFocusTrap } from '@/shared/hooks/useFocusTrap';
import { usePreferences } from '@/shared/hooks/usePreferences';
import { useReturnFocus } from '@/shared/hooks/useReturnFocus';
import { OverlayPortal } from './OverlayPortal';
import type { DialogProps } from './overlay.types';

export function Dialog({
  open,
  onClose,
  titleId,
  descriptionId,
  children,
  className = '',
  initialFocusRef,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { isReducedMotion } = usePreferences();

  useBodyScrollLock(open);
  useReturnFocus(open);
  useFocusTrap(dialogRef, initialFocusRef, open);

  useEffect(() => {
    if (!open) return;
    const appRoot = document.getElementById('root');
    if (appRoot) {
      appRoot.inert = true;
      appRoot.setAttribute('aria-hidden', 'true');
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      if (appRoot) {
        appRoot.inert = false;
        appRoot.removeAttribute('aria-hidden');
      }
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <OverlayPortal>
      <div
        className="overlay-backdrop"
        data-reduced-motion={isReducedMotion ? 'true' : 'false'}
        onClick={(event) => {
          if (event.currentTarget === event.target) onClose();
        }}
      >
        <div
          ref={dialogRef}
          className={`overlay-dialog ${className}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          tabIndex={-1}
        >
          {children}
        </div>
      </div>
    </OverlayPortal>
  );
}
