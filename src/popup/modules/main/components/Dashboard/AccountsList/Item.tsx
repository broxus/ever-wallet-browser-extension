import * as React from 'react'
import classNames from 'classnames'

import { Icon, Space } from '@app/popup/modules/shared'

import styles from './AccountList.module.scss'

type Props = {
    external?: boolean
    heading?: React.ReactNode
    title?: React.ReactNode
    info?: React.ReactNode
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    active?: boolean
    className?: string
    onClick?: () => void
}

export const AccountsListItem: React.FC<Props> = ({
    external,
    heading,
    title,
    info,
    leftIcon,
    rightIcon,
    active,
    className,
    onClick,
}) => {
    const inner = (
        <>
            <div className={styles.main}>
                {leftIcon}
                {heading && (
                    <div className={styles.heading}>
                        {heading}
                    </div>
                )}

                {title || info ? (
                    <div>
                        {title && (
                            <div className={styles.title}>
                                {title}
                                {external && (
                                    <Icon icon="usersRound" width={16} height={16} />
                                )}
                            </div>
                        )}
                        {info && (
                            <Space
                                gap="xs"
                                direction="row"
                                className={styles.info}
                            >
                                {info}
                            </Space>
                        )}
                    </div>
                ) : null}
            </div>
            {rightIcon}
        </>
    )

    return onClick ? (
        <button
            className={classNames(className, styles.item, styles.clickable, active ? styles.active : null)}
            onClick={onClick}
        >
            {inner}
        </button>
    ) : (
        <div className={classNames(className, styles.item, active ? styles.active : null)}>
            {inner}
        </div>
    )
}
