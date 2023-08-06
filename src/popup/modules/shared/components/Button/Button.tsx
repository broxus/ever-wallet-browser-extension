import classNames from 'classnames'
import { ButtonHTMLAttributes, forwardRef } from 'react'

import { Loader } from '../Loader'
import styles from './Button.module.scss'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    design?: 'primary' | 'secondary' | 'ghost' | 'alert' | 'contrast';
    size?: 's' | 'm' | 'l';
    group?: 'default' | 'small'; // TODO: remove
    loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, Props>((props, ref): JSX.Element => {
    const {
        size = 'l',
        design = 'primary',
        type = 'button',
        group = 'default',
        loading = false,
        children,
        className,
        onClick,
        ...rest
    } = props

    const cls = classNames(styles.button, className, styles[`_design-${design}`], styles[`_size-${size}`], styles[`_group-${group}`])

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
