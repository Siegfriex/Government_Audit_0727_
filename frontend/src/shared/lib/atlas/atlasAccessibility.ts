import type { AtlasNodeViewModel } from '@/shared/types/atlas';

const FAMILY_LABELS = {
  information_non_direct: '정보 부재·비직접 계열',
  deferral_procedural: '유보·절차 계열',
  action_evidence: '조치·근거 계열',
} as const;

const STATUS_LABELS = {
  complete: '추진완료',
  active: '추진중',
  unresolved: '미완료·단절',
} as const;

export function atlasNodeAccessibleName(node: AtlasNodeViewModel): string {
  return `${FAMILY_LABELS[node.behaviorFamily]}, ${STATUS_LABELS[node.status]}, ${node.answerType}`;
}

export function atlasNodeMetricDescription(node: AtlasNodeViewModel): string {
  const parts = [
    `주제 ${node.topicLabel ?? '라벨 미제공'}`,
    `답변 ${node.answerCount}건`,
    `승인 link ${node.linkCount}건`,
    `정규화 질량 지수 ${Math.round(node.normalizedMass * 100)}점`,
    node.isPublicEvidenceAvailable ? '공개 대표 Evidence 있음' : '공개 대표 Evidence 없음',
    'node 관계는 승인 데이터 미제공',
  ];
  if (node.confidence !== null) parts.push(`평균 신뢰도 ${Math.round(node.confidence * 100)}퍼센트`);
  return parts.join(', ');
}
