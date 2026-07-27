import React from 'react';
import { ReportedStatus, BehaviorType, BehaviorFamily } from '../types/story';

interface BadgeProps {
  label: string;
  variant?: 'status' | 'behavior' | 'mock' | 'neutral';
  status?: ReportedStatus;
  behaviorType?: BehaviorType;
  family?: BehaviorFamily;
  className?: string;
  id?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  status,
  behaviorType,
  family,
  className = '',
  id,
}) => {
  let styleClasses = 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)] border-[var(--color-neutral-200)]';

  if (variant === 'status') {
    if (status === 'complete') {
      styleClasses = 'bg-[var(--color-behavior-blue-bg)] text-[var(--color-behavior-blue-deep)] border-[var(--color-behavior-blue-soft)]';
    } else if (status === 'active') {
      styleClasses = 'bg-[var(--color-behavior-amber-bg)] text-[var(--color-behavior-amber-deep)] border-[var(--color-behavior-amber-soft)]';
    } else if (status === 'unresolved') {
      styleClasses = 'bg-[var(--color-behavior-red-bg)] text-[var(--color-behavior-red-deep)] border-[var(--color-behavior-red-soft)]';
    }
  } else if (variant === 'behavior') {
    if (family === 'blue') {
      styleClasses = 'bg-[var(--color-behavior-blue-bg)] text-[var(--color-behavior-blue-deep)] border-[var(--color-behavior-blue-soft)]';
    } else if (family === 'amber') {
      styleClasses = 'bg-[var(--color-behavior-amber-bg)] text-[var(--color-behavior-amber-deep)] border-[var(--color-behavior-amber-soft)]';
    } else if (family === 'red') {
      styleClasses = 'bg-[var(--color-behavior-red-bg)] text-[var(--color-behavior-red-deep)] border-[var(--color-behavior-red-soft)]';
    }
  } else if (variant === 'mock') {
    styleClasses = 'bg-amber-100/60 text-amber-900 border-amber-300 font-mono text-[10px] uppercase tracking-wider';
  }

  return (
    <span
      id={id}
      data-behavior-type={behaviorType}
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono border rounded-sm ${styleClasses} ${className}`}
    >
      {label}
    </span>
  );
};
