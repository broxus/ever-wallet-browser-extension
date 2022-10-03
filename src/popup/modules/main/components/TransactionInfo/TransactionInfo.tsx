import type nt from '@wallet/nekoton-wasm'
import Decimal from 'decimal.js'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import {
    convertCurrency,
    convertEvers,
    extractTokenTransactionAddress,
    extractTokenTransactionValue,
    extractTransactionAddress,
    extractTransactionValue,
    NATIVE_CURRENCY,
    trimTokenName,
} from '@app/shared'
import { Button, CopyText } from '@app/popup/modules/shared'

import './TransactionInfo.scss'

interface Props {
    symbol?: nt.Symbol;
    transaction: nt.TonWalletTransaction | nt.TokenWalletTransaction;
    onOpenInExplorer: (txHash: string) => void;
}

export const TransactionInfo = observer(({ transaction, symbol, onOpenInExplorer }: Props): JSX.Element => {
    const intl = useIntl()

    const value = !symbol
        ? extractTransactionValue(transaction)
        : extractTokenTransactionValue(transaction as nt.TokenWalletTransaction) || new Decimal(0)

    let direction: string | undefined,
        address: string | undefined

    if (!symbol) {
        const txAddress = extractTransactionAddress(transaction)
        direction = intl.formatMessage({
            id: `TRANSACTION_TERM_${txAddress.direction}`.toUpperCase(),
        })
        address = txAddress.address
    }
    else {
        const tokenTransaction = transaction as nt.TokenWalletTransaction

        const txAddress = extractTokenTransactionAddress(tokenTransaction)
        if (txAddress && tokenTransaction.info) {
            direction = intl.formatMessage({
                id: `TRANSACTION_TERM_${tokenTransaction.info.type}`.toUpperCase(),
            })
            address = txAddress?.address
        }
    }

    const decimals = !symbol ? 9 : symbol.decimals
    const fee = new Decimal(transaction.totalFees)
    const txHash = transaction.id.hash

    let info: nt.TokenWalletTransactionInfo | undefined
    const currencyName = !symbol ? NATIVE_CURRENCY : symbol.name

    if (symbol) {
        info = (transaction as nt.TokenWalletTransaction).info
    }

    return (
        <div className="transaction-info">
            <h2 className="transaction-info__title noselect">
                {intl.formatMessage({ id: 'TRANSACTION_PANEL_HEADER' })}
            </h2>
            <div className="transaction-info__tx-details">
                <div className="transaction-info__tx-details-param">
                    <p className="transaction-info__tx-details-param-desc">
                        {intl.formatMessage({ id: 'TRANSACTION_TERM_DATETIME' })}
                    </p>
                    <p className="transaction-info__tx-details-param-value">
                        {new Date(transaction.createdAt * 1000).toLocaleString()}
                    </p>
                </div>

                <div className="transaction-info__tx-details-param">
                    <p className="transaction-info__tx-details-param-desc">
                        {intl.formatMessage({ id: 'TRANSACTION_TERM_HASH' })}
                    </p>
                    <CopyText
                        className="transaction-info__tx-details-param-value copy"
                        id={`copy-${txHash}`}
                        text={txHash}
                    />
                </div>

                {address && (
                    <div className="transaction-info__tx-details-param">
                        <p className="transaction-info__tx-details-param-desc">{direction}</p>
                        <CopyText
                            className="transaction-info__tx-details-param-value copy"
                            id={`copy-${address}`}
                            text={address}
                        />
                    </div>
                )}

                {info && (
                    <div className="transaction-info__tx-details-param">
                        <p className="transaction-info__tx-details-param-desc">
                            {intl.formatMessage({ id: 'TRANSACTION_TERM_INFO' })}
                        </p>
                        <p className="transaction-info__tx-details-param-value">
                            {intl.formatMessage({
                                id: `TRANSACTION_TERM_TYPE_${info?.type}`.toUpperCase(),
                            })}
                        </p>
                    </div>
                )}

                <hr className="transaction-info__tx-details-separator" />

                <div className="transaction-info__tx-details-param">
                    <p className="transaction-info__tx-details-param-desc">
                        {intl.formatMessage({ id: 'TRANSACTION_TERM_AMOUNT' })}
                    </p>
                    <p className="transaction-info__tx-details-param-value">
                        {convertCurrency(value.toString(), decimals)}
                        {' '}
                        {currencyName.length >= 10 ? trimTokenName(currencyName) : currencyName}
                    </p>
                </div>

                <div className="transaction-info__tx-details-param">
                    <p className="transaction-info__tx-details-param-desc">
                        {intl.formatMessage({ id: 'TRANSACTION_TERM_BLOCKCHAIN_FEE' })}
                    </p>
                    <p className="transaction-info__tx-details-param-value">
                        {`${convertEvers(fee.toString())} ${NATIVE_CURRENCY}`}
                    </p>
                </div>
            </div>

            <Button design="secondary" onClick={() => onOpenInExplorer(txHash)}>
                {intl.formatMessage({ id: 'OPEN_IN_EXPLORER_BTN_TEXT' })}
            </Button>
        </div>
    )
})
