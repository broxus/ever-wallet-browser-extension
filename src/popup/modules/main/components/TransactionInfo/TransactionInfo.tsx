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
import { Button, Container, Content, CopyText, Header } from '@app/popup/modules/shared'

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
        address: string | undefined,
        comment: string | undefined

    if (!symbol) {
        const everTransaction = transaction as nt.TonWalletTransaction
        const txAddress = extractTransactionAddress(transaction)
        direction = intl.formatMessage({
            id: `TRANSACTION_TERM_${txAddress.direction}`.toUpperCase(),
        })
        address = txAddress.address

        if (everTransaction.info?.type === 'comment') {
            comment = everTransaction.info?.data
        }
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
    const amount = convertCurrency(value.toString(), decimals)

    if (symbol) {
        info = (transaction as nt.TokenWalletTransaction).info
    }

    return (
        <Container className="transaction-info">
            <Header>
                <h2 className="noselect">
                    {new Date(transaction.createdAt * 1000).toLocaleString()}
                </h2>
            </Header>

            <Content className="transaction-info__content">
                <div className="transaction-info__param _row">
                    <p className="transaction-info__param-desc">
                        {intl.formatMessage({ id: 'TRANSACTION_TERM_STATUS' })}
                    </p>
                    <div className="transaction-info__param-value">
                        <span className="transaction-info__status">
                            {intl.formatMessage({ id: 'TRANSACTION_TERM_VALUE_STATUS_COMPLETED' })}
                        </span>
                    </div>
                </div>

                <div className="transaction-info__param _row">
                    <p className="transaction-info__param-desc">
                        {intl.formatMessage({ id: 'TRANSACTION_TERM_TYPE' })}
                    </p>
                    <div className="transaction-info__param-value">
                        {intl.formatMessage({ id: 'TRANSACTION_TERM_TYPE_ORDINARY' })}
                    </div>
                </div>

                <div className="transaction-info__param _row">
                    <p className="transaction-info__param-desc">
                        {intl.formatMessage({ id: 'TRANSACTION_TERM_BLOCKCHAIN_FEE' })}
                    </p>
                    <p className="transaction-info__param-value">
                        {`${convertEvers(fee.toString())} ${NATIVE_CURRENCY}`}
                    </p>
                </div>

                <div className="transaction-info__param _row">
                    <p className="transaction-info__param-desc">
                        {intl.formatMessage({ id: 'TRANSACTION_TERM_AMOUNT' })}
                    </p>
                    <p
                        className="transaction-info__param-value _amount"
                        title={`${amount} ${currencyName}`}
                    >
                        {amount}
                        &nbsp;
                        {currencyName.length >= 10 ? trimTokenName(currencyName) : currencyName}
                    </p>
                </div>

                {address && (
                    <div className="transaction-info__param">
                        <p className="transaction-info__param-desc">{direction}</p>
                        <CopyText
                            className="transaction-info__param-value _copy"
                            id={`copy-${address}`}
                            text={address}
                        />
                    </div>
                )}

                <div className="transaction-info__param">
                    <p className="transaction-info__param-desc">
                        {intl.formatMessage({ id: 'TRANSACTION_TERM_HASH' })}
                    </p>
                    <CopyText
                        className="transaction-info__param-value _copy"
                        id={`copy-${txHash}`}
                        text={txHash}
                    />
                </div>

                {info && (
                    <div className="transaction-info__param">
                        <p className="transaction-info__param-desc">
                            {intl.formatMessage({ id: 'TRANSACTION_TERM_INFO' })}
                        </p>
                        <p className="transaction-info__param-value">
                            {intl.formatMessage({
                                id: `TRANSACTION_TERM_TYPE_${info?.type}`.toUpperCase(),
                            })}
                        </p>
                    </div>
                )}

                {comment && (
                    <div className="transaction-info__param">
                        <p className="transaction-info__param-desc">
                            {intl.formatMessage({ id: 'TRANSACTION_TERM_COMMENT' })}
                        </p>
                        <p className="transaction-info__param-value">
                            {comment}
                        </p>
                    </div>
                )}

                <Button className="transaction-info__btn" design="secondary" onClick={() => onOpenInExplorer(txHash)}>
                    {intl.formatMessage({ id: 'OPEN_IN_EXPLORER_BTN_TEXT' })}
                </Button>
            </Content>
        </Container>
    )
})
