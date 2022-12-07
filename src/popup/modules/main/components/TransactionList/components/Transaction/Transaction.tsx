import type nt from '@wallet/nekoton-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import {
    convertAddress,
    convertEvers,
    isConfirmTransaction,
    NATIVE_CURRENCY,
    splitAddress,
    trimTokenName,
} from '@app/shared'
import { useViewModel } from '@app/popup/modules/shared'

import { Label, TransactionViewModel } from './TransactionViewModel'

interface Props {
    symbol?: nt.Symbol;
    transaction: nt.TonWalletTransaction | nt.TokenWalletTransaction;
    onViewTransaction: (transaction: nt.Transaction) => void;
}

export const Transaction = observer(({ symbol, transaction, onViewTransaction }: Props): JSX.Element | null => {
    if (isConfirmTransaction(transaction)) {
        return null
    }

    const vm = useViewModel(TransactionViewModel, model => {
        model.symbol = symbol
        model.transaction = transaction
    }, [symbol, transaction])
    const intl = useIntl()

    return (
        <div
            className="transactions-list-item _transaction"
            onClick={() => onViewTransaction(transaction)}
        >
            <div className="transactions-list-item__amount _arrow">
                <div
                    className={`transactions-list-item__description ${vm.value.lessThan(0) ? '_expense' : '_income'}`}
                    title={`${vm.amount} ${vm.currencyName}`}
                >
                    {vm.amount}
                    &nbsp;
                    {vm.currencyName.length >= 10 ? trimTokenName(vm.currencyName) : vm.currencyName}
                </div>
                <div className="transactions-list-item__description _fees">
                    {intl.formatMessage(
                        { id: 'TRANSACTIONS_LIST_ITEM_FEES_HINT' },
                        {
                            value: convertEvers(transaction.totalFees),
                            symbol: NATIVE_CURRENCY,
                        },
                    )}
                </div>
            </div>

            <div className="transactions-list-item__bottom">
                <span
                    className="transactions-list-item__description _address"
                    data-tooltip={
                        vm.recipient
                            ? splitAddress(vm.recipient.address)
                            : intl.formatMessage({
                                id: 'TRANSACTIONS_LIST_ITEM_RECIPIENT_UNKNOWN_HINT',
                            })
                    }
                >
                    {
                        vm.recipient
                            ? (vm.recipient.address && convertAddress(vm.recipient.address))
                            : intl.formatMessage({
                                id: 'TRANSACTIONS_LIST_ITEM_RECIPIENT_UNKNOWN_HINT',
                            })
                    }
                </span>
                <span className="transactions-list-item__description _date">
                    {vm.createdAtFormat}
                </span>
            </div>

            {vm.labelType === Label.UNCONFIRMED && (
                <>
                    <div className="transactions-list-item__labels">
                        <div className="transactions-list-item__label-waiting">
                            {intl.formatMessage({
                                id: 'TRANSACTIONS_LIST_ITEM_LABEL_WAITING_FOR_CONFIRMATION',
                            })}
                        </div>
                    </div>
                    {vm.unconfirmedTransaction && (
                        <div className="transactions-list-item__signatures">
                            <p className="transactions-list-item__signatures-item">
                                {intl.formatMessage(
                                    {
                                        id: 'TRANSACTIONS_LIST_ITEM_LABEL_SIGNATURES',
                                    },
                                    {
                                        received: vm.unconfirmedTransaction.signsReceived || '0',
                                        requested: vm.unconfirmedTransaction.signsRequired || '0',
                                    },
                                )}
                            </p>
                            <p className="transactions-list-item__signatures-item">
                                {intl.formatMessage(
                                    { id: 'TRANSACTIONS_LIST_ITEM_LABEL_EXPIRES_AT' },
                                    {
                                        date: vm.expireAtFormat,
                                    },
                                )}
                            </p>
                        </div>
                    )}
                </>
            )}

            {vm.labelType === Label.EXPIRED && (
                <div className="transactions-list-item__labels">
                    <div className="transactions-list-item__label-expired">
                        {intl.formatMessage({
                            id: 'TRANSACTIONS_LIST_ITEM_LABEL_EXPIRED',
                        })}
                    </div>
                </div>
            )}
        </div>
    )
})
