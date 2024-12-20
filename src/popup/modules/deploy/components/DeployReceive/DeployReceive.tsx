import type * as nt from '@broxus/ever-wallet-wasm'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Receive } from '@app/popup/modules/main/components/Receive'

interface Props {
    account: nt.AssetsList;
    totalAmount: string;
    currencyName: string;
}

export const DeployReceive = observer(({ account, currencyName }: Props): JSX.Element => {
    const intl = useIntl()

    return (
        <Receive
            symbol={currencyName}
            address={account.tonWallet.address}
            hint={intl.formatMessage({ id: 'DEPLOY_WALLET_NEED_BALANCE' }, { symbol: currencyName })}
        />
    )
})
