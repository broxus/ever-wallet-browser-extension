import classNames from 'classnames'
import { forwardRef, InputHTMLAttributes, ReactNode } from 'react'

import './Input.scss'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size'> & {
    size?: 's' | 'm',
    design?: 'default' | 'gray',
    prefix?: ReactNode,
    suffix?: ReactNode,
};

export type InputProps = Props

export const Input = forwardRef<HTMLInputElement, Props>((props, ref): JSX.Element => {
    const {
        type = 'text',
        size = 'm',
        design = 'default',
        prefix,
        suffix,
        className,
        ...inputProps
    } = props

    return (
        <div className={classNames('input', `_size-${size}`, `_design-${design}`, className)}>
            {prefix && <div className="input__prefix">{prefix}</div>}

            <input
                className="input__inner"
                autoComplete="off"
                ref={ref}
                type={type}
                spellCheck={false}
                step={0.000000000000000001}
                {...inputProps}
            />
            {suffix && <div className="input__suffix">{suffix}</div>}
        </div>
    )
})
