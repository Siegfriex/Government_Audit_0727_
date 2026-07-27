import { Link } from 'react-router';
import { PageFrame } from '@/shared/ui/PageFrame';

export function NotFoundPage() {
  return (
    <main id="main-content" className="py-20" data-testid="not-found-page" tabIndex={-1}>
      <PageFrame>
        <p className="type-mono text-[var(--color-behavior-red-deep)]">404 / NOT FOUND</p>
        <h1 className="type-display-l font-serif mt-4">요청한 기록을 찾을 수 없습니다</h1>
        <p className="type-body-l text-[var(--color-neutral-700)] mt-6">
          주소를 확인하거나 메인 스토리에서 다시 탐색해 주세요.
        </p>
        <Link className="mt-8 inline-flex min-h-11 items-center bg-[var(--color-ink)] px-5 py-2.5 text-[var(--color-paper)]" to="/">
          메인 스토리로 이동
        </Link>
      </PageFrame>
    </main>
  );
}
