import { test, expect } from './fixtures/extension'

test.describe('Onboarding', () => {
    test('should display Welcome page on first launch', async ({ extensionPage }) => {
        const page = extensionPage

        await test.step('Wait for page to load', async () => {
            await page.waitForLoadState('networkidle')
            await page.screenshot({ path: 'test-results/onboarding-welcome-loaded.png', fullPage: true })
        })

        await test.step('Verify Welcome page is displayed', async () => {
            await expect(page.getByTestId('welcome-title')).toBeVisible({ timeout: 10000 })
        })

        await test.step('Verify main buttons are present', async () => {
            const createWalletButton = page.getByTestId('create-wallet-button')
            const signInWithSeedButton = page.getByTestId('sign-in-seed-button')
            const signInWithLedgerButton = page.getByTestId('sign-in-ledger-button')

            await expect(createWalletButton).toBeVisible()
            await expect(signInWithSeedButton).toBeVisible()
            await expect(signInWithLedgerButton).toBeVisible()
        })

        await test.step('Verify Terms of Use link', async () => {
            const termsLink = page.getByTestId('terms-link')
            await expect(termsLink).toBeVisible()
            await page.screenshot({ path: 'test-results/onboarding-welcome-complete.png', fullPage: true })
        })
    })

    test('should navigate to Select Network page when clicking Create Wallet', async ({ extensionPage }) => {
        const page = extensionPage

        await test.step('Verify Welcome page loaded', async () => {
            await page.waitForLoadState('networkidle')
            await page.screenshot({ path: 'test-results/onboarding-before-create-click.png', fullPage: true })
        })

        await test.step('Click create wallet button', async () => {
            const createWalletButton = page.getByTestId('create-wallet-button')
            await createWalletButton.click()
        })

        await test.step('Verify navigation to Select Network page', async () => {
            await expect(page.locator('h2')).toContainText('Select')
            await page.screenshot({ path: 'test-results/onboarding-select-network.png', fullPage: true })
        })
    })

    test('should navigate to Select Network page when clicking Sign In with Seed', async ({ extensionPage }) => {
        const page = extensionPage

        await test.step('Verify Welcome page loaded', async () => {
            await page.waitForLoadState('networkidle')
            await page.screenshot({ path: 'test-results/onboarding-before-signin-click.png', fullPage: true })
        })

        await test.step('Click sign in with seed button', async () => {
            const signInButton = page.getByTestId('sign-in-seed-button')
            await signInButton.click()
        })

        await test.step('Verify navigation to Select Network page', async () => {
            await expect(page.locator('h2')).toContainText('Select')
            await page.screenshot({ path: 'test-results/onboarding-select-network-seed.png', fullPage: true })
        })
    })
})
