import classNames from 'classnames'
import { ButtonHTMLAttributes, forwardRef } from 'react'

import { Loader } from '../Loader'
import styles from './Button.module.scss'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    design?: 'primary' | 'secondary' | 'ghost' | 'alert' | 'contrast';
    size?: 's' | 'm' | 'l';
    loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>((props, ref): JSX.Element => {
    const {
        size = 'm',
        design = 'primary',
        type = 'button',
        loading = false,
        children,
        className,
        onClick,
        ...rest
    } = props

    const cls = classNames(styles.button, className, styles[`_design-${design}`], styles[`_size-${size}`])

    return (
        <button
            {...rest}
            ref={ref}
            type={type}
            className={cls}
            onClick={loading ? undefined : onClick}
        >
            {loading && <Loader />}
            {!loading && children}
        </button>
    )
})
