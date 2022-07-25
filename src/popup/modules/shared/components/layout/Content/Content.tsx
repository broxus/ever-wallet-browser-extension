import classNames from 'classnames'
import React, { HTMLAttributes, memo } from 'react'

import './Content.scss'

type Props = HTMLAttributes<HTMLElement>;

export const Content = memo(({ className, ...props }: Props): JSX.Element => (
    <div className={classNames('content', className)} {...props} />
))
