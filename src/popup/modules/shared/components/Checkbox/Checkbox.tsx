import { forwardRef, InputHTMLAttributes } from 'react'
import classNames from 'classnames'

import styles from './Checkbox.module.scss'

type Props = InputHTMLAttributes<HTMLInputElement> & {
    labelPosition?: 'before' | 'after';
}

export const Checkbox = forwardRef<HTMLInputElement, Props>((props, ref): JSX.Element => {
    const { className, disabled, children, labelPosition, ...rest } = props
    const cls = classNames(styles.checkbox, styles[`_label-${labelPosition ?? 'after'}`], className, {
        _disabled: disabled,
    })

    return (
        <label className={cls}>
            <input
                type="checkbox"
                ref={ref}
                className={styles.input}
                disabled={disabled}
                {...rest}
            />
            <span className={styles.checkmark} />
            {children && <span className={styles.label}>{children}</span>}
        </label>
    )
})
