import * as React from 'react'
import classNames from 'classnames'

import { Icon } from '@app/popup/modules/shared/components/Icon'

import styles from './Alert.module.scss'

type Props = {
    showIcon?: boolean
    title?: React.ReactNode
    body?: React.ReactNode
    type?: 'error' | 'warning' | 'success' | 'neutral'
    size?: 'm' | 's'
}

export const Alert: React.FC<Props> = ({
    showIcon = true,
    body,
    title,
    type = 'error',
    size = 'm',
}) => (
    <div className={classNames(styles.root, styles[type], styles[size])}>
        {showIcon && (
            <Icon
                icon="triangleAlert" width={20} height={20}
                className={styles.icon}
            />
        )}
        <div className={styles.content}>
            {title && (
                <div className={styles.title}>{title}</div>
            )}
            {body && (
                <div className={styles.body}>{body}</div>
            )}
        </div>
    </div>
)
