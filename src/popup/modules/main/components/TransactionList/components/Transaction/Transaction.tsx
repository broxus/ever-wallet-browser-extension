import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { convertAddress } from '@app/shared'
import { Amount, useViewModel } from '@app/popup/modules/shared'
import { TransactionItem } from '@app/popup/modules/main/components/TransactionList/components/Item'

import { Label, TransactionViewModel } from './TransactionViewModel'

interface Props {
    first?: boolean
    last?: boolean
    symbol?: nt.Symbol;
    transaction: nt.TonWalletTransaction | nt.TokenWalletTransaction;
    onViewTransaction(transaction: nt.Transaction): void;
}

export const Transaction = observer(({
    symbol, transaction, first, last, onViewTransaction,
}: Props): JSX.Element | null => {
    const vm = useViewModel(TransactionViewModel, model => {
        model.symbol = symbol
        model.transaction = transaction
    }, [symbol, transaction])
    const intl = useIntl()
    const isOut = vm.value.isLessThan(0)

    return (
        <TransactionItem
            onClick={() => onViewTransaction(transaction)}
            first={first}
            last={last}
            type={vm.labelType === Label.EXPIRED
                ? 'expired'
                : vm.labelType === Label.UNCONFIRMED
                    ? 'unconfirmed'
                    : isOut
                        ? 'out'
                        : 'in'}
            amount={(
                <Amount
                    precise
                    prefix={isOut ? '-' : ''}
                    value={vm.amount}
                />
            )}
            from={!vm.recipient
                ? intl.formatMessage({
                    id: 'TRANSACTIONS_LIST_ITEM_RECIPIENT_UNKNOWN_HINT',
                })
                : isOut
                    ? intl.formatMessage({
                        id: 'TO_ADDRESS',
                    }, {
                        address: vm.recipient.address ? convertAddress(vm.recipient.address) : '',
                    })
                    : intl.formatMessage({
                        id: 'FROM_ADDRESS',
                    }, {
                        address: vm.recipient.address ? convertAddress(vm.recipient.address) : '',
                    })}
            status={vm.labelType === Label.EXPIRED ? (
                intl.formatMessage({
                    id: 'TRANSACTIONS_LIST_ITEM_LABEL_EXPIRED',
                })
            ) : vm.labelType === Label.UNCONFIRMED && vm.unconfirmedTransaction ? (
                intl.formatMessage({
                    id: 'CONFIRMED_VAL',
                }, {
                    received: vm.unconfirmedTransaction.signsReceived || '0',
                    requested: vm.unconfirmedTransaction.signsRequired || '0',
                })
            ) : null}
            time={vm.labelType === Label.UNCONFIRMED ? (
                intl.formatMessage(
                    { id: 'TRANSACTIONS_LIST_ITEM_LABEL_EXPIRES_AT' },
                    { date: vm.expireAtFormat },
                )
            ) : vm.createdAtFormat}
        />
    )
})
