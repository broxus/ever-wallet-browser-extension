import { init, setTag, browserTracingIntegration } from '@sentry/react'
import {
    BrowserClient,
    defaultStackParser,
    getDefaultIntegrations,
    makeFetchTransport,
    Scope,
} from '@sentry/browser'

import { INPAGE_ERROR, INPAGE_SCRIPT } from './shared'


export function initSentry(context: 'popup') {
    init({
        dsn: 'https://8e5a00efb3f56e26ddcc78307724a945@sentry.broxus.com/10',
        release: `sparx-extension@${process.env.EXT_VERSION}`,
        environment: process.env.NODE_ENV,

        integrations: [
            browserTracingIntegration(),
        ],

        tracesSampleRate: 0.1,
    })

    setTag('context', context)
}

export function initBrowserSentry(context: 'content' | 'worker') {
    const integrations = getDefaultIntegrations({}).filter(
        (defaultIntegration) => !['BrowserApiErrors', 'Breadcrumbs', 'GlobalHandlers'].includes(
            defaultIntegration.name,
        ),
    )
    const client = new BrowserClient({
        dsn: 'https://8e5a00efb3f56e26ddcc78307724a945@sentry.broxus.com/10',
        transport: makeFetchTransport,
        release: `sparx-extension@${process.env.EXT_VERSION}`,
        environment: process.env.NODE_ENV,
        stackParser: defaultStackParser,
        integrations,
        tracesSampleRate: 0.1,
    })
    const scope = new Scope()
    scope.setTag('context', context)
    scope.setClient(client)
    client.init()

    return client
}


export const initInpageErrorBridge = () => {
    function reportError(error: Error | string) {
        const err = typeof error === 'string' ? new Error(error) : error

        window.postMessage(
            {
                source: INPAGE_SCRIPT,
                type: INPAGE_ERROR,
                payload: {
                    message: err.message,
                    stack: err.stack,
                },
            },
            window.location.origin,
        )
    }

    window.addEventListener('error', (event) => {
        reportError(event.error || event.message)
    })

    window.addEventListener('unhandledrejection', (event) => {
        const reason = event.reason || {}
        reportError(reason)
    })

    return reportError
}
