import { forwardRef, memo, PropsWithChildren } from 'react'
import { FormattedMessage } from 'react-intl'
import type { Components } from 'react-virtuoso'

import EmptySrc from '@app/popup/assets/img/logo-gray@2x.png'

import styles from './EmptyHistory.module.scss'

export const EmptyHistory = memo(({ children }: PropsWithChildren) => (
    <div className={styles.empty}>
        <img className={styles.img} src={EmptySrc} alt="" />
        <p className={styles.text}>
            {children ?? <FormattedMessage id="TRANSACTIONS_LIST_HISTORY_IS_EMPTY" />}
        </p>
    </div>
))

// react-virtuoso
export const EmptyPlaceholder = EmptyHistory as Components['EmptyPlaceholder']

export const Scroller: Components['Scroller'] = forwardRef((props, ref) => (
    <div {...props} ref={ref} className={styles.scroller} />
))
// react-virtuoso
