from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Check Admin App
            page.goto("http://localhost:5173/register")
            page.wait_for_timeout(2000)
            page.screenshot(path="admin_register.png")

            # Check User App (Port 5174 usually)
            # Need to start user app too
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify()
