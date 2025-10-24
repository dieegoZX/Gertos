from playwright.sync_api import sync_playwright, expect

def run_verification(page):
    """
    Navigates to the dashboard, verifies the title, and takes a screenshot.
    """
    # Navigate to the local development server
    page.goto("http://localhost:3000")

    # Expect the main heading to be visible
    heading = page.get_by_role("heading", name="Dashboard de Análise de Dados")
    expect(heading).to_be_visible()

    # Take a screenshot to verify the initial layout
    page.screenshot(path="jules-scratch/verification/verification.png")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run_verification(page)
        browser.close()

if __name__ == "__main__":
    main()
