import React, { memo } from 'react';
import classNames from 'classnames';

import './Checkbox.scss';

interface Props {
  id?: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}

export const Checkbox = memo(({ id, checked, disabled, onChange }: Props): JSX.Element => {
  const onToggle = () => {
    onChange?.(!checked);
  };

  return (
    <label
      className={classNames('checkbox', {
        _disabled: disabled,
      })}
    >
      <input
        id={id}
        type="checkbox"
        className="checkbox__input"
        checked={checked}
        onChange={onToggle}
        disabled={disabled}
      />
      <span className="checkbox__checkmark" />
    </label>
  );
});
