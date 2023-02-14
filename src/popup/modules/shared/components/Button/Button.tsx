import classNames from 'classnames'
import { ButtonHTMLAttributes, forwardRef } from 'react'

import { useRipple } from '../../hooks'

import './Button.scss'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    design?: 'primary' | 'secondary' | 'dark' | 'primary-light' | 'error';
    size?: 's' | 'm' | 'l';
    group?: 'default' | 'small';
};

export const Button = forwardRef<HTMLButtonElement, Props>((props, ref): JSX.Element => {
    const {
        children,
        className,
        size = 'm',
        design = 'primary',
        type = 'button',
        group = 'default',
        ...rest
    } = props

    const ripple = useRipple()
    const styles = classNames('button', className, `_design-${design}`, `_size-${size}`, `_group-${group}`)

    return (
        <button
            {...rest}
            ref={ref}
            type={type}
            className={styles}
            onMouseDown={ripple.create}
            onMouseLeave={ripple.remove}
            onMouseUp={ripple.remove}
        >
            <div className="button__content">{children}</div>
        </button>
    )
})
