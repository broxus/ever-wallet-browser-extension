import * as React from 'react'
import { memo } from 'react'
import classNames from 'classnames'

import { Notification } from './Notification'
import './Notification.scss'

type Props = React.PropsWithChildren<{
    opened: boolean;
    action: string;
    position?: 'top' | 'bottom';
    onAction(): void;
    onClose?(): void;
    onClosed?(): void;
}>;

export const ActionNotification = memo(({ children, opened, position, action, onClose, onClosed, onAction }: Props) => (
    <Notification
        className={classNames('action-notification')}
        position={position ?? 'bottom'}
        timeout={3000}
        opened={opened}
        onClose={onClose}
        onClosed={onClosed}
    >
        <div className="action-notification__content">
            {children}
            <button className="action-notification__btn" type="button" onClick={onAction}>
                {action}
            </button>
        </div>
    </Notification>
))
