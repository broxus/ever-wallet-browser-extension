import { memo, PropsWithChildren } from 'react'
import classNames from 'classnames'

import './Badge.scss'

type Props = PropsWithChildren<{
    type: 'info' | 'error';
    className?: string;
}>

export const Badge = memo(({ type, className, children }: Props): JSX.Element => (
    <span className={classNames('badge', `_type-${type}`, className)}>
        {children}
    </span>
))
