from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Check Admin Login Page
            page.goto("http://localhost:5173/login")
            page.wait_for_timeout(2000)
            page.screenshot(path="admin_login.png")

            # Check Admin Register Page (step 1)
            page.goto("http://localhost:5173/register")
            page.wait_for_timeout(2000)
            page.screenshot(path="admin_register_v2.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify()
