import { useEffect, useState } from 'react'

import { useResolve } from './useResolve'
import { RpcStore } from '../store'

const PASSWORD_CHECK_INTERVAL: number = 40000

// TODO: move to mobx
export const usePasswordCache = (publicKey: string | undefined) => {
    const { rpc } = useResolve(RpcStore)
    const [passwordCached, setPasswordCached] = useState<boolean>()

    useEffect(() => {
        let timeoutId: number | undefined

        if (publicKey) {
            setPasswordCached(undefined)
            const update = () => rpc.isPasswordCached(publicKey)
                .then(cached => {
                    setPasswordCached(cached)
                    timeoutId = self.setTimeout(update, PASSWORD_CHECK_INTERVAL)
                })
                .catch(console.error)

            update().catch(console.log)
        }

        return () => self.clearTimeout(timeoutId)
    }, [publicKey])

    return passwordCached
}
