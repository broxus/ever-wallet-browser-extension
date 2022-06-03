import classNames from 'classnames';
import React, { forwardRef } from 'react';
import Delete from './assets/delete.svg';

import './Tag.scss';

type Props = React.PropsWithChildren<{
  className?: string;
  onRemove?: () => void;
}>;

export const Tag = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const { className, children, onRemove } = props;

  return (
    <div ref={ref} className={classNames('tag', className)}>
      {children}
      {onRemove && (
        <button type="button" className="tag__button" onClick={onRemove}>
          <img className="tag__icon" alt="delete" src={Delete} />
        </button>
      )}
    </div>
  );
});
