import { expect, test } from '@playwright/test';

test.describe('approved Story and Explorer parity', () => {
  test.skip(process.env.AGENT4_PRODUCTION_E2E !== 'true', 'runs against the pointer-backed production preview');

  test('uses one release/projection and preserves every approved Story node field in Explorer', async ({ page }) => {
    const runtimeErrors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') runtimeErrors.push(message.text()); });
    page.on('pageerror', (error) => runtimeErrors.push(error.message));

    await page.goto('/#answers');
    const storyReady = page.getByTestId('story-atlas-ready');
    await expect(storyReady).toBeVisible();
    const storyMeta = await storyReady.evaluate((element) => ({
      releaseId: element.getAttribute('data-release-id'),
      projectionId: element.getAttribute('data-projection-id'),
      projectionHash: element.getAttribute('data-projection-hash'),
    }));
    const storyNodes = await page.locator('#answers [data-testid="atlas-chart"] [data-node-id]').evaluateAll((elements) => elements.map((element) => ({
      id: element.getAttribute('data-node-id'),
      anchorX: element.getAttribute('data-anchor-x'),
      anchorY: element.getAttribute('data-anchor-y'),
      displayX: element.getAttribute('data-display-x'),
      displayY: element.getAttribute('data-display-y'),
      radius: element.getAttribute('data-source-radius'),
    })));
    expect(storyNodes).toHaveLength(140);
    await expect(page.locator('#answers [data-editorial-anchor="true"]')).toHaveCount(16);
    await expect(page.locator('#answers .atlas-node-navigator')).toHaveCount(140);

    await page.goto('/atlas');
    const explorerReady = page.getByTestId('atlas-explorer-ready');
    await expect(explorerReady).toBeVisible();
    await expect(page.locator('[data-testid="atlas-chart"] [data-node-id]')).toHaveCount(140);
    await expect(page.locator('#atlas-node-list .atlas-node-navigator')).toHaveCount(140);
    await expect(explorerReady).toHaveAttribute('data-release-id', storyMeta.releaseId ?? '');
    await expect(explorerReady).toHaveAttribute('data-projection-id', storyMeta.projectionId ?? '');
    await expect(explorerReady).toHaveAttribute('data-projection-hash', storyMeta.projectionHash ?? '');

    const explorerById = new Map(await page.locator('[data-testid="atlas-chart"] [data-node-id]').evaluateAll((elements) => elements.map((element) => [
      element.getAttribute('data-node-id'),
      {
        anchorX: element.getAttribute('data-anchor-x'),
        anchorY: element.getAttribute('data-anchor-y'),
        displayX: element.getAttribute('data-display-x'),
        displayY: element.getAttribute('data-display-y'),
        radius: element.getAttribute('data-source-radius'),
      },
    ] as const)));
    for (const storyNode of storyNodes) {
      expect(explorerById.get(storyNode.id)).toEqual({
        anchorX: storyNode.anchorX,
        anchorY: storyNode.anchorY,
        displayX: storyNode.displayX,
        displayY: storyNode.displayY,
        radius: storyNode.radius,
      });
    }
    expect(runtimeErrors).toEqual([]);
  });

  test('serializes status and answer types into the CTA without carrying Story selection', async ({ page }) => {
    await page.goto('/?status=active&types=A2,A7&node=ANODE_62B6852738502414C4FA08E3#answers');
    const cta = page.getByRole('link', { name: '현재 필터로 전체 답변행태 지도 보기' });
    await expect(cta).toHaveAttribute('href', '/atlas?status=active&types=A2%2CA7');
  });
});
