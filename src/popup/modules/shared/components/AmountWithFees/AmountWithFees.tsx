import { ReactNode } from 'react'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { convertEvers } from '@app/shared'

import { useResolve } from '../../hooks'
import { ConnectionStore } from '../../store'
import { Amount } from '../Amount'
import styles from './AmountWithFees.module.scss'

interface Props {
    value: string;
    currency?: string;
    className?: string;
    icon?: ReactNode;
    fees?: string;
    error?: ReactNode;
}

export const AmountWithFees = observer((props: Props) => {
    const { fees, error, className, ...amount } = props
    const { symbol, decimals } = useResolve(ConnectionStore)
    const intl = useIntl()

    return (
        <div className={classNames(styles.container, className)}>
            <Amount precise className={styles.amount} {...amount} />
            {!error && (
                <div className={styles.fees}>
                    {intl.formatMessage({ id: 'NETWORK_FEE_LABEL' })}
                    &nbsp;
                    {fees
                        ? <Amount approx value={convertEvers(decimals, fees)} currency={symbol} />
                        : intl.formatMessage({ id: 'CALCULATING_HINT' })}
                </div>
            )}
            {error}
        </div>
    )
})
