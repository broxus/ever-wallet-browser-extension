import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { convertAddress } from '@app/shared'
import { Amount, Icon, useViewModel } from '@app/popup/modules/shared'

import { Label, TransactionViewModel } from './TransactionViewModel'
import styles from './Transaction.module.scss'

interface Props {
    symbol?: nt.Symbol;
    transaction: nt.TonWalletTransaction | nt.TokenWalletTransaction;
    onViewTransaction(transaction: nt.Transaction): void;
}

export const Transaction = observer(({ symbol, transaction, onViewTransaction }: Props): JSX.Element | null => {
    const vm = useViewModel(TransactionViewModel, model => {
        model.symbol = symbol
        model.transaction = transaction
    }, [symbol, transaction])
    const intl = useIntl()
    const isOut = vm.value.isLessThan(0)

    return (
        <div className={styles.transaction} onClick={() => onViewTransaction(transaction)}>
            <div className={styles.data}>
                <div className={classNames(styles.row, styles.main)}>
                    <div className={styles.section}>
                        {isOut ? (
                            <>
                                <Icon icon="arrowUp" className={styles.icon} />
                                <span>
                                    {intl.formatMessage({
                                        id: 'COMMON_SENT',
                                    })}
                                </span>
                            </>
                        ) : (
                            <>
                                <Icon icon="arrowDown" className={classNames(styles.icon, styles.in)} />
                                <span>
                                    {intl.formatMessage({
                                        id: 'COMMON_RECEIVED',
                                    })}
                                </span>
                            </>
                        )}
                    </div>

                    <div className={styles.section}>
                        <div className={styles.amount}>
                            <Amount
                                precise
                                className={isOut ? styles.expense : styles.income}
                                value={vm.amount}
                                currency={vm.currencyName}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.row}>
                    <div className={styles.section}>
                        {vm.recipient
                            ? (vm.recipient.address && convertAddress(vm.recipient.address))
                            : intl.formatMessage({
                                id: 'TRANSACTIONS_LIST_ITEM_RECIPIENT_UNKNOWN_HINT',
                            })}
                    </div>

                    <div className={styles.section}>
                        {vm.labelType === Label.UNCONFIRMED && (
                            <div className={styles.item}>
                                {intl.formatMessage({ id: 'TRANSACTIONS_LIST_ITEM_LABEL_WAITING_FOR_CONFIRMATION' })}
                            </div>
                        )}

                        {vm.labelType === Label.EXPIRED && (
                            <div className={styles.item}>
                                {intl.formatMessage({ id: 'TRANSACTIONS_LIST_ITEM_LABEL_EXPIRED' })}
                            </div>
                        )}

                        {/* Could be returned */}
                        {/* <div className={styles.item}>
                            {intl.formatMessage(
                                { id: 'TRANSACTIONS_LIST_ITEM_FEES_HINT' },
                                {
                                    value: convertEvers(transaction.totalFees),
                                    symbol: vm.nativeCurrency,
                                },
                            )}
                        </div> */}

                        <div className={styles.item}>
                            {vm.createdAtFormat}
                        </div>
                    </div>
                </div>

                {vm.labelType === Label.UNCONFIRMED && vm.unconfirmedTransaction && (
                    <div className={styles.row}>
                        <div className={styles.section}>
                            {intl.formatMessage(
                                { id: 'TRANSACTIONS_LIST_ITEM_LABEL_SIGNATURES' },
                                {
                                    received: vm.unconfirmedTransaction.signsReceived || '0',
                                    requested: vm.unconfirmedTransaction.signsRequired || '0',
                                },
                            )}
                        </div>

                        <div className={styles.section}>
                            {intl.formatMessage(
                                { id: 'TRANSACTIONS_LIST_ITEM_LABEL_EXPIRES_AT' },
                                { date: vm.expireAtFormat },
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
})
