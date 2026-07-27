import type { ReactNode, RefObject } from 'react';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  titleId: string;
  descriptionId: string;
  children: ReactNode;
  className?: string;
  initialFocusRef?: RefObject<HTMLElement | null>;
}
