import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Notification, useViewModel } from '@app/popup/modules/shared'

import { NftNotificationContainerViewModel } from './NftNotificationContainerViewModel'

import './NftNotificationContainer.scss'

export const NftNotificationContainer = observer((): JSX.Element => {
    const vm = useViewModel(NftNotificationContainerViewModel)
    const intl = useIntl()

    return (
        <Notification position="bottom" opened={vm.opened}>
            <div className="nft-notification">
                {intl.formatMessage({ id: 'NFT_COLLECTION_HIDDEN_TEXT' })}
                <button className="nft-notification__undo" type="button" onClick={vm.undo}>
                    {intl.formatMessage({ id: 'UNDO_BTN_TEXT' })}
                </button>
            </div>
        </Notification>
    )
})
