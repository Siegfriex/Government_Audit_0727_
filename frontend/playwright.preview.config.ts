import { defineConfig, devices } from '@playwright/test';

process.env.AGENT4_PRODUCTION_E2E = 'true';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: [
    'agent4-presentation-wcag.spec.ts',
    'atlas-contract-shell.spec.ts',
    'atlas-experience-design.spec.ts',
    'vercel-preview.spec.ts',
    'story-explorer-parity.spec.ts',
    'evidence-detail.spec.ts',
  ],
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4317',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4317 --strictPort',
    url: 'http://127.0.0.1:4317',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
