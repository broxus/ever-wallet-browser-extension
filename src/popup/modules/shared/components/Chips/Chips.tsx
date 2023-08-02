import { memo, PropsWithChildren } from 'react'
import classNames from 'classnames'

import styles from './Chips.module.scss'

type Props = PropsWithChildren<{
    type: 'default' | 'success' | 'warning' | 'error';
    className?: string;
}>

export const Chips = memo(({ type, className, children }: Props): JSX.Element => (
    <span className={classNames(styles.chips, styles[`_type-${type}`], className)}>
        {children}
    </span>
))
