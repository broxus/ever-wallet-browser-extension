import { forwardRef, memo, PropsWithChildren } from 'react'
import { FormattedMessage } from 'react-intl'
import type { Components } from 'react-virtuoso'

import { Icon } from '@app/popup/modules/shared/components/Icon'

import styles from './Empty.module.scss'

export const Empty = memo(({ children }: PropsWithChildren) => (
    <div className={styles.empty}>
        <Icon icon="empty" width={40} height={40} />
        <p className={styles.text}>
            {children ?? <FormattedMessage id="EMPTY_TEXT" values={{ br: <br /> }} />}
        </p>
    </div>
))

// react-virtuoso
export const EmptyPlaceholder = Empty as Components['EmptyPlaceholder']

export const Scroller: Components['Scroller'] = forwardRef((props, ref) => (
    <div {...props} ref={ref} className={styles.scroller} />
))
// react-virtuoso
