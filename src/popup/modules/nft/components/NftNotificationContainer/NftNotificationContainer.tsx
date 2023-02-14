import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { UndoNotification, useViewModel } from '@app/popup/modules/shared'

import { NftNotificationContainerViewModel } from './NftNotificationContainerViewModel'

export const NftNotificationContainer = observer((): JSX.Element => {
    const vm = useViewModel(NftNotificationContainerViewModel)
    const intl = useIntl()

    return (
        <UndoNotification
            opened={vm.opened}
            onClose={vm.handleClose}
            onUndo={vm.handleUndo}
        >
            {intl.formatMessage({ id: 'NFT_COLLECTION_HIDDEN_TEXT' })}
        </UndoNotification>
    )
})
