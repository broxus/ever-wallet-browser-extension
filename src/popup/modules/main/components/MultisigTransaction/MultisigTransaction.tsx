import type nt from '@wallet/nekoton-wasm'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { SubmitTransaction } from '@app/models'
import { EnterSendPassword } from '@app/popup/modules/send'
import {
    Button,
    Container,
    Content,
    CopyText,
    Footer,
    Header,
    useDrawerPanel,
    useViewModel,
} from '@app/popup/modules/shared'
import {
    convertCurrency,
    convertTokenName,
    extractTransactionAddress,
    NATIVE_CURRENCY,
} from '@app/shared'

import { MultisigTransactionViewModel, Step } from './MultisigTransactionViewModel'

import './MultisigTransaction.scss'

interface Props {
    transaction: (nt.TonWalletTransaction | nt.TokenWalletTransaction) & SubmitTransaction;
    onOpenInExplorer: (txHash: string) => void;
}

export const MultisigTransaction = observer(({ transaction, onOpenInExplorer }: Props): JSX.Element => {
    const drawer = useDrawerPanel()
    const vm = useViewModel(MultisigTransactionViewModel, model => {
        model.transaction = transaction
        model.drawer = drawer
    }, [transaction])
    const intl = useIntl()

    let direction: string | undefined,
        address: string | undefined

    if (
        vm.knownPayload == null
        || (vm.knownPayload.type !== 'token_outgoing_transfer' && vm.knownPayload.type !== 'token_swap_back')
    ) {
        const txAddress = extractTransactionAddress(transaction)
        direction = intl.formatMessage({
            id: `TRANSACTION_TERM_${txAddress.direction}`.toUpperCase(),
        })
        address = txAddress.address
    }
    else {
        direction = intl.formatMessage({
            id: 'TRANSACTION_TERM_OUTGOING_TRANSFER',
        })
        if (vm.knownPayload.type === 'token_outgoing_transfer') {
            address = vm.knownPayload.data.to.address
        }
    }

    if (vm.step.value === Step.EnterPassword) {
        return (
            <Container className="multisig-transaction">
                <Header>
                    <h2 className="noselect">
                        {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_APPROVAL_TITLE' })}
                    </h2>
                </Header>
                {vm.selectedKey && (
                    <EnterSendPassword
                        disabled={vm.loading}
                        transactionId={vm.transactionId}
                        keyEntries={vm.filteredSelectableKeys}
                        keyEntry={vm.selectedKey}
                        amount={vm.amount}
                        recipient={address as string}
                        fees={vm.fees}
                        error={vm.error}
                        masterKeysNames={vm.masterKeysNames}
                        onChangeKeyEntry={vm.setSelectedKey}
                        onSubmit={vm.onSubmit}
                        onBack={vm.onBack}
                    />
                )}
            </Container>
        )
    }

    return (
        <Container className="multisig-transaction">
            <Header>
                <h2 className="noselect">
                    {new Date(transaction.createdAt * 1000).toLocaleString()}
                </h2>
            </Header>

            <Content className="multisig-transaction__content">
                <div className="multisig-transaction__param _row">
                    <p className="multisig-transaction__param-desc">
                        {intl.formatMessage({ id: 'TRANSACTION_TERM_STATUS' })}
                    </p>
                    <div className="multisig-transaction__param-value">
                        {vm.unconfirmedTransaction && (
                            <span className="multisig-transaction__status _waiting">
                                {intl.formatMessage({ id: 'TRANSACTION_TERM_VALUE_STATUS_WAITING_FOR_CONFIRMATION' })}
                            </span>
                        )}
                        {vm.txHash && (
                            <span className="multisig-transaction__status _sent">
                                {intl.formatMessage({ id: 'TRANSACTION_TERM_VALUE_STATUS_SENT' })}
                            </span>
                        )}
                        {vm.isExpired && !vm.txHash && (
                            <span className="multisig-transaction__status _expired">
                                {intl.formatMessage({ id: 'TRANSACTION_TERM_VALUE_STATUS_EXPIRED' })}
                            </span>
                        )}
                    </div>
                </div>

                <div className="multisig-transaction__param _row">
                    <p className="multisig-transaction__param-desc">
                        {intl.formatMessage({ id: 'TRANSACTION_TERM_TYPE' })}
                    </p>
                    <div className="multisig-transaction__param-value">
                        {intl.formatMessage({ id: 'TRANSACTION_TERM_TYPE_MULTISIG' })}
                    </div>
                </div>

                {vm.parsedTokenTransaction && (
                    <div className="multisig-transaction__param _row">
                        <p className="multisig-transaction__param-desc">
                            {intl.formatMessage({ id: 'TRANSACTION_TERM_AMOUNT' })}
                        </p>
                        <p className="multisig-transaction__param-value _amount">
                            {convertCurrency(
                                vm.parsedTokenTransaction.amount,
                                vm.parsedTokenTransaction.decimals,
                            )}
                            &nbsp;
                            <span className="root-token-name">
                                {convertTokenName(vm.parsedTokenTransaction.symbol)}
                            </span>
                        </p>
                    </div>
                )}

                <div className="multisig-transaction__param _row">
                    <p className="multisig-transaction__param-desc">
                        {vm.parsedTokenTransaction
                            ? intl.formatMessage({ id: 'TRANSACTION_TERM_ATTACHED_AMOUNT' })
                            : intl.formatMessage({ id: 'TRANSACTION_TERM_AMOUNT' })}
                    </p>
                    <p className="multisig-transaction__param-value _amount">
                        {convertCurrency(vm.value?.toString(), 9)}
                        &nbsp;
                        {convertTokenName(NATIVE_CURRENCY)}
                    </p>
                </div>

                {address && (
                    <div className="multisig-transaction__param">
                        <p className="multisig-transaction__param-desc">
                            {direction}
                        </p>
                        <CopyText
                            className="multisig-transaction__param-value _copy"
                            id={`copy-${address}`}
                            text={address}
                        />
                    </div>
                )}

                {vm.txHash && (
                    <div className="multisig-transaction__param">
                        <p className="multisig-transaction__param-desc">
                            {intl.formatMessage({ id: 'TRANSACTION_TERM_HASH' })}
                        </p>
                        <CopyText
                            className="multisig-transaction__param-value _copy"
                            id={`copy-${vm.txHash}`}
                            text={vm.txHash}
                        />
                    </div>
                )}

                {vm.transactionId && (
                    <div className="multisig-transaction__param">
                        <p className="multisig-transaction__param-desc">
                            {intl.formatMessage({ id: 'TRANSACTION_TERM_TRANSACTION_ID' })}
                        </p>
                        <p className="multisig-transaction__param-value">
                            {vm.transactionId}
                        </p>
                    </div>
                )}

                {vm.comment && (
                    <div className="multisig-transaction__param">
                        <p className="multisig-transaction__param-desc">
                            {intl.formatMessage({ id: 'TRANSACTION_TERM_COMMENT' })}
                        </p>
                        <p className="multisig-transaction__param-value">
                            {vm.comment}
                        </p>
                    </div>
                )}

                {vm.custodians.length > 1 && (
                    <>
                        {vm.unconfirmedTransaction && !vm.isExpired && (
                            <div className="multisig-transaction__param">
                                <p className="multisig-transaction__param-desc">
                                    {intl.formatMessage({ id: 'TRANSACTION_TERM_SIGNATURES' })}
                                </p>
                                <p className="multisig-transaction__param-value">
                                    {intl.formatMessage(
                                        {
                                            id: 'TRANSACTION_TERM_SIGNATURES_COLLECTED',
                                        },
                                        {
                                            value: vm.confirmations.size,
                                            total: vm.unconfirmedTransaction.signsRequired,
                                        },
                                    )}
                                </p>
                            </div>
                        )}

                        {vm.custodians.map((custodian, idx) => {
                            const isSigned = vm.confirmations.has(custodian)
                            const isInitiator = vm.creator === custodian

                            return (
                                <div key={custodian} className="multisig-transaction__param">
                                    <p className="multisig-transaction__param-desc">
                                        {intl.formatMessage(
                                            {
                                                id: 'TRANSACTION_TERM_CUSTODIAN',
                                            },
                                            { value: idx + 1 },
                                        )}
                                        {isSigned && (
                                            <span className="multisig-transaction__param-badge _signed">
                                                {intl.formatMessage({
                                                    id: 'TRANSACTION_TERM_CUSTODIAN_SIGNED',
                                                })}
                                            </span>
                                        )}
                                        {isInitiator && (
                                            <span className="multisig-transaction__param-badge _initiator">
                                                {intl.formatMessage({
                                                    id: 'TRANSACTION_TERM_CUSTODIAN_INITIATOR',
                                                })}
                                            </span>
                                        )}
                                        {!isSigned && (
                                            <span className="multisig-transaction__param-badge _unsigned">
                                                {intl.formatMessage({
                                                    id: 'TRANSACTION_TERM_CUSTODIAN_NOT_SIGNED',
                                                })}
                                            </span>
                                        )}
                                    </p>
                                    <CopyText
                                        className="multisig-transaction__param-value _copy"
                                        id={`copy-${custodian}`}
                                        text={custodian}
                                    />
                                </div>
                            )
                        })}
                    </>
                )}
            </Content>

            {vm.txHash && (
                <Footer>
                    <Button design="secondary" onClick={() => onOpenInExplorer(vm.txHash!)}>
                        {intl.formatMessage({ id: 'OPEN_IN_EXPLORER_BTN_TEXT' })}
                    </Button>
                </Footer>
            )}

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
