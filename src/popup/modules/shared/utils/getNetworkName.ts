import { NETWORK } from '@app/shared'

export const getClassNameByNetwork = (connectionId: number) => {
    if (connectionId === NETWORK.VENOM) return 'venom'
    if (connectionId === NETWORK.EVERSCALE_RPC) return 'everscale'
    if (connectionId === NETWORK.TYCHO_TESTNET) return 'tycho'

    return 'custom'
}
