import type { ReactNode } from 'react';

interface AtlasSectionHeaderProps {
  index: string;
  eyebrow: string;
  title: string;
  thesis: string;
  aside?: ReactNode;
  headingLevel?: 'h1' | 'h2';
}

export function AtlasSectionHeader({ index, eyebrow, title, thesis, aside, headingLevel = 'h1' }: AtlasSectionHeaderProps) {
  const Heading = headingLevel;
  return (
    <header className="redline-section-header">
      <div className="redline-section-signal" aria-hidden="true">{index}</div>
      <div className="redline-section-copy">
        <p className="redline-meta text-[var(--signal-red-dark)]">{eyebrow}</p>
        <Heading className="redline-page-title">{title}</Heading>
        <p className="redline-thesis">{thesis}</p>
      </div>
      {aside ? <div className="redline-section-aside">{aside}</div> : null}
    </header>
  );
}
