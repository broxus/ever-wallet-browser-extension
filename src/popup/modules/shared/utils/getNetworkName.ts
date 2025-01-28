import { NETWORK_ID } from '@app/shared'

export const getClassNameByNetwork = (connectionId: number) => {
    if (connectionId === NETWORK_ID.VENOM) return 'venom'
    if (connectionId === NETWORK_ID.EVERSCALE) return 'everscale'
    if (connectionId === NETWORK_ID.TYCHO_TESTNET) return 'tycho'
    if (connectionId === NETWORK_ID.TON) return 'ton'

    return 'custom'
}
