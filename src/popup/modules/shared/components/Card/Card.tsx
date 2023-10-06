import { DetailedHTMLProps, HTMLAttributes } from 'react'
import classNames from 'classnames'

import styles from './Card.module.scss'

type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    size?: 's' | 'm' | 'l';
}

// TODO: refactor all `<div className={styles.pane}` to `<Card`
export function Card({ className, size = 'm', ...props }: Props): JSX.Element {
    return (
        <div
            className={classNames(styles.card, styles[`_size-${size}`], className)}
            {...props}
        />
    )
}
