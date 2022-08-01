import type nt from '@wallet/nekoton-wasm'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useIntl } from 'react-intl'

import {
    convertAddress,
    convertCurrency,
    convertEvers,
    isConfirmTransaction,
    NATIVE_CURRENCY,
    trimTokenName,
} from '@app/shared'
import { AssetIcon, useViewModel } from '@app/popup/modules/shared'

import { Label, TransactionViewModel } from './TransactionViewModel'

const splitAddress = (address: string | undefined) => {
    const half = address != null ? Math.ceil(address.length / 2) : 0
    return half > 0 ? `${address!.slice(0, half)}\n${address!.slice(-half)}` : ''
}

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

    const decimals = !symbol ? 9 : symbol.decimals
    const currencyName = !symbol ? NATIVE_CURRENCY : symbol.name

    return (
        <div
            className="transactions-list-item"
            onClick={() => onViewTransaction(transaction)}
        >
            <AssetIcon
                type={!symbol ? 'ever_wallet' : 'token_wallet'}
                address={symbol?.rootTokenContract || transaction.inMessage.dst!}
                old={symbol && symbol.version !== 'Tip3'}
                className="transactions-list-item__logo"
            />

            <div className="transactions-list-item__scope">
                <div className="transactions-list-item__amount">
                    <div
                        className={`transactions-list-item__description ${vm.value.lessThan(0) ? '_expense' : '_income'}`}
                    >
                        {convertCurrency(vm.value.toString(), decimals)}
                        {' '}
                        {currencyName.length >= 10 ? trimTokenName(currencyName) : currencyName}
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
        </div>
    )
})
