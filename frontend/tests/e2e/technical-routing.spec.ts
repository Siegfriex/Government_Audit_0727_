import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const approvedEvidenceId = 'EVID_18557647961C4C1481271E6B';
const representativeNodeId = 'ANODE_E488BDA6398875DB653D7A71';

function collectRuntimeFailures(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const failedRequests: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    const failure = request.failure()?.errorText ?? 'unknown failure';
    failedRequests.push(`${request.method()} ${request.url()} ${failure}`);
  });

  return () => {
    expect(consoleErrors, 'browser console errors').toEqual([]);
    expect(pageErrors, 'uncaught page errors').toEqual([]);
    expect(failedRequests, 'application network failures').toEqual([]);
  };
}

async function expectNoCriticalOrSeriousAxeViolations(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const blocking = result.violations.filter(
    (violation) => violation.impact === 'critical' || violation.impact === 'serious'
  );
  expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
}

test('public URL routes, links, and wildcard 404 are reproducible', async ({ page }) => {
  const assertCleanRuntime = collectRuntimeFailures(page);

  await page.goto('/');
  await expect(page.getByRole('heading', { name: '국정감사 단순히 쇼인가?' })).toBeVisible();
  await expect(page).toHaveTitle(/에세이/);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '본문으로 건너뛰기' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();

  const routes = [
    { name: '방법론 (Method)', path: '/method', heading: /국정감사 발언은 어떻게\s*검증 가능한 데이터가 되었나/ },
    { name: '데이터 (Data)', path: '/data', heading: /데이터가 무엇을 말하고,\s*어디까지 말할 수 있는가/ },
    { name: '소개 (About)', path: '/about', heading: /프로젝트 정체성/ },
    { name: '에세이 (Story)', path: '/', heading: /국정감사 단순히 쇼인가/ },
  ];

  for (const route of routes) {
    await page.getByRole('link', { name: route.name }).click();
    await expect(page).toHaveURL(route.path);
    await expect(page.getByRole('heading', { name: route.heading }).first()).toBeVisible();
    await expect(page).toHaveTitle(new RegExp(route.name.split(' ')[0]));
  }

  await page.goto('/does-not-exist');
  await expect(page.getByTestId('not-found-page')).toBeVisible();
  await expect(page.getByRole('heading', { name: '요청한 기록을 찾을 수 없습니다' })).toBeVisible();
  await expect(page).toHaveTitle(/기록을 찾을 수 없음/);
  assertCleanRuntime();
});

test('story hashes support direct entry, explicit navigation, and back restoration', async ({ page }) => {
  const assertCleanRuntime = collectRuntimeFailures(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });

  await page.goto('/#prologue');
  await expect(page.locator('#prologue')).toBeInViewport();
  await page.getByRole('button', { name: '다음 챕터 스케일로 스크롤하여 이동' }).click();
  await expect(page).toHaveURL('/#scale');
  await expect(page.locator('#scale')).toBeInViewport();

  await page.goBack();
  await expect(page).toHaveURL('/#prologue');
  await expect(page.locator('#prologue')).toBeInViewport();

  await page.goto('/#remains');
  await expect(page.locator('#remains')).toBeInViewport();
  assertCleanRuntime();
});

test('approved evidence resolves while unavailable case and evidence IDs fail closed', async ({ page }) => {
  const assertCleanRuntime = collectRuntimeFailures(page);

  await page.goto(`/evidence/${approvedEvidenceId}`);
  await expect(page.getByTestId('evidence-direct-page')).toBeVisible();
  await expect(page.getByTestId('approved-evidence-detail')).toHaveAttribute('data-evidence-id', approvedEvidenceId);

  await page.goto('/case/case-01');
  await expect(page.getByTestId('case-direct-page')).toBeVisible();
  await expect(page.getByTestId('case-data-unavailable')).toContainText('APPROVED_CASE_ABSENT:case-01');

  await page.goto('/evidence/not-real');
  await expect(page.getByTestId('evidence-data-unavailable')).toContainText('EVIDENCE_NOT_APPROVED');
  assertCleanRuntime();
});

test('route-driven evidence drawer is modal, history-aware, and restores focus', async ({ page }) => {
  const assertCleanRuntime = collectRuntimeFailures(page);
  await page.goto(`/atlas?node=${representativeNodeId}`);

  const opener = page.getByRole('button', { name: '승인된 대표 증거 보기' });
  await opener.click();
  await expect(page).toHaveURL(`/evidence/${approvedEvidenceId}`);

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(dialog.getByTestId('approved-evidence-detail')).toHaveAttribute('data-evidence-id', approvedEvidenceId);
  await expect(page.locator('#root')).toHaveAttribute('aria-hidden', 'true');
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('hidden');
  await expect(page.getByRole('button', { name: '드로어 닫기' })).toBeFocused();

  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => {
    const active = document.activeElement;
    const modal = document.querySelector('[role="dialog"]');
    return Boolean(active && modal?.contains(active));
  })).toBe(true);

  await page.goBack();
  await expect(page).toHaveURL(new RegExp(`/atlas\\?node=${representativeNodeId}`));
  await expect(dialog).toBeHidden();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe('');
  await expect(page.locator('#root')).not.toHaveAttribute('aria-hidden', 'true');
  await expect(opener).toBeFocused();
  assertCleanRuntime();
});

test('mobile approved Evidence drawer remains usable and contained', async ({ page }) => {
  const assertCleanRuntime = collectRuntimeFailures(page);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`/atlas?node=${representativeNodeId}`);
  await page.getByRole('button', { name: '승인된 대표 증거 보기' }).click();

  const dialog = page.getByRole('dialog');
  await expect.poll(async () => {
    const box = await dialog.boundingBox();
    return (box?.x ?? 0) + (box?.width ?? 0);
  }).toBeLessThanOrEqual(375.01);
  const box = await dialog.boundingBox();
  expect(box?.x).toBeGreaterThanOrEqual(-0.01);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await expect(dialog.getByTestId('approved-evidence-detail')).toHaveAttribute('data-evidence-id', approvedEvidenceId);
  await expect(dialog.getByRole('tablist')).toHaveCount(0);
  const closeBox = await page.getByRole('button', { name: '드로어 닫기' }).boundingBox();
  expect(closeBox?.width).toBeGreaterThanOrEqual(44);
  expect(closeBox?.height).toBeGreaterThanOrEqual(44);
  assertCleanRuntime();
});

test('Axe reports zero critical or serious violations on key route states', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['/', '/method', '/data', '/about', '/evidence/ev-101', '/does-not-exist']) {
    await page.goto(route);
    await expect(page.locator('main')).toBeVisible();
    await expectNoCriticalOrSeriousAxeViolations(page);
  }

  await page.goto(`/atlas?node=${representativeNodeId}`);
  await page.getByRole('button', { name: '승인된 대표 증거 보기' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expectNoCriticalOrSeriousAxeViolations(page);
});

test('foundation gallery exists only at the development route', async ({ page }) => {
  test.skip(process.env.AGENT4_PRODUCTION_E2E === 'true', 'development-only route is intentionally excluded from production');
  await page.goto('/method');
  await expect(page.getByTestId('foundations-page')).toHaveCount(0);
  await expect(page.getByText('Foundation Gallery', { exact: true })).toHaveCount(0);

  await page.goto('/dev/foundations');
  await expect(page.getByTestId('foundations-page')).toBeVisible();
  await expect(page.getByText('Foundation Gallery', { exact: true })).toBeVisible();
});
