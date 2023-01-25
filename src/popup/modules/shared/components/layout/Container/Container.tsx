import classNames from 'classnames'
import { HTMLAttributes, memo } from 'react'

import './Container.scss'

type Props = HTMLAttributes<HTMLElement>;

export const Container = memo(({ className, ...props }: Props): JSX.Element => (
    <div className={classNames('layout-container', className)} {...props} />
))
