interface AtlasMetadataItem {
  label: string;
  value: string;
  tone?: 'default' | 'signal' | 'warning';
}

interface AtlasMetadataRailProps {
  items: readonly AtlasMetadataItem[];
  label?: string;
}

export function AtlasMetadataRail({ items, label = 'Atlas metadata' }: AtlasMetadataRailProps) {
  return (
    <dl className="redline-metadata-rail" aria-label={label}>
      {items.map((item) => (
        <div key={`${item.label}-${item.value}`} data-tone={item.tone ?? 'default'}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
