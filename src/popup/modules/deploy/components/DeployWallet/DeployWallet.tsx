import { observer } from 'mobx-react-lite'

import { useViewModel } from '@app/popup/modules/shared'

import { DeployPreparedMessage, DeploySelectType } from './components'
import { DeployWalletViewModel, Step } from './DeployWalletViewModel'

interface Props {
    address: string;
}

export const DeployWallet = observer(({ address }: Props): JSX.Element | null => {
    const vm = useViewModel(
        DeployWalletViewModel,
        (model) => {
            model.address = address
        },
        [address],
    )

    if (vm.step.is(Step.SelectType)) {
        return <DeploySelectType onChange={vm.onChangeWalletType} onNext={vm.onNext} onClose={vm.onClose} />
    }

    return (
        <DeployPreparedMessage
            keyEntry={vm.selectedDerivedKeyEntry}
            account={vm.account}
            fees={vm.fees}
            loading={vm.loading}
            error={vm.error}
            currencyName={vm.nativeCurrency}
            balance={vm.everWalletState?.balance}
            onSubmit={vm.onSubmit}
            onClose={vm.onClose}
        />
    )
})
