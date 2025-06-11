import classNames from 'classnames'
import { forwardRef, InputHTMLAttributes, ReactNode, useRef } from 'react'

import './Input.scss'
import { Button } from '../Button'
import { Icon } from '../Icon'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix' | 'size'> & {
    size?: 'xxs' | 'xs' | 's' | 'm',
    design?: 'default',
    prefix?: ReactNode,
    suffix?: ReactNode,
    showReset?: boolean,
    showPaste?: boolean,
    invalid?: boolean,
};

export type InputProps = Props

export const Input = forwardRef<HTMLInputElement, Props>((props, ref): JSX.Element => {
    const {
        type = 'text',
        size = 'm',
        design = 'default',
        showReset = false,
        showPaste = false,
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

    const handlePaste = async () => {
        const clipboardText = await navigator.clipboard.read()

        _ref.current?.focus()
        inputProps.onChange?.({
            target: {
                name: inputProps.name ?? '',
                value: clipboardText,
            },
        } as any)
    }

    const hasSuffix = !!suffix || (showReset && !!inputProps.value) || (showPaste && !inputProps.value)
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
            {!suffix && showPaste && !inputProps.value && (
                <div className="input__suffix">
                    <Button
                        shape="square"
                        size="s"
                        design="neutral"
                        onClick={handlePaste}
                        tabIndex={-1}
                    >
                        <Icon icon="clipboard" width={16} height={16} />
                    </Button>

                </div>
            )}
            {!suffix && showReset && inputProps.value && (
                <div className="input__suffix">
                    <Button
                        shape="square"
                        size="s"
                        design="neutral"
                        onClick={hanleReset}
                        tabIndex={-1}
                    >
                        <Icon icon="cross" width={16} height={16} />
                    </Button>

                </div>
            )}
        </div>
    )
})
