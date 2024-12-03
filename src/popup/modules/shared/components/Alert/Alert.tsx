import * as React from 'react'
import classNames from 'classnames'

import { Icon } from '@app/popup/modules/shared/components/Icon'

import styles from './Alert.module.scss'

type Props = {
    title?: React.ReactNode
    body?: React.ReactNode
    type?: 'error' | 'warning' | 'success' | 'neutral'
}

export const Alert: React.FC<Props> = ({
    body,
    title,
    type = 'error',
}) => (
    <div className={classNames(styles.root, styles[type])}>
        <Icon
            icon="triangleAlert" width={20} height={20}
            className={styles.icon}
        />
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
