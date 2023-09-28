import { observer } from 'mobx-react-lite'

import { useViewModel } from '@app/popup/modules/shared'

import { DeployPreparedMessage, DeploySelectType } from './components'
import { DeployWalletViewModel, Step } from './DeployWalletViewModel'

interface Props {
    address: string;
}

export const DeployWallet = observer(({ address }: Props): JSX.Element | null => {
    const vm = useViewModel(DeployWalletViewModel, (model) => {
        model.address = address
    }, [address])

    if (vm.step.is(Step.SelectType)) {
        return (
            <DeploySelectType
                value={vm.walletType}
                onChange={vm.onChangeWalletType}
                onNext={vm.onNext}
            />
        )
    }

    return (
        <DeployPreparedMessage
            keyEntry={vm.selectedDerivedKeyEntry}
            balance={vm.everWalletState?.balance}
            fees={vm.fees}
            loading={vm.loading}
            error={vm.error}
            currencyName={vm.nativeCurrency}
            onSubmit={vm.onSubmit}
            onBack={vm.onBack}
        />
    )
})
