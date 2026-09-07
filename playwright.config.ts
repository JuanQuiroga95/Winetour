import { config } from 'dotenv';
config({ path: '.env.local', quiet: true });
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  timeout: 60000,
  use: { baseURL: 'http://localhost:3000', ...devices['Desktop Chrome'], channel: 'chrome' },
  reporter: 'list',
  webServer: {
    command: 'npm run dev -- --hostname 127.0.0.1',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
