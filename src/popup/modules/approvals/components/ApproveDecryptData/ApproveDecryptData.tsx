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

import { Approval } from '../Approval'
import { ApproveDecryptDataViewModel } from './ApproveDecryptDataViewModel'

export const ApproveDecryptData = observer((): JSX.Element | null => {
    const vm = useViewModel(ApproveDecryptDataViewModel)
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
                className="approval--encrypt-data"
                title={intl.formatMessage({ id: 'APPROVE_DECRYPT_DATA_APPROVAL_TITLE' })}
                account={vm.account}
                origin={vm.approval.origin}
                networkName={vm.networkName}
            >
                <Content>
                    <div className="approval__spend-details">
                        <div className="approval__spend-details-param">
                            <span className="approval__spend-details-param-desc">
                                {intl.formatMessage({ id: 'APPROVE_DECRYPT_DATA_TERM_PUBLIC_KEY' })}
                            </span>
                            <span className="approval__spend-details-param-value">
                                {vm.approval.requestData.sourcePublicKey}
                            </span>
                        </div>
                    </div>
                </Content>

                <Footer>
                    <ButtonGroup>
                        <Button design="secondary" disabled={vm.loading} onClick={vm.onReject}>
                            {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
                        </Button>
                        <Button
                            disabled={vm.loading || passwordCached == null}
                            onClick={() => (passwordCached ? vm.onSubmit() : vm.openPasswordModal())}
                        >
                            {intl.formatMessage({ id: 'DECRYPT_BTN_TEXT' })}
                        </Button>
                    </ButtonGroup>
                </Footer>
            </Approval>

            {passwordCached === false && (
                <SlidingPanel active={vm.passwordModalVisible} onClose={vm.closePasswordModal}>
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
