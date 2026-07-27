import { ANSWER_TYPE_SEMANTICS } from '@/shared/config/atlas/atlasSemantics';
import { ANSWER_TYPES, type AnswerType, type AtlasNodeViewModel } from '@/shared/types/atlas';

interface AtlasDistributionStripProps {
  nodes: readonly AtlasNodeViewModel[];
  selectedAnswerType: AnswerType | null;
}

export function AtlasDistributionStrip({ nodes, selectedAnswerType }: AtlasDistributionStripProps) {
  const counts = Object.fromEntries(ANSWER_TYPES.map((type) => [type, 0])) as Record<AnswerType, number>;
  nodes.forEach((node) => { counts[node.answerType] += node.answerCount; });
  const maximum = Math.max(1, ...Object.values(counts));

  return (
    <section className="atlas-distribution" aria-labelledby="atlas-distribution-heading">
      <header>
        <p className="redline-meta">FILTERED POPULATION / A1–A8</p>
        <h2 id="atlas-distribution-heading">선택 node와 현재 모집단 비교</h2>
        <p>막대는 현재 필터에 포함된 승인 node의 답변 수 합계입니다. 선택 node의 유형은 테두리로 표시합니다.</p>
      </header>
      <ol>
        {ANSWER_TYPES.map((type) => (
          <li key={type} data-selected={selectedAnswerType === type ? 'true' : undefined}>
            <div><strong>{type}</strong><span>{ANSWER_TYPE_SEMANTICS[type].name}</span><b>{counts[type]}건</b></div>
            <span className="atlas-distribution__track" aria-hidden="true"><i style={{ width: `${(counts[type] / maximum) * 100}%` }} /></span>
          </li>
        ))}
      </ol>
    </section>
  );
}
