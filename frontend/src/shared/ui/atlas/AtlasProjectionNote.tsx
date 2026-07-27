import { ATLAS_PROJECTION_WARNINGS } from '@/shared/config/atlas/atlasWarnings';

interface AtlasProjectionNoteProps {
  compact?: boolean;
}

export function AtlasProjectionNote({ compact = false }: AtlasProjectionNoteProps) {
  return (
    <aside
      className={`text-[var(--color-neutral-700)] ${compact ? 'border-l-2 border-[var(--signal-red)] pl-4 text-xs' : 'border-y border-[var(--line-medium)] bg-[var(--paper-surface)] py-5 text-sm md:py-6'}`}
      aria-label={compact ? '스토리 아틀라스 투영 해석 주의' : '전체 아틀라스 투영 해석 주의'}
    >
      <p className="redline-meta text-[var(--signal-red-dark)]">PROJECTION NOTE / 2D DISPLAY SPACE</p>
      <div className="mt-2 space-y-1 leading-relaxed">
        {ATLAS_PROJECTION_WARNINGS.map((warning) => <p key={warning}>{warning}</p>)}
      </div>
    </aside>
  );
}
