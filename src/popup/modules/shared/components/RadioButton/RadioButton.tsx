import classNames from 'classnames';
import React, { memo } from 'react';

import './RadioButton.scss';

type RadioButtonValue = string | number | ReadonlyArray<string> | undefined;

type Props<T> = React.PropsWithChildren<{
  id: string;
  onChange: (value: T) => void;
  value: T;
  disabled?: boolean;
  checked: boolean;
}>;

function RB<T extends RadioButtonValue>(props: Props<T>): JSX.Element {
  const { checked, disabled, id, value, children, onChange } = props;

  return (
    <label
      className={classNames('radio-button', {
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

export const RadioButton = memo(RB) as typeof RB;
