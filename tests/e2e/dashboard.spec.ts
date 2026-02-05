import { test, expect } from './fixtures/extension'
import path from 'path'

test.describe('Main Page (Dashboard)', () => {
    test('should display Dashboard after importing backup', async ({ context, extensionId }) => {
        let page: any
        let popupPage: any

        await test.step('Open onboarding page', async () => {
            page = await context.newPage()
            await page.goto(`chrome-extension://${extensionId}/home.html`)
            await page.waitForLoadState('domcontentloaded')
            await page.waitForTimeout(1000)
            await page.screenshot({ path: 'test-results/dashboard-welcome-before-restore.png', fullPage: true })
        })

        await test.step('Verify Welcome page', async () => {
            await expect(page.getByTestId('welcome-title')).toBeVisible()
            const restoreButton = page.getByTestId('restore-backup-button')
            await expect(restoreButton).toBeVisible()
        })

        await test.step('Import backup file', async () => {
            const backupFilePath = path.join(__dirname, 'sparx-wallet-backup.json')
            const fileChooserPromise = page.waitForEvent('filechooser')

            const restoreButton = page.getByTestId('restore-backup-button')
            await restoreButton.click()

            const fileChooser = await fileChooserPromise
            await fileChooser.setFiles(backupFilePath)

            await page.waitForTimeout(3000)
            await page.screenshot({ path: 'test-results/dashboard-after-restore.png', fullPage: true })
        })

        await test.step('Open popup with Dashboard', async () => {
            popupPage = await context.newPage()
            await popupPage.setViewportSize({ width: 360, height: 600 })
            await popupPage.goto(`chrome-extension://${extensionId}/popup.html`)
            await popupPage.waitForLoadState('domcontentloaded')
            await popupPage.waitForTimeout(2000)
            await popupPage.screenshot({ path: 'test-results/dashboard-popup.png' })
        })

        await test.step('Verify Dashboard elements', async () => {
            const balanceElement = popupPage.locator('[class*="_balance_"]')
            await expect(balanceElement).toBeVisible()

            const tokensTab = popupPage.getByRole('button', { name: /tokens/i })
            await expect(tokensTab).toBeVisible()

            const nftTab = popupPage.getByRole('button', { name: /nft/i })
            await expect(nftTab).toBeVisible()

            const receiveButton = popupPage.getByText(/receive/i)
            await expect(receiveButton).toBeVisible()

            await popupPage.screenshot({ path: 'test-results/dashboard-complete.png' })
        })
    })
})
