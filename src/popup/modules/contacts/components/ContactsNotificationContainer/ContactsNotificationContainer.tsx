import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Notification, UndoNotification, useViewModel } from '@app/popup/modules/shared'

import { ContactsNotificationContainerViewModel } from './ContactsNotificationContainerViewModel'

export const ContactsNotificationContainer = observer((): JSX.Element | null => {
    const vm = useViewModel(ContactsNotificationContainerViewModel)
    const intl = useIntl()

    return (
        <>
            <UndoNotification
                position="bottom"
                opened={vm.undoOpened}
                onClose={vm.handleCloseUndo}
                onUndo={vm.handleUndo}
            >
                {intl.formatMessage({ id: 'CONTACT_CONTACT_DELETED' })}
            </UndoNotification>

            <Notification
                timeout={2000}
                position="bottom"
                opened={vm.addedOpened}
                onClose={vm.handleCloseAdded}
            >
                {intl.formatMessage({ id: 'CONTACT_CONTACT_ADDED' })}
            </Notification>
        </>
    )
})
