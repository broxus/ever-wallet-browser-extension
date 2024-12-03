import * as React from 'react'
import classNames from 'classnames'

import styles from './FooterActions.module.scss'

type Props = {
    buttons: React.ReactNode[]
}

export const FooterAction: React.FC<Props> = ({ buttons }) => (
    <div className={classNames(styles.root, buttons.length > 1 ? styles.wide : null)}>
        <div className={styles.inner}>
            {buttons}
        </div>
    </div>
)
