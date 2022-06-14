/* eslint-disable jsx-a11y/control-has-associated-label */
import classNames from 'classnames';
import React, { memo } from 'react';

import './Switch.scss';

type Props = React.PropsWithChildren<{
  id?: string;
  className?: string;
  disabled?: boolean,
  checked: boolean;
  onChange: (checked: boolean) => void;
}>;

export const Switch = memo(({ id, className, disabled, checked, children, onChange }: Props): JSX.Element => {
  const cls = classNames('switch', className, {
    _checked: checked,
    _disabled: disabled,
  });

  return (
    <label className={cls} htmlFor={id}>
      <button
        id={id}
        type="button"
        className="switch__btn"
        disabled={disabled}
        onClick={() => onChange(!checked)}
      />
      {children && <span className="switch__content">{children}</span>}
    </label>
  );
});
