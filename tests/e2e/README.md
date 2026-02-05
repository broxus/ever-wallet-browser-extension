# E2E Tests

Playwright-based end-to-end tests for SparX Wallet browser extension.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the extension:
```bash
npm run build
```

3. Install Playwright browsers (if not already installed):
```bash
npx playwright install chromium
```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests with UI mode (recommended for development)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see the browser)
```bash
npm run test:e2e:headed
```

### Debug tests
```bash
npm run test:e2e:debug
```

### View test report
```bash
npm run test:e2e:report
```

### View Trace Viewer (interactive timeline)

After running tests, view the HTML report and click on the 📊 trace icon next to any test.

Or open traces directly:
```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```

**Trace Viewer features:**
- 🎬 Timeline of all actions with screenshots
- 📸 Before/after screenshots for each step
- 🌐 Network requests and responses
- 📝 Console logs and errors
- 💻 Source code and call stack
- 🎯 Click on any action to see its state

## Test Structure

```
tests/
  e2e/
    fixtures/
      extension.ts          # Extension loading fixture
    onboarding.spec.ts      # Onboarding flow tests
    dashboard.spec.ts       # Dashboard/MainPage tests with backup import
    sparx-wallet-backup.json # Test backup file for import
```

## Writing Tests

Tests use a custom fixture that automatically loads the extension with a clean profile:

```typescript
import { test, expect } from './fixtures/extension'

test('my test', async ({ extensionPage }) => {
  const page = extensionPage

  // Use data-testid for reliable element selection
  const button = page.getByTestId('create-wallet-button')
  await button.click()

  // Add screenshots for debugging
  await page.screenshot({ path: 'test-results/my-test.png', fullPage: true })
})
```

### Available Fixtures

- `context`: Browser context with the extension loaded (clean profile for each test)
- `extensionId`: The ID of the loaded extension
- `extensionPage`: Pre-configured page navigated to `home.html` (onboarding page)

### Best Practices

- **Use `data-testid` attributes** instead of text content or CSS selectors for more reliable tests
- **Add screenshots** at key points in your tests for debugging and documentation
- Each test gets a fresh browser profile, ensuring clean state
- Screenshots are automatically captured for all tests (successful and failed)

### Adding Test IDs to Components

When adding new test coverage, add `data-testid` attributes to your components:

```tsx
<Button data-testid="my-button" onClick={handleClick}>
  Click me
</Button>
```

## Notes

- Tests run in non-headless mode by default (extension testing requirement)
- Each test gets a fresh browser context
- Extension is loaded from the `dist` folder
- Make sure to build the extension before running tests
