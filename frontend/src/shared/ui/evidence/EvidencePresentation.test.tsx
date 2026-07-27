import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  EvidenceFixtureNotice,
  EvidenceHeader,
  EvidenceUnavailableState,
} from './EvidencePresentation';

afterEach(cleanup);

describe('Evidence presentation contract', () => {
  it('uses a page-level heading when requested and identifies development mock content', () => {
    render(
      <>
        <EvidenceFixtureNotice />
        <EvidenceHeader
          recordId="EV-TEST"
          title="검증용 증거"
          context="development fixture"
          headingLevel="h1"
        />
      </>,
    );

    expect(screen.getByRole('heading', { level: 1, name: '검증용 증거' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('DEVELOPMENT ONLY');
  });

  it('renders missing approved evidence without inventing excerpts', () => {
    render(<EvidenceUnavailableState evidenceId="evidence-missing" headingLevel="h1" />);

    expect(screen.getByTestId('evidence-data-unavailable')).toHaveAttribute('role', 'status');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('승인된 증거 상세');
    expect(screen.getByText('evidence-missing')).toBeInTheDocument();
    expect(screen.queryByText(/질문 전문|답변 전문/)).not.toBeInTheDocument();
  });
});
