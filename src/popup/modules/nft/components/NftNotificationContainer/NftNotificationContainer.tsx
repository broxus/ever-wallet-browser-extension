import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { ActionNotification, useViewModel } from '@app/popup/modules/shared'

import { NftNotificationContainerViewModel } from './NftNotificationContainerViewModel'

export const NftNotificationContainer = observer((): JSX.Element => {
    const vm = useViewModel(NftNotificationContainerViewModel)
    const intl = useIntl()

    return (
        <ActionNotification
            action={intl.formatMessage({ id: 'UNDO_BTN_TEXT' })}
            opened={vm.opened}
            onClose={vm.handleClose}
            onAction={vm.handleUndo}
        >
            {intl.formatMessage({ id: 'NFT_COLLECTION_HIDDEN_TEXT' })}
        </ActionNotification>
    )
})
