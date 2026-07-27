import type { ReactNode } from 'react';

interface AtlasStageFrameProps {
  label: string;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  testId?: string;
}

export function AtlasStageFrame({ label, title, children, footer, testId }: AtlasStageFrameProps) {
  return (
    <section className="redline-stage-frame" aria-labelledby={`${testId ?? 'atlas-stage'}-title`} data-testid={testId}>
      <header>
        <p className="redline-meta">{label}</p>
        <h2 id={`${testId ?? 'atlas-stage'}-title`}>{title}</h2>
      </header>
      <div className="redline-stage-body">{children}</div>
      {footer ? <footer>{footer}</footer> : null}
    </section>
  );
}
