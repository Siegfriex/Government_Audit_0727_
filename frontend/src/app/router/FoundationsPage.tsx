import { FoundationGallery } from '@/shared/ui/FoundationGallery';
import { PageFrame } from '@/shared/ui/PageFrame';

export function FoundationsPage() {
  return (
    <main id="main-content" className="py-12" data-testid="foundations-page" tabIndex={-1}>
      <PageFrame>
        <p className="type-mono text-[var(--color-neutral-500)]">DEVELOPMENT ONLY</p>
        <h1 className="type-display-l font-serif my-6">Foundation Gallery</h1>
        <FoundationGallery />
      </PageFrame>
    </main>
  );
}
