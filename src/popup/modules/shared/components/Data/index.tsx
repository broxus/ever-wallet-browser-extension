import * as React from 'react'
import classNames from 'classnames'

import styles from './index.module.scss'

type Props = {
    dir?: 'h' | 'v'
    value?: React.ReactNode
    label?: React.ReactNode
}

export const Data: React.FC<Props> = ({
    label,
    value,
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
        </div>
    </div>
)
