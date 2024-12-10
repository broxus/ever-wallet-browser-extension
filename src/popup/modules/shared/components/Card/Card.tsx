import { DetailedHTMLProps, HTMLAttributes } from 'react'
import classNames from 'classnames'

import styles from './Card.module.scss'

type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    size?: 'xs' | 's' | 'm' | 'l';
    // TODO: Remove secondary, tertiary
    bg?: 'secondary' | 'tertiary' | 'layer-1' | 'layer-2'
}

export function Card({ className, size = 'm', bg = 'secondary', ...props }: Props): JSX.Element {
    return (
        <div
            className={classNames(styles.card, styles[`_size-${size}`], styles[bg], className)}
            {...props}
        />
    )
}
