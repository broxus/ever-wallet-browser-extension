import classNames from 'classnames';
import React from 'react';

import './Input.scss';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, Props>((props, ref) => (
  <input
    {...props}
    ref={ref}
    className={classNames('input', props.className)}
    spellCheck={false}
    step={0.000000000000000001}
  />
));
