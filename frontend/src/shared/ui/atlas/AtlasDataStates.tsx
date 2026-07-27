import type { ReactNode } from 'react';

interface AtlasStatePanelProps {
  eyebrow: string;
  title: string;
  description: string;
  tone?: 'neutral' | 'unavailable' | 'error' | 'contract';
  testId?: string;
  role?: 'status' | 'alert';
  detail?: ReactNode;
  actions?: ReactNode;
  signal?: string;
  loading?: boolean;
  compact?: boolean;
  headingLevel?: 'h1' | 'h2';
}

function AtlasStatePanel({
  eyebrow,
  title,
  description,
  tone = 'neutral',
  testId,
  role,
  detail,
  actions,
  signal = '00',
  loading = false,
  compact = false,
  headingLevel = 'h2',
}: AtlasStatePanelProps) {
  const Heading = headingLevel;
  return (
    <section
      className="atlas-state-panel"
      data-testid={testId}
      data-tone={tone}
      data-compact={compact ? 'true' : undefined}
      role={role}
    >
      {loading ? <span className="atlas-state-progress" aria-hidden="true" /> : null}
      <div className="atlas-state-signal" aria-hidden="true">{signal}</div>
      <div className="atlas-state-content">
        <p className="redline-meta atlas-state-eyebrow">{eyebrow}</p>
        <Heading>{title}</Heading>
        <p className="atlas-state-description">{description}</p>
        {loading ? <div className="atlas-state-skeleton" aria-hidden="true"><span /><span /><span /></div> : null}
        {detail ? <div className="atlas-state-detail">{detail}</div> : null}
        {actions ? <div className="atlas-state-actions">{actions}</div> : null}
      </div>
    </section>
  );
}

interface AtlasLoadingStateProps {
  title?: string;
  description?: string;
  testId?: string;
}

export function AtlasLoadingState({
  title = '승인된 Atlas 데이터를 확인하고 있습니다',
  description = 'manifest와 데이터 계약을 검증하는 동안 임시 좌표나 대체 데이터를 표시하지 않습니다.',
  testId = 'atlas-route-loading',
}: AtlasLoadingStateProps) {
  return (
    <div aria-busy="true">
      <AtlasStatePanel
        eyebrow="DATA CHECK IN PROGRESS"
        title={title}
        description={description}
        testId={testId}
        role="status"
        loading
        signal="…"
      />
    </div>
  );
}

interface AtlasDataUnavailableProps {
  title?: string;
  description: string;
  reason?: string;
  actions?: ReactNode;
  testId?: string;
  headingLevel?: 'h1' | 'h2';
}

export function AtlasDataUnavailable({
  title = '승인된 Atlas 데이터가 아직 없습니다',
  description,
  reason,
  actions,
  testId = 'atlas-data-unavailable',
  headingLevel = 'h2',
}: AtlasDataUnavailableProps) {
  return (
    <AtlasStatePanel
      eyebrow="DATA UNAVAILABLE / FAIL CLOSED"
      title={title}
      description={description}
      tone="unavailable"
      signal="00"
      testId={testId}
      detail={reason ? <p className="font-mono text-xs">상태 코드: {reason}</p> : undefined}
      actions={actions}
      headingLevel={headingLevel}
    />
  );
}

interface AtlasEmptyStateProps {
  title: string;
  description: string;
  onReset?: () => void;
  testId?: string;
}

export function AtlasEmptyState({ title, description, onReset, testId = 'atlas-empty-state' }: AtlasEmptyStateProps) {
  return (
    <AtlasStatePanel
      eyebrow="NO RESULTS"
      title={title}
      description={description}
      testId={testId}
      role="status"
      actions={onReset ? (
        <button type="button" className="atlas-action-primary" onClick={onReset}>필터 초기화</button>
      ) : undefined}
    />
  );
}

interface AtlasErrorStateProps {
  title?: string;
  description: string;
  technicalDetail?: string;
  onRetry?: () => void;
  testId?: string;
}

