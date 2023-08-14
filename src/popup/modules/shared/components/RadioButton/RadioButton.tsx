import classNames from 'classnames'
import { memo, PropsWithChildren } from 'react'

import styles from './RadioButton.module.scss'

type RadioButtonValue = string | number | ReadonlyArray<string> | undefined;

type Props<T> = PropsWithChildren<{
    disabled?: boolean;
    className?: string;
    value: T;
    checked: boolean;
    labelPosition?: 'before' | 'after';
    onChange: (value: T) => void;
}>;

function InternalRadioButton<T extends RadioButtonValue>(props: Props<T>): JSX.Element {
    const { className, checked, disabled, value, children, labelPosition, onChange } = props
    const cls = classNames(styles.radioButton, styles[`_label-${labelPosition ?? 'after'}`], className, {
        [styles._disabled]: disabled,
    })

    return (
        <label className={cls} aria-disabled={disabled}>
            <input
                type="radio"
                className={styles.input}
                value={value}
                checked={checked}
                disabled={disabled}
                onChange={() => onChange(value)}
            />
            <div className={styles.box} />
            {children && (
                <div className={styles.label}>{children}</div>
            )}
        </label>
    )
}

export const RadioButton = memo(InternalRadioButton) as typeof InternalRadioButton
