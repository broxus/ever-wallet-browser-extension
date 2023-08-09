import { forwardRef, memo, PropsWithChildren } from 'react'
import { FormattedMessage } from 'react-intl'
import type { Components } from 'react-virtuoso'

import EmptySrc from '@app/popup/assets/img/empty@2x.png'

import styles from './Empty.module.scss'

export const Empty = memo(({ children }: PropsWithChildren) => (
    <div className={styles.empty}>
        <img className={styles.img} src={EmptySrc} alt="" />
        <p className={styles.text}>
            {children ?? <FormattedMessage id="EMPTY_TEXT" values={{ br: <br /> }} />}
        </p>
    </div>
))

// react-virtuoso
export const EmptyPlaceholder = Empty as Components['EmptyPlaceholder']

export const Scroller: Components['Scroller'] = forwardRef((props, ref) => {
    return (
        <div {...props} ref={ref} className={styles.scroller} />
    )
})
// react-virtuoso
