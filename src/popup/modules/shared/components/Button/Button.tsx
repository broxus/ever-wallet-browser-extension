import classNames from 'classnames'
import { ButtonHTMLAttributes, forwardRef } from 'react'

import { Loader } from '../Loader'
import './Button.scss'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    design?: 'primary' | 'secondary' | 'ghost' | 'alert' | 'contrast';
    size?: 's' | 'm' | 'l';
    group?: 'default' | 'small'; // TODO: remove
    loading?: boolean; // TODO
};

export const Button = forwardRef<HTMLButtonElement, Props>((props, ref): JSX.Element => {
    const {
        children,
        className,
        size = 'l',
        design = 'primary',
        type = 'button',
        group = 'default',
        loading = false,
        ...rest
    } = props

    const styles = classNames('button', className, `_design-${design}`, `_size-${size}`, `_group-${group}`)

    return (
        <button
            {...rest}
            ref={ref}
            type={type}
            className={styles}
        >
            {loading && <Loader />}
            {!loading && children}
        </button>
    )
})
