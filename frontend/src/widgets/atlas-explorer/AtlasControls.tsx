import { BEHAVIOR_FAMILY_PRESENTATION } from '@/shared/config/atlas/atlasSemantics';
import {
  ANSWER_TYPES,
  ATLAS_RELATION_TYPES,
  ATLAS_STATUSES,
  type AnswerType,
  type AtlasRelationType,
  type AtlasStatus,
  type AtlasViewMode,
  type BehaviorFamily,
} from '@/shared/types/atlas';

interface AtlasControlsProps {
  status: AtlasStatus;
  types: readonly AnswerType[];
  onStatusChange: (status: AtlasStatus) => void;
  onTypesChange: (types: AnswerType[]) => void;
  onReset: () => void;
  typeCounts?: Readonly<Record<AnswerType, number>>;
  view?: AtlasViewMode;
  relationType?: AtlasRelationType | null;
  onRelationTypeChange?: (relationType: AtlasRelationType | null) => void;
}

const STATUS_LABELS: Record<AtlasStatus, string> = {
  all: '전체 상태',
  complete: '추진완료',
  active: '추진중',
  unresolved: '미완료·단절',
};

const FAMILY_TYPES: Readonly<Record<BehaviorFamily, readonly AnswerType[]>> = {
  information_non_direct: ['A1', 'A2', 'A3', 'A4'],
  deferral_procedural: ['A5', 'A6'],
  action_evidence: ['A7', 'A8'],
};

const RELATION_LABELS: Record<AtlasRelationType, string> = {
  semantic_neighbor: '의미 이웃',
  shared_target: '같은 감사 지적사항',
  same_topic_cross_behavior: '같은 주제·다른 행태',
  shared_evidence_context: '공유 근거 문맥',
  temporal_continuity: '시간 연속성',
};

export function AtlasControls({
  status,
  types,
  onStatusChange,
  onTypesChange,
  onReset,
  typeCounts,
  view = 'map',
  relationType = null,
  onRelationTypeChange,
}: AtlasControlsProps) {
  const toggleType = (answerType: AnswerType) => {
    const next = types.includes(answerType)
      ? types.filter((value) => value !== answerType)
      : ANSWER_TYPES.filter((value) => value === answerType || types.includes(value));
    onTypesChange(next.length > 0 ? next : [...ANSWER_TYPES]);
  };

  const toggleFamily = (family: BehaviorFamily) => {
    const familyTypes = FAMILY_TYPES[family];
    const allSelected = familyTypes.every((type) => types.includes(type));
    const next = allSelected
      ? ANSWER_TYPES.filter((type) => types.includes(type) && !familyTypes.includes(type))
      : ANSWER_TYPES.filter((type) => types.includes(type) || familyTypes.includes(type));
    onTypesChange(next.length > 0 ? next : [...ANSWER_TYPES]);
  };

  return (
    <section id="atlas-controls" aria-label="Atlas 필터" className="border-y border-[var(--line-medium)] py-4" tabIndex={-1}>
      <p className="redline-meta mb-4 text-[var(--ink-secondary)]">CONTROL RAIL / URL SYNCHRONIZED</p>
      <div className="atlas-controls-layout">
        <label className="flex min-w-48 flex-col gap-2 font-mono text-xs text-[var(--color-neutral-700)]">
          처리 상태
          <select
            className="min-h-11 border border-[var(--line-strong)] bg-[var(--paper-surface)] px-3 text-sm text-[var(--color-ink)] focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[var(--signal-red-dark)]"
            value={status}
            onChange={(event) => onStatusChange(event.target.value as AtlasStatus)}
          >
            {ATLAS_STATUSES.map((value) => <option key={value} value={value}>{STATUS_LABELS[value]}</option>)}
          </select>
        </label>

        <fieldset className="atlas-behavior-controls min-w-0 flex-1">
          <legend className="mb-2 font-mono text-xs text-[var(--color-neutral-700)]">답변 유형</legend>
          <div className="atlas-family-toggles" aria-label="답변행태 계열">
            {(Object.keys(FAMILY_TYPES) as BehaviorFamily[]).map((family) => {
              const active = FAMILY_TYPES[family].every((type) => types.includes(type));
              return (
                <button key={family} type="button" aria-pressed={active} onClick={() => toggleFamily(family)}>
                  <span>{BEHAVIOR_FAMILY_PRESENTATION[family].shortLabel}</span>
                  <small>{FAMILY_TYPES[family].join(' ')}</small>
                </button>
              );
            })}
          </div>
          <details className="border border-[var(--line-strong)] bg-[var(--color-paper)] sm:hidden">
            <summary className="flex min-h-11 cursor-pointer items-center px-3 font-mono text-xs font-bold">선택된 답변 유형 {types.length}개</summary>
            <div className="grid grid-cols-2 gap-2 border-t border-[var(--color-neutral-200)] p-3">
              {ANSWER_TYPES.map((answerType) => (
                <label key={answerType} className={`inline-flex min-h-11 cursor-pointer items-center justify-center border px-3 font-mono text-xs ${types.includes(answerType) ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-on-ink)]' : 'border-[var(--line-strong)] bg-[var(--color-paper)]'}`}>
                  <input className="sr-only" type="checkbox" checked={types.includes(answerType)} onChange={() => toggleType(answerType)} />
                  {answerType}{typeCounts ? <small>{typeCounts[answerType]}</small> : null}
                </label>
              ))}
            </div>
          </details>
          <div className="hidden flex-wrap gap-2 sm:flex">
            {ANSWER_TYPES.map((answerType) => (
              <label
                key={answerType}
                  className={`relative inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center border px-3 font-mono text-xs focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[var(--signal-red-dark)] ${types.includes(answerType) ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-on-ink)] after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:bg-[var(--signal-red)]' : 'border-[var(--line-strong)] bg-[var(--color-paper)]'}`}
              >
                <input className="sr-only" type="checkbox" checked={types.includes(answerType)} onChange={() => toggleType(answerType)} />
                {answerType}{typeCounts ? <small>{typeCounts[answerType]}</small> : null}
              </label>
            ))}
          </div>
        </fieldset>

        {view === 'relations' && onRelationTypeChange ? (
          <label className="flex min-w-52 flex-col gap-2 font-mono text-xs text-[var(--color-neutral-700)]">
            관계 유형
            <select
              className="min-h-11 border border-[var(--line-strong)] bg-[var(--paper-surface)] px-3 text-sm"
              value={relationType ?? ''}
              onChange={(event) => onRelationTypeChange(event.target.value ? event.target.value as AtlasRelationType : null)}
            >
              <option value="">전체 관계 유형</option>
              {ATLAS_RELATION_TYPES.map((type) => <option key={type} value={type}>{RELATION_LABELS[type]}</option>)}
            </select>
          </label>
        ) : null}

        <button
          type="button"
          className="atlas-action-secondary"
          onClick={onReset}
        >
          필터 초기화
        </button>
      </div>
    </section>
  );
}
