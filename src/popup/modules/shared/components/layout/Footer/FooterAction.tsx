import * as React from 'react'
import classNames from 'classnames'

import styles from './FooterActions.module.scss'

type Props = React.PropsWithChildren<{
    dir?: 'row' | 'column'
}>

export const FooterAction: React.FC<Props> = ({ children, dir = 'row' }) => {
    const count = React.Children.toArray(children).length

    return (
        <div
            className={classNames(
                styles.root,
                count > 1 ? styles.wide : null,
                styles[dir],
            )}
        >
            <div className={styles.inner}>
                {children}
            </div>
        </div>
    )
}
