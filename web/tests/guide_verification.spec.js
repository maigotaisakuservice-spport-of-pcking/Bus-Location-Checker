const { test, expect } = require('@playwright/test');

test.use({ baseURL: 'http://localhost:8080' });

test.describe('Help and Guide Verification', () => {
  test('Root index has Guide link and it works', async ({ page }) => {
    await page.goto('/index.html');
    const guideBtn = page.locator('button:has-text("📖 使い方ガイド")');
    await expect(guideBtn).toBeVisible();
    await guideBtn.click();
    await expect(page).toHaveURL(/guide.html/);
    await expect(page.locator('h1')).toHaveText('ご利用ガイド');
    await page.screenshot({ path: 'verification/guide_page.png' });
  });

  test('Admin Help Modal is functional', async ({ page }) => {
    await page.goto('/web/admin/index.html');

    // Bypass auth modal for visual check
    await page.evaluate(() => {
        document.getElementById('auth-modal').remove();
    });

    const helpBtn = page.locator('button:has-text("❓")');
    await expect(helpBtn).toBeVisible();
    await helpBtn.click();

    const modal = page.locator('#help-modal');
    await expect(modal).toBeVisible();
    await expect(modal.locator('h2')).toContainText('管理者ヘルプガイド');

    await page.screenshot({ path: 'verification/admin_help_modal.png' });

    await page.click('#help-modal button:has-text("閉じる")');
    await expect(modal).toBeHidden();
  });
});
