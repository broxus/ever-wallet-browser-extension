/* eslint-disable jsx-a11y/control-has-associated-label */
import classNames from 'classnames'
import { type PropsWithChildren, type Ref } from 'react'

import './Switch.scss'

type Props = PropsWithChildren<{
    id?: string;
    className?: string;
    disabled?: boolean,
    checked: boolean;
    labelPosition?: 'before' | 'after'
    onChange: (checked: boolean) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    ref?: Ref<HTMLLabelElement> | undefined
}>

export const Switch = (props: Props) => {
    const { id, className, disabled, checked, labelPosition, children, onChange, onFocus, onBlur, ref } = props
    const cls = classNames('switch', `_label-${labelPosition ?? 'after'}`, {
        _checked: checked,
        _disabled: disabled,
    }, className)

    return (
        <label
            ref={ref}
            className={cls}
            htmlFor={id}
            onFocus={onFocus}
            onBlur={onBlur}
        >
            <button
                id={id}
                type="button"
                className="switch__btn"
                disabled={disabled}
                onClick={() => onChange(!checked)}
            >
                <span className="switch__btn-check" />
            </button>
            {children && <span className="switch__content">{children}</span>}
        </label>
    )
}
