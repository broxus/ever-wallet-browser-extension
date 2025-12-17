import { useMemo } from 'react'

import { isTokenSymbol } from '@app/shared'
import { type TokenWalletsToUpdate } from '@app/models'

import { type ManageAssetsViewModel } from '../ManageAssetsViewModel'

type Token = {
    name: string;
    fullName: string;
    rootTokenContract: string;
    old: boolean;
}

export const useGetTokens = (vm:ManageAssetsViewModel) => {
    const baseTokens = Object.values(vm.tokens ?? {}).reduce((acc, token) => {
        if (!token) return acc
        acc.push({
            name: token.symbol,
            fullName: token.name,
            rootTokenContract: token.address,
            old: !!token.version && token.version < 5 && !vm.tokensManifest?.name?.startsWith('TON'),
        })

        return acc
    }, [] as Token[])

    const getToken = (rootTokenContract: string) => {
        const known = vm.knownTokens[rootTokenContract]
        if (known) {
            return {
                name: known.name,
                fullName: known.fullName,
                rootTokenContract: known.rootTokenContract,
                old: isTokenSymbol(known) && known.version === 'OldTip3v4',
            }
        }
        return null
    }

    const savedTokens = vm.storageTokenWalletAssets.reduce((acc, { rootTokenContract }) => {
        if (!vm.tokens?.[rootTokenContract]) {
            const token = getToken(rootTokenContract)
            if (token) {
                acc.push(token)
            }
        }
        return acc
    }, [] as Token[])

    const { tokens, existingTokens } = useMemo(() => vm.tokenWalletAssets.reduce(
        (acc, wallet) => {
            acc.existingTokens[wallet.rootTokenContract] = true

            if (!vm.tokens?.[wallet.rootTokenContract]) {
                const token = getToken(wallet.rootTokenContract)
                if (token) {
                    acc.tokens.push(token)
                }
            }
            return acc
        },
        { tokens: [...baseTokens, ...savedTokens] as Token[], existingTokens: {} as TokenWalletsToUpdate },
    ), [vm.tokenWalletAssets, vm.storageTokenWalletAssets, vm.tokens])

    return { tokens, existingTokens }
}
