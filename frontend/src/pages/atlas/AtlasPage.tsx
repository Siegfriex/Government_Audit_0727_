import { useEffect, useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';

import { useAtlasRelease } from '@/shared/api/atlas/useAtlasRelease';
import { ATLAS_DATA_UNAVAILABLE_COPY } from '@/shared/config/atlas/atlasWarnings';
import { parseAtlasQueryState, serializeAtlasQueryState } from '@/shared/lib/atlas/atlasQueryState';
import { PageFrame } from '@/shared/ui/PageFrame';
import { AtlasDataUnavailable, AtlasLoadingState, AtlasProjectionNote } from '@/shared/ui/atlas';
import { AtlasExplorer } from '@/widgets/atlas-explorer/AtlasExplorer';
import { AtlasMetadataRail } from '@/widgets/atlas-explorer/AtlasMetadataRail';
import { AtlasSectionHeader } from '@/widgets/atlas-explorer/AtlasSectionHeader';
import { AtlasUnavailableShell } from '@/widgets/atlas-explorer/AtlasUnavailableShell';
import { AtlasRouteError } from './AtlasRouteError';
import './atlas-page.css';

export function AtlasPage() {
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  const release = useAtlasRelease();
  const queryResult = useMemo(() => parseAtlasQueryState(location.search), [location.search]);

  useEffect(() => {
    if (queryResult.wasNormalized) {
      setSearchParams(queryResult.canonicalSearch, { replace: true });
    }
  }, [queryResult.canonicalSearch, queryResult.wasNormalized, setSearchParams]);

  const fixtureProvenance = import.meta.env.DEV && import.meta.env.VITE_ATLAS_FIXTURE_PROVENANCE === 'CONTRACT_FIXTURE'
    ? 'CONTRACT_FIXTURE'
    : undefined;
  const releaseState = release.status === 'ready'
    ? `RELEASE ${release.bundle.releaseId}`
    : release.status === 'loading'
      ? 'RELEASE 확인 중'
      : 'APPROVED DATA 미연결';

  return (
    <main id="main-content" className="atlas-page-vid py-12 md:py-16 lg:py-20" data-testid="atlas-page" tabIndex={-1}>
      <PageFrame>
        <AtlasSectionHeader
          index="A"
          eyebrow="FULL EXPLORER / PUBLIC RECORD"
          title="답변행태 지도"
          thesis="Topic Space의 답변행태 분포, 승인된 관계의 이유, 원문 근거 계보를 하나의 release와 projection에서 검증합니다. 브라우저는 투영·집계·상태를 새로 계산하지 않습니다."
          aside={<p className={`inline-flex min-h-11 w-full items-center justify-center border px-4 font-mono text-xs font-bold ${release.status === 'ready' ? 'border-[var(--atlas-state-ready)] bg-[var(--color-behavior-blue-bg)]' : 'border-[var(--atlas-state-warning)] bg-[var(--color-behavior-amber-bg)]'}`} role="status">{releaseState}</p>}
        />
        <div className="mt-6">
          <AtlasMetadataRail
            items={[
              { label: 'Layer 01', value: 'PUBLIC RECORD' },
              { label: 'Layer 02', value: 'QUESTION / ANSWER FIELD' },
              { label: 'Layer 03', value: 'EVIDENCE TRACE' },
              { label: 'Renderer', value: 'AGGREGATE SVG / 2D', tone: release.status === 'ready' ? 'default' : 'warning' },
            ]}
          />
        </div>

        <div className="mt-12">
          {release.status === 'loading' ? (
            <AtlasLoadingState />
          ) : null}
          {release.status === 'unavailable' ? (
            <div className="space-y-6">
              <AtlasDataUnavailable
                title={ATLAS_DATA_UNAVAILABLE_COPY.title}
                description={ATLAS_DATA_UNAVAILABLE_COPY.description}
                reason={release.reason}
                actions={(
                  <>
                    <Link className="atlas-action-primary" to="/#answers">Story Answers로 돌아가기</Link>
                    <Link className="atlas-action-secondary" to="/data">데이터 승인 상태 확인</Link>
                    <Link className="atlas-action-secondary" to="/method">투영 방법 확인</Link>
                  </>
                )}
              />
              {queryResult.issues.length > 0 ? <p className="border border-[var(--atlas-state-warning)] bg-[var(--color-behavior-amber-bg)] px-4 py-3 text-sm" role="status">URL parameter {queryResult.issues.length}개는 안전한 기본값으로 해석됩니다.</p> : null}
              <AtlasUnavailableShell />
              <AtlasProjectionNote />
            </div>
          ) : null}
          {release.status === 'error' ? (
            <AtlasRouteError
              error={release.error}
              onRetry={release.retry}
            />
          ) : null}
          {release.status === 'ready' ? (
            <div className="atlas-vid-workspace">
              <AtlasExplorer
                bundle={release.bundle}
                query={queryResult.state}
                queryIssues={queryResult.issues}
                fixtureProvenance={fixtureProvenance}
                onQueryChange={(query) => setSearchParams(serializeAtlasQueryState(query))}
              />
            </div>
          ) : null}
        </div>
      </PageFrame>
    </main>
  );
}
