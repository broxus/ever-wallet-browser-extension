import { DetailedHTMLProps, HTMLAttributes } from 'react'
import classNames from 'classnames'

import styles from './Card.module.scss'

type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    size?: 's' | 'm' | 'l';
    bg?: 'secondary' | 'tertiary'
}

export function Card({ className, size = 'm', bg = 'secondary', ...props }: Props): JSX.Element {
    return (
        <div
            className={classNames(styles.card, styles[`_size-${size}`], styles[bg], className)}
            {...props}
        />
    )
}
