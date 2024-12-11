import * as React from 'react'
import classNames from 'classnames'

import { Space } from '@app/popup/modules/shared'

import styles from './index.module.scss'

type Props = {
    leftIcon?: React.ReactNode
    title?: React.ReactNode
    info?: React.ReactNode
    rightIcon?: React.ReactNode
    active?: boolean
    onClick?: () => void
}

export const AccountsListItem: React.FC<Props> = ({
    leftIcon,
    title,
    info,
    rightIcon,
    active,
    onClick,
}) => {
    const inner = (
        <>
            <div className={styles.main}>
                {leftIcon}
                {title && info ? (
                    <div>
                        <div className={styles.title}>
                            {title}
                        </div>
                        <Space
                            gap="xs"
                            direction="row"
                            className={styles.info}
                        >
                            {info}
                        </Space>
                    </div>
                ) : (
                    <div className={styles.seed}>
                        {title}
                    </div>
                )}

            </div>
            {rightIcon}
        </>
    )

    return onClick ? (
        <button
            className={classNames(styles.item, styles.clickable, active ? styles.active : null)}
            onClick={onClick}
        >
            {inner}
        </button>
    ) : (
        <div className={classNames(styles.item, active ? styles.active : null)}>
            {inner}
        </div>
    )
}
