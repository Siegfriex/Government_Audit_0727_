import type { ReactNode } from 'react';
import type { EvidenceDetailViewModel } from '@/shared/types/atlas';

interface EvidenceHeaderProps {
  recordId: string;
  title: string;
  context: string;
  headingLevel?: 'h1' | 'h2';
}

export function EvidenceHeader({ recordId, title, context, headingLevel = 'h2' }: EvidenceHeaderProps) {
  const Heading = headingLevel;
  return (
    <header className="border-b-2 border-[var(--ink-primary)] pb-6">
      <p className="redline-meta text-[var(--signal-red-dark)]">EVIDENCE TRACE / <span>{recordId}</span></p>
      <Heading className="mt-4 max-w-3xl font-serif text-4xl font-bold leading-[1.02] tracking-[-0.03em]">{title}</Heading>
      <p className="mt-4 font-mono text-xs text-[var(--ink-tertiary)]">{context}</p>
    </header>
  );
}

export function EvidenceFixtureNotice() {
  return (
    <p className="evidence-fixture-notice" role="status">
      MOCK PREVIEW / DEVELOPMENT ONLY / 승인된 EvidenceRepository 결과가 아님
    </p>
  );
}

interface EvidenceUnavailableStateProps {
  evidenceId: string;
  description?: string;
  actions?: ReactNode;
  compact?: boolean;
  headingLevel?: 'h1' | 'h2';
}

export function EvidenceUnavailableState({
  evidenceId,
  description = '승인된 EvidenceRepository에 이 기록의 공개 상세가 연결되지 않았습니다. 개발용 발췌문이나 임시 PDF를 대신 표시하지 않습니다.',
  actions,
  compact = false,
  headingLevel = 'h2',
}: EvidenceUnavailableStateProps) {
  const Heading = headingLevel;
  return (
    <section
      className="evidence-unavailable-panel"
      data-compact={compact ? 'true' : undefined}
      data-testid="evidence-data-unavailable"
      role="status"
    >
      <p className="redline-meta text-[var(--signal-red-dark)]">EVIDENCE STATUS / UNAVAILABLE</p>
      <p className="evidence-unavailable-id">{evidenceId}</p>
      <Heading>승인된 증거 상세가 아직 없습니다</Heading>
      <p>{description}</p>
      {actions ? <div className="atlas-state-actions">{actions}</div> : null}
    </section>
  );
}

export function EvidenceStatusPair({ reported, verified }: { reported: string; verified: string }) {
  return (
    <dl className="grid grid-cols-2 border-y border-[var(--line-medium)] text-sm">
      <div className="border-r border-[var(--line-faint)] p-4"><dt className="redline-meta text-[var(--ink-tertiary)]">REPORTED STATUS</dt><dd className="mt-2 font-bold">{reported}</dd></div>
      <div className="p-4"><dt className="redline-meta text-[var(--signal-red-dark)]">VERIFICATION STATUS</dt><dd className="mt-2 font-bold">{verified}</dd></div>
    </dl>
  );
}

interface EvidenceChainItem { step: string; label: string; detail: string }

export function EvidenceChain({ items }: { items: readonly EvidenceChainItem[] }) {
  return (
    <ol className="grid gap-0 border-t border-[var(--line-medium)]">
      {items.map((item) => (
        <li key={item.step} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-4 border-b border-[var(--line-faint)] py-4">
          <span className="font-mono text-xs font-bold text-[var(--signal-red-dark)]">{item.step}</span>
          <div><p className="font-bold">{item.label}</p><p className="mt-1 text-sm leading-relaxed text-[var(--ink-secondary)]">{item.detail}</p></div>
        </li>
      ))}
    </ol>
  );
}

export function EvidenceQuote({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="border-l-2 border-[var(--signal-red)] py-2 pl-5">
      <figcaption className="redline-meta text-[var(--ink-tertiary)]">{label}</figcaption>
      <blockquote className="mt-3 font-serif text-xl font-medium leading-relaxed">{children}</blockquote>
    </figure>
  );
}

export function EvidenceVerificationPanel({ conclusion, detail }: { conclusion: string; detail: string }) {
  return (
    <section className="redline-inverse p-5 md:p-6">
      <p className="redline-meta text-[var(--signal-red)]">ADDITIONAL VERIFICATION</p>
      <h3 className="mt-3 font-serif text-2xl font-bold">{conclusion}</h3>
      <p className="mt-4 text-sm leading-relaxed text-[var(--inverse-muted)]">{detail}</p>
    </section>
  );
}

interface EvidenceProvenanceRailProps {
  meetingId: string;
  pages: string;
  pdfAsset: string;
  pipelineRun: string;
  reviewStatus: string;
  publicationStatus: string;
}

export function EvidenceProvenanceRail(props: EvidenceProvenanceRailProps) {
  const items = [
    ['MEETING', props.meetingId],
    ['PAGES', props.pages],
    ['PDF ASSET', props.pdfAsset],
    ['PIPELINE', props.pipelineRun],
    ['REVIEW', props.reviewStatus],
    ['PUBLICATION', props.publicationStatus],
  ];
  return (
    <dl className="grid grid-cols-2 border border-[var(--line-medium)] font-mono text-[11px] md:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label} className="min-w-0 border-b border-r border-[var(--line-faint)] p-3">
          <dt className="text-[var(--ink-tertiary)]">{label}</dt>
          <dd className="mt-1 [overflow-wrap:anywhere] font-bold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function EvidenceApprovedRecord({
  detail,
  headingLevel = 'h2',
}: {
  detail: EvidenceDetailViewModel;
  headingLevel?: 'h1' | 'h2';
}) {
  return (
    <article className="evidence-record-layout" data-testid="approved-evidence-detail" data-evidence-id={detail.id}>
      <EvidenceHeader
        recordId={detail.id}
        title={detail.title}
        context={`회의 ${detail.meetingId} / ${detail.pageStartNo}–${detail.pageEndNo}`}
        headingLevel={headingLevel}
      />
      <EvidenceStatusPair reported={detail.reportedStatus} verified={detail.verificationStatus} />
      <EvidenceChain
        items={[
          { step: '01', label: '시정요구', detail: detail.requestText },
          { step: '02', label: '당시 질문', detail: detail.questionText },
          { step: '03', label: '당시 답변', detail: detail.answerText },
          { step: '04', label: '공개 증거 발췌', detail: detail.excerpt },
        ]}
      />
      <EvidenceVerificationPanel
        conclusion={detail.verificationStatus}
        detail={`공개 승인 상세와 manifest SHA-256 검증을 통과했습니다. 보고 상태: ${detail.reportedStatus}.`}
      />
      <EvidenceProvenanceRail
        meetingId={detail.meetingId}
        pages={`${detail.pageStartNo}–${detail.pageEndNo}`}
        pdfAsset={detail.pdfAssetId}
        pipelineRun={detail.pipelineRunId}
        reviewStatus="APPROVED"
        publicationStatus="PUBLIC"
      />
      <footer className="border-t border-[var(--line-medium)] pt-4 font-mono text-xs text-[var(--ink-secondary)] [overflow-wrap:anywhere]">
        SOURCE PDF SHA-256: {detail.sourcePdfSha256}
      </footer>
    </article>
  );
}
