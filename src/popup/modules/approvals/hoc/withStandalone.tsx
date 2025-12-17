import ObjectMultiplex from 'obj-multiplex'
import pump from 'pump'
import { type FC, useEffect, useState } from 'react'
import { type DependencyContainer } from 'tsyringe'
import browser from 'webextension-polyfill'

import { closeCurrentWindow, PortDuplexStream, STANDALONE_CONTROLLER } from '@app/shared'
import { type IControllerRpcClient, makeControllerRpcClient } from '@app/popup/utils'
import { AppConfig, DIProvider, useDI, useResolve } from '@app/popup/modules/shared'
import type { StandaloneController } from '@app/background'

import { setup } from '../di-container'

export function withStandalone<P extends {}>(Component: FC): FC<P> {
    function WithStandalone(props: P) {
        const [container, setContainer] = useState<DependencyContainer | null>(null)
        const parent = useDI()
        const { windowInfo } = useResolve(AppConfig)

        useEffect(() => {
            const client = setupOriginTabConnection(windowInfo.approvalTabId!, windowInfo.approvalFrameId)

            client.getState()
                .then(state => setup(parent, client, state))
                .then(container => setContainer(container))
                .catch(console.error)
        }, [])

        if (!container) return null

        return (
            <DIProvider value={container}>
                <Component {...props} />
            </DIProvider>
        )
    }

    WithStandalone.displayName = `WithStandalone(${Component.displayName ?? Component.name})`

    return WithStandalone
}

function setupOriginTabConnection(tabId: number, frameId?: number): IControllerRpcClient<StandaloneController> {
    const port = browser.tabs.connect(tabId, { frameId })
    const connectionStream = new PortDuplexStream(port)
    const mux = new ObjectMultiplex()

    pump(connectionStream, mux, connectionStream, error => {
        if (error) {
            console.error(error)
        }

        closeCurrentWindow()
    })

    return makeControllerRpcClient<StandaloneController>(mux.createStream(STANDALONE_CONTROLLER))
}
