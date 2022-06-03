import classNames from 'classnames';
import React, { forwardRef } from 'react';
import { CSSTransition } from 'react-transition-group';

import './Dropdown.scss';

type Props = React.PropsWithChildren<{
  className?: string;
  active: boolean;
}>;

export const Dropdown = forwardRef<HTMLDivElement, Props>(({ active, className, children }: Props, ref): JSX.Element => (
  <CSSTransition mountOnEnter unmountOnExit in={active} timeout={150} classNames="dropdown-transition">
    <div className={classNames('dropdown', className)} ref={ref}>
      {children}
    </div>
  </CSSTransition>
));
