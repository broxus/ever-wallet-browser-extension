import * as nt from '@broxus/ever-wallet-wasm'
import { useEffect, useMemo } from 'react'
import { Observer } from 'mobx-react-lite'
import { makeAutoObservable, runInAction } from 'mobx'

import { EnterPassword } from '../components/EnterPassword'
import { useSlidingPanel } from './useSlidingPanel'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    disabled?: boolean;
    error?: string;
    onSubmit(password: string, cache: boolean): void;
}

export function useEnterPassword({ keyEntry, disabled, error, onSubmit }: Props) {
    const panel = useSlidingPanel()
    const vm = useMemo(() => makeAutoObservable({ keyEntry, disabled, error, onSubmit }), [])

    useEffect(() => {
        runInAction(() => {
            vm.keyEntry = keyEntry
            vm.disabled = disabled
            vm.error = error
            vm.onSubmit = onSubmit
        })
    }, [keyEntry, disabled, error, onSubmit])

    return useMemo(() => ({
        show: () => {
            panel.open({
                render: () => (
                    <Observer>
                        {() => (
                            <EnterPassword
                                keyEntry={vm.keyEntry}
                                disabled={vm.disabled}
                                error={vm.error}
                                onSubmit={vm.onSubmit}
                                onBack={panel.close}
                            />
                        )}
                    </Observer>
                ),
            })
        },
        close: () => panel.close(),
    }), [])
}
