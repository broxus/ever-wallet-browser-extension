import classNames from 'classnames'
import { ForwardedRef, forwardRef, HTMLAttributes, memo } from 'react'

import './Container.scss'

type Props = HTMLAttributes<HTMLElement>;

function ContainerImpl({ className, ...props }: Props, ref: ForwardedRef<HTMLDivElement>): JSX.Element {
    return <div className={classNames('layout-container', className)} ref={ref} {...props} />
}

export const Container = memo(forwardRef(ContainerImpl))
