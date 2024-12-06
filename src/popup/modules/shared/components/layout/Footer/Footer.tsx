import classNames from 'classnames'
import { HTMLAttributes, memo } from 'react'

import './Footer.scss'

type Props = HTMLAttributes<HTMLElement> & {
    // TODO: Remove
    background?: boolean;
    // TODO: Remove
    layer?: boolean;
};

export const Footer = memo(({ className, background, layer, ...props }: Props): JSX.Element => (
    <footer className={classNames('layout-footer', { _background: background, layer }, className)} {...props} />
))
