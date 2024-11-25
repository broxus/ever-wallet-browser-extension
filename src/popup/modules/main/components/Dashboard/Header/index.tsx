import * as React from 'react'

import styles from './index.module.scss'
import { Account } from './Account'
import { Settings } from './Settings'

export const DashboardHeader: React.FC = () => (
    <div className={styles.root}>
        <Account />
        <Settings />
    </div>
)
