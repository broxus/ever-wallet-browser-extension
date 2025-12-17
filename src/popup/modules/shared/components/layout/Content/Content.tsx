import classNames from 'classnames'
import { type HTMLAttributes, memo } from 'react'

import './Content.scss'

type Props = HTMLAttributes<HTMLElement>

export const Content = memo(({ className, ...props }: Props) => (
    <div className={classNames('layout-content', className)} {...props} />
))
