import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import React from 'react'

import type { SubmitTransaction, TokenWalletTransaction } from '@app/models'
import { Amount, AssetIcon, Button, Card, Chips, Content, CopyButton, Footer, Icon, useViewModel } from '@app/popup/modules/shared'
import { convertCurrency, convertHash, extractTransactionAddress } from '@app/shared'
import { ContactLink } from '@app/popup/modules/contacts'
import { EnterSendPassword } from '@app/popup/modules/send'
import { TrxIcon } from '@app/popup/modules/shared/components/TrxIcon'
import { Data } from '@app/popup/modules/shared/components/Data'

import { MultisigTransactionInfoViewModel, Step } from './MultisigTransactionInfoViewModel'
import styles from './MultisigTransactionInfo.module.scss'

interface Props {
    transaction: (nt.TonWalletTransaction | TokenWalletTransaction) & SubmitTransaction;
    onOpenTransactionInExplorer(txHash: string): void;
    onOpenAccountInExplorer(address: string): void;
}

export const MultisigTransactionInfo = observer((props: Props): JSX.Element => {
    const { transaction, onOpenTransactionInExplorer, onOpenAccountInExplorer } = props
    const vm = useViewModel(MultisigTransactionInfoViewModel, model => {
        model.transaction = transaction
    }, [transaction])
    const intl = useIntl()

    let direction: string | undefined,
        address: string | undefined

    if (!vm.knownPayload || (vm.knownPayload.type !== 'token_outgoing_transfer' && vm.knownPayload.type !== 'token_swap_back')) {
        const txAddress = extractTransactionAddress(transaction)
        direction = intl.formatMessage({ id: `TRANSACTION_TERM_${txAddress.direction}`.toUpperCase() })
        address = txAddress.address
    }
    else {
        direction = intl.formatMessage({ id: 'TRANSACTION_TERM_OUTGOING_TRANSFER' })
        if (vm.knownPayload.type === 'token_outgoing_transfer') {
            address = vm.knownPayload.data.to.address
        }
    }

    if (vm.step.value === Step.EnterPassword && vm.selectedKey) {
        return (
            <EnterSendPassword
                withHeader={false}
                account={vm.selectedAccount}
                loading={vm.loading}
                transactionId={vm.transactionId}
                keyEntries={vm.filteredSelectableKeys}
                keyEntry={vm.selectedKey}
                amount={vm.amount}
                recipient={address}
                fees={vm.fees}
                error={vm.error}
                context={vm.context}
                onChangeKeyEntry={vm.setSelectedKey}
                onSubmit={vm.onSubmit}
                onBack={vm.onBack}
            />
        )
    }

    return (
        <>
            <Content className={styles.content}>
                <Card bg="layer-1" className={styles.card}>
                    <div className={styles.header}>
                        {vm.unconfirmedTransaction && !vm.isExpired ? (
                            <TrxIcon color="yellow" className={styles.icon}>
                                <Icon icon="time" />
                            </TrxIcon>
                        ) : vm.txHash ? (
                            <TrxIcon className={styles.icon}>
                                <Icon icon="arrowOut" />
                            </TrxIcon>
                        ) : vm.isExpired ? (
                            <TrxIcon color="gray" className={styles.icon}>
                                <Icon icon="x" />
                            </TrxIcon>
                        ) : null}

                        <div className={styles.info}>
                            <div className={styles.title}>
                                {vm.unconfirmedTransaction && !vm.isExpired ? (
                                    intl.formatMessage({ id: 'TRANSACTION_TERM_VALUE_STATUS_WAITING_FOR_CONFIRMATION' })
                                ) : vm.txHash ? (
                                    intl.formatMessage({ id: 'TRANSACTION_TERM_VALUE_STATUS_SENT' })
                                ) : vm.isExpired && !vm.txHash ? (
                                    intl.formatMessage({ id: 'TRANSACTION_TERM_VALUE_STATUS_EXPIRED' })
                                ) : null}
                            </div>
                            {vm.unconfirmedTransaction && !vm.isExpired && (
                                <div className={styles.stats}>
                                    {intl.formatMessage({
                                        id: 'SINGED_OF',
                                    }, {
                                        value: vm.confirmations.size,
                                        total: vm.unconfirmedTransaction.signsRequired,
                                    })}
                                </div>
                            )}
                            <div className={styles.date}>
                                {new Date(transaction.createdAt * 1000).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    <hr />

                    <Data
                        label={intl.formatMessage({ id: 'TRANSACTION_TERM_TYPE' })}
                        value={intl.formatMessage({ id: 'TRANSACTION_TERM_TYPE_MULTISIG' })}
                    />

                    {vm.parsedTokenTransaction && (() => {
                        const { amount, decimals, symbol, rootTokenContract } = vm.parsedTokenTransaction
                        return (
                            <Data
                                label={intl.formatMessage({ id: 'TRANSACTION_TERM_AMOUNT' })}
                                value={(
                                    <Amount
                                        precise
                                        icon={<AssetIcon type="token_wallet" address={rootTokenContract} />}
                                        value={convertCurrency(amount, decimals)}
                                        currency={vm.tokens[rootTokenContract]?.symbol ?? symbol}
                                    />
                                )}
                            />
                        )
                    })()}

                    <Data
                        label={vm.parsedTokenTransaction
                            ? intl.formatMessage({ id: 'TRANSACTION_TERM_ATTACHED_AMOUNT' })
                            : intl.formatMessage({ id: 'TRANSACTION_TERM_AMOUNT' })}
                        value={(
                            <Amount
                                precise
                                icon={<AssetIcon type="ever_wallet" />}
                                value={convertCurrency(vm.value?.toString(), 9)}
                                currency={vm.nativeCurrency}
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
                                    onOpen={() => onOpenAccountInExplorer(address!)}
                                />
                            )}
                        />
                    )}
                    {vm.txHash && (
                        <Data
                            label={intl.formatMessage({ id: 'TRANSACTION_TERM_HASH' })}
                            value={(
                                <CopyButton text={vm.txHash}>
                                    <button type="button" className={styles.copy}>
                                        {convertHash(vm.txHash)}
                                        <Icon
                                            icon="copy" className={styles.icon} width={16}
                                            height={16}
                                        />
                                    </button>
                                </CopyButton>
                            )}
                        />
                    )}
                    {!vm.txHash && vm.transactionId && (
                        <Data
                            label={intl.formatMessage({ id: 'TRANSACTION_TERM_TRANSACTION_ID' })}
                            value={vm.transactionId}
                        />
                    )}
                    {vm.comment && (
                        <>
                            <hr />
                            <Data
                                label={intl.formatMessage({ id: 'TRANSACTION_TERM_COMMENT' })}
                                value={vm.comment}
                            />
                        </>
                    )}
                </Card>

                {vm.custodians.length > 0 && (
                    <div className={styles.custodians}>
                        {vm.custodians.map((custodian, idx) => {
                            const isSigned = vm.confirmations.has(custodian)
                            const isInitiator = vm.creator === custodian
                            const label = (
                                <div className={styles.label}>
                                    <div className={styles.tags}>
                                        {intl.formatMessage(
                                            { id: 'TRANSACTION_TERM_CUSTODIAN' },
                                            { value: idx + 1 },
                                        )}
                                        {isInitiator && (
                                            <div className={styles.status}>
                                                <Icon icon="users" width={16} height={16} />
                                                {intl.formatMessage({ id: 'TRANSACTION_TERM_CUSTODIAN_INITIATOR' })}
                                            </div>
                                        )}
                                    </div>

                                    {isSigned ? (
                                        <Chips type="success">
                                            <Icon icon="checkCircle" width={16} height={16} />
                                            {intl.formatMessage({ id: 'TRANSACTION_TERM_CUSTODIAN_SIGNED' })}
                                        </Chips>
                                    ) : (
                                        <Chips type="default">
                                            <Icon icon="crossCircle" width={16} height={16} />
                                            {intl.formatMessage({ id: 'TRANSACTION_TERM_CUSTODIAN_NOT_SIGNED' })}
                                        </Chips>
                                    )}
                                </div>
                            )

                            return (
                                <React.Fragment key={custodian}>
                                    {idx > 0 && (
                                        <hr />
                                    )}
                                    <Data
                                        key={custodian}
                                        dir="v"
                                        label={label}
                                        value={custodian}
                                    />
                                </React.Fragment>
                            )
                        })}
                    </div>
                )}
            </Content>

            {!vm.txHash && vm.unconfirmedTransaction && !vm.isExpired && (
                <Footer className={styles.footer}>
                    <Button
                        loading={vm.loading}
                        disabled={!vm.selectedKey}
                        onClick={vm.onConfirm}
                        design="accent"
                        width={232}
                    >
                        <Icon icon="check" width={16} height={16} />
                        {intl.formatMessage({ id: 'CONFIRM_TRANSACTION_BTN_TEXT' })}
                    </Button>
                </Footer>
            )}

            {vm.txHash && (
                <Footer className={styles.footer}>
                    <Button design="primary" onClick={() => onOpenTransactionInExplorer(vm.txHash!)} width={232}>
                        <Icon icon="planet" width={16} height={16} />
                        {intl.formatMessage({ id: 'OPEN_IN_EXPLORER_BTN_TEXT' })}
                    </Button>
                </Footer>
            )}
        </>
    )
})
