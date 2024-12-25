import * as React from 'react'
import classNames from 'classnames'

import styles from './Toast.module.scss'

type Props = {
    type?: 'default' | 'success'
} & React.PropsWithChildren

export const Toast: React.FC<Props> = ({
    children,
    type = 'default',
}) => (
    <div
        className={classNames(styles.root, styles[type])}
    >
        {children}
    </div>
)
