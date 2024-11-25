import * as React from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { IconButton } from '@app/popup/modules/shared'
import { Icons } from '@app/popup/icons'

import styles from './index.module.scss'

type Props = {
    className?: string
}

export const DashboardButtons: React.FC<Props> = ({
    className,
}) => {
    const intl = useIntl()

    return (
        <div className={classNames(styles.root, className)}>
            <label className={styles.label}>
                <IconButton design="transparent" icon={Icons.currency} />
                {intl.formatMessage({ id: 'BUY_EVER_BTN_TEXT' })}
            </label>

            <label className={styles.label}>
                <IconButton design="transparent" icon={Icons.arrowDown} />
                {intl.formatMessage({ id: 'RECEIVE_BTN_TEXT' })}
            </label>

            <label className={styles.label}>
                <IconButton design="transparent" icon={Icons.arrowUp} />
                {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
            </label>
        </div>
    )
}
