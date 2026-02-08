import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para E2E Tests
 */
export default defineConfig({
  testDir: './e2e',
  testIgnore: ['**/*.test.*'],
  maxFailures: 5,
  fullyParallel: false, // Executar sequencialmente para evitar conflitos
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },

  webServer: {
    // Start dev server inside the frontend folder to ensure correct scripts
    command: process.env.CI ? 'cd frontend && npm start' : 'cd frontend && npm run dev',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ]
});
