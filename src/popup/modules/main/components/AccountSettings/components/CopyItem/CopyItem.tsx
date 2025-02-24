import { memo } from 'react'

import { Box, CopyButton, Icon } from '@app/popup/modules/shared'

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
            <CopyButton text={value} notificationId="copy-item-value">
                <div className={styles.value}>
                    {value}
                </div>
            </CopyButton>
        </div>
        <CopyButton text={value} notificationId="copy-item-icon">
            <Box>
                <Icon
                    icon="copy"
                    width={20}
                    height={20}
                    cursor="pointer"
                />
            </Box>
        </CopyButton>
    </div>
))
