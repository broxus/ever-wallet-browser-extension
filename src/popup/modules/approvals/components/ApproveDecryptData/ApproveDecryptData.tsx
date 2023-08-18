import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useIntl } from 'react-intl'

import {
    Button,
    ButtonGroup,
    Content,
    Footer,
    useEnterPassword,
    usePasswordCache,
    useViewModel,
} from '@app/popup/modules/shared'
import { LedgerConnector } from '@app/popup/modules/ledger'

import { Approval } from '../Approval'
import { ApproveDecryptDataViewModel } from './ApproveDecryptDataViewModel'

export const ApproveDecryptData = observer((): JSX.Element | null => {
    const vm = useViewModel(ApproveDecryptDataViewModel)
    const intl = useIntl()
    const passwordCached = usePasswordCache(vm.approval.requestData.publicKey)
    const enterPassword = useEnterPassword({
        keyEntry: vm.keyEntry,
        error: vm.error,
        disabled: vm.loading,
        onSubmit: vm.onSubmit,
    })

    useEffect(() => {
        if (!vm.account && !vm.loading) {
            vm.onReject()
        }
    }, [!!vm.account, vm.loading])

    if (!vm.account) return null

    if (vm.ledgerConnect) {
        return (
            <LedgerConnector
                onNext={vm.handleLedgerConnected}
                onBack={vm.handleLedgerFailed}
            />
        )
    }

    return (
        <Approval
            className="approval--encrypt-data"
            title={intl.formatMessage({ id: 'APPROVE_DECRYPT_DATA_APPROVAL_TITLE' })}
            account={vm.account}
            origin={vm.approval.origin}
            networkName={vm.networkName}
            loading={vm.ledger.loading}
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
                        onClick={() => (passwordCached ? vm.onSubmit() : enterPassword.show())}
                    >
                        {intl.formatMessage({ id: 'DECRYPT_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Approval>
    )
})
