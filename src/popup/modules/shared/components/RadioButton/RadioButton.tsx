import classNames from 'classnames';
import React, { memo } from 'react';

import './RadioButton.scss';

type RadioButtonValue = string | number | ReadonlyArray<string> | undefined;

type Props<T> = React.PropsWithChildren<{
  disabled?: boolean;
  className?: string;
  id: string;
  value: T;
  checked: boolean;
  onChange: (value: T) => void;
}>;

function InternalRadioButton<T extends RadioButtonValue>(props: Props<T>): JSX.Element {
  const { className, checked, disabled, id, value, children, onChange } = props;

  return (
    <label
      className={classNames('radio-button', className, {
        _checked: checked,
        _disabled: disabled,
      })}
      htmlFor={id}
    >
      <input
        type="radio"
        className="radio-button__input"
        id={id}
        value={value}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange(value)}
      />
      <div className="radio-button__box" />
      {children}
    </label>
  );
}

export const RadioButton = memo(InternalRadioButton) as typeof InternalRadioButton;
