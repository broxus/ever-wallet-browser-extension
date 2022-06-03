import Close from '@app/popup/assets/img/close.svg';
import classNames from 'classnames';
import React, { memo, useEffect } from 'react';
import { Portal } from '../Portal';

import './Notification.scss';

type Props = React.PropsWithChildren<{
  className?: string;
  timeout?: number;
  title?: React.ReactNode;
  onClose: () => void;
}>;

// TODO: animation
export const Notification = memo((props: Props) => {
  const {
    className,
    title,
    children,
    timeout,
    onClose,
  } = props;

  useEffect(() => {
    const id: any = timeout ? setTimeout(onClose, timeout) : undefined;
    return () => clearTimeout(id);
  }, [timeout]);

  return (
    <Portal id="notification-container">
      <div className={classNames('notification', className)}>
        {title && (<h3 className="notification__title">{title}</h3>)}
        <div className="notification__content">
          {children}
        </div>
        <button className="notification__close" type="button" onClick={onClose}>
          <img src={Close} alt="close" />
        </button>
      </div>
    </Portal>
  );
});
