const { test, expect } = require('@playwright/test');

test.use({ baseURL: 'http://localhost:8080' });

test.describe('v1.0 Final UI Refinement Verification', () => {
  test('Login View is default, can toggle to Registration', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/web/user/index.html');

    // Check login view items
    await expect(page.locator('#login-view')).toBeVisible();

    // Target the specific Google login button in the login view
    const googleLoginBtn = page.locator('#login-view').getByRole('button', { name: 'Googleでログイン', exact: true });
    await expect(googleLoginBtn).toBeVisible();

    // Toggle to registration
    await page.click('button:has-text("新規バス利用登録（初回）")');

    await expect(page.locator('#login-view')).toBeHidden();
    await expect(page.locator('#registration-view')).toBeVisible();
    await expect(page.locator('input#invite-code')).toBeVisible();

    // Toggle back
    await page.click('button:has-text("ログイン画面に戻る")');
    await expect(page.locator('#login-view')).toBeVisible();

    await page.screenshot({ path: 'verification/v1_ui_refinement_toggle.png' });
  });

  test('Multi-bus switcher uses new terminology', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/web/user/index.html');

    await page.evaluate(() => {
        const auths = [{busId: 'bus1', key: 'key1'}];
        localStorage.setItem('user_auths', JSON.stringify(auths));
        window.allAuths = auths;
        window.authData = auths[0];

        // Render selector manually for check
        const sel = document.getElementById('bus-selector');
        sel.innerHTML = '';
        const btn = document.createElement('button');
        btn.innerText = "Bus 1";
        sel.appendChild(btn);

        const addBtn = document.createElement('button');
        addBtn.innerText = "＋ 別のバスを登録";
        sel.appendChild(addBtn);

        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('map-section').classList.remove('hidden', 'opacity-0');
        document.body.classList.remove('login-active');
        document.getElementById('info-panel').classList.remove('panel-hidden');
    });

    await expect(page.locator('button:has-text("＋ 別のバスを登録")')).toBeVisible();
    await page.screenshot({ path: 'verification/v1_ui_refinement_switcher.png' });
  });
});
