import React from 'react'

import * as nt from '@nekoton'
import { useAccountability } from '@app/popup/modules/shared/providers/AccountabilityProvider'
import { useRpc } from '@app/popup/modules/shared/providers/RpcProvider'
import { closeCurrentWindow, useRpcState } from '@app/popup/modules/shared/providers/RpcStateProvider'
import { WalletMessageToSend } from '@shared/backgroundApi'
import { useSelectableKeys } from '@app/popup/modules/shared/hooks/useSelectableKeys'
import { SelectedAsset } from '@shared/utils'
import Loader from '@app/popup/components/Loader'
import { Send } from '@app/popup/components/Send'

export function SendPage(): JSX.Element | null {
    const accountability = useAccountability()
    const rpc = useRpc()
    const rpcState = useRpcState()

    const selectedAccount = React.useMemo(() => accountability.selectedAccount, [])
    const [initialSelectedAsset, setSelectedAsset] = React.useState<SelectedAsset | undefined>()

    if (selectedAccount == null) {
        return null
    }

    const { knownTokens, selectedConnection } = rpcState.state
    const accountName = selectedAccount?.name as string
    const accountAddress = selectedAccount?.tonWallet.address as string
    const { keys } = useSelectableKeys(selectedAccount)

    // if (selectableKeys[0] == null) {
    // 	return null
    // }

    const tonWalletAsset = selectedAccount.tonWallet
    const tonWalletState = rpcState.state.accountContractStates[accountAddress] as
        | nt.ContractState
        | undefined

    if (tonWalletState == null) {
        return null
    }

    const tokenWalletAssets =
        selectedAccount.additionalAssets[selectedConnection.group]?.tokenWallets || []
    const tokenWalletStates = rpcState.state.accountTokenStates[accountAddress] || {}

    const defaultAsset = {
        type: 'ton_wallet',
        data: { address: tonWalletAsset.address },
    } as SelectedAsset

    React.useEffect(() => {
        rpc.tempStorageRemove('selected_asset')
            .then((value: SelectedAsset) => {
                setSelectedAsset(value || defaultAsset)
            })
            .catch((_) => {
                setSelectedAsset(defaultAsset)
            })
    }, [])

    if (initialSelectedAsset == null) {
        return <Loader />
    }

    const sendMessage = async (message: WalletMessageToSend) => {
        return rpc.sendMessage(accountAddress as string, message)
    }

    return (
        <div className="send-page">
            <Send
                accountName={accountName}
                tonWalletAsset={tonWalletAsset}
                tokenWalletAssets={tokenWalletAssets}
                defaultAsset={initialSelectedAsset}
                keyEntries={keys}
                tonWalletState={tonWalletState}
                tokenWalletStates={tokenWalletStates}
                knownTokens={knownTokens}
                estimateFees={async (params) => await rpc.estimateFees(accountAddress, params, {})}
                prepareMessage={async (params, password) =>
                    rpc.prepareTransferMessage(accountAddress, params, password)
                }
                prepareTokenMessage={async (owner, rootTokenContract, params) =>
                    rpc.prepareTokenMessage(owner, rootTokenContract, params)
                }
                sendMessage={sendMessage}
                onBack={() => {
                    closeCurrentWindow()
                }}
            />
        </div>
    )
}
