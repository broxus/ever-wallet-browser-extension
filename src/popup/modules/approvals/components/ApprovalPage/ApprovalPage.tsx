/* eslint-disable no-nested-ternary */
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { closeCurrentWindow } from '@app/shared'
import { IconButton, Space, useViewModel } from '@app/popup/modules/shared'
import LogoIcon from '@app/popup/assets/icons/logo-circle.svg'

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
import styles from './ApprovalPage.module.scss'

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
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.network}>
                    <LogoIcon className={styles.networkLogo} />
                    <div className={styles.networkWrap}>
                        <div className={styles.networkTitle}>
                            {intl.formatMessage({ id: 'NETWORK_BTN_TITLE' })}
                        </div>
                        <div className={styles.networkName} title={vm.connectionName}>
                            {vm.connectionName}
                        </div>
                    </div>
                </div>

                {vm.pendingApprovals.length !== 1 && (
                    <Space direction="row" gap="m" className={styles.nav}>
                        <IconButton
                            size="m"
                            icon={Icons.chevronLeft}
                            disabled={vm.approvalIndex === 0}
                            onClick={vm.decrementIndex}
                        />
                        <IconButton
                            size="m"
                            icon={Icons.chevronRight}
                            disabled={vm.approvalIndex + 1 === vm.pendingApprovalCount}
                            onClick={vm.incrementIndex}
                        />
                    </Space>
                )}
            </div>

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
