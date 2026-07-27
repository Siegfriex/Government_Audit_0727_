import { BookOpen, Database, Eye, FileText, Info } from 'lucide-react';
import { Link, NavLink } from 'react-router';

import { usePreferences } from '@/shared/hooks/usePreferences';

const navItems = [
  { to: '/', label: '에세이', longLabel: '에세이 (Story)', icon: BookOpen, end: true },
  { to: '/method', label: '방법론', longLabel: '방법론 (Method)', icon: FileText, end: false },
  { to: '/data', label: '데이터', longLabel: '데이터 (Data)', icon: Database, end: false },
  { to: '/about', label: '소개', longLabel: '소개 (About)', icon: Info, end: false },
] as const;

export function HeaderNav() {
  const {
    isPresentationMode,
    isReducedMotion,
    togglePresentationMode,
    toggleReducedMotion,
  } = usePreferences();

  return (
    <header className="sticky top-0 z-[var(--z-navigation)] w-full bg-[var(--color-paper)]/90 backdrop-blur-md border-b border-[var(--color-neutral-200)] transition-all">
      <div className="page-frame flex h-14 min-w-0 items-center justify-between gap-1 sm:gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/"
            className="group flex min-h-11 items-center gap-3 text-left"
            aria-label="메인 스토리로 이동"
          >
            <span className="font-mono text-[10px] tracking-widest uppercase text-[var(--color-neutral-500)] hidden xl:inline">
              PROJECT: P3_CULTURE
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[var(--color-behavior-red-deep)] group-hover:scale-125 transition-transform" />
              <span className="hidden sm:inline font-serif italic text-lg sm:text-xl font-bold tracking-tight text-[var(--color-ink)]">
                문체위 국정감사 6년
              </span>
            </span>
          </Link>
          <span className="hidden 2xl:inline-block text-[11px] font-mono px-2 py-0.5 bg-[var(--color-surface)] text-[var(--color-neutral-700)] border border-[var(--color-neutral-200)]">
            2020–2025
          </span>
        </div>

        <nav className="flex min-w-0 items-center gap-0.5 text-xs font-mono" aria-label="주요 화면">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                aria-label={item.longLabel}
                className={({ isActive }) =>
                  `flex min-h-11 min-w-11 items-center justify-center gap-1 px-1.5 py-1.5 transition-colors sm:px-2 md:px-3 ${
                    isActive
                      ? 'bg-[var(--color-ink)] text-[var(--color-paper)] font-bold'
                      : 'text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)]'
                  }`
                }
              >
                {Icon ? <Icon className="w-3.5 h-3.5" aria-hidden="true" /> : null}
                <span className="hidden lg:inline">{item.longLabel}</span>
                <span className="sr-only lg:hidden">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="flex min-w-0 shrink-0 items-center gap-1 text-xs font-mono sm:gap-2">
          <button
            type="button"
            onClick={togglePresentationMode}
            className={`hidden min-h-11 px-2.5 py-1 items-center gap-1.5 border transition-all sm:flex ${
              isPresentationMode
                ? 'bg-[var(--color-behavior-red-deep)] text-white border-[var(--color-behavior-red-deep)]'
                : 'border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)]'
            }`}
            title="발표 및 전광판 집중 모드 토글"
            aria-pressed={isPresentationMode}
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="hidden xl:inline">{isPresentationMode ? '발표모드 ON' : '발표모드'}</span>
          </button>

          <button
            type="button"
            onClick={toggleReducedMotion}
            className={`min-h-11 min-w-11 px-1.5 py-1 sm:px-2.5 border transition-all ${
              isReducedMotion
                ? 'bg-[var(--color-ink)] text-white border-[var(--color-ink)]'
                : 'border-[var(--color-neutral-200)] text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-100)]'
            }`}
            title="애니메이션 절약 모드"
            aria-pressed={isReducedMotion}
          >
            <span className="hidden xl:inline">{isReducedMotion ? '모션절약 ON' : '모션절약'}</span>
            <span className="xl:hidden" aria-hidden="true">{isReducedMotion ? 'M-OFF' : 'M-ON'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
