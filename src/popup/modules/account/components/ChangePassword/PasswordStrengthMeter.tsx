import { useIntl } from 'react-intl'
import { Control, useWatch } from 'react-hook-form'
import { memo } from 'react'
import classNames from 'classnames'

import { PWD_MIN_LENGTH } from '@app/shared'

import { FormValue } from './ChangePasswordViewModel'
import styles from './ChangePassword.module.scss'

interface Props {
    control: Control<FormValue>
}

const ANY_NUMBER = /\d/
const ANY_LOWER = /[a-z]/
const ANY_UPPER = /[A-Z]/
const ANY_SYMBOL = /\W/

export const PasswordStrengthMeter = memo(({ control }: Props): JSX.Element => {
    const password = useWatch<FormValue>({ control, name: 'newPassword' }) ?? ''
    const intl = useIntl()
    let label = intl.formatMessage({ id: 'PWD_WEAK' }),
        strength = 0

    if (password.length >= PWD_MIN_LENGTH) {
        strength += ANY_NUMBER.test(password) ? 1 : 0
        strength += ANY_LOWER.test(password) ? 1 : 0
        strength += ANY_UPPER.test(password) ? 1 : 0
        strength += ANY_SYMBOL.test(password) ? 1 : 0

        if (strength >= 3) {
            label = intl.formatMessage({ id: 'PWD_STRONG' })
        }
        else if (strength >= 2) {
            label = intl.formatMessage({ id: 'PWD_MEDIUM' })
        }
    }

    return (
        <div className={styles.meter}>
            <div className={styles.meterLabel}>
                {label}
            </div>
            <div className={classNames(styles.meterIndicator, { [styles._active]: strength >= 1 })} />
            <div className={classNames(styles.meterIndicator, { [styles._active]: strength >= 2 })} />
            <div className={classNames(styles.meterIndicator, { [styles._active]: strength >= 3 })} />
        </div>
    )
})
