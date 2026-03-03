const { test, expect } = require('@playwright/test');

test.use({ baseURL: 'http://localhost:8080' });

test.describe('v1.0 Final Product Verification', () => {
  test('Registration Flow: Form then Google Auth', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/web/user/index.html');

    // Check form visibility
    await expect(page.locator('#registration-fields')).toBeVisible();
    await expect(page.locator('#google-auth-container')).toBeHidden();

    // Fill form
    await page.fill('#invite-code', 'TEST:CODE');
    await page.fill('#parent-name', 'テスト保護者');
    await page.fill('#parent-class', 'テスト組');

    // Click Next
    await page.click('button:has-text("情報を入力して次へ")');

    // Check Google Auth button visibility
    await expect(page.locator('#registration-fields')).toBeHidden();
    await expect(page.locator('#google-auth-container')).toBeVisible();
    await expect(page.locator('button:has-text("Googleでログインして登録完了")')).toBeVisible();

    await page.screenshot({ path: 'verification/v1_reg_flow_auth_step.png' });
  });

  test('Multi-bus switcher is present when multiple buses exist', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/web/user/index.html');

    await page.evaluate(() => {
        localStorage.setItem('user_auths', JSON.stringify([
            {busId: 'bus1', key: 'key1'},
            {busId: 'bus2', key: 'key2'}
        ]));
        window.allAuths = [
            {busId: 'bus1', key: 'key1'},
            {busId: 'bus2', key: 'key2'}
        ];
        window.authData = {busId: 'bus1', key: 'key1'};

        // Force unhide map and info panel
        document.getElementById('login-section').classList.add('hidden');
        const mapSec = document.getElementById('map-section');
        mapSec.classList.remove('hidden');
        mapSec.classList.remove('opacity-0');
        document.body.classList.remove('login-active');
        document.getElementById('info-panel').classList.remove('panel-hidden');
    });

    // Check switcher buttons
    const busButtons = page.locator('#bus-selector button');
    await expect(busButtons).toHaveCount(3); // 2 buses + 1 "Add Bus" button

    await page.screenshot({ path: 'verification/v1_multibus_switcher.png' });
  });
});
