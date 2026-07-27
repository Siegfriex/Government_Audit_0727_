import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  AtlasContractMismatch,
  AtlasDataUnavailable,
  AtlasEmptyState,
  AtlasErrorState,
  AtlasInvalidNodeState,
  AtlasLoadingState,
  AtlasProjectionMismatch,
  AtlasStaleRelease,
} from './AtlasDataStates';

describe('Atlas shared data-state presentation components', () => {
  it('renders loading and unavailable without creating chart marks', () => {
    const loading = render(<AtlasLoadingState />);
    expect(screen.getByTestId('atlas-route-loading')).toHaveAttribute('role', 'status');
    expect(loading.container.querySelector('svg')).toBeNull();
    loading.unmount();

    render(<AtlasDataUnavailable description="승인 데이터 없음" reason="NO_RELEASE" />);
    expect(screen.getByTestId('atlas-data-unavailable')).toHaveTextContent('NO_RELEASE');
  });

  it('provides explicit empty, error, mismatch, and invalid-node actions', () => {
    const reset = vi.fn();
    const empty = render(<AtlasEmptyState title="결과 없음" description="필터 결과 없음" onReset={reset} />);
    screen.getByRole('button', { name: '필터 초기화' }).click();
    expect(reset).toHaveBeenCalledOnce();
    empty.unmount();

    const retry = vi.fn();
    const error = render(<AtlasErrorState description="요청 실패" onRetry={retry} />);
    screen.getByRole('button', { name: '다시 확인' }).click();
    expect(retry).toHaveBeenCalledOnce();
    error.unmount();

    const mismatch = render(<AtlasContractMismatch description="버전 불일치" />);
    expect(screen.getByTestId('atlas-contract-mismatch')).toHaveAttribute('role', 'alert');
    mismatch.unmount();

    const projectionMismatch = render(<AtlasProjectionMismatch description="좌표계 불일치" projectionId="projection-old" />);
    expect(screen.getByTestId('atlas-projection-mismatch')).toHaveTextContent('projection-old');
    projectionMismatch.unmount();

    const staleRelease = render(<AtlasStaleRelease description="새 release 확인 필요" releaseId="release-old" />);
    expect(screen.getByTestId('atlas-stale-release')).toHaveAttribute('role', 'status');
    staleRelease.unmount();

    const clear = vi.fn();
    render(<AtlasInvalidNodeState nodeId="missing-node" onClear={clear} />);
    screen.getByRole('button', { name: 'node 선택 지우기' }).click();
    expect(clear).toHaveBeenCalledOnce();
  });
});
