import { observer } from 'mobx-react-lite'

import { closeCurrentWindow } from '@app/shared'
import { Loader, useViewModel } from '@app/popup/modules/shared'

import { PrepareMessage } from '../PrepareMessage'
import { SendPageViewModel } from './SendPageViewModel'

export const SendPage = observer((): JSX.Element => {
    const vm = useViewModel(SendPageViewModel)

    if (!vm.selectedAccount || !vm.everWalletState || !vm.initialSelectedAsset) {
        return <Loader />
    }

    return (
        <PrepareMessage
            defaultAsset={vm.initialSelectedAsset}
            onBack={closeCurrentWindow}
        />
    )
})
