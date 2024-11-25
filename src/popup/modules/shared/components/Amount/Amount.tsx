import React, { memo, ReactNode } from 'react'
import classNames from 'classnames'

import { formatCurrency, trimTokenName } from '@app/shared'

import styles from './Amount.module.scss'

interface Props {
    value: string;
    currency?: string;
    className?: string;
    approx?: boolean;
    precise?: boolean;
    icon?: ReactNode;
    prefix?: string;
    intClassName?: string;
    fracClassName?: string;
}

export const Amount = memo(({
    value, currency, className, approx, precise, icon, prefix, intClassName, fracClassName,
}: Props) => {
    const [int, frac] = React.useMemo(() => (
        formatCurrency(value, precise).split('.')
    ), [value, precise])

    return (
        <span className={classNames(styles.amount, className)} title={`${value} ${currency}`}>
            {icon && (
                <span className={styles.icon}>{icon}</span>
            )}
            <span className={styles.value}>
                <span className={intClassName}>
                    {prefix}{approx && '~'}{int}
                </span>
                {frac ? (
                    <span className={fracClassName}>
                        .{frac}
                    </span>
                ) : null}
            </span>
            {currency && (
                <>
                    &nbsp;
                    <span className={styles.currency}>
                        {currency.length >= 10 ? trimTokenName(currency) : currency}
                    </span>
                </>
            )}
        </span>
    )
})
