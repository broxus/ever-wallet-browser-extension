import * as React from 'react'

import { Icon } from '@app/popup/modules/shared'

import styles from './index.module.scss'

export const DashboardBalance: React.FC = () => (
    <div className={styles.root}>
        <div className={styles.balance}>
            <span className={styles.symbol}>$&nbsp;</span>
            <span className={styles.amount1}>0</span>
            <span className={styles.amount2}>.00</span>
        </div>
        <div className={styles.wallet}>
            <Icon icon="wallet" />
            0:h6F9...22oJ
        </div>
    </div>
)
