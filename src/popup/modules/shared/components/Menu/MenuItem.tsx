import * as React from 'react'
import classNames from 'classnames'

import styles from './Menu.module.scss'

type Props = {
    type?: 'danger' | 'default'
    disabled?: boolean
    onClick?: () => void
} & React.PropsWithChildren

export const MenuItem: React.FC<Props> = ({
    children,
    onClick,
    disabled,
    type = 'default',
}) => (
    <button
        disabled={disabled}
        onClick={() => {
            window.dispatchEvent(new Event('menu.click'))
            onClick?.()
        }}
        className={classNames(styles.item, styles[type])}
    >
        {children}
    </button>
)
