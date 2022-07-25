import type nt from '@wallet/nekoton-wasm'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useIntl } from 'react-intl'

import { NATIVE_CURRENCY, SelectedAsset, TokenWalletState } from '@app/shared'
import { Button } from '@app/popup/modules/shared'

import { AssetListItem } from '../AssetListItem'

import './AssetList.scss'

interface Props {
    tonWalletAsset: nt.TonWalletAsset;
    tokenWalletAssets: nt.TokenWalletAsset[];
    tonWalletState: nt.ContractState | undefined;
    tokenWalletStates: { [rootTokenContract: string]: TokenWalletState };
    knownTokens: { [rootTokenContract: string]: nt.Symbol };
    onViewAsset: (asset: SelectedAsset) => void;
    onSelectAssets: () => void;
}

export const AssetList = observer((props: Props): JSX.Element => {
    const {
        tonWalletAsset,
        tokenWalletAssets,
        tonWalletState,
        tokenWalletStates,
        knownTokens,
        onViewAsset,
        onSelectAssets,
    } = props

    const intl = useIntl()

    const handleClick = () => {
        onViewAsset({
            type: 'ton_wallet',
            data: {
                address: tonWalletAsset.address,
            },
        })
    }

    return (
        <div className="assets-list" role="menu">
            <AssetListItem
                type="ton_wallet"
                address={tonWalletAsset.address}
                balance={tonWalletState?.balance}
                name={NATIVE_CURRENCY}
                decimals={9}
                onClick={handleClick}
            />
            {tokenWalletAssets.map(({ rootTokenContract }) => {
                const symbol = knownTokens[rootTokenContract]
                const balance = tokenWalletStates[rootTokenContract]?.balance
                const handleClick = () => {
                    onViewAsset({
                        type: 'token_wallet',
                        data: {
                            owner: tonWalletAsset.address,
                            rootTokenContract,
                        },
                    })
                }

                return (
                    <AssetListItem
                        type="token_wallet"
                        key={rootTokenContract}
                        address={rootTokenContract}
                        balance={balance}
                        name={symbol?.name}
                        decimals={symbol?.decimals}
                        old={symbol?.version !== 'Tip3'}
                        onClick={handleClick}
                    />
                )
            })}

            <Button design="secondary" className="assets-list__btn" onClick={onSelectAssets}>
                {intl.formatMessage({ id: 'SELECT_ASSETS_BTN_TEXT' })}
            </Button>
        </div>
    )
})
