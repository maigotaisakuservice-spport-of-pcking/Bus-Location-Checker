const { test, expect } = require('@playwright/test');

test('Landing page loads correctly', async ({ page }) => {
  await page.goto('http://localhost:8080/index.html');
  await expect(page).toHaveTitle(/バス運行状況確認システム/);
  await expect(page.locator('button', { hasText: '管理者ページ' })).toBeVisible();
  await expect(page.locator('button', { hasText: 'バス走行状況確認' })).toBeVisible();
});

test('User login page loads correctly', async ({ page }) => {
  await page.goto('http://localhost:8080/web/user/index.html');
  await expect(page).toHaveTitle(/バス位置確認 - ユーザー/);
  await expect(page.locator('#invite-code')).toBeVisible();
  await expect(page.locator('button', { hasText: 'ログインする' })).toBeVisible();
});

test('Admin login page loads correctly', async ({ page }) => {
  await page.goto('http://localhost:8080/web/admin/index.html');
  await expect(page).toHaveTitle(/管理者パネル - バス位置管理/);
  await expect(page.locator('#auth-title')).toContainText('管理者認証');
  await expect(page.locator('button', { hasText: 'Googleアカウントでログイン' })).toBeVisible();
});

test('Sender login page loads correctly', async ({ page }) => {
  await page.goto('http://localhost:8080/web/sender/index.html');
  await expect(page).toHaveTitle(/バス位置送信 - 運転手/);
  await expect(page.locator('#invite-code')).toBeVisible();
});
