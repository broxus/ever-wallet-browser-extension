import React from 'react'

import { useResolve } from './useResolve'
import { RpcStore } from '../store'

const PASSWORD_CHECK_INTERVAL: number = 40000

// TODO: move to mobx
export const usePasswordCache = (publicKey: string) => {
    const { rpc } = useResolve(RpcStore)
    const [passwordCached, setPasswordCached] = React.useState<boolean>()

    React.useEffect(() => {
        const destructorState: { timer?: number } = {}

        setPasswordCached(undefined)
        const update = () => rpc.isPasswordCached(publicKey)
            .then(cached => {
                setPasswordCached(cached)
                destructorState.timer = self.setTimeout(update, PASSWORD_CHECK_INTERVAL)
            })
            .catch(console.error)

        update().catch(console.log)

        return () => {
            if (destructorState.timer != null) {
                self.clearTimeout(destructorState.timer)
            }
        }
    }, [publicKey])

    return passwordCached
}
