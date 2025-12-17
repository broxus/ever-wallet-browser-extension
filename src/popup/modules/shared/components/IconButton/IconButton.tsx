import classNames from 'classnames'
import { type ButtonHTMLAttributes, type ReactNode } from 'react'

import styles from './IconButton.module.scss'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    icon: ReactNode;
    design?: 'primary' | 'secondary' | 'ghost' | 'transparent' | 'neutral';
    size?: 'xs' | 's' | 'm' | 'l';
}

export const IconButton = (props: Props) => {
    const { icon, className, size = 'l', design = 'primary', type = 'button', ...rest } = props

    return (
        <button
            {...rest}
            type={type}
            className={classNames(styles.iconButton, styles[`_size-${size}`], styles[`_design-${design}`], className)}
        >
            {icon}
        </button>
    )
}
