import classNames from 'classnames'
import { type HTMLAttributes, type Ref } from 'react'

import './Container.scss'

type Props = HTMLAttributes<HTMLElement> & {
    ref?: Ref<HTMLDivElement>
}

export function Container({ className, ...props }: Props) {
    return <div className={classNames('layout-container', className)} {...props} />
}
