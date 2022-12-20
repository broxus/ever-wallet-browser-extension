/* eslint-disable no-nested-ternary */
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useIntl } from 'react-intl'

import { closeCurrentWindow } from '@app/shared'
import Left from '@app/popup/assets/img/left-arrow-blue.svg'
import Right from '@app/popup/assets/img/right-arrow-blue.svg'
import { useViewModel } from '@app/popup/modules/shared'

import { ApproveAddAsset } from '../ApproveAddAsset'
import { ApproveChangeAccount } from '../ApproveChangeAccount'
import { ApproveContractInteraction } from '../ApproveContractInteraction'
import { ApproveDecryptData } from '../ApproveDecryptData'
import { ApproveEncryptData } from '../ApproveEncryptData'
import { ApproveRequestPermissions } from '../ApproveRequestPermissions'
import { ApproveSendMessage } from '../ApproveSendMessage'
import { ApproveSignData } from '../ApproveSignData'
import { withStandalone } from '../../hoc'
import { ApprovalPageViewModel } from './ApprovalPageViewModel'

import './ApprovalPage.scss'

function Page(): JSX.Element | null {
    const vm = useViewModel(ApprovalPageViewModel)
    const intl = useIntl()

    useEffect(() => {
        if (vm.pendingApprovalCount === 0) {
            closeCurrentWindow()
        }
    }, [vm.pendingApprovalCount])

    if (!vm.pendingApprovalCount || !vm.pendingApprovals.length || !vm.approval) {
        return null
    }

    return (
        <div className="pending-approvals">
            {vm.pendingApprovals.length !== 1 && (
                <div className="pending-approvals__counter">
                    <div
                        dangerouslySetInnerHTML={{
                            __html: intl.formatMessage(
                                { id: 'PENDING_APPROVAL_COUNTER' },
                                { value: vm.approvalIndex + 1, total: vm.pendingApprovals.length },
                                { ignoreTag: true },
                            ),
                        }}
                    />
                    <div className="pending-approvals__counter-nav">
                        <div
                            className="pending-approvals__counter-nav-button"
                            onClick={vm.decrementIndex}
                        >
                            <img src={Left} alt="" />
                        </div>
                        <div
                            className="pending-approvals__counter-nav-button"
                            onClick={vm.incrementIndex}
                        >
                            <img src={Right} alt="" />
                        </div>
                    </div>
                </div>
            )}
            {vm.approval.type === 'requestPermissions' ? (
                <ApproveRequestPermissions key={vm.approval.id} />
            ) : vm.approval.type === 'changeAccount' ? (
                <ApproveChangeAccount key={vm.approval.id} />
            ) : vm.approval.type === 'addTip3Token' ? (
                <ApproveAddAsset key={vm.approval.id} />
            ) : vm.approval.type === 'signData' ? (
                <ApproveSignData key={vm.approval.id} />
            ) : vm.approval.type === 'encryptData' ? (
                <ApproveEncryptData key={vm.approval.id} />
            ) : vm.approval.type === 'decryptData' ? (
                <ApproveDecryptData key={vm.approval.id} />
            ) : vm.approval.type === 'sendMessage' ? (
                <ApproveSendMessage key={vm.approval.id} />
            ) : vm.approval.type === 'callContractMethod' ? (
                <ApproveContractInteraction key={vm.approval.id} />
            ) : (
                <>Unknown approval</>
            )}
        </div>
    )
}

export const ApprovalPage = withStandalone(observer(Page))
