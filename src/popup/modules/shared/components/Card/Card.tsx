import { DetailedHTMLProps, HTMLAttributes } from 'react'
import classNames from 'classnames'

import styles from './Card.module.scss'

type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    size?: 'xs' | 's' | 'm' | 'l';
    padding?: 'xs' | 's' | 'm' | 'l';
    // TODO: Remove secondary, tertiary
    bg?: 'secondary' | 'tertiary' | 'layer-1' | 'layer-2' | 'layer-3';
};

export function Card({
    className,
    size = 'm',
    bg = 'secondary',
    padding,
    ...props
}: Props): JSX.Element {
    return (
        <div
            className={classNames(
                styles.card,
                styles[`_size-${size}`],
                padding ? styles[`_padding-${padding}`] : null,
                styles[bg],
                className,
            )}
            {...props}
        />
    )
}
