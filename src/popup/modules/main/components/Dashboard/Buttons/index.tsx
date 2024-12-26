import * as React from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import { IconButton, useViewModel } from '@app/popup/modules/shared'
import { Icons } from '@app/popup/icons'

import styles from './index.module.scss'
import { Receive } from '../../Receive'
import { AccountSettings } from '../../AccountSettings'
import { DashboardViewModel } from '../DashboardViewModel'

type Props = {
    className?: string;
};

export const DashboardButtons: React.FC<Props> = observer(({ className }) => {
    const intl = useIntl()
    const vm = useViewModel(DashboardViewModel)

    const handleReceive = React.useCallback(
        () => vm.panel.open({
            showClose: false,
            render: () => <Receive address={vm.selectedAccountAddress!} />,
        }),
        [],
    )

    const handleInfo = React.useCallback(
        () => vm.panel.open({
            showClose: true,
            title: intl.formatMessage({ id: 'ACCOUNT_SETTINGS' }),
            render: () => <AccountSettings address={vm.selectedAccountAddress!} />,
        }),
        [],
    )

    return (
        <div className={classNames(styles.root, className)}>
            {/* <label className={styles.label}>
                <IconButton design="transparent" icon={Icons.currency} />
                {intl.formatMessage({ id: 'BUY_EVER_BTN_TEXT' })}
            </label> */}

            <label className={styles.label}>
                <IconButton design="transparent" icon={Icons.arrowDown} onClick={handleReceive} />
                {intl.formatMessage({ id: 'RECEIVE_BTN_TEXT' })}
            </label>

            {vm.everWalletState && vm.isDeployed && (
                <label className={styles.label}>
                    <IconButton design="transparent" icon={Icons.arrowUp} onClick={vm.onSend} />
                    {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
                </label>
            )}

            {/* TODO: for v2 */}
            {/* {vm.everWalletState && vm.isDeployed && vm.stakingAvailable && (
                <label className={classNames(styles.label, { [styles._alert]: vm.hasWithdrawRequest })}>
                    <IconButton design="transparent" icon={Icons.stake} onClick={vm.onStake} />
                    {intl.formatMessage({ id: "STAKE_BTN_TEXT" })}
                </label>
            )} */}

            {vm.everWalletState && !vm.isDeployed && (
                <label className={styles.label}>
                    <IconButton design="transparent" icon={Icons.settings1} onClick={vm.onDeploy} />
                    {intl.formatMessage({ id: 'DEPLOY_BTN_TEXT' })}
                </label>
            )}

            <label className={styles.label}>
                <IconButton design="transparent" icon={Icons.dots} onClick={handleInfo} />
                {intl.formatMessage({ id: 'INFO_BTN_TEXT' })}
            </label>
        </div>
    )
})
