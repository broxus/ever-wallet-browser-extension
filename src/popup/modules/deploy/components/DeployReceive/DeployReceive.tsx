import type * as nt from '@broxus/ever-wallet-wasm'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Receive } from '@app/popup/modules/main/components/Receive'
import { convertEvers } from '@app/shared'
import { ConnectionStore, useResolve } from '@app/popup/modules/shared'

interface Props {
    account: nt.AssetsList;
    totalAmount: string;
    currencyName: string;
}

export const DeployReceive = observer(({ account, currencyName, totalAmount }: Props): JSX.Element => {
    const intl = useIntl()
    const connection = useResolve(ConnectionStore)

    return (
        <Receive
            symbol={currencyName}
            address={account.tonWallet.address}
            hint={(
                intl.formatMessage({
                    id: 'DEPLOY_WALLET_INSUFFICIENT_BALANCE_HINT',
                }, {
                    symbol: currencyName,
                    value: convertEvers(connection.decimals, totalAmount),
                })
            )}
        />
    )
})
