import { useMemo, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router';

import { useAtlasRelease } from '@/shared/api/atlas/useAtlasRelease';
import {
  ATLAS_PLOT_RECT,
  ATLAS_VIEWBOX,
  getPresentedNodeRadius,
  type NodeFilterState,
} from '@/shared/config/atlas/atlasEncoding';
import type { AtlasNodeViewModel, AtlasViewModelBundle } from '@/shared/types/atlas';
import { AtlasDataUnavailable, AtlasLoadingState, AtlasProjectionNote } from '@/shared/ui/atlas';
import { AtlasDomMirror } from '@/widgets/atlas-explorer/AtlasDomMirror';
import { AtlasMetadataRail } from '@/widgets/atlas-explorer/AtlasMetadataRail';
import { AtlasNodeGlyph } from '@/widgets/atlas-explorer/AtlasNodeGlyph';
import { AtlasScene } from '@/widgets/atlas-explorer/AtlasScene';
import { AtlasSectionHeader } from '@/widgets/atlas-explorer/AtlasSectionHeader';
import './projection-method-lab.css';

const LAB_VIEWS = [
  { id: 'umap2d', label: 'UMAP 2D', state: 'CANONICAL' },
  { id: 'compare', label: 'PCA ↔ UMAP', state: 'COMPARE' },
  { id: 'pca2d', label: 'PCA 2D', state: 'UNAVAILABLE' },
  { id: 'pca3d', label: '3D SHELL', state: 'OPTIONAL' },
  { id: 'tensor', label: 'TENSOR', state: 'SPEC ONLY' },
] as const;

type LabView = (typeof LAB_VIEWS)[number]['id'];
type CameraPreset = 'front' | 'side' | 'top';

function ProjectionMiniPlot({
  title,
  mode,
  nodes,
  selectedNodeId,
}: {
  title: string;
  mode: 'umap' | 'pca';
  nodes: readonly AtlasNodeViewModel[];
  selectedNodeId: string | null;
}) {
  const available = mode === 'umap';
  const description = available
    ? `${nodes.length}개 승인 aggregate node의 canonical UMAP 2D 표시입니다. 선택된 node는 붉은 ring으로 구분합니다.`
    : '승인된 PCA 좌표가 없어 node를 표시하지 않는 PCA 2D 계약 프레임입니다.';

  return (
    <section className="projection-mini-plot" data-method={mode}>
      <header>
        <div>
          <p className="redline-meta">{mode === 'umap' ? 'NONLINEAR / LOCAL NEIGHBORHOOD' : 'LINEAR / EXPLAINED VARIANCE'}</p>
          <h3>{title}</h3>
        </div>
        <span>{available ? 'APPROVED COORDINATES' : 'DATA UNAVAILABLE'}</span>
      </header>
      <div className="projection-mini-plot__field">
        <svg viewBox={`0 0 ${ATLAS_VIEWBOX.width} ${ATLAS_VIEWBOX.height}`} role="img" aria-label={description}>
          <title>{title}</title>
          <desc>{description}</desc>
          <defs>
            <pattern id={`projection-grid-${mode}`} width="72" height="52" patternUnits="userSpaceOnUse">
              <path d="M 72 0 L 0 0 0 52" fill="none" stroke="var(--projection-grid)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect x={ATLAS_PLOT_RECT.x} y={ATLAS_PLOT_RECT.y} width={ATLAS_PLOT_RECT.width} height={ATLAS_PLOT_RECT.height} fill={`url(#projection-grid-${mode})`} stroke="var(--line-strong)" />
          {available ? nodes.map((node) => (
            <g key={node.id} transform={`translate(${node.screen.x} ${node.screen.y})`} aria-hidden="true">
              <AtlasNodeGlyph
                shape={node.encoding.shapeToken}
                answerType={node.answerType}
                status={node.status}
                fill={node.encoding.fillToken}
                stroke={node.encoding.strokeToken}
                opacity={node.encoding.opacity}
                radius={getPresentedNodeRadius(node.radiusPx)}
                state={node.id === selectedNodeId ? 'selected' : 'default'}
              />
            </g>
          )) : (
            <g className="projection-mini-plot__empty" aria-hidden="true">
              <line x1="90" y1="440" x2="650" y2="440" />
              <line x1="90" y1="440" x2="90" y2="80" />
              <text x="620" y="468">PC1</text>
              <text x="52" y="94">PC2</text>
              <text x="370" y="260" textAnchor="middle">APPROVED PCA COORDINATES ABSENT</text>
            </g>
          )}
        </svg>
      </div>
      <p>{available ? 'UMAP 축은 의미 축이 아닙니다.' : 'PC1·PC2와 explained variance는 승인 projection payload가 제공될 때만 활성화합니다.'}</p>
    </section>
  );
}

function ProjectionDossier({ node, bundle }: { node: AtlasNodeViewModel | null; bundle: AtlasViewModelBundle }) {
  return (
    <aside className="projection-lab-dossier" aria-label="Method Lab 선택 node 정보" aria-live="polite">
      <p className="redline-meta">SYNCHRONIZED IDENTITY</p>
      {!node ? (
        <div className="projection-lab-dossier__empty">
          <span aria-hidden="true">＋</span>
          <h3>동일 node를 방법 간 비교</h3>
          <p>UMAP 장면이나 keyboard navigator에서 node를 선택하면 Method view 전체가 같은 ID를 유지합니다.</p>
        </div>
      ) : (
        <div className="projection-lab-dossier__selected">
          <div><span>{node.answerType}</span><strong>{node.topicLabel ?? 'topic label 미제공'}</strong></div>
          <p>{node.id}</p>
          <dl>
            <div><dt>Behavior</dt><dd>{node.behaviorFamily}</dd></div>
            <div><dt>Status</dt><dd>{node.status}</dd></div>
            <div><dt>Mass</dt><dd>{node.normalizedMass.toFixed(3)}</dd></div>
            <div><dt>Confidence</dt><dd>{node.confidence === null ? 'N/A' : node.confidence.toFixed(3)}</dd></div>
          </dl>
          <Link className="atlas-action-primary" to={`/atlas?node=${encodeURIComponent(node.id)}`}>Full Explorer에서 이어보기</Link>
        </div>
      )}
      <div className="projection-lab-dossier__release">
        <span>RELEASE</span>
        <strong>{bundle.releaseId}</strong>
        <span>PROJECTION</span>
        <strong>{bundle.projectionId}</strong>
      </div>
    </aside>
  );
}

function MethodUnavailable({
  code,
  title,
  description,
  children,
}: {
  code: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="projection-method-unavailable" role="status">
      <span aria-hidden="true">{code}</span>
      <div>
        <p className="redline-meta">METHOD DATA UNAVAILABLE / NO SYNTHETIC FALLBACK</p>
        <h2>{title}</h2>
        <p>{description}</p>
        {children}
      </div>
    </section>
  );
}

function ThreeDimensionalShell({ preset, onPresetChange }: { preset: CameraPreset; onPresetChange: (preset: CameraPreset) => void }) {
  return (
    <section className="projection-3d-shell" data-preset={preset}>
      <header>
        <div>
          <p className="redline-meta">OPTIONAL ANALYSIS LAYER / FIXED CAMERA</p>
          <h2>3D projection shell</h2>
        </div>
        <span>UNSUPPORTED 3D DATA</span>
      </header>
      <div className="projection-3d-shell__controls" role="group" aria-label="고정 카메라 시점">
        {(['front', 'side', 'top'] as const).map((value) => (
          <button key={value} type="button" aria-pressed={preset === value} onClick={() => onPresetChange(value)}>{value}</button>
        ))}
        <button type="button" onClick={() => onPresetChange('front')}>reset</button>
        <button type="button" disabled title="승인 centroid screen coordinate가 없습니다">centroid</button>
        <button type="button" disabled title="승인 3D 좌표가 없습니다">slice</button>
      </div>
      <div className="projection-3d-shell__viewport" role="img" aria-label={`승인된 3D 좌표 없이 ${preset} 고정 시점의 접근 가능한 interface shell만 표시합니다.`}>
        <div className="projection-3d-shell__cube" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
        <p>3D VIEW UNAVAILABLE<br /><span>canonical 2D remains available</span></p>
      </div>
      <div className="projection-3d-shell__alternative">
        <h3>동등한 대체 표현</h3>
        <p>3D가 없어도 UMAP 2D와 node table에서 동일 ID, 상태, 질량, confidence를 확인할 수 있습니다.</p>
        <Link className="atlas-action-primary" to="/atlas">2D canonical Atlas 열기</Link>
      </div>
    </section>
  );
}

export function ProjectionMethodLabPage() {
  const release = useAtlasRelease();
  const [view, setView] = useState<LabView>('umap2d');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [previewNodeId, setPreviewNodeId] = useState<string | null>(null);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('front');

  const bundle = release.status === 'ready' ? release.bundle : null;
  const selectedNode = bundle && selectedNodeId ? bundle.nodes.find((node) => node.id === selectedNodeId) ?? null : null;
  const filterStates = useMemo(
    () => new Map((bundle?.nodes ?? []).map((node): [string, NodeFilterState] => [node.id, 'matched'])),
    [bundle],
  );

  const handleTabKey = (event: KeyboardEvent<HTMLButtonElement>, current: LabView) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = LAB_VIEWS.findIndex((item) => item.id === current);
    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? LAB_VIEWS.length - 1
        : (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + LAB_VIEWS.length) % LAB_VIEWS.length;
    setView(LAB_VIEWS[nextIndex].id);
    document.getElementById(`projection-tab-${LAB_VIEWS[nextIndex].id}`)?.focus();
  };

  return (
    <main id="main-content" className="projection-method-lab" data-testid="projection-method-lab" tabIndex={-1}>
      <div className="page-frame">
        <AtlasSectionHeader
          index="M"
          eyebrow="PROJECTION METHOD LAB / OPT-IN ANALYSIS"
          title="투영 방식은 어떻게 다르게 보이는가"
          thesis="Public Story와 Explorer의 canonical view는 2D UMAP입니다. 이 Lab은 승인된 projection만 표시하며 PCA·3D·Tensor 입력이 없을 때 합성 점을 만들지 않습니다."
          aside={<p className="projection-method-lab__warning">두 projection의 좌표는 직접 비교 가능한 절대 좌표가 아닙니다.</p>}
        />

        <div className="mt-6">
          <AtlasMetadataRail
            label="Projection Method Lab 상태"
            items={[
              { label: 'Canonical', value: 'UMAP 2D' },
              { label: 'PCA payload', value: 'ABSENT', tone: 'warning' },
              { label: '3D payload', value: 'ABSENT', tone: 'warning' },
              { label: 'Tensor pipeline', value: 'NOT VERIFIED', tone: 'signal' },
            ]}
          />
        </div>

        <nav className="projection-method-lab__backlinks" aria-label="Method Lab 관련 화면">
          <Link to="/method">전체 방법론</Link>
          <Link to="/atlas">Canonical Atlas</Link>
          <Link to="/#answers">Story Preview</Link>
        </nav>

        <div className="projection-method-tabs" role="tablist" aria-label="Projection 표시 방식">
          {LAB_VIEWS.map((item) => (
            <button
              id={`projection-tab-${item.id}`}
              key={item.id}
              type="button"
              role="tab"
              aria-selected={view === item.id}
              aria-controls="projection-method-panel"
              tabIndex={view === item.id ? 0 : -1}
              onClick={() => setView(item.id)}
              onKeyDown={(event) => handleTabKey(event, item.id)}
            >
              <span>{item.label}</span>
              <small>{item.state}</small>
            </button>
          ))}
        </div>

        <section id="projection-method-panel" className="projection-method-panel" role="tabpanel" aria-labelledby={`projection-tab-${view}`}>
          {release.status === 'loading' ? <AtlasLoadingState title="Projection release를 확인하고 있습니다" /> : null}
          {release.status === 'unavailable' ? (
            <AtlasDataUnavailable
              title="Method Lab의 승인 Atlas release가 없습니다"
              description="canonical UMAP release가 없으면 PCA·3D shell에도 가짜 node를 표시하지 않습니다."
              reason={release.reason}
              actions={<Link className="atlas-action-secondary" to="/method">방법론 문서로 돌아가기</Link>}
            />
          ) : null}
          {release.status === 'error' ? (
            <AtlasDataUnavailable title="Method Lab release 검증에 실패했습니다" description={release.error.message} reason="METHOD_RELEASE_ERROR" />
          ) : null}

          {bundle && view === 'umap2d' ? (
            <>
              <div className="projection-lab-field-layout">
                <AtlasScene
                  nodes={bundle.nodes}
                  nodeFilterStates={filterStates}
                  selectedNodeId={selectedNodeId}
                  previewNodeId={previewNodeId}
                  focusNodeId={focusNodeId}
                  onSelectNode={setSelectedNodeId}
                  onPreviewNode={setPreviewNodeId}
                />
                <ProjectionDossier node={selectedNode} bundle={bundle} />
              </div>
              <div className="projection-lab-dom-mirror">
                <AtlasDomMirror
                  nodes={bundle.nodes}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={setSelectedNodeId}
                  onClearSelection={() => setSelectedNodeId(null)}
                  onPreviewNode={setPreviewNodeId}
                  onFocusNode={setFocusNodeId}
                />
              </div>
            </>
          ) : null}

          {bundle && view === 'compare' ? (
            <>
              <div className="projection-compare-toolbar">
                <label>
                  비교할 node
                  <select value={selectedNodeId ?? ''} onChange={(event) => setSelectedNodeId(event.target.value || null)}>
                    <option value="">node를 선택하세요</option>
                    {bundle.nodes.map((node) => <option key={node.id} value={node.id}>{node.answerType} · {node.topicLabel ?? node.id}</option>)}
                  </select>
                </label>
                <p role="status">{selectedNode ? `동기화 ID: ${selectedNode.id}` : '두 화면에 동기화할 node가 선택되지 않았습니다.'}</p>
              </div>
              <div className="projection-compare-grid">
                <ProjectionMiniPlot title="Canonical UMAP 2D" mode="umap" nodes={bundle.nodes} selectedNodeId={selectedNodeId} />
                <ProjectionMiniPlot title="PCA 2D contract" mode="pca" nodes={[]} selectedNodeId={selectedNodeId} />
              </div>
              <div className="projection-quality-grid">
                <div><span>Node identity</span><strong>{selectedNode ? 'SYNCHRONIZED' : 'WAITING'}</strong></div>
                <div><span>Neighbor preservation</span><strong>METRIC NOT PROVIDED</strong></div>
                <div><span>Position displacement</span><strong>NOT COMPARABLE</strong></div>
                <div><span>Projection hash</span><strong>{bundle.projectionHash.slice(0, 12)}…</strong></div>
              </div>
            </>
          ) : null}

          {bundle && view === 'pca2d' ? (
            <MethodUnavailable
              code="PC"
              title="승인된 PCA 2D projection이 없습니다"
              description="현재 release에는 canonical UMAP 좌표만 있습니다. PC1·PC2 좌표와 explained variance를 브라우저에서 계산하거나 기존 UMAP 좌표로 위장하지 않습니다."
            >
              <ProjectionMiniPlot title="PCA 2D contract frame" mode="pca" nodes={[]} selectedNodeId={selectedNodeId} />
            </MethodUnavailable>
          ) : null}

          {bundle && view === 'pca3d' ? <ThreeDimensionalShell preset={cameraPreset} onPresetChange={setCameraPreset} /> : null}

          {bundle && view === 'tensor' ? (
            <MethodUnavailable
              code="T×"
              title="Tensor decomposition pipeline이 확인되지 않았습니다"
              description="entity × topic factor × behavior factor × status/time 계약이 승인될 때까지 latent factor를 Atlas 위치처럼 표시하지 않습니다."
            >
              <div className="tensor-spec-grid" aria-label="Tensor method view specification">
                <div><span>ENTITY</span><strong>row identity</strong></div>
                <div><span>TOPIC FACTOR</span><strong>latent loading</strong></div>
                <div><span>BEHAVIOR FACTOR</span><strong>A1–A8 relation</strong></div>
                <div><span>STATUS / TIME</span><strong>approved slice</strong></div>
              </div>
            </MethodUnavailable>
          ) : null}
        </section>

        <section className="projection-method-policy" aria-labelledby="projection-policy-title">
          <p className="redline-meta">INTERPRETATION CONTRACT</p>
          <h2 id="projection-policy-title">방법은 비교하되 의미공간은 섞지 않습니다</h2>
          <div>
            <article><span>S2</span><h3>Topic Space</h3><p>UMAP/PCA 위치. 좌표는 해당 projection 안에서만 읽습니다.</p></article>
            <article><span>S3</span><h3>Behavior Space</h3><p>shape, inner mark, stroke, opacity. 위치와 독립적으로 유지됩니다.</p></article>
            <article><span>S4</span><h3>Method Space</h3><p>projection quality와 latent factor를 설명하는 분석 보조층입니다.</p></article>
          </div>
        </section>

        <AtlasProjectionNote />
      </div>
    </main>
  );
}
