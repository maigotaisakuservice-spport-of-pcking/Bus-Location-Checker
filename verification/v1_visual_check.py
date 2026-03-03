from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 375, 'height': 812})
    page.goto('http://localhost:8080/web/user/index.html')

    # Check registration fields (should be visible if not logged in)
    page.wait_for_timeout(1000)
    page.screenshot(path='/home/jules/verification/v1_user_login.png')

    # Try Admin fly-to logic
    page_admin = browser.new_page(viewport={'width': 1280, 'height': 800})
    page_admin.goto('http://localhost:8080/web/admin/index.html')
    # Mock admin login
    page_admin.evaluate('''() => {
        document.getElementById('auth-modal').classList.add('hidden');
    }''')
    page_admin.wait_for_timeout(500)
    page_admin.screenshot(path='/home/jules/verification/v1_admin_dashboard.png')

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
