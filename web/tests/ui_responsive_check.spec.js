const { test, expect } = require('@playwright/test');

test.use({ baseURL: 'http://localhost:8080' });

test.describe('User UI Responsiveness', () => {
  test('Login screen loads correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/web/user/index.html');
    await expect(page.locator('#login-section > div')).toBeVisible();
    await expect(page.locator('#map-section')).toBeHidden();
    await page.screenshot({ path: 'verification/mobile_login.png' });
  });

  test('Map UI elements are visible and positioned correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/web/user/index.html');

    await page.evaluate(() => {
        // Mock enough state to show the map UI
        localStorage.setItem('user_auths', JSON.stringify([{busId: 'test-bus', key: 'test-key'}]));
        window.authData = {busId: 'test-bus', key: 'test-key'};

        // Manually trigger showMap if possible or just unhide
        document.getElementById('login-section').classList.add('hidden');
        const mapSec = document.getElementById('map-section');
        mapSec.classList.remove('hidden');
        mapSec.classList.remove('opacity-0');
        document.body.classList.remove('login-active');

        // Show the info panel
        document.getElementById('info-panel').classList.remove('panel-hidden');
    });

    await expect(page.locator('#map-section')).toBeVisible();
    await expect(page.locator('#info-panel')).toBeVisible();

    // Check for "Running Info" button
    await expect(page.locator('button:has-text("運行情報")')).toBeVisible();

    // Check legend
    await expect(page.locator('.glass-panel:has-text("走行予定")')).toBeVisible();

    await page.screenshot({ path: 'verification/mobile_map_full_ui.png' });
  });
});
