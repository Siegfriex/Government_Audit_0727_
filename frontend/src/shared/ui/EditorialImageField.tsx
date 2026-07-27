import React, { useState } from 'react';

export type ImageSlotState = 'loaded' | 'pending' | 'missing' | 'error';

export interface EditorialImageFieldProps {
  id?: string;
  src?: string;
  alt?: string;
  slotId?: string;
  aspectRatio?: '3/4' | '4/5' | '4/3' | '16/9' | '1/1' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  objectPosition?: string;
  maskVariant?: 'none' | 'archival-paper' | 'grayscale-tone';
  blendVariant?: 'normal' | 'multiply' | 'luminosity';
  priority?: boolean;
  mobileCrop?: 'inline' | 'hide' | 'banner';
  stampBadge?: string;
  placeholderCaption?: string;
  className?: string;
  forcedState?: ImageSlotState;
}

export const EditorialImageField: React.FC<EditorialImageFieldProps> = ({
  id,
  src,
  alt = 'Archival Editorial Evidence Document',
  slotId,
  aspectRatio = '3/4',
  objectFit = 'cover',
  objectPosition = 'center',
  maskVariant = 'grayscale-tone',
  blendVariant = 'normal',
  priority = false,
  mobileCrop = 'inline',
  stampBadge = 'ARCHIVE / DOC-01',
  placeholderCaption = '[Midjourney Hero Asset Slot: National Assembly Audit Document]',
  className = '',
  forcedState,
}) => {
  const [internalState, setInternalState] = useState<ImageSlotState>(
    src ? 'loaded' : 'pending'
  );

  const currentState = forcedState || internalState;

  const aspectClasses = {
    '3/4': 'aspect-[3/4]',
    '4/5': 'aspect-[4/5]',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-[16/9]',
    '1/1': 'aspect-square',
    'auto': 'aspect-auto',
  }[aspectRatio];

  const maskClasses = {
    'none': '',
    'archival-paper': 'filter grayscale-[80%] sepia-[10%] contrast-[1.1]',
    'grayscale-tone': 'filter grayscale contrast-[1.15]',
  }[maskVariant];

  const blendClasses = {
    'normal': 'mix-blend-normal',
    'multiply': 'mix-blend-multiply',
    'luminosity': 'mix-blend-luminosity',
  }[blendVariant];

  const mobileClasses = {
    'inline': 'block',
    'hide': 'hidden md:block',
    'banner': 'block md:aspect-[3/4] aspect-[16/9]',
  }[mobileCrop];

  return (
    <figure
      id={id || slotId}
      className={`editorial-image-slot relative overflow-hidden bg-[var(--color-neutral-100)] border border-[var(--color-neutral-200)] ${aspectClasses} ${mobileClasses} ${className}`}
      data-asset-status={currentState}
      data-slot-id={slotId}
    >
      {/* Stamp Badge */}
      {stampBadge && (
        <div className="absolute top-2.5 left-2.5 z-10 font-mono text-[10px] tracking-widest text-[var(--color-neutral-700)] uppercase border border-[var(--color-neutral-300)] px-1.5 py-0.5 bg-[var(--color-paper)]/90 backdrop-blur-xs select-none">
          {stampBadge}
        </div>
      )}

      {/* Render states */}
      {currentState === 'pending' || !src ? (
        <div className="absolute inset-0 flex flex-col justify-between p-3 bg-gradient-to-br from-[var(--color-paper)] to-[var(--color-neutral-200)]/60 text-[var(--color-neutral-600)]">
          <div className="h-4" /> {/* Spacer for badge */}
          <div className="space-y-1.5 opacity-80">
            <div className="w-12 h-0.5 bg-[var(--color-behavior-red-deep)]/40" />
            <p className="font-mono text-[10px] leading-tight text-[var(--color-neutral-600)]">
              {placeholderCaption}
            </p>
          </div>
        </div>
      ) : currentState === 'error' || currentState === 'missing' ? (
        <div className="absolute inset-0 flex flex-col justify-center items-center p-4 bg-[var(--color-neutral-100)] text-[var(--color-neutral-500)] text-center font-mono text-[11px]">
          <span>[DOCUMENT ASSET UN-AVAILABLE]</span>
          <span className="text-[9px] text-[var(--color-neutral-400)] mt-1">{slotId}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          onError={() => setInternalState('error')}
          onLoad={() => setInternalState('loaded')}
          className={`w-full h-full ${maskClasses} ${blendClasses} transition-opacity duration-300`}
          style={{ objectFit, objectPosition }}
          referrerPolicy="no-referrer"
        />
      )}
    </figure>
  );
};
