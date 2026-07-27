import React, { useState } from 'react';
import { EditorialImageField } from './EditorialImageField';
import { RedlineAtlasCalibration } from './RedlineAtlasCalibration';

export const FoundationGallery: React.FC = () => {
  const [reducedMotion, setReducedMotion] = useState(false);

  return (
    <section className="bg-[var(--color-surface)] border border-[var(--color-neutral-200)] p-4 space-y-6 md:p-6">
      <div className="flex flex-col items-start gap-4 border-b border-[var(--color-neutral-200)] pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="type-heading-2 font-serif text-[var(--color-ink)]">
            Prologue Foundation Gallery & Tokens
          </h2>
          <p className="type-caption font-mono text-[var(--color-neutral-500)]">
            CHAPTER 1 PROLOGUE SYSTEM SPECIFICATION
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReducedMotion(!reducedMotion)}
          className="px-2.5 py-1 text-xs font-mono border rounded border-[var(--color-neutral-300)] bg-[var(--color-paper)] hover:border-[var(--color-neutral-500)] transition-colors"
        >
          {reducedMotion ? '[REDUCED MOTION: ON]' : '[REDUCED MOTION: OFF]'}
        </button>
      </div>

      {/* 1. Type Hierarchy Showcase */}
      <div className="space-y-3">
        <h3 className="type-meta-micro text-[var(--color-neutral-500)]">1. PROLOGUE TYPOGRAPHY HIERARCHY</h3>
        <div className="p-4 bg-[var(--color-paper)] border border-[var(--color-neutral-200)] space-y-4">
          <div>
            <span className="type-meta-micro text-[var(--color-neutral-500)] block mb-1">
              --type-display-hero-quote (clamp(3.5rem, 8.2vw, 8.5rem))
            </span>
            <span className="foundation-type-sample type-display-hero-quote block text-[var(--color-ink)]">
              “검토하겠습니다”
            </span>
          </div>

          <div>
            <span className="type-meta-micro text-[var(--color-neutral-500)] block mb-1">
              --type-display-hero-conclusion (clamp(2.25rem, 5.2vw, 5.5rem))
            </span>
            <span className="type-display-hero-conclusion block">
              6년 뒤, 국정감사엔 무엇이 남았는가
            </span>
          </div>

          <div>
            <span className="type-meta-micro text-[var(--color-neutral-500)] block mb-1">
              --type-meta-micro (clamp(0.625rem, 0.7vw, 0.75rem))
            </span>
            <span className="type-meta-micro text-[var(--color-neutral-700)] block">
              CHAPTER 00 / PROLOGUE — NATIONAL ASSEMBLY AUDIT 2018–2023
            </span>
          </div>
        </div>
      </div>

      {/* 2. Evidence Band, Hairline & Handoff Elbow */}
      <div className="space-y-3">
        <h3 className="type-meta-micro text-[var(--color-neutral-500)]">2. EVIDENCE LINE GEOMETRY VARIATIONS</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Band Form */}
          <div className="p-4 bg-[var(--color-paper)] border border-[var(--color-neutral-200)] flex flex-col justify-between h-36">
            <span className="type-meta-micro text-[var(--color-neutral-500)]">ENTRY BAND (16px)</span>
            <div className="flex items-center gap-3 my-auto">
              <div
                className="bg-[var(--color-behavior-red-deep)] h-16 rounded-xs"
                style={{ width: 'var(--evidence-band-width)' }}
              />
              <span className="type-caption font-mono text-[var(--color-neutral-600)]">
                State P1: Grid Cut Collision
              </span>
            </div>
          </div>

          {/* Hairline Form */}
          <div className="p-4 bg-[var(--color-paper)] border border-[var(--color-neutral-200)] flex flex-col justify-between h-36">
            <span className="type-meta-micro text-[var(--color-neutral-500)]">REVEALED HAIRLINE (2.5px)</span>
            <div className="flex items-center gap-3 my-auto">
              <div
                className="bg-[var(--color-behavior-red-deep)] h-16"
                style={{ width: 'var(--evidence-line-width)' }}
              />
              <span className="type-caption font-mono text-[var(--color-neutral-600)]">
                State P2: Primary Narrative Guide
              </span>
            </div>
          </div>

          {/* Handoff Elbow Form */}
          <div className="p-4 bg-[var(--color-paper)] border border-[var(--color-neutral-200)] flex flex-col justify-between h-36">
            <span className="type-meta-micro text-[var(--color-neutral-500)]">HANDOFF ELBOW (TO SCALE)</span>
            <div className="my-auto h-16 w-full flex items-center justify-center">
              <svg className="w-full h-12 stroke-[var(--color-behavior-red-deep)] fill-none" viewBox="0 0 100 40">
                <path d="M 10 0 L 10 25 C 10 35, 90 35, 90 40" strokeWidth="2.5" strokeLinecap="square" />
              </svg>
            </div>
            <span className="type-caption font-mono text-[var(--color-neutral-600)]">
              State P3: Section Anchor Exit
            </span>
          </div>
        </div>
      </div>

      {/* 3. Hero Image Slot States */}
      <div className="space-y-3">
        <h3 className="type-meta-micro text-[var(--color-neutral-500)]">3. EDITORIAL HERO IMAGE SLOT STATES</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="type-meta-micro text-[var(--color-neutral-500)] block mb-1">State: ASSET_PENDING</span>
            <EditorialImageField
              slotId="prologue-hero-identity-demo"
              aspectRatio="3/4"
              stampBadge="ARCHIVE / DOC-01"
              placeholderCaption="[Midjourney Hero Asset Slot: Audit Document 2018]"
              forcedState="pending"
            />
          </div>

          <div>
            <span className="type-meta-micro text-[var(--color-neutral-500)] block mb-1">State: MISSING / UN-AVAILABLE</span>
            <EditorialImageField
              slotId="prologue-hero-identity-missing"
              aspectRatio="3/4"
              stampBadge="ARCHIVE / DOC-01"
              forcedState="missing"
            />
          </div>
        </div>
      </div>

      {/* 4. Over-Paper Header Sample Preview */}
      <div className="space-y-3">
        <h3 className="type-meta-micro text-[var(--color-neutral-500)]">4. OVER-PAPER HEADER SAMPLE</h3>
        <div className="relative p-4 bg-[var(--color-paper)] border border-[var(--color-neutral-200)] rounded-xs overflow-hidden">
          <div className="p-3 bg-[var(--color-paper)]/90 backdrop-blur-md border-b border-[var(--color-neutral-200)] flex items-center justify-between font-mono text-xs text-[var(--color-ink)]">
            <div className="flex items-center gap-2">
              <span className="font-bold">P3_CULTURE</span>
              <span className="text-[var(--color-neutral-400)]">/</span>
              <span className="text-[var(--color-neutral-600)]">CHAPTER 00</span>
            </div>
            <span className="px-1.5 py-0.5 border border-[var(--color-neutral-300)] text-[10px]">
              MODE: STORY
            </span>
          </div>
          <div className="py-6 text-center text-[var(--color-neutral-500)] font-mono text-xs">
            [Paper Background Context with Clean Backdrop Filter]
          </div>
        </div>
      </div>

      <RedlineAtlasCalibration />
    </section>
  );
};
