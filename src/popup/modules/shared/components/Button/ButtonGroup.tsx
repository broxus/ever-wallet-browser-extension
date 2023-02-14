import classNames from 'classnames'
import { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{
    className?: string;
    vertical?: boolean;
}>;

export function ButtonGroup({ className, vertical, children }: Props): JSX.Element {
    return (
        <div
            className={classNames('button-group', className, {
                _vertical: vertical,
            })}
        >
            {children}
        </div>
    )
}
