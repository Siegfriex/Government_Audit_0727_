import { useState } from 'react';

import { ANSWER_TYPE_COLOR_TOKENS } from '@/shared/config/atlas/atlasEncoding';
import { ANSWER_TYPE_SEMANTICS } from '@/shared/config/atlas/atlasSemantics';
import { ANSWER_TYPES } from '@/shared/types/atlas';

interface AtlasLegendProps {
  defaultOpen?: boolean;
}

export function AtlasLegend({ defaultOpen = false }: AtlasLegendProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <details
      className="border-y border-[var(--line-medium)] bg-[var(--paper-surface)] py-3"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="min-h-11 cursor-pointer px-1 py-3 font-mono text-xs font-bold tracking-[0.08em] text-[var(--color-ink)]">
        범례와 시각 인코딩
      </summary>
      <div className="mt-2 grid gap-6 border-t border-[var(--line-faint)] px-1 pt-5 lg:grid-cols-[1.6fr_1fr]">
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-label="A1부터 A8까지 색상 범례">
          {ANSWER_TYPES.map((answerType) => (
            <li key={answerType} className="flex items-start gap-3 text-sm">
              <span
                className="mt-0.5 h-5 w-5 shrink-0 rounded-full border border-[var(--line-strong)]"
                style={{ backgroundColor: ANSWER_TYPE_COLOR_TOKENS[answerType] }}
                aria-hidden="true"
              />
              <span><strong className="block">{answerType} · {ANSWER_TYPE_SEMANTICS[answerType].name}</strong></span>
            </li>
          ))}
        </ul>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs text-[var(--color-neutral-700)]">
          <div><dt className="font-bold">위치</dt><dd>topic projection</dd></div>
          <div><dt className="font-bold">크기</dt><dd>정규화 질량</dd></div>
          <div><dt className="font-bold">불투명도</dt><dd>신뢰도</dd></div>
          <div><dt className="font-bold">내부 표식·색</dt><dd>A1–A8 세부 행태</dd></div>
          <div><dt className="font-bold">형태</dt><dd>정보 원 · 절차 둥근 사각 · 조치 마름모</dd></div>
          <div><dt className="font-bold">외곽선</dt><dd>완료 실선 · 진행 긴 점선 · 미완료 점선</dd></div>
          <div><dt className="font-bold">작은 사선 badge</dt><dd>공개 대표 Evidence 없음</dd></div>
        </dl>
      </div>
    </details>
  );
}
