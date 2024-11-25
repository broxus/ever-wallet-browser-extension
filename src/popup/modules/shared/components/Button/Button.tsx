/* eslint-disable no-nested-ternary */
import classNames from 'classnames'
import { ButtonHTMLAttributes, forwardRef } from 'react'

import { Loader } from '../Loader'
import styles from './Button.module.scss'

// TODO: Remove 'primary' | 'secondary' | 'tertiary' | 'danger' | 'alert' | 'contrast' after redesign finished
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    design?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'alert' | 'contrast' | 'accent' | 'neutral' | 'transparency' | 'ghost' | 'destructive';
    shape?: 'rectangle' | 'pill' | 'icon'
    size?: 's' | 'm' | 'l';
    width?: number;
    loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, Props>((props, ref): JSX.Element => {
    const {
        size = 'm',
        design = 'primary',
        shape = 'rectangle',
        type = 'button',
        loading = false,
        children,
        className,
        width,
        onClick,
        ...rest
    } = props

    const cls = classNames(styles.button, className, styles[`_design-${design}`], styles[`_size-${size}`], styles[`_shape-${shape}`])

    return (
        <button
            {...rest}
            disabled={rest.disabled || loading}
            ref={ref}
            type={type}
            className={cls}
            onClick={loading ? undefined : onClick}
            style={{
                width: width ? `${width}px` : undefined,
            }}
        >
            {loading && <Loader className={styles.loader} />}
            {!loading && children}
        </button>
    )
})
