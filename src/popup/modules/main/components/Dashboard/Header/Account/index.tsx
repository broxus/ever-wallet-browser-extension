import * as React from 'react'

import { Jdenticon } from '@app/popup/modules/shared/components/Jdenticon'
import { Icon } from '@app/popup/modules/shared'

import styles from './index.module.scss'

export const Account: React.FC = () => (
    <button className={styles.root}>
        <Jdenticon
            value="0:7fcbb43638d7df93ed11e9febd06b2c11e67371bcb2bc5745c254b416ef1a011"
        />

        <div className={styles.side}>
            <div className={styles.name}>
                Account name
                <Icon icon="chevronDown" />
            </div>

            <div className={styles.wallet}>
                <Icon icon="usersRound" width={16} height={16} />
                Multi-sig 3/4
            </div>
        </div>
    </button>
)