export function AtlasErrorState({
  title = 'Atlas 데이터를 확인하지 못했습니다',
  description,
  technicalDetail,
  onRetry,
  testId = 'atlas-route-error',
}: AtlasErrorStateProps) {
  return (
    <AtlasStatePanel
      eyebrow="ATLAS ERROR / NO FALLBACK"
      title={title}
      description={description}
      tone="error"
      signal="ERR"
      testId={testId}
      role="alert"
      detail={technicalDetail ? (
        <details>
          <summary className="min-h-11 cursor-pointer py-3 font-mono text-xs font-bold">기술 정보 보기</summary>
          <p className="mt-2 break-words font-mono text-xs">{technicalDetail}</p>
        </details>
      ) : undefined}
      actions={onRetry ? (
        <button type="button" className="atlas-action-primary" onClick={onRetry}>다시 확인</button>
      ) : undefined}
    />
  );
}

interface AtlasContractMismatchProps {
  description: string;
  contractVersion?: string;
  onRetry?: () => void;
}

export function AtlasContractMismatch({ description, contractVersion, onRetry }: AtlasContractMismatchProps) {
  return (
    <AtlasStatePanel
      eyebrow="CONTRACT MISMATCH"
      title="현재 앱과 Atlas 데이터 계약이 일치하지 않습니다"
      description={description}
      tone="contract"
      signal="VER"
      testId="atlas-contract-mismatch"
      role="alert"
      detail={contractVersion ? <p className="font-mono text-xs">계약 버전: {contractVersion}</p> : undefined}
      actions={onRetry ? (
        <button type="button" className="atlas-action-primary" onClick={onRetry}>계약 다시 확인</button>
      ) : undefined}
    />
  );
}

interface AtlasProjectionMismatchProps {
  description: string;
  projectionId?: string;
  onRetry?: () => void;
}

export function AtlasProjectionMismatch({ description, projectionId, onRetry }: AtlasProjectionMismatchProps) {
  return (
    <AtlasStatePanel
      eyebrow="PROJECTION MISMATCH"
      title="현재 좌표계와 Atlas release가 일치하지 않습니다"
      description={description}
      tone="contract"
      signal="XY"
      testId="atlas-projection-mismatch"
      role="alert"
      detail={projectionId ? <p className="font-mono text-xs">요청 projection: {projectionId}</p> : undefined}
      actions={onRetry ? (
        <button type="button" className="atlas-action-primary" onClick={onRetry}>projection 다시 확인</button>
      ) : undefined}
    />
  );
}

interface AtlasStaleReleaseProps {
  description: string;
  releaseId?: string;
  actions?: ReactNode;
}

export function AtlasStaleRelease({ description, releaseId, actions }: AtlasStaleReleaseProps) {
  return (
    <AtlasStatePanel
      eyebrow="STALE RELEASE"
      title="더 최신의 승인 release를 확인해야 합니다"
      description={description}
      tone="unavailable"
      signal="OLD"
      testId="atlas-stale-release"
      role="status"
      detail={releaseId ? <p className="font-mono text-xs">현재 release: {releaseId}</p> : undefined}
      actions={actions}
    />
  );
}

interface AtlasInvalidNodeStateProps {
  nodeId: string;
  onClear: () => void;
}

export function AtlasInvalidNodeState({ nodeId, onClear }: AtlasInvalidNodeStateProps) {
  return (
    <AtlasStatePanel
      eyebrow="INVALID NODE"
      title="요청한 node를 찾을 수 없습니다"
      description="현재 승인 release에 존재하지 않는 선택입니다. 필터는 유지하고 node 선택만 지울 수 있습니다."
      tone="error"
      signal="ID"
      testId="atlas-invalid-node-state"
      role="alert"
      detail={<p className="break-all font-mono text-xs">{nodeId}</p>}
      actions={<button type="button" className="atlas-action-primary" onClick={onClear}>node 선택 지우기</button>}
      compact
    />
  );
}
