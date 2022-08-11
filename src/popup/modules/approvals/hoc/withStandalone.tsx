import ObjectMultiplex from 'obj-multiplex'
import pump from 'pump'
import { FC, useEffect, useState } from 'react'
import { DependencyContainer } from 'tsyringe'
import browser from 'webextension-polyfill'

import { PortDuplexStream, SimplePort, STANDALONE_CONTROLLER } from '@app/shared'
import { IControllerRpcClient, makeControllerRpcClient } from '@app/popup/utils'
import {
    AppConfig, DIProvider, useDI, useResolve,
} from '@app/popup/modules/shared'
import { closeCurrentWindow, StandaloneController } from '@app/background'

import { setup } from '../di-container'

export function withStandalone<P extends {}>(Component: FC): {
    (props: P): JSX.Element | null;
    displayName: string;
} {
    function WithStandalone(props: P): JSX.Element | null {
        const [container, setContainer] = useState<DependencyContainer | null>(null)
        const parent = useDI()
        const config = useResolve(AppConfig)

        useEffect(() => {
            const client = setupOriginTabConnection(config.windowInfo.approvalTabId!)

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

function setupOriginTabConnection(tabId: number): IControllerRpcClient<StandaloneController> {
    const port = browser.tabs.connect(tabId)
    const connectionStream = new PortDuplexStream(
        new SimplePort(port),
    )
    const mux = new ObjectMultiplex()

    pump(connectionStream, mux, connectionStream, error => {
        if (error) {
            console.error(error)
        }

        closeCurrentWindow()
    })

    return makeControllerRpcClient<StandaloneController>(mux.createStream(STANDALONE_CONTROLLER))
}
