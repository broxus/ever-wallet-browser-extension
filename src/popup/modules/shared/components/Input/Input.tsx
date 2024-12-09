import classNames from 'classnames'
import { forwardRef, InputHTMLAttributes, ReactNode, useRef } from 'react'

import { Icons } from '@app/popup/icons'

import './Input.scss'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size'> & {
    size?: 'xs' | 's' | 'm',
    design?: 'default',
    prefix?: ReactNode,
    suffix?: ReactNode,
    showReset?: boolean,
    invalid?: boolean,
};

export type InputProps = Props

export const Input = forwardRef<HTMLInputElement, Props>((props, ref): JSX.Element => {
    const {
        type = 'text',
        size = 'm',
        design = 'default',
        showReset = false,
        prefix,
        suffix,
        className,
        invalid,
        ...inputProps
    } = props
    const _ref = useRef<HTMLInputElement>()

    const handleRef = (instance: HTMLInputElement) => {
        _ref.current = instance

        if (ref) {
            if (typeof ref === 'function') {
                ref(instance)
            }
            else {
                ref.current = instance
            }
        }
    }

    const hanleReset = () => {
        _ref.current?.focus()
        inputProps.onChange?.({
            target: {
                name: inputProps.name ?? '',
                value: '',
            },
        } as any)
    }

    const hasSuffix = !!suffix || (showReset && !!inputProps.value)
    const cls = classNames('input', `_size-${size}`, `_design-${design}`, { '_has-suffix': hasSuffix }, { _invalid: invalid }, className)

    return (
        <div className={cls}>
            {prefix && <div className="input__prefix">{prefix}</div>}
            <input
                className="input__inner"
                autoComplete="off"
                ref={handleRef}
                type={type}
                spellCheck={false}
                step={0.000000000000000001}
                {...inputProps}
            />
            {suffix && <div className="input__suffix">{suffix}</div>}
            {!suffix && showReset && inputProps.value && (
                <div className="input__suffix">
                    <button
                        type="button"
                        className="reset__reset"
                        tabIndex={-1}
                        onClick={hanleReset}
                    >
                        {Icons.cross}
                    </button>
                </div>
            )}
        </div>
    )
})
