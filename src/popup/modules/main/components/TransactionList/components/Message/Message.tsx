import type * as nt from '@broxus/ever-wallet-wasm'
import { memo, useMemo } from 'react'
import { useIntl } from 'react-intl'

import { StoredBriefMessageInfo } from '@app/models'
import { convertAddress, convertCurrency } from '@app/shared'
import { Amount } from '@app/popup/modules/shared'
import { TransactionItem } from '@app/popup/modules/main/components/TransactionList/components/Item'

const OPERATION_NAME: { [k in StoredBriefMessageInfo['type']]: string } = {
    transfer: 'Transfer',
    confirm: 'Confirmation',
    deploy: 'Deploy',
}

interface Props {
    everWalletAsset: nt.TonWalletAsset;
    message: StoredBriefMessageInfo;
    nativeCurrency: string;
    first?: boolean;
    last?: boolean;
}

export const Message = memo(({ everWalletAsset, message, nativeCurrency, first, last }: Props): JSX.Element => {
    const intl = useIntl()
    const amount = message.data?.amount
    const recipient = message.data?.recipient
    const time = useMemo(() => new Date(message.createdAt * 1000).toLocaleString('default', {
        hour: 'numeric',
        minute: 'numeric',
    }), [message.createdAt])

    return (
        <TransactionItem
            first={first}
            last={last}
            type="progress"
            amount={(
                <Amount precise value={convertCurrency(amount, 9)} currency={nativeCurrency} />
            )}
            from={convertAddress(recipient || everWalletAsset.address)}
            time={time}
            status={intl.formatMessage(
                { id: 'TRANSACTIONS_LIST_ITEM_LABEL_PROGRESS' },
                { name: OPERATION_NAME[message.type] },
            )}
        />
    )
})
