import type * as nt from '@broxus/ever-wallet-wasm'
import BigNumber from 'bignumber.js'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import classNames from 'classnames'
import { useNavigate } from 'react-router'

import { Icons } from '@app/popup/icons'
import { convertCurrency, convertEvers, convertHash, extractTokenTransactionAddress, extractTokenTransactionValue, extractTransactionAddress, extractTransactionValue } from '@app/shared'
import { Amount, Chips, Container, Content, CopyButton, Header, Navbar, ParamsPanel, Token } from '@app/popup/modules/shared'
import { ContactLink, useContacts } from '@app/popup/modules/contacts'

import styles from './GenericTransactionInfo.module.scss'

interface Props {
    symbol?: nt.Symbol;
    token?: Token;
    nativeCurrency: string;
    transaction: nt.TonWalletTransaction | nt.TokenWalletTransaction;
    onOpenInExplorer: (txHash: string) => void;
}

export const GenericTransactionInfo = observer((props: Props): JSX.Element => {
    const { transaction, symbol, token, nativeCurrency, onOpenInExplorer } = props
    const intl = useIntl()
    const navigate = useNavigate()
    const contacts = useContacts()

    const value = !symbol
        ? extractTransactionValue(transaction)
        : extractTokenTransactionValue(transaction as nt.TokenWalletTransaction) ?? new BigNumber(0)

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
    const fee = new BigNumber(transaction.totalFees)
    const txHash = transaction.id.hash

    let info: nt.TokenWalletTransactionInfo | undefined
    const currencyName = !symbol ? nativeCurrency : token?.symbol ?? symbol.name
    const amount = convertCurrency(value.toString(), decimals)

    if (symbol) {
        info = (transaction as nt.TokenWalletTransaction).info
    }

    const statusLabel = <Chips type="success">{intl.formatMessage({ id: 'TRANSACTION_TERM_VALUE_STATUS_COMPLETED' })}</Chips>

    return (
        <Container>
            <Header>
                <Navbar back={() => navigate(-1)} />
            </Header>
            <Content>
                <h2>
                    {intl.formatMessage({ id: 'TRANSACTION_PANEL_HEADER' })}
                </h2>

                <ParamsPanel className={styles.panel}>
                    <ParamsPanel.Param row label={statusLabel}>
                        <span className={styles.date}>
                            {new Date(transaction.createdAt * 1000).toLocaleString()}
                        </span>
                    </ParamsPanel.Param>
                    <ParamsPanel.Param label={intl.formatMessage({ id: 'TRANSACTION_TERM_TYPE' })}>
                        {intl.formatMessage({ id: 'TRANSACTION_TERM_TYPE_ORDINARY' })}
                    </ParamsPanel.Param>
                    <ParamsPanel.Param label={intl.formatMessage({ id: 'TRANSACTION_TERM_BLOCKCHAIN_FEE' })}>
                        <Amount value={convertEvers(fee.toString())} currency={nativeCurrency} />
                    </ParamsPanel.Param>
                    <ParamsPanel.Param label={intl.formatMessage({ id: 'TRANSACTION_TERM_AMOUNT' })}>
                        <Amount value={amount} currency={currencyName} />
                    </ParamsPanel.Param>
                    {address && (
                        <ParamsPanel.Param label={direction}>
                            <ContactLink address={address} onAdd={contacts.add} onOpen={contacts.details} />
                        </ParamsPanel.Param>
                    )}
                    <ParamsPanel.Param label={intl.formatMessage({ id: 'TRANSACTION_TERM_HASH' })}>
                        <div className={styles.copy}>
                            <button
                                type="button"
                                className={classNames(styles.copyValue, styles.copyLink)}
                                onClick={() => onOpenInExplorer(txHash)}
                            >
                                {convertHash(txHash)}
                            </button>
                            <CopyButton text={txHash}>
                                <button type="button" className={styles.copyBtn}>
                                    {Icons.copy}
                                </button>
                            </CopyButton>
                        </div>
                    </ParamsPanel.Param>
                    {info && (
                        <ParamsPanel.Param label={intl.formatMessage({ id: 'TRANSACTION_TERM_INFO' })}>
                            {intl.formatMessage({ id: `TRANSACTION_TERM_TYPE_${info?.type}`.toUpperCase() })}
                        </ParamsPanel.Param>
                    )}
                    {comment && (
                        <ParamsPanel.Param label={intl.formatMessage({ id: 'TRANSACTION_TERM_COMMENT' })}>
                            {comment}
                        </ParamsPanel.Param>
                    )}
                </ParamsPanel>
            </Content>
        </Container>
    )
})
