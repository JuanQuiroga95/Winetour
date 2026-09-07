import { chromium } from '@playwright/test';
import fs from 'node:fs';
fs.mkdirSync('artifacts', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  const failures = [];
  page.on('response', (r) => {
    if (r.status() >= 400) failures.push(`${r.status()} ${r.url()}`);
  });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Pausar carrusel' }).click();
  await page.getByRole('button', { name: 'Ver foto 1' }).click();
  await page.waitForTimeout(1500);
  for (let y = 0; y < (await page.evaluate(() => document.body.scrollHeight)); y += 700) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
    await page.waitForTimeout(160);
  }
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'artifacts/home-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'artifacts/home-mobile.png', fullPage: true });
  console.log(
    JSON.stringify({
      imageFailures: failures.filter((x) => /unsplash|google/.test(x)),
      desktopScreenshot: 'artifacts/home-desktop.png',
      mobileScreenshot: 'artifacts/home-mobile.png',
    }),
  );
} finally {
  await browser.close();
}
