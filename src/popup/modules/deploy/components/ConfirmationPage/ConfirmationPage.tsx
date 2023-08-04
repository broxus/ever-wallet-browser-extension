import { observer } from 'mobx-react-lite'

import { useViewModel } from '@app/popup/modules/shared'

import { PreparedMessage } from '../PreparedMessage'
import { ConfirmationPageViewModel } from './ConfirmationPageViewModel'

export const ConfirmationPage = observer((): JSX.Element | null => {
    const vm = useViewModel(ConfirmationPageViewModel)

    return (
        <PreparedMessage
            keyEntry={vm.store.selectedDerivedKeyEntry!}
            balance={vm.store.everWalletState?.balance}
            fees={vm.store.fees}
            custodians={vm.store.multisigData?.custodians}
            loading={vm.loading}
            error={vm.error}
            currencyName={vm.store.nativeCurrency}
            onSubmit={vm.submit}
            onBack={vm.handleBack}
        />
    )
})
