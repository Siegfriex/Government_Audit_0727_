import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router';
import { useEvidenceDetail } from '@/shared/api/atlas/useEvidenceDetail';
import { MOCK_EVIDENCES, EDITORIAL_CASES } from '@/shared/mock/storyData';
import type { DetailKind } from '@/shared/types/routing';
import { Badge } from '@/shared/ui/Badge';
import { LineSymbol } from '@/shared/ui/LineSymbol';
import { EvidenceApprovedRecord, EvidenceFixtureNotice, EvidenceUnavailableState } from '@/shared/ui/evidence';
import { Drawer } from '@/shared/ui/overlay/Drawer';
import { X, AlertTriangle, Copy, Check } from 'lucide-react';

interface EvidenceDrawerProps {
  kind: DetailKind;
  itemId: string;
  onClose: () => void;
}

const EVIDENCE_TABS = [
  { id: 'evidence', label: '원문 증거' },
  { id: 'transcript', label: '속기록 질의답변' },
  { id: 'verification', label: '저널리즘 검증' },
  { id: 'source', label: '출처 및 PDF' },
] as const;

type EvidenceTabId = (typeof EVIDENCE_TABS)[number]['id'];

export function EvidenceDrawer({ kind, itemId, onClose }: EvidenceDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [activeTab, setActiveTab] = useState<EvidenceTabId>('evidence');
  const tabRefs = useRef(new Map<EvidenceTabId, HTMLButtonElement>());
  const [copied, setCopied] = useState(false);
  const activeEvidenceId = kind === 'evidence' ? itemId : null;
  const activeCaseId = kind === 'case' ? itemId : null;
  const fixtureMode = import.meta.env.DEV
    && import.meta.env.VITE_ATLAS_FIXTURE_PROVENANCE === 'CONTRACT_FIXTURE';
  const approvedEvidence = useEvidenceDetail(!fixtureMode && kind === 'evidence' ? itemId : null);
  const activeCase = fixtureMode
    ? EDITORIAL_CASES.find((c) => c.id === activeCaseId)
    : undefined;
  const requestedEvidenceId = fixtureMode
    ? activeEvidenceId ?? activeCase?.evidenceId
    : itemId;
  const activeEvidence = fixtureMode
    ? MOCK_EVIDENCES.find((evidence) => evidence.id === requestedEvidenceId)
    : undefined;

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleCopySource = () => {
    if (!activeEvidence) return;
    const citation = `[증거 ${activeEvidence?.id.toUpperCase()}] ${activeEvidence?.issue} (${activeEvidence?.sourceLabel}, ${activeEvidence?.sourcePage})`;
    void navigator.clipboard.writeText(citation);
    setCopied(true);
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, tabId: EvidenceTabId) => {
    const currentIndex = EVIDENCE_TABS.findIndex((tab) => tab.id === tabId);
    let nextIndex: number;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % EVIDENCE_TABS.length;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + EVIDENCE_TABS.length) % EVIDENCE_TABS.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = EVIDENCE_TABS.length - 1;
    else return;
    event.preventDefault();
    const nextTab = EVIDENCE_TABS[nextIndex].id;
    setActiveTab(nextTab);
    tabRefs.current.get(nextTab)?.focus();
  };

  if (!fixtureMode && kind === 'evidence') {
    return (
      <Drawer
        open
        onClose={onClose}
        titleId="drawer-title"
        descriptionId="drawer-description"
        initialFocusRef={closeButtonRef}
      >
        <div className="evidence-drawer-shell" data-testid="approved-evidence-drawer">
          <header className="evidence-drawer-header">
            <div>
              <p className="redline-meta text-[var(--signal-red-dark)]">EVIDENCE TRACE / APPROVED RELEASE</p>
              <h2 id="drawer-title" className="mt-3 font-serif text-3xl font-bold">승인된 증거 상세</h2>
              <p id="drawer-description" className="mt-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
                current Atlas release의 manifest와 동일한 EvidenceRepository 결과입니다.
              </p>
            </div>
            <button type="button" ref={closeButtonRef} onClick={onClose} className="inline-flex min-h-11 min-w-11 items-center justify-center" aria-label="드로어 닫기">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>
          <div
            className="evidence-drawer-body"
            role="region"
            aria-label="승인된 증거 상세 내용"
            tabIndex={0}
          >
            {approvedEvidence.status === 'loading' ? (
              <div aria-busy="true" data-testid="evidence-detail-loading">
                <p className="redline-meta">EVIDENCE DETAIL / LOADING</p>
                <p className="mt-3 font-serif text-2xl font-bold">승인 상세를 불러오고 있습니다</p>
              </div>
            ) : null}
            {approvedEvidence.status === 'ready' ? <EvidenceApprovedRecord detail={approvedEvidence.detail} /> : null}
            {approvedEvidence.status === 'unavailable' || approvedEvidence.status === 'error' ? (
              <EvidenceUnavailableState
                evidenceId={itemId}
                compact
                description={approvedEvidence.status === 'error' ? approvedEvidence.error.message : `승인된 release에서 이 기록을 사용할 수 없습니다. ${approvedEvidence.reason}`}
                actions={(
                  <>
                    {approvedEvidence.status === 'error' ? <button type="button" className="atlas-action-primary" onClick={approvedEvidence.retry}>다시 시도</button> : null}
                    <button type="button" className="atlas-action-secondary" onClick={onClose}>Atlas로 돌아가기</button>
                  </>
                )}
              />
            ) : null}
          </div>
        </div>
      </Drawer>
    );
  }

  if (!activeEvidence) {
    return (
      <Drawer
        open
        onClose={onClose}
        titleId="drawer-title"
        descriptionId="drawer-description"
        initialFocusRef={closeButtonRef}
      >
        <div className="evidence-drawer-shell">
          <header className="evidence-drawer-header">
            <div>
              <p className="redline-meta text-[var(--signal-red-dark)]">EVIDENCE TRACE / UNAVAILABLE</p>
              <h2 id="drawer-title" className="mt-3 font-serif text-3xl font-bold">증거 상세를 표시할 수 없습니다</h2>
              <p id="drawer-description" className="mt-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
                선택한 node는 유지됩니다. 승인된 EvidenceRepository 상세가 연결되기 전에는 개발용 발췌문을 대신 표시하지 않습니다.
              </p>
            </div>
            <button
              type="button"
              ref={closeButtonRef}
              onClick={onClose}
              className="inline-flex min-h-11 min-w-11 items-center justify-center"
              aria-label="드로어 닫기"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </header>
          <div className="evidence-drawer-body">
            <EvidenceUnavailableState
              evidenceId={requestedEvidenceId ?? itemId}
              compact
              actions={(
                <>
                  <Link className="atlas-action-primary" to="/data">데이터 상태 확인</Link>
                  <button type="button" className="atlas-action-secondary" onClick={onClose}>Atlas로 돌아가기</button>
                </>
              )}
            />
          </div>
        </div>
      </Drawer>
    );
  }

  return (
    <Drawer
      open
      onClose={onClose}
      titleId="drawer-title"
      descriptionId="drawer-description"
      initialFocusRef={closeButtonRef}
    >
      <div className="evidence-drawer-shell">
        {/* Drawer Header */}
        <div className="evidence-drawer-header-block">
          <EvidenceFixtureNotice />
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <span className="type-mono font-bold text-xs text-[var(--color-behavior-red-deep)] px-2 py-0.5 bg-[var(--color-behavior-red-bg)]">
                {activeEvidence.id.toUpperCase()}
              </span>
              <Badge label={activeEvidence.reportedStatusLabel} variant="status" status={activeEvidence.reportedStatus} />
              <LineSymbol style={activeEvidence.lineStyle} length={40} />
            </div>

            <button
              type="button"
              ref={closeButtonRef}
              onClick={onClose}
              className="inline-flex min-h-11 min-w-11 items-center justify-center text-[var(--color-neutral-500)] hover:text-[var(--color-ink)] hover:bg-[var(--color-neutral-200)] transition-colors"
              aria-label="드로어 닫기"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          <h3 id="drawer-title" className="type-heading-2 font-serif text-[var(--color-ink)] mb-2">
            {activeEvidence.issue}
          </h3>

          <div id="drawer-description" className="type-caption font-mono text-[var(--color-neutral-500)]">
            {activeEvidence.auditYear}년도 국정감사 · 피감기관: {activeEvidence.targetOrg}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="drawer-tabs flex items-center border-b border-[var(--color-neutral-200)] bg-[var(--color-surface)] px-6 font-mono text-xs" role="tablist" aria-label="증거 상세 섹션">
          {EVIDENCE_TABS.map((tab) => (
            <button
              key={tab.id}
              ref={(element) => {
                if (element) tabRefs.current.set(tab.id, element);
                else tabRefs.current.delete(tab.id);
              }}
              id={`drawer-tab-${tab.id}`}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              onKeyDown={(event) => handleTabKeyDown(event, tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls="drawer-tabpanel"
              tabIndex={activeTab === tab.id ? 0 : -1}
              className={`px-3 py-3 border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-[var(--color-behavior-red-deep)] text-[var(--color-ink)] font-bold'
                  : 'border-transparent text-[var(--color-neutral-500)] hover:text-[var(--color-ink)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Body */}
        <div
          id="drawer-tabpanel"
          className="evidence-drawer-body space-y-6"
          role="tabpanel"
          aria-labelledby={`drawer-tab-${activeTab}`}
          tabIndex={0}
        >
          {activeCase && (
            <div className="p-4 bg-[var(--color-behavior-amber-bg)] border border-[var(--color-behavior-amber-soft)] mb-4">
              <span className="type-mono text-[10px] uppercase font-bold text-[var(--color-behavior-amber-deep)] block mb-1">
                대표 사례 연결 ({activeCase.caseNumber})
              </span>
              <p className="type-body-m font-serif font-bold text-[var(--color-ink)]">
                {activeCase.title}
              </p>
              <p className="type-caption text-[var(--color-neutral-700)] mt-1">
                {activeCase.summary}
              </p>
            </div>
          )}

          {activeTab === 'evidence' && (
            <div className="space-y-6">
              <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-neutral-200)]">
                <span className="type-mono text-xs font-bold text-[var(--color-neutral-500)] block mb-2">
                  국정감사 시정요구 전문
                </span>
                <p className="type-body-l font-serif text-[var(--color-ink)] leading-relaxed">
                  "{activeEvidence.issue}"
                </p>
              </div>

              <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-neutral-200)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="type-mono text-xs font-bold text-[var(--color-neutral-500)]">
                    피감기관 공식 처리 답변
                  </span>
                  <Badge label={activeEvidence.behaviorLabel} variant="behavior" />
                </div>
                <p className="type-body-m text-[var(--color-neutral-900)] leading-relaxed">
                  {activeEvidence.answerExcerpt}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'transcript' && (
            <div className="space-y-6">
              <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-neutral-200)]">
                <div className="flex items-center gap-2 mb-2 text-xs font-mono text-[var(--color-neutral-500)]">
                  <span>질의 의원: {activeEvidence.questioner}</span>
                  <span>·</span>
                  <span>위원회: {activeEvidence.committee}</span>
                </div>
                <p className="type-body-m font-serif italic text-[var(--color-neutral-900)] leading-relaxed">
                  {activeEvidence.questionExcerpt}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'verification' && (
            <div className="space-y-6">
              <div className="p-5 bg-[var(--color-behavior-red-bg)] border border-[var(--color-behavior-red-soft)]">
                <div className="flex items-center gap-2 text-[var(--color-behavior-red-deep)] mb-2 font-bold font-mono text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>실질 검증 한줄 결론</span>
                </div>
                <p className="type-body-l font-serif font-bold text-[var(--color-behavior-red-deep)] mb-3">
                  {activeEvidence.verificationLabel}
                </p>
                <p className="type-body-m text-[var(--color-neutral-700)] leading-relaxed">
                  {activeEvidence.verificationDetail}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'source' && (
            <div className="space-y-6">
              <div className="p-5 bg-[var(--color-surface)] border border-[var(--color-neutral-200)] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="type-mono text-xs text-[var(--color-neutral-500)]">출처 문헌:</span>
                  <Badge label="MOCK CITATION" variant="mock" />
                </div>
                <p className="type-body-m font-mono font-bold text-[var(--color-ink)]">
                  {activeEvidence.sourceLabel}
                </p>
                <p className="type-caption font-mono text-[var(--color-neutral-500)]">
                  수록 페이지: {activeEvidence.sourcePage}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopySource}
                className="flex min-h-11 w-full items-center justify-center gap-2 bg-[var(--color-ink)] px-4 py-2.5 font-mono text-xs text-[var(--color-paper)] transition-colors hover:bg-[var(--color-neutral-700)]"
              >
                {copied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                <span>{copied ? '출처 인용문 복사됨' : '출처 인용문 복사하기'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[var(--color-neutral-200)] bg-[var(--color-surface)] flex items-center justify-between text-xs font-mono">
          <span className="text-[var(--color-neutral-500)]">
            Single Overlay Infrastructure
          </span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 px-4 py-1.5 border border-[var(--color-neutral-200)] bg-[var(--color-paper)] hover:bg-[var(--color-neutral-100)] transition-colors"
          >
            닫기 (ESC)
          </button>
        </div>
      </div>
    </Drawer>
  );
}
