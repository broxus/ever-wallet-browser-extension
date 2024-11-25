import { forwardRef, memo } from 'react'
import { FormattedMessage } from 'react-intl'
import type { Components } from 'react-virtuoso'


import { Icon } from '@app/popup/modules/shared'

import styles from './EmptyHistory.module.scss'

export const EmptyHistory = memo(() => (
    <div className={styles.empty}>
        <Icon icon="zap" />
        <FormattedMessage id="TRANSACTIONS_LIST_HISTORY_IS_EMPTY" />
    </div>
))

// react-virtuoso
export const EmptyPlaceholder = EmptyHistory as Components['EmptyPlaceholder']

export const Scroller: Components['Scroller'] = forwardRef((props, ref) => (
    <div {...props} ref={ref} className={styles.scroller} />
))
// react-virtuoso
