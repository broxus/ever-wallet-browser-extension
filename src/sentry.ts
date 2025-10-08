import { init, setTag, browserTracingIntegration } from '@sentry/react'

function getExtensionVersion(): string | undefined {
    try {
        return chrome.runtime.getManifest().version
    }
    catch {
        return 'latest'
    }
}


export function initSentry(context: 'popup' | 'content' | 'inpage' | 'worker') {
    const ver = getExtensionVersion()
    init({
        dsn: 'https://8e5a00efb3f56e26ddcc78307724a945@sentry.broxus.com/10',
        release: `sparx-extension@${ver}`,
        environment: process.env.NODE_ENV,

        integrations: [
            browserTracingIntegration(),
        ],

        tracesSampleRate: 0.1,
    })

    setTag('context', context)
}
