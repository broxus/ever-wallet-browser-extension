import { memo } from 'react'

import { CopyButton, Icon } from '@app/popup/modules/shared'

import styles from './CopyItem.module.scss'

interface Props {
    label: string;
    value: string;
}

export const CopyItem = memo(({ label, value }: Props) => (
    <div className={styles.main}>
        <div className={styles.text}>
            <div className={styles.label}>
                {label}
            </div>
            <div className={styles.value}>
                {value}
            </div>
        </div>
        <div>
            <CopyButton text={value}>
                <Icon
                    icon="copy"
                    width={20}
                    height={20}
                    cursor="pointer"
                />
            </CopyButton>
        </div>
    </div>
))
