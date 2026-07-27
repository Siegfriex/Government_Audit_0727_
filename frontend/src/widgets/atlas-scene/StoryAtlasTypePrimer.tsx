import { createAtlasEncoding } from '@/shared/config/atlas/atlasEncoding';
import { ANSWER_TYPE_SEMANTICS } from '@/shared/config/atlas/atlasSemantics';
import { ANSWER_TYPES, type AnswerType } from '@/shared/types/atlas';
import { AtlasNodeGlyph } from '@/widgets/atlas-explorer/AtlasNodeGlyph';

interface StoryAtlasTypePrimerProps {
  distribution: Readonly<Record<AnswerType, number>>;
  selectedTypes: readonly AnswerType[];
  onSelectType: (answerType: AnswerType) => void;
  onShowAll: () => void;
}

export function StoryAtlasTypePrimer({ distribution, selectedTypes, onSelectType, onShowAll }: StoryAtlasTypePrimerProps) {
  return (
    <section className="story-atlas-primer" aria-labelledby="story-atlas-primer-title" data-testid="story-atlas-type-primer">
      <header className="story-atlas-primer__header">
        <div>
          <p className="redline-meta">ANSWER BEHAVIOR / A1–A8</p>
          <h3 id="story-atlas-primer-title">먼저, 점의 색이 뜻하는 답변을 읽습니다</h3>
        </div>
        <p>
          761개 decision group에 부여된 주행태 분포입니다. 모든 점은 같은 원형이며 A1의 deep red에서 A8의 saturated blue까지 색으로 구분합니다.
        </p>
      </header>

      <ul className="story-atlas-primer__grid" aria-label="답변행태 A1부터 A8까지">
        {ANSWER_TYPES.map((answerType) => {
          const semantics = ANSWER_TYPE_SEMANTICS[answerType];
          const encoding = createAtlasEncoding(answerType, 'complete', 1);
          const selected = selectedTypes.includes(answerType);
          return (
            <li key={answerType}>
              <button
                type="button"
                className={`story-atlas-primer__type story-atlas-primer__type--${semantics.family}`}
                aria-pressed={selected}
                data-answer-type={answerType}
                data-family={semantics.family}
                onClick={() => onSelectType(answerType)}
              >
                <span className="story-atlas-primer__glyph" aria-hidden="true">
                  <svg viewBox="-20 -20 40 40">
                    <AtlasNodeGlyph
                      shape={encoding.shapeToken}
                      answerType={answerType}
                      status="complete"
                      fill={encoding.fillToken}
                      stroke="var(--ink-primary)"
                      radius={12}
                      showAnswerMark={false}
                    />
                  </svg>
                </span>
                <span className="story-atlas-primer__code">{answerType}</span>
                <strong>{semantics.name}</strong>
                <small>{distribution[answerType].toLocaleString('ko-KR')} labels</small>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="story-atlas-primer__footer">
        <p><span aria-hidden="true">●</span> 카드를 누르면 해당 유형을 지도에서 강조합니다.</p>
        <button type="button" onClick={onShowAll}>A1–A8 전체 보기</button>
      </div>
    </section>
  );
}
