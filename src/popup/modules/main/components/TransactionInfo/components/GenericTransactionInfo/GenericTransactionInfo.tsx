import type * as nt from '@broxus/ever-wallet-wasm'
import BigNumber from 'bignumber.js'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import {
    convertCurrency, convertEvers, convertHash, extractTokenTransactionAddress, extractTokenTransactionValue, extractTransactionAddress, extractTransactionValue } from '@app/shared'
import { Amount, AssetIcon, Button, Card, ConnectionStore, Content, CopyButton, Icon, Token, useResolve } from '@app/popup/modules/shared'
import { ContactLink, useContacts } from '@app/popup/modules/contacts'
import { TrxIcon } from '@app/popup/modules/shared/components/TrxIcon'
import { Data } from '@app/popup/modules/shared/components/Data'

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
    const connection = useResolve(ConnectionStore)

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

    return (
        <Content className={styles.content}>
            <Card bg="layer-1" className={styles.card}>
                <div className={styles.header}>
                    <TrxIcon color={value.gte(0) ? 'green' : undefined} className={styles.icon}>
                        <Icon icon={value.gte(0) ? 'arrowIn' : 'arrowOut'} />
                    </TrxIcon>

                    <div className={styles.info}>
                        <div className={styles.title}>
                            {value.gte(0)
                                ? intl.formatMessage({
                                    id: 'COMMON_RECEIVED',
                                })
                                : intl.formatMessage({
                                    id: 'COMMON_SENT',
                                })}
                        </div>
                        <div className={styles.date}>
                            {new Date(transaction.createdAt * 1000).toLocaleString()}
                        </div>
                    </div>
                </div>

                <hr />

                <Data
                    label={intl.formatMessage({ id: 'TRANSACTION_TERM_TYPE' })}
                    value={intl.formatMessage({ id: 'TRANSACTION_TERM_TYPE_ORDINARY' })}
                />

                <Data
                    label={intl.formatMessage({ id: 'TRANSACTION_TERM_AMOUNT' })}
                    value={(
                        <Amount
                            value={amount}
                            icon={symbol
                                ? <AssetIcon type="token_wallet" address={symbol.rootTokenContract} />
                                : <AssetIcon type="ever_wallet" />}
                            currency={currencyName}
                        />
                    )}
                />

                <Data
                    label={intl.formatMessage({ id: 'NETWORK_FEE' })}
                    value={(
                        <Amount
                            approx
                            value={convertEvers(transaction.totalFees)}
                            currency={connection.symbol}
                            icon={<AssetIcon type="ever_wallet" />}
                        />
                    )}
                />

                {address && (
                    <Data
                        label={direction}
                        value={(
                            <ContactLink
                                type="address"
                                address={address}
                                onAdd={contacts.add}
                                onOpen={() => onOpenAccountInExplorer(address!)}
                            />
                        )}
                    />
                )}

                <Data
                    label={intl.formatMessage({ id: 'TRANSACTION_TERM_HASH' })}
                    value={(
                        <CopyButton text={txHash}>
                            <button type="button" className={styles.copy}>
                                {convertHash(txHash)}
                                <Icon
                                    icon="copy" className={styles.icon} width={16}
                                    height={16}
                                />
                            </button>
                        </CopyButton>
                    )}
                />

                {info && (
                    <Data
                        label={intl.formatMessage({ id: 'TRANSACTION_TERM_INFO' })}
                        value={intl.formatMessage({ id: `TRANSACTION_TERM_TYPE_${info?.type}`.toUpperCase() })}
                    />
                )}

                {comment && (
                    <>
                        <hr />
                        <Data
                            dir="v"
                            label={intl.formatMessage({ id: 'TRANSACTION_TERM_COMMENT' })}
                            value={comment}
                        />
                    </>
                )}
            </Card>

            <Button design="neutral" width={230} onClick={() => onOpenTransactionInExplorer(txHash)}>
                <Icon icon="planet" />
                {intl.formatMessage({
                    id: 'OPEN_IN_EXPLORER_BTN_TEXT',
                })}
            </Button>
        </Content>
    )
})
