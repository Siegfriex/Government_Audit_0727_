/**
 * Core Data Models & Contracts for P3_CULTURE
 * Editorial Scrollytelling — 문체위 국정감사 6년
 */

export type LineStyle = 'solid' | 'dashed' | 'dotted' | 'break' | 'branch' | 'loop';

export type ReportedStatus = 'complete' | 'active' | 'unresolved';

export type BehaviorType = 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7' | 'A8';

export type BehaviorFamily = 'red' | 'amber' | 'blue';

export interface StoryChapterViewModel {
  id: string;
  order: number;
  slug: string;
  title: string;
  subtitle: string;
  thesis: string;
  summary?: string;
  timeframe?: string;
}

export interface StoryMetricViewModel {
  id: string;
  label: string;
  value: string;
  unit?: string;
  comparison?: string;
  sourceLabel?: string;
  mock?: boolean;
}

export interface AtlasNodeViewModel {
  id: string;
  topic: string;
  status: ReportedStatus;
  type: BehaviorType;
  family: BehaviorFamily;
  x: number; // Normalized coordinate 0..100
  y: number; // Normalized coordinate 0..100
  radius: number;
  count: number;
  label: string;
  behaviorTitle: string;
  behaviorExcerpt: string;
  confidence?: number; // e.g. 84%
  representativeEvidenceIds: string[];
}

export interface EvidenceViewModel {
  id: string;
  issue: string; // 시정요구 제목 / 사안명
  auditYear: number; // e.g. 2019
  committee: string; // 문화체육관광위원회
  targetOrg: string; // 피감기관 (예: 한국콘텐츠진흥원, 국립현대미술관 등)
  questioner: string; // 국회의원 / 국정감사 질의자
  questionExcerpt: string; // 국정감사 회의록 실질 질의
  answerExcerpt: string; // 피감기관 답변
  reportedStatus: ReportedStatus; // 공식 보고된 상태 (추진완료 / 추진중 / 처리불가)
  reportedStatusLabel: string;
  behaviorType: BehaviorType; // A1 ~ A8
  behaviorLabel: string;
  verificationLabel?: string; // 저널리즘 추적/검증 한줄 결론
  verificationDetail?: string; // 실질 검증 상세 설명
  lineStyle: LineStyle; // Evidence line representation
  sourceLabel: string; // 출처 (예: 2019년도 국정감사 시정 및 처리결과 보고서)
  sourcePage?: string; // p.142
  pdfLinkPlaceholder?: string;
  isRepresentativeCase?: boolean;
}

export interface EditorialCaseViewModel {
  id: string;
  caseNumber: string; // e.g. "01"
  eyebrow: string;
  title: string;
  targetOrg: string;
  yearRange: string;
  summary: string;
  evidenceId: string;
  demandStatement: string;
  answerStatement: string;
  officialOutcome: string;
  journalismCheck: string;
  limitationNote: string;
}

export interface QuickFilterOptions {
  status: ReportedStatus | 'all';
  type: BehaviorType | 'all';
  searchQuery: string;
}
