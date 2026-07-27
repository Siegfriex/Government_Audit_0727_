import { expect, test } from '@playwright/test';

const evidenceId = 'EVID_18557647961C4C1481271E6B';
const representativeNodeId = 'ANODE_E488BDA6398875DB653D7A71';

test.describe('approved Evidence detail runtime', () => {
  test.skip(process.env.AGENT4_PRODUCTION_E2E !== 'true', 'runs against the pointer-backed production preview');

  test('loads an approved direct detail and fails closed for an invalid ID', async ({ page }) => {
    const failures: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') failures.push(message.text()); });
    page.on('pageerror', (error) => failures.push(error.message));
    page.on('requestfailed', (request) => failures.push(`${request.url()} ${request.failure()?.errorText}`));

    const response = await page.goto(`/evidence/${evidenceId}`);
    expect(response?.status()).toBe(200);
    await expect(page.getByTestId('approved-evidence-detail')).toHaveAttribute('data-evidence-id', evidenceId);
    await expect(page.getByText(/MOCK PREVIEW|MOCK CITATION|CONTRACT_FIXTURE/i)).toHaveCount(0);

    await page.goto('/evidence/EVID_NOT_APPROVED');
    await expect(page.getByTestId('evidence-data-unavailable')).toBeVisible();
    expect(failures).toEqual([]);
  });

  test('opens the same approved detail in the route-driven Drawer and restores Atlas history', async ({ page }) => {
    await page.goto(`/atlas?node=${representativeNodeId}`);
    await expect(page.getByTestId('atlas-explorer-ready')).toBeVisible();
    await page.getByRole('button', { name: '승인된 대표 증거 보기' }).click();
    await expect(page).toHaveURL(`/evidence/${evidenceId}`);
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByTestId('approved-evidence-detail')).toHaveAttribute('data-evidence-id', evidenceId);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/atlas\\?node=${representativeNodeId}`));
  });
});
