import { PlaywrightTestConfig, devices } from '@playwright/test';

// in headless mode (local docker), prod mode is on
const isProd = process.env.NODE_ENV === 'production';

const config: PlaywrightTestConfig = {
  timeout: isProd ? 30e3 : 1e8,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  outputDir: './vision-results',
  globalTimeout: isProd ? 5 * 60 * 1000 : undefined,
  expect: {
    toMatchSnapshot: {
      threshold: 0.1,
      maxDiffPixelRatio: 0.01,
    },
  },
  testMatch: ['vision/**/**.spec.ts'],
  use: {
    trace: 'on-first-retry',
    video: 'off',
    launchOptions: {
      devtools: !isProd,
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  snapshotDir: './vision/snapshots',
};
export default config;
