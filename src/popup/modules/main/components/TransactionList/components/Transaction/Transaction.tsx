import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import InSrc from '@app/popup/assets/img/in@2x.png'
import OutSrc from '@app/popup/assets/img/out@2x.png'
import { Icons } from '@app/popup/icons'
import { convertAddress, convertEvers } from '@app/shared'
import { Amount, Chips, useViewModel } from '@app/popup/modules/shared'

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
                <Icons.ChevronRight className={styles.arrow} />
                <div className={styles.amount}>
                    <img className={styles.img} src={isOut ? OutSrc : InSrc} alt="" />
                    <Amount
                        className={isOut ? styles.expense : styles.income}
                        value={vm.amount}
                        currency={vm.currencyName}
                    />
                </div>
                <div className={styles.info}>
                    <div className={styles.item}>
                        {vm.recipient
                            ? (vm.recipient.address && convertAddress(vm.recipient.address))
                            : intl.formatMessage({
                                id: 'TRANSACTIONS_LIST_ITEM_RECIPIENT_UNKNOWN_HINT',
                            })}
                    </div>

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

                    <div className={styles.item}>{vm.createdAtFormat}</div>

                    {vm.labelType === Label.UNCONFIRMED && vm.unconfirmedTransaction && (
                        <>
                            <div className={styles.item}>
                                {intl.formatMessage(
                                    { id: 'TRANSACTIONS_LIST_ITEM_LABEL_SIGNATURES' },
                                    {
                                        received: vm.unconfirmedTransaction.signsReceived || '0',
                                        requested: vm.unconfirmedTransaction.signsRequired || '0',
                                    },
                                )}
                            </div>
                            <div className={styles.item}>
                                {intl.formatMessage(
                                    { id: 'TRANSACTIONS_LIST_ITEM_LABEL_EXPIRES_AT' },
                                    { date: vm.expireAtFormat },
                                )}
                            </div>
                        </>
                    )}
                </div>

                {vm.labelType === Label.UNCONFIRMED && (
                    <div className={styles.status}>
                        <Chips type="error">
                            {intl.formatMessage({ id: 'TRANSACTIONS_LIST_ITEM_LABEL_WAITING_FOR_CONFIRMATION' })}
                        </Chips>
                    </div>
                )}

                {vm.labelType === Label.EXPIRED && (
                    <div className={styles.status}>
                        <Chips type="default">
                            {intl.formatMessage({ id: 'TRANSACTIONS_LIST_ITEM_LABEL_EXPIRED' })}
                        </Chips>
                    </div>
                )}
            </div>
        </div>
    )
})
