import init, * as nekoton from 'nekoton-wasm'
import ObjectMultiplex from 'obj-multiplex'
import LocalMessageDuplexStream from 'post-message-stream'
import pump from 'pump'
import { Transform } from 'readable-stream'
import browser from 'webextension-polyfill'

import {
    CONTENT_SCRIPT,
    DomainMetadata,
    INPAGE_SCRIPT,
    JsonRpcClient,
    NEKOTON_PROVIDER,
    PortDuplexStream,
    ReconnectablePort,
    SimplePort,
    STANDALONE_PROVIDER,
} from '@app/shared'
import { StandaloneController } from '@app/background'

const logStreamDisconnectWarning = (remoteLabel: string, error?: Error) => {
    console.debug(`Nekoton: Content script lost connection to "${remoteLabel}"`, error)
}

const checkDoctype = () => {
    const { doctype } = window.document
    if (doctype) {
        return doctype.name === 'html'
    }
    return true
}

const checkSuffix = () => {
    const excludedTypes = [/\.xml$/u, /\.pdf$/u]
    const currentUrl = window.location.pathname
    for (const type of excludedTypes) {
        if (type.test(currentUrl)) {
            return false
        }
    }
    return true
}

const checkDocumentElement = () => {
    const documentElement = document.documentElement.nodeName
    if (documentElement) {
        return documentElement.toLowerCase() === 'html'
    }
    return true
}

function checkExcludedDomains() {
    const excludedDomains = [
        'dropbox.com',
        'atlassian.net',
        'atlassian.com',
        'broxus.github.io',
        'ozon.ru',
        'mail.ru',
    ]

    const currentUrl = window.location.href

    let currentRegex: RegExp | undefined
    for (let i = 0; i < excludedDomains.length; i++) {
        const blockedDomain = excludedDomains[i].replace('.', '\\.')
        currentRegex = new RegExp(`(?:https?:\\/\\/)(?:(?!${blockedDomain}).)*$`, 'u')

        if (!currentRegex.test(currentUrl)) {
            return false
        }
    }

    return true
}

const shouldInjectProvider = () => checkDoctype() && checkSuffix() && checkDocumentElement() && checkExcludedDomains()

const injectScript = () => {
    try {
        const container = document.head || document.documentElement
        const scriptTag = document.createElement('script')
        scriptTag.src = browser.runtime.getURL('js/inpage.js')
        scriptTag.setAttribute('async', 'false')
        container.insertBefore(scriptTag, container.children[0])
        container.removeChild(scriptTag)
    }
    catch (e: any) {
        console.error('Nekoton: Provider injection failed', e)
    }
}

const forwardTrafficBetweenMutexes = (
    channelName: string,
    a: ObjectMultiplex,
    b: ObjectMultiplex,
) => {
    const channelA = a.createStream(channelName)
    const channelB = b.createStream(channelName)
    pump(channelA, channelB, channelA, e => {
        console.debug(`Nekoton: Muxed traffic for channel "${channelName}" failed`, e)
    })
}

const notifyInpageOfStreamFailure = () => {
    window.postMessage(
        {
            target: INPAGE_SCRIPT,
            data: {
                name: STANDALONE_PROVIDER,
                data: {
                    jsonrpc: '2.0',
                    method: 'NEKOTON_STREAM_FAILURE',
                },
            },
        },
        window.location.origin,
    )
}

