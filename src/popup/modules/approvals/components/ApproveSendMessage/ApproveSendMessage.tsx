import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useIntl } from 'react-intl'

import { LedgerConnector } from '@app/popup/modules/ledger'
import { EnterSendPassword } from '@app/popup/modules/send'
import {
    AssetIcon,
    Button,
    ButtonGroup,
    Content,
    ErrorMessage,
    NativeAssetIcon,
    Footer,
    useViewModel,
} from '@app/popup/modules/shared'
import { convertCurrency, convertEvers, convertTokenName } from '@app/shared'

import { Approval } from '../Approval'
import { ParamsView } from '../ParamsView'
import { ApproveSendMessageViewModel, Step } from './ApproveSendMessageViewModel'

import './ApproveSendMessage.scss'

export const ApproveSendMessage = observer((): JSX.Element | null => {
    const vm = useViewModel(ApproveSendMessageViewModel)
    const intl = useIntl()

    useEffect(() => {
        if (!vm.account && !vm.loading) {
            vm.onReject()
        }
    }, [!!vm.account, vm.loading])

    if (!vm.account) return null

    if (vm.step.is(Step.LedgerConnect)) {
        return (
            <LedgerConnector
                onNext={vm.step.callback(Step.MessagePreview)}
                onBack={vm.handleLedgerFailed}
            />
        )
    }

    return (
        <Approval
            className="approval--send-message"
            title={
                vm.step.is(Step.MessagePreview)
                    ? intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_APPROVAL_PREVIEW_TITLE' })
                    : intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_APPROVAL_TITLE' })
            }
            account={vm.account}
            origin={vm.approval.origin}
            networkName={vm.networkName}
            loading={!vm.contractState || vm.ledger.loading}
        >
            {vm.step.is(Step.MessagePreview) && vm.contractState && (
                <>
                    <Content>
                        <div key="message" className="approval__spend-details">
                            <div className="approval__spend-details-param">
                                <span className="approval__spend-details-param-desc">
                                    {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_RECIPIENT' })}
                                </span>
                                <span className="approval__spend-details-param-value">
                                    {vm.approval.requestData.recipient}
                                </span>
                            </div>
                            {vm.tokenTransaction != null && (
                                <div className="approval__spend-details-param">
                                    <span className="approval__spend-details-param-desc">
                                        {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT' })}
                                    </span>
                                    <span
                                        className="approval__spend-details-param-value approval--send-message__amount"
                                    >
                                        <AssetIcon
                                            type="token_wallet"
                                            address={vm.tokenTransaction.rootTokenContract}
                                            old={vm.tokenTransaction.old}
                                            className="root-token-icon noselect"
                                        />
                                        <span className="token-amount-text">
                                            {convertCurrency(
                                                vm.tokenTransaction.amount,
                                                vm.tokenTransaction.decimals,
                                            )}
                                        </span>
                                        &nbsp;
                                        <span className="root-token-name">
                                            {convertTokenName(vm.tokenTransaction.symbol)}
                                        </span>
                                    </span>
                                </div>
                            )}
                            <div className="approval__spend-details-param">
                                <span className="approval__spend-details-param-desc">
                                    {!vm.tokenTransaction
                                        ? intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_AMOUNT' })
                                        : intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_ATTACHED_AMOUNT' })}
                                </span>
                                <span className="approval__spend-details-param-value approval--send-message__amount">
                                    <NativeAssetIcon className="root-token-icon noselect" />
                                    {convertEvers(vm.approval.requestData.amount)}
                                    {' '}
                                    {vm.nativeCurrency}
                                </span>
                                {vm.isInsufficientBalance && (
                                    <ErrorMessage className="approval__spend-details-param-error _amount">
                                        {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_INSUFFICIENT_FUNDS' })}
                                    </ErrorMessage>
                                )}
                            </div>
                            <div className="approval__spend-details-param">
                                <span className="approval__spend-details-param-desc">
                                    {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_BLOCKCHAIN_FEE' })}
                                </span>
                                {vm.isDeployed && (
                                    <span
                                        className="approval__spend-details-param-value approval--send-message__amount"
                                    >
                                        <NativeAssetIcon className="root-token-icon noselect" />
                                        {vm.fees
                                            ? `~${convertEvers(vm.fees)} ${vm.nativeCurrency}`
                                            : intl.formatMessage({ id: 'CALCULATING_HINT' })}
                                    </span>
                                )}
                                {!vm.isDeployed && (
                                    <ErrorMessage className="approval__spend-details-param-error">
                                        {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_OPERATION_NOT_POSSIBLE' })}
                                    </ErrorMessage>
                                )}
                            </div>
                            {vm.approval.requestData.payload && (
                                <div className="approval__spend-details-param">
                                    <span className="approval__spend-details-param-desc">
                                        {intl.formatMessage({
                                            id: 'APPROVE_SEND_MESSAGE_TERM_DATA',
                                        })}
                                    </span>
                                    <div className="approval__spend-details-param-data">
                                        <div className="approval__spend-details-param-data__method">
                                            <span>
                                                {intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_DATA_METHOD' })}
                                            </span>
                                            <span>{vm.approval.requestData.payload.method}</span>
                                        </div>
                                        <ParamsView params={vm.approval.requestData.payload.params} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </Content>

                    <Footer>
                        {!vm.selectedKey && (
                            <ErrorMessage className="approval__footer-error">
                                {intl.formatMessage({ id: 'ERROR_CUSTODIAN_KEY_NOT_FOUND' })}
                            </ErrorMessage>
                        )}
                        <ButtonGroup>
                            <Button design="secondary" disabled={vm.loading} onClick={vm.onReject}>
                                {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
                            </Button>
                            <Button
                                disabled={vm.isInsufficientBalance || !vm.selectedKey || !vm.fees}
                                onClick={vm.step.callback(Step.EnterPassword)}
                            >
                                {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
                            </Button>
                        </ButtonGroup>
                    </Footer>
                </>
            )}

            {vm.step.is(Step.EnterPassword) && vm.selectedKey && (
                <EnterSendPassword
                    contractType={vm.account.tonWallet.contractType}
                    keyEntries={vm.selectableKeys!.keys}
                    keyEntry={vm.selectedKey}
                    amount={vm.messageAmount}
                    recipient={vm.approval.requestData.recipient}
                    fees={vm.fees}
                    txErrors={vm.txErrors}
                    txErrorsLoaded={vm.txErrorsLoaded}
                    error={vm.error}
                    disabled={vm.loading}
                    context={vm.context}
                    onSubmit={vm.onSubmit}
                    onBack={vm.step.callback(Step.MessagePreview)}
                    onChangeKeyEntry={vm.setKey}
                />
            )}
        </Approval>
    )
})
