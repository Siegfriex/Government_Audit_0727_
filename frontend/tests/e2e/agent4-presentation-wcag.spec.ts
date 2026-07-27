import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const compactViewports = [
  { width: 320, height: 800 },
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
] as const;
const productionPreview = process.env.AGENT4_PRODUCTION_E2E === 'true';

test('global header keeps every visible pointer target at least 44 by 44', async ({ page }) => {
  for (const viewport of compactViewports) {
    await page.setViewportSize(viewport);
    await page.goto('/atlas');
    await expect(page.getByTestId('atlas-chart')).toBeVisible();

    const targets = page.locator('#root > div > header a[href], #root > div > header button');
    for (let index = 0; index < await targets.count(); index += 1) {
      const target = targets.nth(index);
      if (!(await target.isVisible())) continue;
      const box = await target.boundingBox();
      expect(box?.width, `${viewport.width}px header target ${index} width`).toBeGreaterThanOrEqual(44);
      expect(box?.height, `${viewport.width}px header target ${index} height`).toBeGreaterThanOrEqual(44);
    }
  }
});

test('focus indicator keeps a two-layer boundary on paper and inverse surfaces', async ({ page }) => {
  await page.goto('/atlas');
  await expect(page.getByTestId('atlas-chart')).toBeVisible();
  await page.evaluate(() => {
    const inverse = document.createElement('div');
    inverse.className = 'redline-inverse';
    inverse.innerHTML = '<button id="agent4-inverse-focus-probe" type="button">focus probe</button>';
    document.body.append(inverse);
  });
  const probe = page.locator('#agent4-inverse-focus-probe');
  await probe.focus();
  const style = await probe.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      outlineStyle: computed.outlineStyle,
      outlineWidth: computed.outlineWidth,
      boxShadow: computed.boxShadow,
    };
  });
  expect(style.outlineStyle).not.toBe('none');
  expect(Number.parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
  expect(style.boxShadow).not.toBe('none');
});

test('mobile Evidence unavailable hierarchy reflows without a vertical record ID', async ({ page }) => {
  test.skip(!productionPreview, 'production fail-closed Evidence is validated against the Vite preview build');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/evidence/ev-101');
  const panel = page.getByTestId('evidence-data-unavailable');
  await expect(panel).toBeVisible();
  await expect(panel.locator('.evidence-unavailable-id')).toHaveText('ev-101');

  const geometry = await panel.evaluate((element) => {
    const id = element.querySelector<HTMLElement>('.evidence-unavailable-id');
    const heading = element.querySelector<HTMLElement>('h1');
    if (!id || !heading) throw new Error('Evidence unavailable hierarchy is incomplete');
    const idRect = id.getBoundingClientRect();
    const headingRect = heading.getBoundingClientRect();
    return {
      display: getComputedStyle(element).display,
      idWidth: idRect.width,
      idHeight: idRect.height,
      headingTop: headingRect.top,
      idBottom: idRect.bottom,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });

  expect(geometry.display).toBe('flex');
  expect(geometry.idWidth).toBeGreaterThanOrEqual(200);
  expect(geometry.idHeight).toBeLessThan(100);
  expect(geometry.headingTop).toBeGreaterThanOrEqual(geometry.idBottom);
  expect(geometry.overflow).toBe(0);
});

test('development Evidence Drawer preserves modal focus lifecycle for approved detail', async ({ page }) => {
  test.skip(productionPreview, 'development-only fixture interaction does not run against production');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const opener = page.getByRole('button', { name: /첫 승인 증거 원문 확인하기$/ });
  await opener.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByTestId('approved-evidence-detail')).toBeVisible();
  await expect(dialog.getByText(/MOCK PREVIEW|MOCK CITATION/i)).toHaveCount(0);
  await expect(page.getByRole('button', { name: '드로어 닫기' })).toBeFocused();
  await expect(page.locator('#root')).toHaveAttribute('aria-hidden', 'true');
  expect(await page.locator('#root').evaluate((element) => element instanceof HTMLElement && element.inert)).toBe(true);

  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(axe.violations.filter((violation) => violation.impact === 'critical' || violation.impact === 'serious')).toEqual([]);

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test('production Story, Data, Case and Evidence expose no mock or fixture content', async ({ page }) => {
  test.skip(!productionPreview, 'production isolation is validated against the Vite preview build');
  await page.setViewportSize({ width: 375, height: 812 });

  await page.goto('/');
  await expect(page.getByTestId('story-atlas-ready')).toBeVisible();
  await expect(page.getByText(/MOCK|CONTRACT_FIXTURE|MOCK PREVIEW|MOCK CITATION/i)).toHaveCount(0);

  await page.goto('/data');
  await expect(page.getByTestId('data-release-ready')).toBeVisible();
  await expect(page.getByText(/Mock Fixtures|Mock JSON|EV-101/i)).toHaveCount(0);

  await page.goto('/case/case-01');
  await expect(page.getByTestId('case-data-unavailable')).toBeVisible();
  await expect(page.getByText(/MOCK|EV-101|블랙리스트/i)).toHaveCount(0);

  await page.goto('/evidence/ev-101');
  await expect(page.getByTestId('evidence-data-unavailable')).toBeVisible();
  await expect(page.getByText(/MOCK PREVIEW|MOCK CITATION|CONTRACT_FIXTURE/i)).toHaveCount(0);
});
