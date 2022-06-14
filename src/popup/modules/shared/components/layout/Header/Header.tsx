import classNames from 'classnames';
import React, { HTMLAttributes, memo } from 'react';

import './Header.scss';

type Props = HTMLAttributes<HTMLElement>;

export const Header = memo(({ className, ...props }: Props): JSX.Element => (
  <header className={classNames('header', className)} {...props} />
));
