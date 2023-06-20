/* eslint-disable react/no-children-prop */
import { observer } from 'mobx-react-lite'

import { useResolve } from '../../hooks'
import { NotificationStore } from '../../store'
import { Notification, ActionNotification } from '../Notification'


export const NotificationsContainer = observer((): JSX.Element => (
    <>
        {useResolve(NotificationStore).notifications.map((item) => (
            item.params.type === 'notification' ? (
                <Notification
                    key={item.id}
                    title={item.params.title}
                    children={item.params.message}
                    className={item.params.className}
                    showClose={item.params.showClose}
                    position={item.params.position ?? 'bottom'}
                    timeout={item.params.timeout ?? 3000}
                    opened={item.opened}
                    onClose={item.onClose}
                    onClosed={item.onClosed}
                />
            ) : (
                <ActionNotification
                    key={item.id}
                    action={item.params.action}
                    position={item.params.position ?? 'bottom'}
                    children={item.params.message}
                    onAction={item.params.onAction}
                    opened={item.opened}
                    onClose={item.onClose}
                    onClosed={item.onClosed}
                />
            )
        ))}
    </>
))
