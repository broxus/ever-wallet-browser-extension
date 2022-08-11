import classNames from 'classnames'
import {
    FocusEventHandler,
    forwardRef,
    InputHTMLAttributes,
    ReactNode,
    useCallback,
    useState,
} from 'react'

import './Input.scss'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> & {
    prefix?: ReactNode,
    suffix?: ReactNode,
};

export const Input = forwardRef<HTMLInputElement, Props>((props, ref): JSX.Element => {
    const {
        type = 'text',
        prefix,
        suffix,
        className,
        ...inputProps
    } = props

    return (
        <div className={classNames('input', className, `_type-${type}`)}>
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
