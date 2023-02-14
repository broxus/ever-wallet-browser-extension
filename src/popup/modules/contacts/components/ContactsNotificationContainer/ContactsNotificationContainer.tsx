import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Notification, UndoNotification, useViewModel } from '@app/popup/modules/shared'

import { ContactsNotificationContainerViewModel } from './ContactsNotificationContainerViewModel'

interface Props {
    offset?: boolean;
}

export const ContactsNotificationContainer = observer(({ offset }: Props): JSX.Element | null => {
    const vm = useViewModel(ContactsNotificationContainerViewModel)
    const intl = useIntl()
    const position = offset ? 'bottom-offset' : 'bottom'

    return (
        <>
            <UndoNotification
                position={position}
                opened={vm.undoOpened}
                onClose={vm.handleCloseUndo}
                onUndo={vm.handleUndo}
            >
                {intl.formatMessage({ id: 'CONTACT_CONTACT_DELETED' })}
            </UndoNotification>

            <Notification
                timeout={2000}
                showClose={false}
                position={position}
                opened={vm.addedOpened}
                onClose={vm.handleCloseAdded}
            >
                {intl.formatMessage({ id: 'CONTACT_CONTACT_ADDED' })}
            </Notification>
        </>
    )
})
