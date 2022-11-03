import { observer } from 'mobx-react-lite'

import { closeCurrentWindow } from '@app/background'
import { Loader, useViewModel } from '@app/popup/modules/shared'

import { PrepareNftTransfer } from '../PrepareNftTransfer'
import { TransferNftPageViewModel } from './TransferNftPageViewModel'

export const TransferNftPage = observer((): JSX.Element => {
    const vm = useViewModel(TransferNftPageViewModel)

    if (!vm.selectedAccount || !vm.everWalletState || !vm.nft) {
        return <Loader />
    }

    return (
        <PrepareNftTransfer
            nft={vm.nft}
            onBack={closeCurrentWindow}
        />
    )
})
