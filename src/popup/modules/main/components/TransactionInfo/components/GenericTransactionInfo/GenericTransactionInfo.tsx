import type * as nt from '@broxus/ever-wallet-wasm'
import BigNumber from 'bignumber.js'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { convertCurrency, convertHash, extractTokenTransactionAddress, extractTokenTransactionValue, extractTransactionAddress, extractTransactionValue } from '@app/shared'
import { AmountWithFees, AssetIcon, Button, Chips, Container, Content, CopyButton, Footer, Icon, ParamsPanel, Token } from '@app/popup/modules/shared'
import { ContactLink, useContacts } from '@app/popup/modules/contacts'

import styles from './GenericTransactionInfo.module.scss'

interface Props {
    symbol?: nt.Symbol;
    token?: Token;
    nativeCurrency: string;
    transaction: nt.TonWalletTransaction | nt.TokenWalletTransaction;
    onOpenTransactionInExplorer(txHash: string): void;
    onOpenAccountInExplorer(address: string): void;
}

export const GenericTransactionInfo = observer((props: Props): JSX.Element => {
    const { transaction, symbol, token, nativeCurrency, onOpenTransactionInExplorer, onOpenAccountInExplorer } = props
    const intl = useIntl()
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
    const txHash = transaction.id.hash

    let info: nt.TokenWalletTransactionInfo | undefined
    const currencyName = !symbol ? nativeCurrency : token?.symbol ?? symbol.name
    const amount = convertCurrency(value.toString(), decimals)

    if (symbol) {
        info = (transaction as nt.TokenWalletTransaction).info
    }

    const statusLabel = (
        <Chips type="success">
            {intl.formatMessage({ id: 'TRANSACTION_TERM_VALUE_STATUS_COMPLETED' })}
        </Chips>
    )

    return (
        <Container>
            <Content>
                <ParamsPanel>
                    <ParamsPanel.Param row label={statusLabel}>
                        <span className={styles.date}>
                            {new Date(transaction.createdAt * 1000).toLocaleString()}
                        </span>
                    </ParamsPanel.Param>
                    <ParamsPanel.Param label={intl.formatMessage({ id: 'TRANSACTION_TERM_TYPE' })}>
                        {intl.formatMessage({ id: 'TRANSACTION_TERM_TYPE_ORDINARY' })}
                    </ParamsPanel.Param>
                    <ParamsPanel.Param bold label={intl.formatMessage({ id: 'TRANSACTION_TERM_AMOUNT' })}>
                        <AmountWithFees
                            icon={symbol
                                ? <AssetIcon type="token_wallet" address={symbol.rootTokenContract} />
                                : <AssetIcon type="ever_wallet" />}
                            value={amount}
                            currency={currencyName}
                            fees={transaction.totalFees}
                        />
                    </ParamsPanel.Param>
                    {address && (
                        <ParamsPanel.Param label={direction}>
                            <ContactLink
                                type="address"
                                address={address}
                                onAdd={contacts.add}
                                onOpen={() => onOpenAccountInExplorer(address!)}
                            />
                        </ParamsPanel.Param>
                    )}
                    <ParamsPanel.Param label={intl.formatMessage({ id: 'TRANSACTION_TERM_HASH' })}>
                        <CopyButton text={txHash}>
                            <button type="button" className={styles.copy}>
                                {convertHash(txHash)}
                                <Icon icon="copy" className={styles.icon} />
                            </button>
                        </CopyButton>
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

            <Footer>
                <Button design="primary" onClick={() => onOpenTransactionInExplorer(txHash)}>
                    {Icons.planet}
                    {intl.formatMessage({ id: 'OPEN_IN_EXPLORER_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
