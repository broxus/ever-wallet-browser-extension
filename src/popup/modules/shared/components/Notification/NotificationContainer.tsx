/* eslint-disable react/no-children-prop */
import { observer } from 'mobx-react-lite'

import { useResolve } from '../../hooks'
import { NotificationStore } from '../../store'
import { Notification } from './Notification'


export const NotificationContainer = observer((): JSX.Element => (
    <>
        {useResolve(NotificationStore).notifications.map((item) => (
            <Notification
                key={item.id}
                type={item.params.type}
                children={item.params.message}
                timeout={item.params.timeout}
                action={item.params.action}
                opened={item.opened}
                onAction={item.params.onAction}
                onClose={item.onClose}
                onClosed={item.onClosed}
            />
        ))}
    </>
))
