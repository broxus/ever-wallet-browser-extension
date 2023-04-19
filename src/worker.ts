import init, * as nekoton from '@broxus/ever-wallet-wasm'
import endOfStream from 'end-of-stream'
import ObjectMultiplex from 'obj-multiplex'
import pump from 'pump'
import { Duplex, Transform } from 'readable-stream'
import browser from 'webextension-polyfill'
import log from 'loglevel'

import { NekotonController, WindowManager } from '@app/background'
import { TriggerUiParams } from '@app/models'
import {
    ENVIRONMENT_TYPE_FULLSCREEN,
    ENVIRONMENT_TYPE_NOTIFICATION,
    ENVIRONMENT_TYPE_POPUP,
    PortDuplexStream,
} from '@app/shared'

let popupIsOpen: boolean = false,
    notificationIsOpen: boolean = false,
    uiIsTriggering: boolean = false
const openNekotonTabsIDs: { [id: number]: true } = {}
const phishingPageUrl = new URL(browser.runtime.getURL('phishing-warning.html'))

log.setLevel(process.env.NODE_ENV === 'production' ? 'warn' : 'debug')

async function initialize() {
    log.log('Setup controller')

    await init()

    const windowManager = await WindowManager.load()
    const controller = await NekotonController.load({
        windowManager,
        nekoton,
        openExternalWindow: triggerUi,
        getOpenNekotonTabIds: () => openNekotonTabsIDs,
    })

    const nekotonInternalProcessHash: { [type: string]: true } = {
        [ENVIRONMENT_TYPE_POPUP]: true,
        [ENVIRONMENT_TYPE_NOTIFICATION]: true,
        [ENVIRONMENT_TYPE_FULLSCREEN]: true,
    }

    async function connectRemote(port: browser.Runtime.Port, portStream: ObjectMultiplex) {
        const processName = port.name
        const isNekotonInternalProcess = nekotonInternalProcessHash[processName]
        const senderUrl = port.sender?.url ? new URL(port.sender.url) : null

        log.log('On remote connect', processName)

        if (isNekotonInternalProcess) {
            const proceedConnect = () => {
                if (processName === ENVIRONMENT_TYPE_POPUP) {
                    popupIsOpen = true
                    endOfStream(portStream, () => {
                        popupIsOpen = false
                    })
                }
                else if (processName === ENVIRONMENT_TYPE_NOTIFICATION) {
                    notificationIsOpen = true
                    endOfStream(portStream, () => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        notificationIsOpen = false
                    })
                }
                else if (processName === ENVIRONMENT_TYPE_FULLSCREEN) {
                    const tabId = port.sender?.tab?.id
                    if (tabId != null) {
                        openNekotonTabsIDs[tabId] = true
                    }
                    endOfStream(portStream, () => {
                        if (tabId != null) {
                            delete openNekotonTabsIDs[tabId]
                        }
                    })
                }
            }

            if (!port.sender) {
                proceedConnect()
            }
            else {
                controller.setupTrustedCommunication(portStream)
                proceedConnect()
            }
        }
        else if (
            senderUrl?.origin === phishingPageUrl.origin
            && senderUrl?.pathname === phishingPageUrl.pathname
        ) {
            controller.setupPhishingCommunication(portStream)
        }
        else {
            await connectExternal(port, portStream)
        }
    }

    async function connectExternal(port: browser.Runtime.Port, portStream: ObjectMultiplex) {
        log.trace('connectExternal')

        if (port.sender) {
            await controller.setupUntrustedCommunication(portStream, port.sender)
        }
    }

    async function triggerUi(params: TriggerUiParams) {
        let firstAttempt = true

        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (!uiIsTriggering && (params.force || !popupIsOpen)) {
                uiIsTriggering = true
                try {
                    return await windowManager.showPopup({
                        group: params.group,
                        width: params.width,
                        height: params.height,
                        owner: params.owner,
                    })
                }
                catch (e) {
                    if (firstAttempt) {
                        firstAttempt = false
                    }
                    else {
                        throw e
                    }
                }
                finally {
                    uiIsTriggering = false
                }
            }
            else {
                return undefined
            }
        }
    }

    return {
        connectRemote,
        connectExternal,
    }
}

function setupMultiplex<T extends Duplex>(connectionStream: T) {
    let initialized = false
    const mux = new ObjectMultiplex()
    const transform = new Transform({
        objectMode: true,
        transform(chunk: any, _encoding: BufferEncoding, callback: (error?: (Error | null), data?: any) => void) {
            if (!initialized) {
                ensureInitialized()
                    .then(() => {
                        initialized = true
                        callback(null, chunk)
                    })
                    .catch(error => callback(error))
            }
            else {
                callback(null, chunk)
            }
        },
    })

    pump(connectionStream, transform, mux, connectionStream, e => {
        if (e) {
            log.error(e)
        }
    })

    return mux
}

let instance: ReturnType<typeof initialize> | undefined
function ensureInitialized() {
    if (!instance) {
        instance = initialize()
    }
    return instance
}

browser.runtime.onInstalled.addListener(({ reason }) => {
    if (reason === 'install') {
        browser.tabs.create({
            url: 'home.html',
        })
    }
})

browser.runtime.onConnect.addListener(port => {
    const portStream = new PortDuplexStream(port)
    const mux = setupMultiplex(portStream)

    ensureInitialized().then(({ connectRemote }) => connectRemote(port, mux)).catch(log.error)
})

browser.runtime.onConnectExternal.addListener(port => {
    const portStream = new PortDuplexStream(port)
    const mux = setupMultiplex(portStream)

    ensureInitialized().then(({ connectExternal }) => connectExternal(port, mux)).catch(log.error)
})

browser.alarms.onAlarm.addListener(() => {
    ensureInitialized().catch(log.error)
})
