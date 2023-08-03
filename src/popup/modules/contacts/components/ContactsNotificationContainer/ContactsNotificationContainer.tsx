import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import CheckIcon from '@app/popup/assets/icons/check-circle.svg'
import { Notification, useViewModel } from '@app/popup/modules/shared'

import { ContactsNotificationContainerViewModel } from './ContactsNotificationContainerViewModel'

export const ContactsNotificationContainer = observer((): JSX.Element | null => {
    const vm = useViewModel(ContactsNotificationContainerViewModel)
    const intl = useIntl()

    return (
        <>
            <Notification
                action={intl.formatMessage({ id: 'UNDO_BTN_TEXT' })}
                opened={vm.undoOpened}
                onClose={vm.handleCloseUndo}
                onAction={vm.handleUndo}
            >
                {intl.formatMessage({ id: 'CONTACT_CONTACT_DELETED' })}
            </Notification>

            <Notification
                type="success"
                opened={vm.addedOpened}
                onClose={vm.handleCloseAdded}
            >
                <CheckIcon />
                {intl.formatMessage({ id: 'CONTACT_CONTACT_ADDED' })}
            </Notification>
        </>
    )
})
