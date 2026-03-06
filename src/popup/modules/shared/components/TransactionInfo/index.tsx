import * as React from 'react'
import classNames from 'classnames'

import styles from './index.module.scss'

type Props = {
    value: React.ReactNode
    label: React.ReactNode
    amountInUsd?: string | null | React.ReactElement
    dir?: 'h' | 'v'
}

export const TransactionInfo: React.FC<Props> = ({
    label,
    value,
    amountInUsd,
    dir = 'h',
}) => (
    <div
        className={classNames(styles.root, {
            [styles.h]: dir === 'h',
            [styles.v]: dir === 'v',
        })}
    >
        <div className={styles.label}>
            {label}
        </div>
        <div className={styles.value}>
            {value}
            {amountInUsd && <span className={styles.usd}>{amountInUsd}</span>}
        </div>
    </div>
)
