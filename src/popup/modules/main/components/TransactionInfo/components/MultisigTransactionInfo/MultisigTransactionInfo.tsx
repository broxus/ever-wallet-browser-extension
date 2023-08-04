import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import classNames from 'classnames'
import { useNavigate } from 'react-router'

import type { SubmitTransaction } from '@app/models'
import { Amount, Button, Chips, Container, Content, CopyButton, Footer, Header, Navbar, ParamsPanel, useViewModel } from '@app/popup/modules/shared'
import { convertCurrency, extractTransactionAddress } from '@app/shared'
import { ContactLink, useContacts } from '@app/popup/modules/contacts'
import { EnterSendPassword } from '@app/popup/modules/send'
import CopyIcon from '@app/popup/assets/icons/copy.svg'
import UsersIcon from '@app/popup/assets/icons/users.svg'
import CheckIcon from '@app/popup/assets/icons/check-circle.svg'
import CrossIcon from '@app/popup/assets/icons/cross-circle.svg'

import { MultisigTransactionInfoViewModel, Step } from './MultisigTransactionInfoViewModel'
import styles from './MultisigTransactionInfo.module.scss'

interface Props {
    transaction: (nt.TonWalletTransaction | nt.TokenWalletTransaction) & SubmitTransaction;
    onOpenInExplorer: (txHash: string) => void;
}

