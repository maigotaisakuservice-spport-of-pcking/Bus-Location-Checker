from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)

    # Desktop
    page = browser.new_page(viewport={'width': 1280, 'height': 800})
    page.goto('http://localhost:8080/web/user/index.html')

    # Mock login state
    page.evaluate('''() => {
        localStorage.setItem('user_auths', JSON.stringify([{busId: 'test-bus', key: 'test-key'}]));
        window.authData = {busId: 'test-bus', key: 'test-key'};
        document.getElementById('login-section').classList.add('hidden');
        const mapSec = document.getElementById('map-section');
        mapSec.classList.remove('hidden');
        mapSec.classList.remove('opacity-0');
        document.body.classList.remove('login-active');
        document.getElementById('info-panel').classList.remove('panel-hidden');
    }''')

    page.wait_for_timeout(500)
    page.screenshot(path='/home/jules/verification/desktop_map.png')

    # Mobile
    page_mobile = browser.new_page(viewport={'width': 375, 'height': 812})
    page_mobile.goto('http://localhost:8080/web/user/index.html')
    page_mobile.evaluate('''() => {
        localStorage.setItem('user_auths', JSON.stringify([{busId: 'test-bus', key: 'test-key'}]));
        window.authData = {busId: 'test-bus', key: 'test-key'};
        document.getElementById('login-section').classList.add('hidden');
        const mapSec = document.getElementById('map-section');
        mapSec.classList.remove('hidden');
        mapSec.classList.remove('opacity-0');
        document.body.classList.remove('login-active');
        document.getElementById('info-panel').classList.remove('panel-hidden');
    }''')
    page_mobile.wait_for_timeout(500)
    page_mobile.screenshot(path='/home/jules/verification/mobile_map.png')

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
