import { useState } from 'react';

import type { AnswerType, AtlasNodeStatus, AtlasShapeToken } from '@/shared/types/atlas';
import {
  AtlasContractMismatch,
  AtlasDataUnavailable,
  AtlasEmptyState,
  AtlasErrorState,
  AtlasInvalidNodeState,
  AtlasLoadingState,
  AtlasProjectionMismatch,
  AtlasProjectionNote,
  AtlasStaleRelease,
} from '@/shared/ui/atlas';
import {
  EvidenceChain,
  EvidenceHeader,
  EvidenceProvenanceRail,
  EvidenceQuote,
  EvidenceStatusPair,
  EvidenceVerificationPanel,
} from '@/shared/ui/evidence';
import { AtlasNodeGlyph, type AtlasGlyphState } from '@/widgets/atlas-explorer/AtlasNodeGlyph';

const palette = [
  ['paper.canvas', 'var(--paper-canvas)'], ['paper.surface', 'var(--paper-surface)'], ['paper.muted', 'var(--paper-muted)'],
  ['ink.primary', 'var(--ink-primary)'], ['ink.secondary', 'var(--ink-secondary)'], ['line.medium', 'var(--line-medium)'],
  ['signal.red', 'var(--signal-red)'], ['signal.red.dark', 'var(--signal-red-dark)'], ['archive.ochre', 'var(--archive-ochre)'],
  ['inverse.surface', 'var(--inverse-surface)'],
] as const;

const glyphs: readonly { answerType: AnswerType; shape: AtlasShapeToken; fill: string }[] = [
  { answerType: 'A1', shape: 'circle', fill: 'var(--ink-primary)' },
  { answerType: 'A2', shape: 'circle', fill: 'var(--ink-primary)' },
  { answerType: 'A3', shape: 'circle', fill: 'var(--ink-primary)' },
  { answerType: 'A4', shape: 'circle', fill: 'var(--ink-primary)' },
  { answerType: 'A5', shape: 'diamond', fill: 'var(--archive-ochre)' },
  { answerType: 'A6', shape: 'diamond', fill: 'var(--archive-ochre)' },
  { answerType: 'A7', shape: 'square', fill: 'var(--line-strong)' },
  { answerType: 'A8', shape: 'square', fill: 'var(--line-strong)' },
];

const statusSamples: readonly AtlasNodeStatus[] = ['complete', 'active', 'unresolved'];
const stateSamples: readonly AtlasGlyphState[] = ['default', 'hovered', 'focused', 'selected', 'dimmed'];

function GlyphSample({ answerType, shape, fill, status = 'complete', state = 'default' }: {
  answerType: AnswerType; shape: AtlasShapeToken; fill: string; status?: AtlasNodeStatus; state?: AtlasGlyphState;
}) {
  return <svg className="h-16 w-16" viewBox="-32 -32 64 64" aria-hidden="true"><AtlasNodeGlyph shape={shape} answerType={answerType} status={status} fill={fill} radius={16} state={state} /></svg>;
}

