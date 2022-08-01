import type nt from '@wallet/nekoton-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { NATIVE_CURRENCY, SelectedAsset, TokenWalletState } from '@app/shared'
import { Button } from '@app/popup/modules/shared'

import { AssetListItem } from '../AssetListItem'

import './AssetList.scss'

interface Props {
    everWalletAsset: nt.TonWalletAsset;
    tokenWalletAssets: nt.TokenWalletAsset[];
    everWalletState: nt.ContractState | undefined;
    tokenWalletStates: { [rootTokenContract: string]: TokenWalletState };
    knownTokens: { [rootTokenContract: string]: nt.Symbol };
    onViewAsset: (asset: SelectedAsset) => void;
    onSelectAssets: () => void;
}

export const AssetList = observer((props: Props): JSX.Element => {
    const {
        everWalletAsset,
        tokenWalletAssets,
        everWalletState,
        tokenWalletStates,
        knownTokens,
        onViewAsset,
        onSelectAssets,
    } = props

    const intl = useIntl()

    const handleClick = () => {
        onViewAsset({
            type: 'ever_wallet',
            data: {
                address: everWalletAsset.address,
            },
        })
    }

    return (
        <div className="assets-list" role="menu">
            <AssetListItem
                type="ever_wallet"
                address={everWalletAsset.address}
                balance={everWalletState?.balance}
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
                            owner: everWalletAsset.address,
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
