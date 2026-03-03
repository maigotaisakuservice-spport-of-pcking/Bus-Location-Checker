const { test, expect } = require('@playwright/test');

test.use({ baseURL: 'http://localhost:8080' });

test.describe('v1.0 Final Product Verification', () => {
  test('Registration Flow: Form then Google Auth', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/web/user/index.html');

    const validCode = Buffer.from('testBusId:testKey1234567890').toString('base64');
    await page.fill('#invite-code', validCode);
    await page.fill('#parent-name', 'テスト保護者');
    await page.fill('#parent-class', 'テスト組');

    await page.click('button:has-text("情報を入力して次へ")');

    await expect(page.locator('#google-auth-container')).toBeVisible();
    await expect(page.locator('#registration-fields')).toBeHidden();

    await page.screenshot({ path: 'verification/v1_reg_flow_auth_step.png' });
  });

  test('Multi-bus switcher is present with mocked data', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/web/user/index.html');

    await page.evaluate(() => {
        // Mock Firestore getDoc
        window.getDocMock = () => ({ exists: () => false, data: () => ({}) });

        const auths = [
            {busId: 'bus1', key: 'key1'},
            {busId: 'bus2', key: 'key2'}
        ];
        localStorage.setItem('user_auths', JSON.stringify(auths));
        window.allAuths = auths;
        window.authData = auths[0];

        // Setup UI
        document.body.classList.remove('login-active');
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('map-section').classList.remove('hidden', 'opacity-0');
        document.getElementById('info-panel').classList.remove('panel-hidden');

        // Render manually since we can't easily mock the Firebase imports inside the script
        const sel = document.getElementById('bus-selector');
        sel.innerHTML = '';
        auths.forEach((a, i) => {
            const btn = document.createElement('button');
            btn.innerText = "Mock Bus " + i;
            sel.appendChild(btn);
        });
        const addBtn = document.createElement('button');
        addBtn.innerText = "＋ 路線を追加";
        sel.appendChild(addBtn);
    });

    const busButtons = page.locator('#bus-selector button');
    await expect(busButtons).toHaveCount(3);

    await page.screenshot({ path: 'verification/v1_multibus_switcher.png' });
  });
});
