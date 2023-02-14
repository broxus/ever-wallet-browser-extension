import type nt from '@broxus/ever-wallet-wasm'
import Decimal from 'decimal.js'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import {
    convertCurrency,
    convertEvers,
    convertHash,
    extractTokenTransactionAddress,
    extractTokenTransactionValue,
    extractTransactionAddress,
    extractTransactionValue,
    trimTokenName,
} from '@app/shared'
import { Container, Content, CopyButton, Header } from '@app/popup/modules/shared'
import { ContactLink, useContacts } from '@app/popup/modules/contacts'
import CopyIcon from '@app/popup/assets/icons/copy.svg'

import './TransactionInfo.scss'

interface Props {
    symbol?: nt.Symbol;
    nativeCurrency: string;
    transaction: nt.TonWalletTransaction | nt.TokenWalletTransaction;
    onOpenInExplorer: (txHash: string) => void;
}

export const TransactionInfo = observer((props: Props): JSX.Element => {
    const { transaction, symbol, nativeCurrency, onOpenInExplorer } = props
    const intl = useIntl()
    const contacts = useContacts()

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
    const currencyName = !symbol ? nativeCurrency : symbol.name
    const amount = convertCurrency(value.toString(), decimals)

    if (symbol) {
        info = (transaction as nt.TokenWalletTransaction).info
    }

    return (
        <>
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
                            {`${convertEvers(fee.toString())} ${nativeCurrency}`}
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
                        <div className="transaction-info__param _row">
                            <p className="transaction-info__param-desc">{direction}</p>
                            <div className="transaction-info__param-value _address">
                                <ContactLink address={address} onAdd={contacts.add} onOpen={contacts.details} />
                            </div>
                        </div>
                    )}

                    <div className="transaction-info__param _row">
                        <p className="transaction-info__param-desc">
                            {intl.formatMessage({ id: 'TRANSACTION_TERM_HASH' })}
                        </p>
                        <div className="transaction-info__param-value _hash">
                            <button type="button" className="transaction-info__link-btn" onClick={() => onOpenInExplorer(txHash)}>
                                {convertHash(txHash)}
                            </button>
                            <CopyButton text={txHash}>
                                <button type="button" className="transaction-info__icon-btn">
                                    <CopyIcon />
                                </button>
                            </CopyButton>
                        </div>
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
                </Content>
            </Container>

            {contacts.panel}
        </>
    )
})
