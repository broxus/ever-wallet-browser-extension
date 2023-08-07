import { observer } from 'mobx-react-lite'

import { AppConfig, useResolve } from '@app/popup/modules/shared'

import { PrepareNftTokenTransfer, PrepareNftTransfer } from './components'

export const PrepareMessage = observer(() => {
    const config = useResolve(AppConfig)

    if (config.windowInfo.group === 'transfer_nft_token') {
        return (
            <PrepareNftTokenTransfer />
        )
    }

    return (
        <PrepareNftTransfer />
    )
})
