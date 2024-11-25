import * as React from 'react'

import { Button, Icon } from '@app/popup/modules/shared'

import styles from './index.module.scss'

export const Settings: React.FC = () => (
    <div className={styles.root}>
        <Button
            size="s"
            shape="icon"
            design="transparency"
        >
            <Icon icon="settings" width={16} height={16} />
        </Button>

        <Button
            size="s"
            shape="icon"
            design="transparency"
        >
            <div className={styles.netSelect}>
                <div className={styles.netIcon} />
                <Icon icon="chevronDown" />
            </div>
        </Button>
    </div>
)
