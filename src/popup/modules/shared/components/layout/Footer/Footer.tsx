import classNames from 'classnames'
import { HTMLAttributes, memo } from 'react'

import './Footer.scss'

type Props = HTMLAttributes<HTMLElement> & {
    background?: boolean;
};

export const Footer = memo(({ className, background, ...props }: Props): JSX.Element => (
    <footer className={classNames('layout-footer', { _background: background }, className)} {...props} />
))
