import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Notification, useViewModel } from '@app/popup/modules/shared'

import { NftNotificationContainerViewModel } from './NftNotificationContainerViewModel'

export const NftNotificationContainer = observer((): JSX.Element => {
    const vm = useViewModel(NftNotificationContainerViewModel)
    const intl = useIntl()

    return (
        <Notification
            action={intl.formatMessage({ id: 'UNDO_BTN_TEXT' })}
            opened={vm.opened}
            onAction={vm.handleUndo}
            onClosed={vm.handleClosed}
        >
            {intl.formatMessage({ id: 'NFT_COLLECTION_HIDDEN_TEXT' })}
        </Notification>
    )
})
