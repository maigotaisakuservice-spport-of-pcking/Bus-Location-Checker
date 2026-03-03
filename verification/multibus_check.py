from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page(viewport={'width': 375, 'height': 812})
    page.goto('http://localhost:8080/web/user/index.html')

    # Mock logged in state with multiple buses
    page.evaluate('''() => {
        localStorage.setItem('user_auths', JSON.stringify([
            {busId: 'bus1', key: 'key1'},
            {busId: 'bus2', key: 'key2'}
        ]));
        window.allAuths = [
            {busId: 'bus1', key: 'key1'},
            {busId: 'bus2', key: 'key2'}
        ];
        window.authData = {busId: 'bus1', key: 'key1'};

        document.getElementById('login-section').classList.add('hidden');
        const mapSec = document.getElementById('map-section');
        mapSec.classList.remove('hidden');
        mapSec.classList.remove('opacity-0');
        document.body.classList.remove('login-active');
        document.getElementById('info-panel').classList.remove('panel-hidden');
    }''')

    page.wait_for_timeout(1000)
    # The bus selector should now show buttons
    page.screenshot(path='/home/jules/verification/multibus_selector_verify.png')

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
