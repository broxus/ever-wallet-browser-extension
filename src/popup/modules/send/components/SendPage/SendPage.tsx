import { observer } from 'mobx-react-lite'

import { closeCurrentWindow } from '@app/shared'
import { Loader, useViewModel } from '@app/popup/modules/shared'

import { PrepareMessage } from '../PrepareMessage'
import { SendResult } from '../SendResult'
import { SendPageViewModel } from './SendPageViewModel'

export const SendPage = observer((): JSX.Element => {
    const vm = useViewModel(SendPageViewModel)

    if (!vm.selectedAccount || !vm.everWalletState || !vm.initialSelectedAsset) {
        return <Loader />
    }

    if (vm.messageParams) {
        return (
            <SendResult
                recipient={vm.messageParams.recipient}
                onClose={closeCurrentWindow}
            />
        )
    }

    return (
        <PrepareMessage
            defaultAsset={vm.initialSelectedAsset}
            defaultAddress={vm.initialSelectedAddress}
            onBack={closeCurrentWindow}
            onSend={vm.handleSend}
        />
    )
})
