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
import { DisplayTypeSelector } from '../DisplayTypeSelector'
import { ApproveSignDataViewModel } from './ApproveSignDataViewModel'

export const ApproveSignData = observer((): JSX.Element | null => {
    const vm = useViewModel(ApproveSignDataViewModel)
    const intl = useIntl()
    const passwordCached = usePasswordCache(vm.approval.requestData.publicKey)
    const enterPassword = useEnterPassword({
        keyEntry: vm.keyEntry,
        error: vm.error,
        loading: vm.loading, // || (vm.submitted && !vm.error),
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
            className="approval--sign-data"
            title={intl.formatMessage({ id: 'APPROVE_SIGN_DATA_APPROVAL_TITLE' })}
            account={vm.account}
            origin={vm.approval.origin}
            networkName={vm.networkName}
            loading={vm.ledger.loading}
        >
            <Content>
                <div className="approval__spend-details">
                    <div className="approval__spend-details-param">
                        <div className="approval__spend-details-param-desc with-selector">
                            <span>
                                {intl.formatMessage({ id: 'APPROVE_SIGN_DATA_TERM_DATA' })}
                            </span>
                            <DisplayTypeSelector value={vm.displayType} onChange={vm.setDisplayType} />
                        </div>
                        <div className="approval__spend-details-param-data">{vm.data}</div>
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
                        {intl.formatMessage({ id: 'SIGN_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Approval>
    )
})
