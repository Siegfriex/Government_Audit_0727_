import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('Methodology publishes the canonical release scope and distinct data populations', async ({ page }) => {
  await page.goto('/method');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/국정감사 발언은 어떻게\s*검증 가능한 데이터가 되었나/);
  await expect(page.getByTestId('methodology-fact-grid').locator('article')).toHaveCount(6);
  await expect(page.getByTestId('methodology-pipeline').locator('details')).toHaveCount(10);
  await expect(page.getByTestId('methodology-codebook').locator('article')).toHaveCount(8);
  await expect(page.getByText('DATA PERIOD · 2020–2025')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'TF-IDF, Transformer, SVD와 UMAP을 어디에 썼나' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'PDF 한 쪽이 Transformer cosine 점수가 되기까지' })).toBeVisible();
  await expect(page.getByText('12-layer multi-head self-attention')).toBeVisible();
  await expect(page.getByText('A(Q,K,V) = softmax((QKᵀ / √dₖ) + M) V')).toBeVisible();
  await expect(page.getByRole('heading', { name: '‘조치완료·조치중·향후 추진계획’을 어떻게 상태로 바꿨나' })).toBeVisible();
  await expect(page.getByText('‘향후 추진계획’은 세 번째 상태 label이 아닙니다.')).toBeVisible();
  await expect(page.getByText('ATLAS_DG761_STORY_20260724_022353_KST_BF673FD1')).toBeVisible();

  const goldCard = page.getByTestId('methodology-fact-grid').locator('article').filter({ hasText: 'Gold 행태 라벨' });
  const analysisCard = page.getByTestId('methodology-fact-grid').locator('article').filter({ hasText: '승인 분석 엔터티' });
  await expect(goldCard).toContainText('769');
  await expect(goldCard).toContainText('761개 답변 결정 그룹');
  await expect(analysisCard).toContainText('64');
  await expect(analysisCard).toContainText('target-answer link');
  await expect(page.getByText(/2018[–~-]2023|2018년부터 2023년까지/)).toHaveCount(0);

  const secondStep = page.getByTestId('methodology-pipeline').locator('details').nth(1);
  await secondStep.locator('summary').click();
  await expect(secondStep).toHaveAttribute('open', '');

  const codebookResponse = await page.request.get('/methodology/behavior-codebook.csv');
  expect(codebookResponse.ok()).toBe(true);
  expect(await codebookResponse.text()).toContain('A8,완료·근거 제시');
});

test('Methodology remains readable and overflow-free across desktop and compact layouts', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
    { width: 320, height: 800 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/method');
    await expect(page.getByTestId('methodology-page')).toBeVisible();

    const layout = await page.evaluate(() => {
      const rail = document.querySelector<HTMLElement>('.method-rail');
      const report = document.querySelector<HTMLElement>('.method-report');
      const factGrid = document.querySelector<HTMLElement>('.method-fact-grid');
      const railBox = rail?.getBoundingClientRect();
      const reportBox = report?.getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        railDisplay: rail ? getComputedStyle(rail).display : null,
        railOutsideReport: Boolean(railBox && reportBox && railBox.left > reportBox.right),
        reportWidth: reportBox?.width ?? 0,
        factColumns: factGrid ? getComputedStyle(factGrid).gridTemplateColumns.split(' ').length : 0,
      };
    });

    expect(layout.overflow, `${viewport.width}px horizontal overflow`).toBe(0);
    if (viewport.width === 1440) {
      expect(layout.railDisplay).not.toBe('none');
      expect(layout.railOutsideReport).toBe(true);
      expect(layout.reportWidth).toBeGreaterThanOrEqual(900);
    }
    if (viewport.width === 390) expect(layout.factColumns).toBe(2);
    if (viewport.width === 320) expect(layout.factColumns).toBe(1);
  }
});

test('Methodology has no serious or critical WCAG violations', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/method');
  await expect(page.getByTestId('methodology-page')).toBeVisible();

  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  expect(axe.violations.filter((violation) => violation.impact === 'critical' || violation.impact === 'serious')).toEqual([]);
});
