import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PreferencesProvider } from '@/shared/providers/PreferencesProvider';
import { Dialog } from './Dialog';

function DialogHarness() {
  const [open, setOpen] = useState(false);
  return (
    <PreferencesProvider>
      <button type="button" onClick={() => setOpen(true)}>증거 열기</button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        titleId="test-title"
        descriptionId="test-description"
      >
        <h2 id="test-title">증거 상세</h2>
        <p id="test-description">상세 설명</p>
        <button type="button" onClick={() => setOpen(false)}>닫기</button>
      </Dialog>
    </PreferencesProvider>
  );
}

describe('Dialog accessibility contract', () => {
  let appRoot: HTMLDivElement;

  beforeEach(() => {
    appRoot = document.createElement('div');
    appRoot.id = 'root';
    document.body.append(appRoot);
    const overlayRoot = document.createElement('div');
    overlayRoot.id = 'overlay-root';
    document.body.append(overlayRoot);
  });

  afterEach(() => {
    document.getElementById('root')?.remove();
    document.getElementById('overlay-root')?.remove();
  });

  it('locks scrolling, isolates the app, closes with Escape, and restores focus', async () => {
    const user = userEvent.setup();
    render(<DialogHarness />, { container: appRoot });
    const opener = screen.getByRole('button', { name: '증거 열기' });

    await user.click(opener);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.getElementById('root')).toHaveAttribute('aria-hidden', 'true');

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(document.body.style.overflow).toBe('');
    await waitFor(() => expect(opener).toHaveFocus());
  });
});
