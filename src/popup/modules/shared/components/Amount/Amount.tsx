import { memo } from 'react'
import classNames from 'classnames'

import { trimTokenName } from '@app/shared'

import styles from './Amount.module.scss'

interface Props {
    value: string;
    currency: string;
    className?: string;
}

export const Amount = memo(({ value, currency, className }: Props) => (
    <div className={classNames(styles.amount, className)} title={`${value} ${currency}`}>
        <span className={styles.value}>{value}</span>
        &nbsp;
        <span className={styles.currency}>
            {currency.length >= 10 ? trimTokenName(currency) : currency}
        </span>
    </div>
))
