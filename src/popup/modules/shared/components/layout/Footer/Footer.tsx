import classNames from 'classnames'
import { HTMLAttributes, memo } from 'react'

import './Footer.scss'

type Props = HTMLAttributes<HTMLElement>;

export const Footer = memo(({ className, ...props }: Props): JSX.Element => (
    <footer className={classNames('footer', className)} {...props} />
))
