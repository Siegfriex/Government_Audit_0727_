import type { AnswerType, BehaviorFamily } from '@/shared/types/atlas';

export interface AnswerTypeSemantics {
  name: string;
  definition: string;
  family: BehaviorFamily;
}

export const ANSWER_TYPE_SEMANTICS: Readonly<Record<AnswerType, AnswerTypeSemantics>> = Object.freeze({
  A1: Object.freeze({ name: '기억 부재 진술', definition: '기억이 나지 않거나 기억하지 못한다고 명시한 답변', family: 'information_non_direct' }),
  A2: Object.freeze({ name: '정보 미보유·확인 필요', definition: '현재 수치·사실을 갖고 있지 않거나 추가 확인이 필요한 답변', family: 'information_non_direct' }),
  A3: Object.freeze({ name: '타기관·타주체 귀속', definition: '책임 또는 답변 주체를 다른 기관·주체로 이동한 답변', family: 'information_non_direct' }),
  A4: Object.freeze({ name: '질문 비직접 대응', definition: '질문의 핵심 대신 일반론이나 주변 설명으로 대응한 답변', family: 'information_non_direct' }),
  A5: Object.freeze({ name: '검토·협의 유보', definition: '구체적 절차나 기한 없이 검토·협의를 미래로 미룬 답변', family: 'deferral_procedural' }),
  A6: Object.freeze({ name: '조사·자료 제출 절차', definition: '조사·확인·자료 제출 등 절차적 후속조치를 제시한 답변', family: 'deferral_procedural' }),
  A7: Object.freeze({ name: '구체 조치 약속', definition: '특정 행동·주체 또는 기한이 있는 조치를 약속한 답변', family: 'action_evidence' }),
  A8: Object.freeze({ name: '완료·근거 제시', definition: '실행 완료 사실과 확인 가능한 수치·문서·조치 근거를 제시한 답변', family: 'action_evidence' }),
});

export const BEHAVIOR_FAMILY_PRESENTATION: Readonly<Record<BehaviorFamily, {
  label: string;
  shortLabel: string;
}>> = Object.freeze({
  information_non_direct: Object.freeze({
    label: '정보 부재·비직접 계열',
    shortLabel: '정보·비직접',
  }),
  deferral_procedural: Object.freeze({
    label: '유보·절차 계열',
    shortLabel: '유보·절차',
  }),
  action_evidence: Object.freeze({
    label: '조치·근거 계열',
    shortLabel: '조치·근거',
  }),
});
