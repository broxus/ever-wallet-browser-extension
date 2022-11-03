import { useMemo, useState } from 'react'
import * as React from 'react'

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
}

interface Config {
    className?: string;
    showClose?: boolean;
    closeOnBackdropClick?: boolean;
}

type Props = React.PropsWithChildren<{}>;

export interface DrawerContext {
    panel: Panel | undefined;
    config: Config | undefined;
    close: () => void;
    setPanel: React.Dispatch<React.SetStateAction<Panel | undefined>>;
    setConfig: React.Dispatch<React.SetStateAction<Config | undefined>>;
}

const Context = React.createContext<DrawerContext>({
    panel: undefined,
    config: undefined,
    close() {},
    setPanel() {},
    setConfig() {},
})

export function useDrawerPanel() {
    return React.useContext(Context)
}

export function DrawerPanelProvider({ children }: Props): JSX.Element {
    const [panel, setPanel] = useState<Panel>()
    const [config, setConfig] = useState<Config>()
    const value = useMemo<DrawerContext>(() => ({
        panel,
        config,
        setPanel,
        setConfig,
        close() {
            setPanel(undefined)
        },
    }), [panel, config])

    return (
        <Context.Provider value={value}>
            {children}
        </Context.Provider>
    )
}