const setupStreams = async () => {
    const pageStream = new LocalMessageDuplexStream({
        name: CONTENT_SCRIPT,
        target: INPAGE_SCRIPT,
    })
    const port = await openWorkerPort()
    const extensionStream = new PortDuplexStream(
        new ReconnectablePort(port, () => openWorkerPort()),
    )

    const pageMux = new ObjectMultiplex()
    pageMux.setMaxListeners(25)
    const extensionMux = new ObjectMultiplex()
    extensionMux.setMaxListeners(25)
    const standaloneMux = new ObjectMultiplex()
    standaloneMux.setMaxListeners(25)

    const transform = new Transform({
        objectMode: true,
        transform(chunk: any, _encoding: BufferEncoding, callback: (error?: (Error | null), data?: any) => void) {
            lazyInitialize()
                .then(() => callback(null, chunk))
                .catch(error => callback(error))
        },
    })

    pump(pageMux, pageStream, transform, pageMux, e => {
        logStreamDisconnectWarning('Nekoton inpage multiplex', e)
    })
    pump(extensionMux, extensionStream, extensionMux, e => {
        logStreamDisconnectWarning('Nekoton background multiplex', e)
        notifyInpageOfStreamFailure()
    })

    forwardTrafficBetweenMutexes(STANDALONE_PROVIDER, pageMux, standaloneMux)

    return { extensionMux, standaloneMux }
}

async function setupStandaloneController(extensionMux: ObjectMultiplex): Promise<StandaloneController> {
    await init(browser.runtime.getURL('assets/nekoton_wasm_bg.wasm'))

    const jrpcClient = new JsonRpcClient(
        extensionMux.createStream(NEKOTON_PROVIDER),
    )

    const controller = await StandaloneController.load({
        nekoton,
        jrpcClient,
        getDomainMetadata,
        origin: window.location.origin,
    })

    return controller
}

function openWorkerPort(): Promise<browser.Runtime.Port> {
    const port = browser.runtime.connect({ name: CONTENT_SCRIPT })

    return new Promise((resolve, reject) => {
        const onMessage = (message: any) => {
            if (message?.name === 'ready') {
                port.onMessage.removeListener(onMessage)
                port.onDisconnect.removeListener(onDisconnect)

                resolve(port)
            }
        }
        const onDisconnect = () => reject()

        port.onMessage.addListener(onMessage)
        port.onDisconnect.addListener(onDisconnect)
    })
}

async function getDomainMetadata(): Promise<DomainMetadata> {
    function getSiteName(): string {
        const siteName: HTMLMetaElement | null = window.document.querySelector(
            'head > meta[property="og:site_name"]',
        )
        if (siteName) {
            return siteName.content
        }

        const metaTitle: HTMLMetaElement | null = window.document.querySelector('head > meta[name="title"]')
        if (metaTitle) {
            return metaTitle.content
        }

        if (window.document.title && window.document.title.length > 0) {
            return window.document.title
        }

        return window.location.hostname
    }

    function imgExists(url: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                const img = window.document.createElement('img')
                img.onload = () => resolve(true)
                img.onerror = () => resolve(false)
                img.src = url
            }
            catch (e) {
                console.log(e)
                reject(e)
            }
        })
    }

    async function getSiteIcon(): Promise<string | undefined> {
        const icons = window.document.querySelectorAll<HTMLLinkElement>('head > link[rel~="icon"]')
        for (const icon of icons) {
            if (icon && (await imgExists(icon.href))) {
                return icon.href
            }
        }
        return undefined
    }

    return {
        name: getSiteName(),
        icon: await getSiteIcon(),
    }
}

async function initialize() {
    const { extensionMux, standaloneMux } = await setupStreamsPromise
    const controller = await setupStandaloneController(extensionMux)

    controller.setupUntrustedCommunication(standaloneMux)

    return controller
}

function lazyInitialize(): Promise<StandaloneController> {
    if (!ensureInitialized) {
        ensureInitialized = initialize()
    }

    return ensureInitialized
}

let setupStreamsPromise: Promise<{ extensionMux: ObjectMultiplex, standaloneMux: ObjectMultiplex }>,
    ensureInitialized: Promise<StandaloneController>

if (shouldInjectProvider()) {
    injectScript()
    setupStreamsPromise = setupStreams()

    browser.runtime.onConnect.addListener(port => {
        lazyInitialize().then(controller => {
            const portStream = new PortDuplexStream(
                new SimplePort(port),
            )

            controller.setupTrustedCommunication(portStream)
        }).catch(console.error)
    })
}
