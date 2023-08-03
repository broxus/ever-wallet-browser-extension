import { FC, memo, PropsWithChildren } from 'react'
import { FormattedMessage } from 'react-intl'

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

export const EmptyPlaceholder = Empty as FC // react-virtuoso
