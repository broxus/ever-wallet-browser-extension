import * as React from 'react'
import classNames from 'classnames'

import styles from './index.module.scss'

type Props = {
    amount: React.ReactNode
    label: React.ReactNode
    amountInUsd?: string
}

export const Data: React.FC<Props> = ({
    label,
    amount,
    amountInUsd,
}) => (
    <div
        className={classNames(styles.root)}
    >
        <div className={styles.label}>
            {label}
        </div>
        <div className={styles.value}>
            {amount}
            {amountInUsd && <span>{amountInUsd}</span>}
        </div>
    </div>
)
