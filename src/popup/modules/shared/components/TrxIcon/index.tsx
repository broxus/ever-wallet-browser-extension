import * as React from 'react'
import classNames from 'classnames'

import styles from './index.module.scss'

type Props = {
    color?: 'gray' | 'yellow' | 'green'
    className?: string
} & React.PropsWithChildren

export const TrxIcon: React.FC<Props> = ({
    children,
    color,
    className,
}) => (
    <div
        className={classNames(styles.root, color ? styles[color] : null, className)}
    >
        {children}
    </div>
)
