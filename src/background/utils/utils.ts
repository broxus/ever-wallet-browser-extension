import browser from 'webextension-polyfill'

/**
 * Try to keep service worker alive until a given promise resolves
 *
 * @see {@link https://developer.chrome.com/docs/extensions/develop/migrate/to-service-workers#keep_a_service_worker_alive_until_a_long-running_operation_is_finished}
 */
export async function waitUntil<T>(promise: Promise<T>): Promise<T> {
    const keepAlive = setInterval(browser.runtime.getPlatformInfo, 25 * 1000)
    try {
        return await promise
    }
    finally {
        clearInterval(keepAlive)
    }
}
