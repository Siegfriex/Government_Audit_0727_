import type { AtlasNodeViewModel, AtlasRelationType } from '@/shared/types/atlas';

interface AtlasRelationsViewProps {
  selectedNode: AtlasNodeViewModel | null;
  relationType: AtlasRelationType | null;
}

export function AtlasRelationsView({ selectedNode, relationType }: AtlasRelationsViewProps) {
  return (
    <section
      id="atlas-view-relations"
      role="tabpanel"
      aria-labelledby="atlas-relations-heading"
      className="atlas-relations-unavailable"
      data-testid="atlas-relations-data-unavailable"
    >
      <p className="redline-meta">RELATION DATA / BLOCKED</p>
      <h2 id="atlas-relations-heading">승인된 node 관계 데이터가 아직 없습니다</h2>
      <p>
        현재 release에는 node 위치와 Evidence 연결은 있지만 node 대 node 관계 엔터티가 없습니다.
        2차원 거리로 관계를 추정하지 않으며, 관계선도 대신 그릴 수 없습니다.
      </p>
      <dl>
        <div><dt>선택 node</dt><dd>{selectedNode?.id ?? '선택되지 않음'}</dd></div>
        <div><dt>관계 필터</dt><dd>{relationType ?? '전체 관계 유형'}</dd></div>
        <div><dt>표시 depth</dt><dd>1-hop 계약 고정</dd></div>
        <div><dt>상태</dt><dd>RELATION_DATA_BLOCKED</dd></div>
      </dl>
      <p className="atlas-relations-unavailable__rule">
        필요한 upstream 엔터티: <code>atlas_relationship_edges</code>. 각 edge에는 관계 유형, 가중치 근거,
        공개 Evidence 수, projection/data/pipeline 버전과 설명이 필요합니다.
      </p>
    </section>
  );
}