export function RedlineAtlasCalibration() {
  const [controlState, setControlState] = useState('active');
  return (
    <section className="mt-16 space-y-16 border-t-4 border-[var(--signal-red)] pt-8" data-testid="redline-calibration">
      <header className="grid gap-6 lg:grid-cols-[1fr_2fr] lg:items-end">
        <p className="type-display-xl text-[var(--signal-red)]" aria-hidden="true">R</p>
        <div><p className="redline-meta text-[var(--signal-red-dark)]">CONTRACT_FIXTURE / DEVELOPMENT ONLY</p><h2 className="redline-page-title mt-3">REDLINE PUBLIC RECORD</h2><p className="redline-thesis mt-5">공공기록, 질문·답변 지형, 증거 추적을 하나의 편집 시스템으로 검산하는 calibration surface입니다.</p></div>
      </header>

      <section><h3 className="redline-meta mb-4">01 / COLOR TOKENS</h3><div className="grid grid-cols-2 gap-px bg-[var(--line-medium)] border border-[var(--line-medium)] md:grid-cols-5">{palette.map(([name, color]) => <div key={name} className="bg-[var(--paper-surface)] p-3"><div className="h-16 border border-black/10" style={{ background: color }} /><p className="mt-2 font-mono text-[10px]">{name}</p></div>)}</div></section>

      <section><h3 className="redline-meta mb-4">02 / TYPE SCALE & MASTER GRID</h3><div className="redline-registration-grid border-y-2 border-[var(--ink-primary)] p-5 md:p-8"><p className="type-display-xl">PUBLIC</p><p className="type-display-l mt-6">기록은 증거로 남는다</p><p className="type-heading-1 mt-6">질문과 답변의 의미적 지형</p><p className="type-body-l mt-5 max-w-2xl">대형 활자와 작은 provenance 정보가 같은 grid 위에서 충돌하지 않고 위계를 만듭니다.</p><p className="redline-meta mt-8">PIPELINE RUN / CONTRACT-RUN-001 / PAGE 17–19</p></div></section>

      <section><h3 className="redline-meta mb-4">03 / CTA & CONTROL STATES</h3><div className="flex flex-wrap items-end gap-3 border-y border-[var(--line-medium)] py-5"><button type="button" className="atlas-action-primary">증거 추적 열기 →</button><button type="button" className="atlas-action-secondary">방법 확인</button><label className="grid gap-2 font-mono text-xs">처리 상태<select value={controlState} onChange={(event) => setControlState(event.target.value)} className="min-h-11 border border-[var(--line-medium)] bg-[var(--paper-surface)] px-3"><option value="active">추진중</option><option value="complete">추진완료</option></select></label><button type="button" disabled className="min-h-11 border border-[var(--line-faint)] bg-[var(--paper-muted)] px-4 font-mono text-xs text-[var(--ink-tertiary)]">승인 전 비활성</button></div></section>

      <section><h3 className="redline-meta mb-4">04 / A1–A8 GLYPHS</h3><div className="grid grid-cols-4 gap-px border border-[var(--line-medium)] bg-[var(--line-medium)] md:grid-cols-8">{glyphs.map((glyph) => <div key={glyph.answerType} className="grid place-items-center bg-[var(--paper-surface)] p-3"><GlyphSample {...glyph} /><span className="font-mono text-xs font-bold">{glyph.answerType}</span></div>)}</div><div className="mt-4 grid gap-4 md:grid-cols-2"><div className="border-y border-[var(--line-faint)] p-4"><p className="redline-meta">STATUS STROKES</p><div className="mt-3 flex gap-5">{statusSamples.map((status) => <div key={status} className="text-center"><GlyphSample answerType="A1" shape="circle" fill="var(--ink-primary)" status={status} /><span className="font-mono text-[10px]">{status}</span></div>)}</div></div><div className="border-y border-[var(--line-faint)] p-4"><p className="redline-meta">INTERACTION STATES</p><div className="mt-3 flex flex-wrap gap-3">{stateSamples.map((state) => <div key={state} className="text-center"><GlyphSample answerType="A7" shape="square" fill="var(--line-strong)" state={state} /><span className="font-mono text-[10px]">{state}</span></div>)}</div></div></div></section>

      <section className="space-y-5"><h3 className="redline-meta">05 / DATA STATES</h3><AtlasLoadingState /><AtlasDataUnavailable description="승인 manifest가 없으므로 좌표나 fixture를 대신 표시하지 않습니다." reason="APPROVED_MANIFEST_ABSENT" actions={<button type="button" className="atlas-action-primary">데이터 상태 확인</button>} /><AtlasEmptyState title="선택한 조건에 해당하는 node가 없습니다" description="projection과 controls는 유지하고 결과가 비어 있음을 설명합니다." /><AtlasContractMismatch description="현재 데이터 버전은 이 앱 계약과 호환되지 않습니다." contractVersion="app 1.0 / data 0.9" /><AtlasProjectionMismatch description="승인 release와 다른 projection ID는 같은 화면에서 비교하지 않습니다." projectionId="contract-projection-stale" /><AtlasStaleRelease description="새 release를 확인하기 전에는 이전 좌표를 최신 결과처럼 표시하지 않습니다." releaseId="contract-release-000" /><AtlasErrorState description="검증된 데이터 요청을 완료하지 못했습니다." technicalDetail="CALIBRATION_ONLY" /><AtlasInvalidNodeState nodeId="contract-node-missing" onClear={() => undefined} /></section>

      <section><h3 className="redline-meta mb-4">06 / INSPECTOR ANATOMY</h3><div className="grid gap-4 lg:grid-cols-[2fr_1fr]"><div className="redline-registration-grid min-h-96 border-t-2 border-[var(--ink-primary)] p-6"><span className="redline-meta">ATLAS STAGE / STATIC CALIBRATION</span><div className="mt-20 flex items-center justify-center"><GlyphSample answerType="A7" shape="square" fill="var(--line-strong)" state="selected" /></div></div><aside className="border-t-2 border-[var(--ink-primary)] bg-[var(--paper-muted)] p-5"><p className="redline-meta text-[var(--signal-red-dark)]">SELECTED / A7 / ACTIVE</p><h4 className="redline-annotation-rule mt-4 font-serif text-3xl font-bold">시정조치 근거 제출</h4><dl className="mt-6 grid grid-cols-2 border-y border-[var(--line-medium)] text-sm"><div className="border-r p-3"><dt>답변</dt><dd className="mt-1 font-mono text-xl font-bold">31</dd></div><div className="p-3"><dt>신뢰도</dt><dd className="mt-1 font-mono text-xl font-bold">84%</dd></div></dl><button type="button" className="atlas-action-primary mt-6 w-full">승인된 대표 증거 보기</button></aside></div></section>

      <section className="space-y-6"><h3 className="redline-meta">07 / EVIDENCE ANATOMY</h3><div className="grid gap-8 lg:grid-cols-[2fr_1fr]"><div className="space-y-6"><EvidenceHeader recordId="EV-CONTRACT-001" title="시정요구 이후의 처리 결과를 다시 확인하다" context="2023 국정감사 / 계약 검증용 정적 presentation" /><EvidenceStatusPair reported="추진완료" verified="추가 검증 필요" /><EvidenceChain items={[{ step: '01', label: '요구', detail: '공식 시정요구의 핵심 문장' }, { step: '02', label: '질문', detail: '당시 질의와 답변 맥락' }, { step: '03', label: '공식 결과', detail: '기관이 제출한 처리상태' }, { step: '04', label: '추가 검증', detail: '공개 근거를 대조한 검증 결과' }]} /><EvidenceQuote label="QUESTION / PAGE 17">“계획의 제출만으로 실제 조치가 완료됐다고 볼 수 있습니까?”</EvidenceQuote><EvidenceVerificationPanel conclusion="보고 상태와 공개 근거 사이에 간극이 남아 있습니다" detail="실제 EvidenceRepository 연결 전에는 이 문구와 값이 production evidence로 노출되지 않습니다." /></div><div><EvidenceProvenanceRail meetingId="meeting-contract-001" pages="17–19" pdfAsset="pdf-contract-001" pipelineRun="run-contract-001" reviewStatus="CONTRACT_FIXTURE" publicationStatus="NOT PUBLIC" /><div className="mt-6 rounded-t-2xl border border-[var(--line-medium)] bg-[var(--paper-surface)] p-5 shadow-[0_-12px_30px_rgb(0_0_0/0.08)]"><span className="mx-auto block h-1 w-10 bg-[var(--line-medium)]" /><p className="redline-meta mt-5 text-[var(--signal-red-dark)]">MOBILE BOTTOM SHEET</p><p className="mt-3 text-sm leading-relaxed">상단 모서리만 16px, provenance는 세로 흐름으로 전환됩니다.</p></div></div></div></section>

      <AtlasProjectionNote />
    </section>
  );
}
