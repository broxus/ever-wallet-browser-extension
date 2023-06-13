import { observer } from 'mobx-react-lite'

import { closeCurrentWindow } from '@app/shared'
import { Loader, useViewModel } from '@app/popup/modules/shared'

import { PrepareNftTransfer } from '../PrepareNftTransfer'
import { PrepareNftTokenTransfer } from '../PrepareNftTokenTransfer'
import { TransferNftPageViewModel } from './TransferNftPageViewModel'

export const TransferNftPage = observer((): JSX.Element => {
    const vm = useViewModel(TransferNftPageViewModel)

    if (!vm.selectedAccount || !vm.everWalletState || !vm.nft) {
        return <Loader />
    }

    if (vm.config.windowInfo.group === 'transfer_nft_token') {
        return (
            <PrepareNftTokenTransfer
                nft={vm.nft}
                onBack={closeCurrentWindow}
            />
        )
    }

    return (
        <PrepareNftTransfer
            nft={vm.nft}
            onBack={closeCurrentWindow}
        />
    )
})
