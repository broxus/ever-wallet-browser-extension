import { HTMLAttributes, PropsWithChildren } from 'react'
import classNames from 'classnames'

import styles from './Space.module.scss'

type Props = PropsWithChildren<HTMLAttributes<HTMLDivElement>> & {
    direction: 'row' | 'column';
    gap?: 'xs' | 's' | 'm' | 'l' | 'xl';
}

export function Space({ direction, gap, className, ...props }: Props) {
    return (
        <div
            {...props}
            className={classNames(
                styles.space,
                gap ? styles[`_gap-${gap}`] : null,
                styles[`_direction-${direction}`],
                className,
            )}
        />
    )
}
