import classNames from 'classnames'
import { PropsWithChildren } from 'react'

import styles from './Button.module.scss'

type Props = PropsWithChildren<{
    className?: string;
    vertical?: boolean;
}>;

// TODO: remove
export function ButtonGroup({ className, vertical, children }: Props): JSX.Element {
    return (
        <div
            className={classNames(styles.group, className, {
                [styles._vertical]: vertical,
            })}
        >
            {children}
        </div>
    )
}
