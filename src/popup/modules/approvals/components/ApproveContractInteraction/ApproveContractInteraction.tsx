import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import { useIntl } from 'react-intl'

import {
    Button,
    ButtonGroup,
    Content,
    EnterPassword,
    Footer,
    SlidingPanel,
    usePasswordCache,
    useViewModel,
} from '@app/popup/modules/shared'
import { ParamsView } from '@app/popup/modules/approvals/components/ParamsView'

import { Approval } from '../Approval'
import { ApproveContractInteractionViewModel } from './ApproveContractInteractionViewModel'

export const ApproveContractInteraction = observer((): JSX.Element | null => {
    const vm = useViewModel(ApproveContractInteractionViewModel)
    const intl = useIntl()
    const passwordCached = usePasswordCache(vm.approval.requestData.publicKey)

    useEffect(() => {
        if (!vm.account && !vm.loading) {
            vm.onReject()
        }
    }, [!!vm.account, vm.loading])

    if (!vm.account) return null

    return (
        <>
            <Approval
                title={intl.formatMessage({ id: 'APPROVE_CONTRACT_INTERACTION_APPROVAL_TITLE' })}
                account={vm.account}
                origin={vm.approval.origin}
                networkName={vm.networkName}
            >
                <Content>
                    <div className="approval__spend-details">
                        <div className="approval__spend-details-param">
                            <span className="approval__spend-details-param-desc">
                                {intl.formatMessage({ id: 'APPROVE_CONTRACT_INTERACTION_TERM_CONTRACT' })}
                            </span>
                            <span className="approval__spend-details-param-value">
                                {vm.approval.requestData.recipient}
                            </span>
                        </div>
                        {vm.approval.requestData.payload && (
                            <div className="approval__spend-details-param">
                                <span className="approval__spend-details-param-desc">
                                    {intl.formatMessage({ id: 'APPROVE_CONTRACT_INTERACTION_TERM_DATA' })}
                                </span>
                                <div className="approval__spend-details-param-data">
                                    <div className="approval__spend-details-param-data__method">
                                        <span>
                                            {intl.formatMessage({ id: 'APPROVE_CONTRACT_INTERACTION_TERM_DATA_METHOD' })}
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
                    <ButtonGroup>
                        <Button design="secondary" disabled={vm.loading} onClick={vm.onReject}>
                            {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
                        </Button>
                        <Button
                            disabled={vm.loading || passwordCached === false}
                            onClick={() => (passwordCached ? vm.onSubmit() : vm.openPasswordModal())}
                        >
                            {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
                        </Button>
                    </ButtonGroup>
                </Footer>
            </Approval>

            {passwordCached === false && (
                <SlidingPanel
                    active={vm.passwordModalVisible}
                    onClose={vm.closePasswordModal}
                >
                    <EnterPassword
                        keyEntry={vm.keyEntry}
                        disabled={vm.loading}
                        error={vm.error}
                        onSubmit={vm.onSubmit}
                        onBack={vm.closePasswordModal}
                    />
                </SlidingPanel>
            )}
        </>
    )
})
