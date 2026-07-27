import { AtlasLegend } from './AtlasLegend';
import { AtlasStageFrame } from './AtlasStageFrame';

export function AtlasUnavailableShell() {
  return (
    <section className="space-y-8" aria-label="Atlas 탐색 인터페이스 준비 상태" data-testid="atlas-unavailable-shell">
      <div id="atlas-controls" className="border-y border-[var(--line-medium)] py-4" tabIndex={-1}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <label className="flex min-w-48 flex-col gap-2 font-mono text-xs text-[var(--color-neutral-500)]">
            처리 상태
            <select className="min-h-11 border border-[var(--line-medium)] bg-[var(--paper-muted)] px-3" disabled>
              <option>승인 데이터 연결 후 사용</option>
            </select>
          </label>
          <div className="flex-1">
            <p className="font-mono text-xs text-[var(--color-neutral-500)]">답변 유형</p>
            <p className="mt-2 flex min-h-11 items-center border border-dashed border-[var(--line-medium)] px-3 text-sm text-[var(--ink-secondary)]">
              A1–A8 control은 승인 ViewModel이 연결된 뒤 활성화됩니다.
            </p>
          </div>
          <p className="redline-meta max-w-52 border-l-2 border-[var(--signal-red)] pl-3 text-[var(--ink-secondary)]">CONTROL RAIL / LOCKED</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,8fr)_minmax(20rem,4fr)]">
        <AtlasStageFrame
          label="QUESTION / ANSWER FIELD"
          title="표시할 승인 node가 없습니다"
          testId="atlas-stage-placeholder"
          footer="고정 projection domain / aggregate-only / no browser relayout"
        >
          <div className="redline-registration-grid flex min-h-[25rem] flex-col justify-between p-5 md:min-h-[31rem] md:p-8">
            <div className="flex items-start justify-between gap-6">
              <span className="type-display-xl text-[var(--line-faint)]" aria-hidden="true">00</span>
              <span className="mt-2 h-3 w-3 bg-[var(--signal-red)]" aria-hidden="true" />
            </div>
            <p className="max-w-xl border-t-2 border-[var(--ink-primary)] bg-[var(--paper-surface)] pt-4 text-sm leading-relaxed text-[var(--ink-secondary)] md:text-base">
              가짜 점이나 임시 좌표를 채우지 않습니다. 승인 release가 연결되면 이 고정 projection domain에 aggregate node가 표시됩니다.
            </p>
          </div>
        </AtlasStageFrame>

        <aside id="atlas-selection-inspector" className="atlas-selection-inspector border-t-2 border-[var(--ink-primary)] bg-[var(--paper-muted)] p-5 md:p-6 xl:min-h-[31rem]" data-testid="atlas-inspector-placeholder" aria-labelledby="atlas-inspector-placeholder-title" tabIndex={-1}>
          <p className="redline-meta text-[var(--signal-red-dark)]">SELECTION INSPECTOR / 00</p>
          <h2 id="atlas-inspector-placeholder-title" className="mt-4 font-serif text-3xl font-bold leading-tight">선택된 기록이 없습니다</h2>
          <p className="mt-5 text-sm leading-relaxed text-[var(--ink-secondary)]">
            node를 선택하면 답변 유형, 상태, 질량, 신뢰도와 공개 승인된 대표 증거가 이 영역에 표시됩니다.
          </p>
          <dl className="mt-8 grid gap-0 border-y border-[var(--line-medium)] font-mono text-xs text-[var(--ink-secondary)]">
            <div className="flex justify-between gap-4 border-b border-[var(--line-faint)] py-3"><dt>선택 node</dt><dd>없음</dd></div>
            <div className="flex justify-between gap-4 py-3"><dt>대표 증거</dt><dd>연결 전</dd></div>
          </dl>
        </aside>
      </div>

      <section id="atlas-node-list" className="border-y border-[var(--line-medium)] py-5" aria-labelledby="atlas-node-list-unavailable-title" tabIndex={-1}>
        <p className="redline-meta text-[var(--ink-secondary)]">DOM MIRROR / UNAVAILABLE</p>
        <h2 id="atlas-node-list-unavailable-title" className="mt-2 font-serif text-2xl font-bold">접근 가능한 node 목록</h2>
        <p className="mt-2 text-sm text-[var(--ink-secondary)]">승인된 node가 없어 탐색 목록을 만들지 않았습니다.</p>
      </section>

      <AtlasLegend />
    </section>
  );
}
