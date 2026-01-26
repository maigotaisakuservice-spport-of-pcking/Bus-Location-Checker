from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Check Admin
            page.goto("http://localhost:8000/web/admin/index.html")
            page.wait_for_timeout(2000)
            page.screenshot(path="v3_admin.png")

            # Check User
            page.goto("http://localhost:8000/web/user/index.html")
            page.wait_for_timeout(2000)
            page.screenshot(path="v3_user.png")

            # Check Mobile
            page.goto("http://localhost:8000/mobile/cordova/www/index.html")
            page.wait_for_timeout(2000)
            page.screenshot(path="v3_mobile.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify()
