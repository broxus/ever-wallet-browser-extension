import * as React from 'react'
import classNames from 'classnames'

import styles from './FooterActions.module.scss'

type Props = {
    dir?: 'row' | 'column'
    buttons: React.ReactNode[]
}

export const FooterAction: React.FC<Props> = ({ buttons, dir = 'row' }) => (
    <div
        className={classNames(
            styles.root,
            buttons.length > 1 ? styles.wide : null,
            styles[dir],
        )}
    >
        <div className={styles.inner}>
            {buttons}
        </div>
    </div>
)
