import { test as base, chromium, type BrowserContext, type Page } from '@playwright/test';
import path from 'path';
import { tmpdir } from 'os';
import { mkdtempSync } from 'fs';
import { join } from 'path';

export const test = base.extend<{
    context: BrowserContext;
    extensionId: string;
    extensionPage: Page;
}>({
    // eslint-disable-next-line no-empty-pattern
    context: async ({}, use) => {
        const pathToExtension = path.join(__dirname, '../../../dist');

        // Create temporary directory for user profile
        // This ensures clean state for each test
        const userDataDir = mkdtempSync(join(tmpdir(), 'playwright-chrome-'));

        const context = await chromium.launchPersistentContext(userDataDir, {
            channel: 'chromium',
            args: [`--disable-extensions-except=${pathToExtension}`, `--load-extension=${pathToExtension}`],
        });
        await use(context);
        await context.close();
    },
    extensionId: async ({ context }, use) => {
        let [serviceWorker] = context.serviceWorkers();
        if (!serviceWorker) serviceWorker = await context.waitForEvent('serviceworker');

        const extensionId = serviceWorker.url().split('/')[2];
        await use(extensionId);
    },
    extensionPage: async ({ context, extensionId }, use) => {
        // Onboarding opens in home.html (fullscreen), not in popup.html
        const page = await context.newPage();
        await page.goto(`chrome-extension://${extensionId}/home.html`);
        await page.waitForLoadState('domcontentloaded');
        // Give time for React app to load
        await page.waitForTimeout(1000);
        await use(page);
    },
});

export const expect = test.expect;
