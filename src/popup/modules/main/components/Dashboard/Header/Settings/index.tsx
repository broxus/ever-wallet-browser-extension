import * as React from 'react'

import { Button, Icon, useResolve } from '@app/popup/modules/shared'
import { Networks } from '@app/popup/modules/network'
import { AccountDetailsViewModel } from '@app/popup/modules/main/components/AccountDetails/AccountDetailsViewModel'

import styles from './index.module.scss'

export const Settings: React.FC = () => {
    const vm = useResolve(AccountDetailsViewModel)
    return (
        <div className={styles.root}>
            <Button
                size="s"
                shape="icon"
                design="transparency"
            >
                <Icon icon="settings" width={16} height={16} />
            </Button>

            <Networks
                onSettings={vm.openNetworkSettings}
            />
        </div>
    )
}
