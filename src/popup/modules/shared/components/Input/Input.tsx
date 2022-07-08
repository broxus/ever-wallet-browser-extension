import classNames from 'classnames';
import React, { FocusEventHandler, forwardRef, InputHTMLAttributes, ReactNode, useCallback, useState } from 'react';

import './Input.scss';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> & {
  prefix?: ReactNode,
  suffix?: ReactNode,
};

export const Input = forwardRef<HTMLInputElement, Props>((props, ref): JSX.Element => {
  const { prefix, suffix, className, onFocus, onBlur, ...inputProps } = props;
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback<FocusEventHandler<HTMLInputElement>>((e) => {
    setFocused(true);
    onFocus?.(e);
  }, [onFocus]);
  const handleBlur = useCallback<FocusEventHandler<HTMLInputElement>>((e) => {
    setFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  return (
    <div className={classNames('input', className, { _focused: focused })}>
      {prefix && <div className="input__prefix">{prefix}</div>}
      <input
        className="input__inner"
        autoComplete="off"
        ref={ref}
        spellCheck={false}
        step={0.000000000000000001}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...inputProps}
      />
      {suffix && <div className="input__suffix">{suffix}</div>}
    </div>
  );
});
