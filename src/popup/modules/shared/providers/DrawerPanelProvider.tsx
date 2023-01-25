import type { PropsWithChildren } from 'react'
import { injectable } from 'tsyringe'
import { makeAutoObservable } from 'mobx'

import { useChildContainer, useResolve } from '../hooks'
import { DIProvider } from './DIProvider'

export enum Panel {
    RECEIVE,
    SEND,
    DEPLOY,
    CREATE_ACCOUNT,
    ACCOUNTS_MANAGER,
    ASSET,
    TRANSACTION,
    STAKE_TUTORIAL,
    STAKE_WITHDRAW_INFO,
    CONNECTION_ERROR,
    NFT_COLLECTION,
    NFT_IMPORT,
    VERIFY_ADDRESS,
}

interface Config {
    className?: string;
    showClose?: boolean;
    closeOnBackdropClick?: boolean;
}

export function useDrawerPanel(): Drawer {
    return useResolve(Drawer)
}

export function DrawerPanelProvider({ children }: PropsWithChildren<{}>): JSX.Element {
    const container = useChildContainer((container) => {
        container.registerSingleton(Drawer)
    })

    return (
        <DIProvider value={container}>
            {children}
        </DIProvider>
    )
}

@injectable()
export class Drawer {

    panel: Panel | undefined

    config: Config | undefined

    constructor() {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public setPanel(panel: Panel | undefined): void {
        this.panel = panel
    }

    public setConfig(config: Config | undefined): void {
        this.config = config
    }

    public close(): void {
        this.panel = undefined
    }

}
