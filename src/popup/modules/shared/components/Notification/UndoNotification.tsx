import * as React from 'react'
import { memo } from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { Notification } from './Notification'
import './Notification.scss'

type Props = React.PropsWithChildren<{
    opened: boolean;
    position?: 'top' | 'bottom';
    onUndo(): void;
    onClose?(): void;
    onClosed?(): void;
}>;

export const UndoNotification = memo(({ children, opened, position, onClose, onClosed, onUndo }: Props) => {
    const intl = useIntl()

    return (
        <Notification
            className={classNames('undo-notification')}
            position={position ?? 'bottom'}
            timeout={3000}
            opened={opened}
            onClose={onClose}
            onClosed={onClosed}
        >
            <div className="undo-notification__content">
                {children}
                <button className="undo-notification__btn" type="button" onClick={onUndo}>
                    {intl.formatMessage({ id: 'UNDO_BTN_TEXT' })}
                </button>
            </div>
        </Notification>
    )
})
