import { memo } from 'react'
import classNames from 'classnames'

import { trimTokenName } from '@app/shared'

import styles from './Amount.module.scss'

interface Props {
    value: string;
    currency: string;
    className?: string;
    approx?: boolean;
}

export const Amount = memo(({ value, currency, className, approx }: Props) => (
    <span className={classNames(styles.amount, className)} title={`${value} ${currency}`}>
        <span className={styles.value}>{approx && '~'}{value}</span>
        &nbsp;
        <span className={styles.currency}>
            {currency.length >= 10 ? trimTokenName(currency) : currency}
        </span>
    </span>
))
