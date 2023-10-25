import type * as nt from '@broxus/ever-wallet-wasm'
import { useEffect, useMemo } from 'react'
import { Observer } from 'mobx-react-lite'
import { makeAutoObservable, runInAction } from 'mobx'

import { EnterPassword } from '../components/EnterPassword'
import { useSlidingPanel } from './useSlidingPanel'

interface Props {
    keyEntry: nt.KeyStoreEntry;
    loading?: boolean;
    error?: string;
    onSubmit(password: string): void;
}

export function useEnterPassword({ keyEntry, loading, error, onSubmit }: Props) {
    const panel = useSlidingPanel()
    const vm = useMemo(() => makeAutoObservable({ keyEntry, loading, error, onSubmit }), [])

    useEffect(() => {
        runInAction(() => {
            vm.keyEntry = keyEntry
            vm.loading = loading
            vm.error = error
            vm.onSubmit = onSubmit
        })
    }, [keyEntry, loading, error, onSubmit])

    return useMemo(() => ({
        show: () => {
            panel.open({
                render: () => (
                    <Observer>
                        {() => (
                            <EnterPassword
                                keyEntry={vm.keyEntry}
                                loading={vm.loading}
                                error={vm.error}
                                onSubmit={vm.onSubmit}
                            />
                        )}
                    </Observer>
                ),
            })
        },
        close: () => panel.close(),
    }), [])
}
