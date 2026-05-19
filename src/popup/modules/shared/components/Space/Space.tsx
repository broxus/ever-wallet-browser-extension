import { type HTMLAttributes, type PropsWithChildren } from 'react';
import classNames from 'classnames';

import styles from './Space.module.scss';

type Props = PropsWithChildren<HTMLAttributes<HTMLDivElement>> & {
    direction: 'row' | 'column';
    align?: 'start' | 'end' | 'unset';
    gap?: 'xxs' | 'xs' | 's' | 'm' | 'l' | 'xl';
};

export function Space({ direction, gap, className, align = 'unset', ...props }: Props) {
    return (
        <div
            {...props}
            className={classNames(
                styles.space,
                gap ? styles[`_gap-${gap}`] : null,
                styles[`_direction-${direction}`],
                styles[`_align-${align}`],
                className,
            )}
        />
    );
}
