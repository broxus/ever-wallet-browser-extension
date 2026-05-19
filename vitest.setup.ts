import '@testing-library/jest-dom';
import { beforeAll, vi } from 'vitest';
import 'fake-indexeddb/auto';

// Mock browser APIs
beforeAll(() => {
    // Mock chrome/browser API
    const mockBrowser = {
        runtime: {
            id: 'test-extension-id',
            getURL: vi.fn((path: string) => `chrome-extension://test/${path}`),
            sendMessage: vi.fn(),
            onMessage: {
                addListener: vi.fn(),
                removeListener: vi.fn(),
            },
            connect: vi.fn(),
            onConnect: {
                addListener: vi.fn(),
                removeListener: vi.fn(),
            },
        },
        storage: {
            local: {
                get: vi.fn(() => Promise.resolve({})),
                set: vi.fn(() => Promise.resolve()),
                remove: vi.fn(() => Promise.resolve()),
                clear: vi.fn(() => Promise.resolve()),
            },
            sync: {
                get: vi.fn(() => Promise.resolve({})),
                set: vi.fn(() => Promise.resolve()),
                remove: vi.fn(() => Promise.resolve()),
                clear: vi.fn(() => Promise.resolve()),
            },
            onChanged: {
                addListener: vi.fn(),
                removeListener: vi.fn(),
            },
        },
        tabs: {
            query: vi.fn(() => Promise.resolve([])),
            sendMessage: vi.fn(() => Promise.resolve()),
            create: vi.fn(() => Promise.resolve({})),
            update: vi.fn(() => Promise.resolve({})),
            remove: vi.fn(() => Promise.resolve()),
        },
        windows: {
            create: vi.fn(() => Promise.resolve({})),
            update: vi.fn(() => Promise.resolve({})),
            remove: vi.fn(() => Promise.resolve()),
            getCurrent: vi.fn(() => Promise.resolve({})),
        },
        i18n: {
            getMessage: vi.fn((key: string) => key),
            getUILanguage: vi.fn(() => 'en'),
        },
    };

    // @ts-ignore
    global.chrome = mockBrowser;
    // @ts-ignore
    global.browser = mockBrowser;
});

// Mock nekoton-wasm
vi.mock('nekoton-wasm', () => ({
    default: {},
    // Add mock implementations as needed
}));

// Mock @broxus/ever-wallet-wasm
vi.mock('@broxus/ever-wallet-wasm', () => ({
    // Add mock implementations as needed
}));

// Suppress console errors in tests (optional)
const originalError = console.error;
beforeAll(() => {
    console.error = (...args: any[]) => {
        if (
            typeof args[0] === 'string' &&
            (args[0].includes('Not implemented: HTMLFormElement.prototype.submit') ||
                args[0].includes('Not implemented: navigation'))
        ) {
            return;
        }
        originalError.call(console, ...args);
    };
});
