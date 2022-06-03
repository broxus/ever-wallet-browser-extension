import classNames from 'classnames';
import React, { forwardRef } from 'react';
import { useRipple } from '../../hooks';

import './Button.scss';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  design?: 'primary' | 'secondary' | 'dark';
  size?: 's' | 'm' | 'l';
};

export const Button = forwardRef<HTMLButtonElement, Props>((props, ref): JSX.Element => {
  const {
    children,
    disabled,
    className,
    size = 'm',
    design = 'primary',
    type = 'button',
    ...rest
  } = props;

  const ripple = useRipple();
  const styles = classNames('button', className, `_design-${design}`, `_size-${size}`);

  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      disabled={disabled}
      className={styles}
      onMouseDown={ripple.create}
      onMouseLeave={ripple.remove}
      onMouseUp={ripple.remove}
    >
      <div className="button__content">{children}</div>
    </button>
  );
});
