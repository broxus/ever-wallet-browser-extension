import { init, setTag, browserTracingIntegration } from '@sentry/react'

const ver = chrome.runtime.getManifest().version

export function initSentry(context: 'popup' | 'content' | 'inpage' | 'worker') {
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
