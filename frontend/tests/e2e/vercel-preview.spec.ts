import { expect, test } from '@playwright/test';

test.describe('Vercel production preview', () => {
  test.skip(
    process.env.AGENT4_PRODUCTION_E2E !== 'true',
    'production routes are checked only against the built preview',
  );

  test('serves every public BrowserRouter entry point', async ({ page }) => {
    const routes = [
      { path: '/' },
      { path: '/method' },
      { path: '/data' },
      { path: '/about' },
      { path: '/atlas', testId: 'atlas-page' },
      { path: '/evidence/EVID_18557647961C4C1481271E6B', testId: 'evidence-direct-page' },
      { path: '/case/case-01', testId: 'case-direct-page' },
    ] as const;

    for (const route of routes) {
      const response = await page.goto(route.path);
      expect(response?.status(), route.path).toBe(200);
      await expect(page.locator('main#main-content'), route.path).toBeVisible();
      if ('testId' in route) {
        await expect(page.getByTestId(route.testId), route.path).toBeVisible();
      }
    }
  });

  test('keeps development-only UI out of the production build', async ({ page }) => {
    const response = await page.goto('/dev/foundations');
    expect(response?.status()).toBe(200);
    await expect(page.getByTestId('foundations-page')).toHaveCount(0);
    await expect(page.getByTestId('not-found-page')).toBeVisible();
  });

  test('loads the runtime release pointer, Story preview, Explorer, and approved Evidence detail', async ({ page, request }) => {
    const pointerResponse = await request.get('/data/current-release.json');
    expect(pointerResponse.status()).toBe(200);
    const pointer = await pointerResponse.json() as { release_id: string };

    await page.goto('/#answers');
    await expect(page.getByText('[2020–2025] 761개 decision group 증거 추적')).toBeVisible();
    await expect(page.getByRole('heading', { name: /조치 중.*3년째.*관계기관 협의/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /조치 완료.*반복된 사망사고/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /완료와 진행.*그 사이를 묻다/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /모르겠습니다.*기억이 안 납니다/ })).toBeVisible();
    await expect(page.getByText(/2,842|82\.4%|ev-101/)).toHaveCount(0);
    await expect(page.locator('[data-testid$="data-unavailable"]')).toHaveCount(0);
    await expect(page.getByTestId('story-atlas-ready')).toHaveAttribute('data-release-id', pointer.release_id);
    await expect(page.locator('#answers [data-testid="atlas-chart"] [data-node-id]')).toHaveCount(140);
    await expect(page.locator('#answers [data-editorial-anchor="true"]')).toHaveCount(16);

    await page.goto('/atlas');
    await expect(page.getByText(pointer.release_id, { exact: true }).first()).toBeVisible();
    await expect(page.locator('[data-testid="atlas-chart"] [data-node-id]')).toHaveCount(140);

    await page.goto('/evidence/EVID_18557647961C4C1481271E6B');
    await expect(page.getByTestId('approved-evidence-detail')).toHaveAttribute('data-evidence-id', 'EVID_18557647961C4C1481271E6B');
    await expect(page.getByText(/MOCK PREVIEW/)).toHaveCount(0);
  });
});
