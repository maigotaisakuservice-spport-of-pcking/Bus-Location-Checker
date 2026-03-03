const { test, expect } = require('@playwright/test');

test.use({ baseURL: 'http://localhost:3000' });

test.describe('User UI Responsiveness', () => {
  test('Login screen loads correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone 13
    await page.goto('/web/user/index.html');

    // Check for login card
    const card = page.locator('#login-section > div');
    await expect(card).toBeVisible();

    // Check that map section is hidden (via login-active class check)
    // Note: The previous logic uses .login-active #map-section { display: none !important; }
    const mapSection = page.locator('#map-section');
    await expect(mapSection).toBeHidden();

    await page.screenshot({ path: 'verification/mobile_login.png' });
  });

  test('Floating buttons are visible and styled on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/web/user/index.html');

    // Bypass login for UI check if possible or mock
    await page.evaluate(() => {
        localStorage.setItem('user_auths', JSON.stringify([{busId: 'test', key: 'test'}]));
        // Force showMap by mocking window.authData
        window.authData = {busId: 'test', key: 'test'};
    });

    await page.reload();

    await expect(page.locator('#map-section')).toBeVisible();

    // Check buttons
    const followBtn = page.locator('#btn-follow');
    await expect(followBtn).toBeVisible();

    // Check legend (using current updated selectors)
    const legend = page.locator('.fixed.bottom-6.left-6');
    await expect(legend).toBeVisible();

    await page.screenshot({ path: 'verification/mobile_map_ui.png' });
  });
});
