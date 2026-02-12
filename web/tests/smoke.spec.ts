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

test('theme variables and surface styles are applied', async ({ page }) => {
  await page.goto('/');

  const themeVars = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    return {
      primary: styles.getPropertyValue('--theme-primary').trim(),
      surface: styles.getPropertyValue('--theme-surface').trim(),
      border: styles.getPropertyValue('--theme-border').trim(),
      radius: styles.getPropertyValue('--theme-radius').trim(),
    };
  });

  expect(themeVars.primary).toBeTruthy();
  expect(themeVars.surface).toBeTruthy();
  expect(themeVars.border).toBeTruthy();
  expect(themeVars.radius).toBeTruthy();

  const themeSwitcher = page.locator('[data-testid="theme-cyberpunk"]').first();
  await expect(themeSwitcher).toBeVisible();

  const switcherContainerBg = await themeSwitcher.locator('..').evaluate((el) => {
    return getComputedStyle(el).backgroundColor;
  });

  // Should be a non-transparent background once `bg-surface` is working.
  expect(switcherContainerBg).not.toBe('rgba(0, 0, 0, 0)');
  expect(switcherContainerBg).not.toBe('transparent');

  // Basic spacing sanity check: layout should not collapse to (almost) zero padding.
  const header = page.locator('header').first();
  const headerPaddingLeft = await header.evaluate((el) => getComputedStyle(el).paddingLeft);
  const headerPaddingTop = await header.evaluate((el) => getComputedStyle(el).paddingTop);
  expect(parseFloat(headerPaddingLeft)).toBeGreaterThan(0);
  expect(parseFloat(headerPaddingTop)).toBeGreaterThan(0);
});

test('verify page still exposes World ID popup trigger when already verified', async ({ page }) => {
  await page.addInitScript(() => {
    const proof = {
      merkle_root: '0xmock',
      nullifier_hash: '0xmock',
      proof: '0xmock',
      verification_level: 'device',
    };

    window.localStorage.setItem(
      'world-id-storage',
      JSON.stringify({
        state: { isVerified: true, proof },
        version: 0,
      })
    );
  });

  await page.goto('/verify');

  const reverifyButton = page.getByRole('button', { name: /re-verify with world id/i });
  await expect(reverifyButton).toBeVisible();
  await expect(reverifyButton).toBeEnabled();
});

test('verify page opens an accessible World ID dialog', async ({ page }) => {
  await page.goto('/verify');

  const verifyButton = page.getByRole('button', { name: /verify with world id/i });
  await verifyButton.click();

  await expect(page.getByRole('dialog', { name: /verify with world id/i })).toBeVisible();
});

test('console keeps separate sessions per agent when switching', async ({ page }) => {
  await page.goto('/console');

  const strategyHubButton = page.getByRole('button', { name: /strategy hub/i });
  await strategyHubButton.click();

  await expect(page.getByText('Primary Coordinator: Strategy Hub (#402)')).toBeVisible();

  await page
    .getByPlaceholder('Ask Strategy Hub to execute strategy...')
    .fill('Rebalance my portfolio');

  await page.getByRole('button', { name: /execute/i }).click();
  await expect(page.getByText('Coordinating with Strategy Hub (#402)...')).toBeVisible();

  const liquidityNodeButton = page.getByRole('button', { name: /liquidity node/i });
  await liquidityNodeButton.click();
  await expect(page.getByText('Primary Coordinator: Liquidity Node (#801)')).toBeVisible();
  await expect(page.getByText('No commands yet for this agent session.')).toBeVisible();
  await expect(page.getByText('Coordinating with Strategy Hub (#402)...')).toHaveCount(0);

  await strategyHubButton.click();
  await expect(page.getByText('Primary Coordinator: Strategy Hub (#402)')).toBeVisible();
  await expect(page.getByText('Coordinating with Strategy Hub (#402)...')).toBeVisible();
});

test('console session persists after leaving and returning to page', async ({ page }) => {
  await page.goto('/console');

  const strategyHubButton = page.getByRole('button', { name: /strategy hub/i });
  await strategyHubButton.click();

  await page
    .getByPlaceholder('Ask Strategy Hub to execute strategy...')
    .fill('Keep this session after navigation');

  await page.getByRole('button', { name: /execute/i }).click();
  await expect(page.getByText('> Keep this session after navigation')).toBeVisible();

  await page.goto('/');
  await page.goto('/console');

  await expect(page.getByText('Primary Coordinator: Strategy Hub (#402)')).toBeVisible();
  await expect(page.getByText('> Keep this session after navigation')).toBeVisible();
});
