import classNames from 'classnames'
import {
    forwardRef,
    InputHTMLAttributes,
    ReactNode,
} from 'react'

import './Input.scss'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size'> & {
    prefix?: ReactNode,
    suffix?: ReactNode,
    extra?: ReactNode,
    size?: 's' | 'm',
};

export const Input = forwardRef<HTMLInputElement, Props>((props, ref): JSX.Element => {
    const {
        type = 'text',
        size = 'm',
        prefix,
        suffix,
        extra,
        className,
        ...inputProps
    } = props

    return (
        <div className={classNames('input', className, `_type-${type}`, `_size-${size}`)}>
            <div className="input__container">
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
            {extra && <div className="input__extra">{extra}</div>}
        </div>
    )
})
