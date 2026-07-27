import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function blockingAxeViolations(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  return result.violations.filter((violation) => violation.impact === 'critical' || violation.impact === 'serious');
}

test('Story VID opens with all 140 approved nodes, 16 editorial anchors, and an in-flow context dossier', async ({ page }) => {
  await page.goto('/#answers');
  await expect(page.getByTestId('story-atlas-ready')).toBeVisible();
  await expect(page.locator('#answers [data-node-id]')).toHaveCount(140);
  await expect(page.locator('#answers [data-editorial-anchor="true"]')).toHaveCount(16);
  await expect(page.locator('#answers [data-node-filter-state="matched"]')).toHaveCount(16);
  await expect(page.locator('#answers [data-node-filter-state="context"]')).toHaveCount(124);
  await expect(page.locator('#answers #atlas-node-list button')).toHaveCount(140);
  const storyWorkspace = page.locator('#answers .story-atlas-workspace');
  await expect(storyWorkspace.locator('.story-atlas-circle-shape--mark')).toHaveCount(140);
  const storyCircleMarks = storyWorkspace.locator('.story-atlas-circle-shape--mark');
  const sourceShapes = storyWorkspace.locator('.atlas-node-glyph__source-shape');
  await expect(storyCircleMarks.first()).toHaveCSS('display', 'block');
  await expect(sourceShapes.first()).toHaveCSS('display', 'none');
  expect(await storyCircleMarks.evaluateAll((elements) => elements.every((element) => getComputedStyle(element).display === 'block'))).toBe(true);
  expect(await sourceShapes.evaluateAll((elements) => elements.every((element) => getComputedStyle(element).display === 'none'))).toBe(true);
  await expect(storyWorkspace.locator('[data-shape-token="circle"]')).toHaveCount(53);
  await expect(storyWorkspace.locator('[data-shape-token="square"]')).toHaveCount(41);
  await expect(storyWorkspace.locator('[data-shape-token="diamond"]')).toHaveCount(46);
  await expect(page.getByTestId('story-selected-dossier')).toBeVisible();
  await expect(page.getByTestId('story-atlas-type-primer').locator('[data-answer-type]')).toHaveCount(8);
  await expect(page.locator('#answers [data-selection-ring="true"]')).toHaveCount(0);
  await expect(page.getByText(/FEATURED CONTEXT/)).toBeVisible();

  const evidenceNodeId = 'ANODE_62B6852738502414C4FA08E3';
  const nodeIndex = await page.locator('#answers [data-node-id]').evaluateAll(
    (elements, nodeId) => elements.findIndex((element) => (element as SVGElement).dataset.nodeId === nodeId),
    evidenceNodeId,
  );
  expect(nodeIndex).toBeGreaterThanOrEqual(0);
  await page.locator('#answers #atlas-node-list button').nth(nodeIndex).evaluate((element) => {
    (element as HTMLButtonElement).click();
  });
  await expect(page).toHaveURL(new RegExp(`node=${evidenceNodeId}`));
  await expect(page.getByTestId('story-selected-dossier')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#answers [data-selection-ring="true"]')).toHaveCount(1);
  await expect(page.locator(`#answers [data-node-id="${evidenceNodeId}"] .atlas-node-label`)).toHaveCount(0);
  const annotation = page.locator('#answers .atlas-selected-annotation');
  await expect(annotation).toHaveCount(1);
  const annotationPresentation = await annotation.evaluate((element) => {
    const panel = element.querySelector<SVGRectElement>('.atlas-selected-annotation__panel')!;
    const box = panel.getBBox();
    return {
      x: box.x,
      y: box.y,
      right: box.x + box.width,
      bottom: box.y + box.height,
      fill: getComputedStyle(panel).fill,
      textFill: getComputedStyle(element.querySelector('text')!).fill,
    };
  });
  expect(annotationPresentation).toEqual(expect.objectContaining({
    x: expect.any(Number),
    y: expect.any(Number),
  }));
  expect(annotationPresentation.x).toBeGreaterThanOrEqual(76);
  expect(annotationPresentation.y).toBeGreaterThanOrEqual(48);
  expect(annotationPresentation.right).toBeLessThanOrEqual(676);
  expect(annotationPresentation.bottom).toBeLessThanOrEqual(456);
  expect(annotationPresentation.fill).not.toMatch(/rgb\(0,?\s*0,?\s*0\)|#000(?:000)?/i);
  expect(annotationPresentation.textFill).not.toBe(annotationPresentation.fill);
  const questionContext = page.getByTestId('story-atlas-question-context');
  await expect(questionContext).toBeVisible();
  await expect(questionContext.locator('details')).not.toHaveAttribute('open');
  await questionContext.getByText('질문 전체 읽기').click();
  await expect(questionContext.locator('details')).toHaveAttribute('open', '');
  await expect(questionContext.getByText('질문 접기')).toBeVisible();
  await expect(page.getByTestId('story-atlas-answer-focus').locator('blockquote')).not.toHaveText('');
});

test('A1 color filter keeps the full field as context and KMeans opens the closest approved evidence', async ({ page }) => {
  await page.goto('/#answers');
  await expect(page.getByTestId('story-atlas-ready')).toBeVisible();

  const primer = page.getByTestId('story-atlas-type-primer');
  await primer.locator('button[data-answer-type="A1"]').click();
  await expect(page).toHaveURL(/\?types=A1$/);
  await expect(page.locator('#answers [data-node-id]')).toHaveCount(140);
  await expect(page.locator('#answers [data-node-filter-state="matched"]')).toHaveCount(1);
  await expect(page.locator('#answers [data-node-filter-state="matched"][data-editorial-anchor="true"]')).toHaveCount(1);
  const a1MatchedCount = 1;
  await expect(page.locator('#answers [data-node-filter-state="context"]')).toHaveCount(140 - a1MatchedCount);
  await expect(page.locator('#answers #atlas-node-list button')).toHaveCount(12);
  await expect(page.locator('.story-atlas-cluster-card')).toHaveCount(12);
  await expect(primer.locator('button[data-answer-type="A1"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(primer.locator('button[data-answer-type="A8"]')).toHaveAttribute('aria-pressed', 'false');

  await primer.getByRole('button', { name: 'A1–A8 전체 보기' }).click();
  await expect(page.locator('.story-atlas-cluster-card')).toHaveCount(24);
  await page.getByTestId('story-atlas-cluster-disclosure').locator('summary').click();
  await expect(page.getByTestId('story-atlas-cluster-disclosure')).toHaveAttribute('open', '');
  await page.locator('.story-atlas-cluster-card').first().click();
  await expect(page).toHaveURL(/\?node=ANODE_[A-F0-9]+$/);
  await expect(page.locator('#answers [data-selection-ring="true"]')).toHaveCount(1);

  const evidence = page.getByTestId('story-atlas-evidence-context');
  await expect(evidence).toBeVisible();
  const question = page.getByTestId('story-atlas-question-context');
  const answer = page.getByTestId('story-atlas-answer-focus');
  const details = page.getByTestId('story-atlas-node-details');
  await expect(question).toContainText('이 답변을 끌어낸 질문');
  await expect(answer).toContainText('대표 승인 답변');
  await expect(answer.locator('blockquote')).not.toHaveText('');
  await expect(details).toContainText('처리상태');
  const verticalOrder = await page.evaluate(() => ({
    question: document.querySelector('[data-testid="story-atlas-question-context"]')!.getBoundingClientRect().top,
    answer: document.querySelector('[data-testid="story-atlas-answer-focus"]')!.getBoundingClientRect().top,
    details: document.querySelector('[data-testid="story-atlas-node-details"]')!.getBoundingClientRect().top,
  }));
  expect(verticalOrder.question).toBeLessThan(verticalOrder.answer);
  expect(verticalOrder.answer).toBeLessThan(verticalOrder.details);
  expect(await blockingAxeViolations(page)).toEqual([]);
});

test('Projection Method Lab exposes canonical UMAP and explicit unavailable method states', async ({ page }) => {
  await page.goto('/method/projection');
  await expect(page.getByTestId('projection-method-lab')).toBeVisible();
  await expect(page.getByTestId('atlas-chart').locator('[data-node-id]')).toHaveCount(140);

  const umapTab = page.getByRole('tab', { name: /UMAP 2D/ });
  await umapTab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: /PCA ↔ UMAP/ })).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('.projection-mini-plot[data-method="umap"] [data-selection-ring="true"]')).toHaveCount(0);
  await expect(page.locator('.projection-mini-plot[data-method="pca"]')).toContainText('APPROVED PCA COORDINATES ABSENT');

  await page.getByRole('tab', { name: /PCA 2D/ }).click();
  await expect(page.getByRole('heading', { name: '승인된 PCA 2D projection이 없습니다' })).toBeVisible();

  await page.getByRole('tab', { name: /3D SHELL/ }).click();
  await expect(page.getByRole('heading', { name: '3D projection shell' })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.getByRole('button', { name: 'top' }).click();
  await expect(page.locator('.projection-3d-shell')).toHaveAttribute('data-preset', 'top');
  await expect(page.getByRole('link', { name: '2D canonical Atlas 열기' })).toHaveAttribute('href', '/atlas');

  await page.getByRole('tab', { name: /TENSOR/ }).click();
  await expect(page.getByRole('heading', { name: 'Tensor decomposition pipeline이 확인되지 않았습니다' })).toBeVisible();
  await expect(page.getByText('latent loading')).toBeVisible();
  expect(await blockingAxeViolations(page)).toEqual([]);
});

for (const viewport of [
  { width: 320, height: 800 },
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
]) {
  test(`Agent 4 Atlas VID has no page overflow at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });

    for (const route of ['/#answers', '/atlas', '/method/projection']) {
      await page.goto(route);
      await expect(page.locator('main')).toBeVisible();
      const geometry = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(geometry.scrollWidth, `${route} overflow at ${viewport.width}`).toBe(geometry.clientWidth);
    }
  });
}

test('Method controls retain 44px targets and reduced motion removes 3D shell transition', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/method/projection');
  await page.getByRole('tab', { name: /3D SHELL/ }).click();

  const targets = page.locator('.projection-method-tabs button, .projection-3d-shell__controls button, .projection-method-lab__backlinks a');
  for (let index = 0; index < await targets.count(); index += 1) {
    const target = targets.nth(index);
    if (!(await target.isVisible())) continue;
    const box = await target.boundingBox();
    expect(box?.width, `target ${index} width`).toBeGreaterThanOrEqual(44);
    expect(box?.height, `target ${index} height`).toBeGreaterThanOrEqual(44);
  }

  const transitionDuration = await page.locator('.projection-3d-shell__cube').evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(Number.parseFloat(transitionDuration)).toBeLessThanOrEqual(0.00001);
});