export const MultisigTransactionInfo = observer(({ transaction, onOpenInExplorer }: Props): JSX.Element => {
    const vm = useViewModel(MultisigTransactionInfoViewModel, model => {
        model.transaction = transaction
    }, [transaction])
    const intl = useIntl()
    const navigate = useNavigate()
    const contacts = useContacts()

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

    const statusLabel = (
        <>
            {vm.unconfirmedTransaction && !vm.isExpired && (
                <Chips type="error">
                    {intl.formatMessage({ id: 'TRANSACTION_TERM_VALUE_STATUS_WAITING_FOR_CONFIRMATION' })}
                </Chips>
            )}
            {vm.txHash && (
                <Chips type="success">
                    {intl.formatMessage({ id: 'TRANSACTION_TERM_VALUE_STATUS_SENT' })}
                </Chips>
            )}
            {vm.isExpired && !vm.txHash && (
                <Chips type="default">
                    {intl.formatMessage({ id: 'TRANSACTION_TERM_VALUE_STATUS_EXPIRED' })}
                </Chips>
            )}
        </>
    )

    if (vm.step.value === Step.EnterPassword && vm.selectedKey) {
        return (
            <EnterSendPassword
                contractType={vm.selectedAccount.tonWallet.contractType}
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
        <Container>
            <Header>
                <Navbar back={() => navigate(-1)} />
            </Header>

            <Content>
                <h2>{intl.formatMessage({ id: 'TRANSACTION_PANEL_HEADER' })}</h2>

                <ParamsPanel className={styles.panel}>
                    <ParamsPanel.Param row label={statusLabel}>
                        <span className={styles.date}>
                            {new Date(transaction.createdAt * 1000).toLocaleString()}
                        </span>
                    </ParamsPanel.Param>
                    <ParamsPanel.Param label={intl.formatMessage({ id: 'TRANSACTION_TERM_TYPE' })}>
                        {intl.formatMessage({ id: 'TRANSACTION_TERM_TYPE_MULTISIG' })}
                    </ParamsPanel.Param>
                    {vm.parsedTokenTransaction && (() => {
                        const { amount, decimals, symbol, rootTokenContract } = vm.parsedTokenTransaction
                        return (
                            <ParamsPanel.Param label={intl.formatMessage({ id: 'TRANSACTION_TERM_AMOUNT' })}>
                                <Amount
                                    value={convertCurrency(amount, decimals)}
                                    currency={vm.tokens[rootTokenContract]?.symbol ?? symbol}
                                />
                            </ParamsPanel.Param>
                        )
                    })()}
                    <ParamsPanel.Param
                        label={vm.parsedTokenTransaction
                            ? intl.formatMessage({ id: 'TRANSACTION_TERM_ATTACHED_AMOUNT' })
                            : intl.formatMessage({ id: 'TRANSACTION_TERM_AMOUNT' })}
                    >
                        <Amount value={convertCurrency(vm.value?.toString(), 9)} currency={vm.nativeCurrency} />
                    </ParamsPanel.Param>
                    {address && (
                        <ParamsPanel.Param label={direction}>
                            {/* TODO: design??? */}
                            <ContactLink address={address} onAdd={contacts.add} onOpen={contacts.details} />
                        </ParamsPanel.Param>
                    )}
                    {vm.txHash && (
                        <ParamsPanel.Param label={intl.formatMessage({ id: 'TRANSACTION_TERM_HASH' })}>
                            <div className={styles.copy}>
                                <button
                                    type="button"
                                    className={classNames(styles.copyValue, styles.copyLink)}
                                    onClick={() => onOpenInExplorer(vm.txHash!)}
                                >
                                    {/* {convertHash(vm.txHash)} */}
                                    {vm.txHash}
                                </button>
                                <CopyButton text={vm.txHash}>
                                    <button type="button" className={styles.copyBtn}>
                                        <CopyIcon />
                                    </button>
                                </CopyButton>
                            </div>
                        </ParamsPanel.Param>
                    )}
                    {vm.transactionId && (
                        <ParamsPanel.Param label={intl.formatMessage({ id: 'TRANSACTION_TERM_TRANSACTION_ID' })}>
                            {vm.transactionId}
                        </ParamsPanel.Param>
                    )}
                    {vm.comment && (
                        <ParamsPanel.Param label={intl.formatMessage({ id: 'TRANSACTION_TERM_COMMENT' })}>
                            {vm.comment}
                        </ParamsPanel.Param>
                    )}
                </ParamsPanel>

                {vm.custodians.length > 1 && (
                    <ParamsPanel className={styles.panel}>
                        <ParamsPanel.Param
                            row
                            label={(
                                <h2>
                                    {intl.formatMessage({ id: 'TRANSACTION_TERM_SIGNATURES' })}
                                </h2>
                            )}
                        >
                            {vm.unconfirmedTransaction && !vm.isExpired && (
                                intl.formatMessage(
                                    { id: 'TRANSACTION_TERM_SIGNATURES_COLLECTED' },
                                    {
                                        value: vm.confirmations.size,
                                        total: vm.unconfirmedTransaction.signsRequired,
                                    },
                                )
                            )}
                        </ParamsPanel.Param>

                        {vm.custodians.map((custodian, idx) => {
                            const isSigned = vm.confirmations.has(custodian)
                            const isInitiator = vm.creator === custodian
                            const label = (
                                <div className={styles.custodian}>
                                    {intl.formatMessage(
                                        { id: 'TRANSACTION_TERM_CUSTODIAN' },
                                        { value: idx + 1 },
                                    )}
                                    <div className={styles.statuses}>
                                        {isInitiator && (
                                            <Chips type="error">
                                                <UsersIcon />
                                                {intl.formatMessage({ id: 'TRANSACTION_TERM_CUSTODIAN_INITIATOR' })}
                                            </Chips>
                                        )}
                                        {isSigned && (
                                            <Chips type="success">
                                                <CheckIcon />
                                                {intl.formatMessage({ id: 'TRANSACTION_TERM_CUSTODIAN_SIGNED' })}
                                            </Chips>
                                        )}
                                        {!isSigned && (
                                            <Chips type="default">
                                                <CrossIcon />
                                                {intl.formatMessage({ id: 'TRANSACTION_TERM_CUSTODIAN_NOT_SIGNED' })}
                                            </Chips>
                                        )}
                                    </div>
                                </div>
                            )

                            return (
                                <ParamsPanel.Param key={custodian} label={label}>
                                    <div className={styles.copy}>
                                        <div className={styles.copyValue}>
                                            {custodian}
                                        </div>
                                        <CopyButton text={custodian}>
                                            <button type="button" className={styles.copyBtn}>
                                                <CopyIcon />
                                            </button>
                                        </CopyButton>
                                    </div>
                                </ParamsPanel.Param>
                            )
                        })}
                    </ParamsPanel>
                )}
            </Content>

            {!vm.txHash && vm.unconfirmedTransaction && !vm.isExpired && (
                <Footer>
                    <Button disabled={!vm.selectedKey} onClick={vm.onConfirm}>
                        {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                    </Button>
                </Footer>
            )}
        </Container>
    )
})
