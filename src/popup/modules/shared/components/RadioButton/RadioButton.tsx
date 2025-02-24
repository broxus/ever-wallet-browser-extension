import classNames from 'classnames'
import { memo, PropsWithChildren } from 'react'

import styles from './RadioButton.module.scss'
import { Label } from '../Label'

type RadioButtonValue = string | number | ReadonlyArray<string> | undefined;

type Props<T> = PropsWithChildren<{
    disabled?: boolean;
    className?: string;
    name?: string;
    labelPosition?: 'before' | 'after';
    value: T;
    checked: boolean;
    onChange: (value: T) => void;
}>;

function InternalRadioButton<T extends RadioButtonValue>(props: Props<T>): JSX.Element {
    const { className, checked, disabled, value, children, labelPosition, name, onChange } = props
    const cls = classNames(styles.radioButton, styles[`_label-${labelPosition ?? 'after'}`], className, {
        [styles._disabled]: disabled,
    })

    return (
        <Label className={cls} aria-disabled={disabled} tabIndex={disabled ? -1 : 0}>
            <input
                type="radio"
                className={styles.input}
                name={name}
                value={value}
                checked={checked}
                disabled={disabled}
                onChange={() => onChange(value)}
                tabIndex={-1}
            />
            <div className={styles.box} />
            {children && (
                <div className={styles.label}>{children}</div>
            )}
        </Label>
    )
}

export const RadioButton = memo(InternalRadioButton) as typeof InternalRadioButton
