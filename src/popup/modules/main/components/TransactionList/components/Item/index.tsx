import * as React from 'react'
import classNames from 'classnames'

import { Box, Icon } from '@app/popup/modules/shared'
import { TrxIcon } from '@app/popup/modules/shared/components/TrxIcon'

import styles from './index.module.scss'

type Props = {
    first?: boolean
    last?: boolean
    type: 'expired' | 'unconfirmed' | 'in' | 'out' | 'progress'
    amount?: React.ReactNode
    status?: React.ReactNode
    from?: React.ReactNode
    time?: React.ReactNode
    onClick?: () => void
}

export const TransactionItem: React.FC<Props> = ({
    first,
    last,
    type,
    amount,
    status,
    from,
    time,
    onClick,
}) => {
    const handleFocus = React.useCallback((e: React.FocusEvent<HTMLDivElement>) => {
        e.target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        })
    }, [])

    return (
        <div
            className={classNames(styles.transaction, {
                [styles.first]: first,
                [styles.last]: last,
                [styles.clickable]: !!onClick,
            })}
            onClick={onClick}
        >
            <Box className={styles.inner} onFocus={handleFocus}>
                <div className={styles.data}>
                    {type === 'expired' ? (
                        <TrxIcon color="gray">
                            <Icon icon="x" />
                        </TrxIcon>
                    ) : type === 'unconfirmed' ? (
                        <TrxIcon color="yellow">
                            <Icon icon="time" />
                        </TrxIcon>
                    ) : type === 'out' ? (
                        <TrxIcon>
                            <Icon icon="arrowOut" />
                        </TrxIcon>
                    ) : type === 'in' ? (
                        <TrxIcon color="green">
                            <Icon icon="arrowIn" />
                        </TrxIcon>
                    ) : type === 'progress' ? (
                        <TrxIcon>
                            <Icon icon="progress" />
                        </TrxIcon>
                    ) : null}

                    <div
                        className={classNames(styles.info, type === 'expired'
                            ? styles.expired
                            : type === 'unconfirmed'
                                ? styles.unconfirmed
                                : type === 'progress'
                                    ? styles.progress
                                    : type === 'out'
                                        ? styles.out
                                        : styles.in)}
                    >
                        <div className={styles.row}>
                            <div className={styles.amount}>
                                {amount}
                            </div>
                            <div className={styles.status}>
                                {status}
                            </div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.from}>
                                {from}
                            </div>
                            <div className={styles.time}>
                                {time}
                            </div>
                        </div>
                    </div>
                </div>
            </Box>
        </div>
    )
}
