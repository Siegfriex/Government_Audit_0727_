import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const selectedNodeId = 'ANODE_62B6852738502414C4FA08E3';
const noPublicEvidenceNodeId = 'ANODE_92324FB57F29713693DBFE63';

async function blockingAxeViolations(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  return result.violations.filter((violation) => violation.impact === 'critical' || violation.impact === 'serious');
}

test('three views share URL state and fail Relations closed without approved edges', async ({ page }) => {
  await page.goto(`/atlas?node=${selectedNodeId}`);
  await expect(page.getByRole('tab', { name: /^지도/ })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[data-topic-label]')).not.toHaveCount(0);
  await expect(page.locator('[data-selected-annotation]')).toHaveCount(1);
  await expect(page.locator('[data-shape-token="circle"]')).not.toHaveCount(0);
  await expect(page.locator('[data-shape-token="square"]')).not.toHaveCount(0);
  await expect(page.locator('[data-shape-token="diamond"]')).not.toHaveCount(0);

  const relationTab = page.getByRole('tab', { name: /^관계/ });
  await relationTab.click();
  await expect(page).toHaveURL(new RegExp(`node=${selectedNodeId}.*view=relations|view=relations.*node=${selectedNodeId}`));
  await expect(relationTab).toBeFocused();
  await expect(page.getByTestId('atlas-relations-data-unavailable')).toContainText('RELATION_DATA_BLOCKED');
  await expect(page.locator('[data-relation-id]')).toHaveCount(0);

  const evidenceTab = page.getByRole('tab', { name: /^근거 흐름/ });
  await evidenceTab.click();
  await expect(page).toHaveURL(new RegExp(`node=${selectedNodeId}.*view=evidence|view=evidence.*node=${selectedNodeId}`));
  await expect(evidenceTab).toBeFocused();
  await expect(page.getByTestId('atlas-evidence-dossier')).toContainText('원문 기록');
  await expect(page.getByTestId('atlas-evidence-dossier')).toContainText('질문');
  await expect(page.getByTestId('atlas-evidence-dossier')).toContainText('답변');

  await page.goBack();
  await expect(page.getByRole('tab', { name: /^관계/ })).toHaveAttribute('aria-selected', 'true');
  await page.goBack();
  await expect(page.getByRole('tab', { name: /^지도/ })).toHaveAttribute('aria-selected', 'true');
});

for (const viewport of [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1440, height: 1000 },
  { width: 1920, height: 1080 },
]) {
  test(`new Atlas views remain contained and Axe-clean at ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const view of ['map', 'relations', 'evidence'] as const) {
      const query = view === 'map' ? `node=${selectedNodeId}` : `node=${selectedNodeId}&view=${view}`;
      await page.goto(`/atlas?${query}`);
      await expect(page.getByTestId('atlas-explorer-ready')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      expect(await blockingAxeViolations(page)).toEqual([]);
    }
  });
}

test('mobile visual node hit targets remain at least 44px inside the bounded chart scroller', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/atlas');
  const hitBoxes = await page.locator('[data-atlas-hit-target="true"]').evaluateAll((elements) => elements.slice(0, 12).map((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }));
  for (const box of hitBoxes) {
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  expect(await page.locator('.atlas-visual-scroll').evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
});

test('mobile visual field opens with the interactive node population centered', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/atlas');
  const scroller = page.locator('.atlas-visual-scroll');
  await expect(scroller).toBeVisible();

  const field = await scroller.evaluate((element) => {
    const scrollerRect = element.getBoundingClientRect();
    const nodeRects = [...element.querySelectorAll<SVGGElement>('[data-node-filter-state="matched"]')]
      .map((node) => node.getBoundingClientRect());
    const visibleNodes = nodeRects.filter((rect) => rect.right > scrollerRect.left && rect.left < scrollerRect.right);
    return {
      scrollLeft: element.scrollLeft,
      visibleNodeCount: visibleNodes.length,
      totalNodeCount: nodeRects.length,
    };
  });

  expect(field.scrollLeft).toBeGreaterThan(0);
  expect(field.visibleNodeCount).toBeGreaterThan(field.totalNodeCount / 2);
});

test('pointer selection updates the URL and reveals the representative answer first', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/atlas');
  const node = page.locator(`[data-node-id="${selectedNodeId}"]`);
  await node.scrollIntoViewIfNeeded();
  const box = await node.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await expect(page).toHaveURL(new RegExp(`node=${selectedNodeId}`));
  await expect(node.locator('[data-selection-ring="true"]')).toHaveCount(1);
  const dossier = page.getByTestId('atlas-evidence-dossier');
  await expect(dossier.getByRole('heading', { name: '대표 답변' })).toBeVisible();
  await expect(dossier.locator('.atlas-dossier__answer')).toBeVisible();
  await expect(dossier.locator('.atlas-dossier__question-context')).toBeVisible();
});

test('a node without public Evidence remains selected and explains why answer text is absent', async ({ page }) => {
  await page.goto(`/atlas?node=${noPublicEvidenceNodeId}`);
  await expect(page.locator(`[data-node-id="${noPublicEvidenceNodeId}"] [data-selection-ring="true"]`)).toHaveCount(1);
  const dossier = page.getByTestId('atlas-evidence-dossier');
  await expect(dossier).toContainText('대표 답변 원문 미제공');
  await expect(dossier).toContainText('node 선택은 정상입니다');
  await expect(dossier).toContainText('공개 승인된 대표 Evidence가 연결되지 않아');
});
