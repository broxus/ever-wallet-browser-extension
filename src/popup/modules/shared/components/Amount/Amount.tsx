import React, { memo, ReactNode } from 'react'
import classNames from 'classnames'

import { formatCurrency, formatFiat, trimTokenName } from '@app/shared'

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
    isFiat?: boolean;
    disableFormatting?: boolean;
}

export const Amount = memo(({
    value, currency, className, approx, precise, icon, prefix, intClassName, fracClassName, isFiat, disableFormatting,
}: Props) => {
    const [int, frac] = disableFormatting ? value.split('.') : isFiat ? formatFiat(value).split('.') : formatCurrency(value, precise).split('.')


    const isNeedApprox = approx && !!Number(int)

    return (
        <span className={classNames(styles.amount, className)} title={`${value} ${currency}`}>
            {icon && (
                <span className={styles.icon}>{icon}</span>
            )}
            <span className={styles.value}>
                <span className={intClassName}>
                    {prefix}{isNeedApprox && '~'}{int}
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
