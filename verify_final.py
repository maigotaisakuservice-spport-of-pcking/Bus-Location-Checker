from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Check Admin
            page.goto("http://localhost:8000/web/admin/index.html")
            page.wait_for_timeout(2000)
            page.screenshot(path="final_admin.png")

            # Check Mobile
            page.goto("http://localhost:8000/mobile/cordova/www/index.html")
            page.wait_for_timeout(2000)
            page.screenshot(path="final_mobile.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify()
