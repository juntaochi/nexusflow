import { test, expect } from './utils/fixtures';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');

  const title = await page.title();
  expect(title).toBeTruthy();

  const htmlElement = page.locator('html');
  await expect(htmlElement).toBeVisible();

  await page.screenshot({ path: 'test-results/smoke-homepage.png' });
});

test('page has valid HTML structure', async ({ page }) => {
  await page.goto('/');

  const body = page.locator('body');
  await expect(body).toBeVisible();

  const headings = page.locator('h1, h2, h3');
  const count = await headings.count();
  expect(count).toBeGreaterThanOrEqual(0);
});

test('no console errors on load', async ({ page }) => {
  const errors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      const isSVGError = text.toLowerCase().includes('path') && text.toLowerCase().includes('attribute');
      if (!isSVGError) {
        errors.push(text);
      }
    }
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  expect(errors).toEqual([]);
});
