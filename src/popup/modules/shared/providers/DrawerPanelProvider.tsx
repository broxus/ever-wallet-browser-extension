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
}

type Props = React.PropsWithChildren<{}>;

export interface DrawerContext {
    currentPanel: Panel | undefined;
    setPanel: React.Dispatch<React.SetStateAction<Panel | undefined>>;
}

const Context = React.createContext<DrawerContext>({
    currentPanel: undefined,
    setPanel() {
    },
})

export function useDrawerPanel() {
    return React.useContext(Context)
}

export function DrawerPanelProvider({ children }: Props): JSX.Element {
    const [currentPanel, setPanel] = useState<Panel>()
    const value = useMemo(() => ({
        currentPanel,
        setPanel,
    }), [currentPanel])

    return (
        <Context.Provider value={value}>
            {children}
        </Context.Provider>
    )
}
