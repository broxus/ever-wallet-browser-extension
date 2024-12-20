import * as React from 'react'

import styles from './Menu.module.scss'

export const Menu: React.FC<React.PropsWithChildren> = ({
    children,
}) => (
    <div className={styles.root}>
        {children}
    </div>
)
