import * as React from 'react'
import { memo } from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { Notification } from './Notification'
import './Notification.scss'

type Props = React.PropsWithChildren<{
    opened: boolean;
    position?: 'top' | 'bottom' | 'bottom-offset';
    onClose(): void;
    onUndo(): void;
}>;

export const UndoNotification = memo(({ children, opened, position, onClose, onUndo }: Props) => {
    const intl = useIntl()

    return (
        <Notification
            className={classNames('undo-notification')}
            showClose={false}
            position={position ?? 'bottom'}
            timeout={3000}
            opened={opened}
            onClose={onClose}
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
