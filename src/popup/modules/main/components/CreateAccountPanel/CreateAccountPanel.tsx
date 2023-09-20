import { observer } from 'mobx-react-lite'

import { PageLoader, useViewModel } from '@app/popup/modules/shared'

import { AddAccountForm, AddExternalForm, NewAccountContractType, SelectAccountAddingFlow } from './components'
import { CreateAccountPanelViewModel, Step } from './CreateAccountPanelViewModel'

export const CreateAccountPanel = observer((): JSX.Element => {
    const vm = useViewModel(CreateAccountPanelViewModel)

    return (
        <>
            {vm.step.is(Step.Index) && (
                <SelectAccountAddingFlow
                    // keyEntry={vm.currentDerivedKey}
                    // keyEntries={vm.derivedKeys}
                    // onChangeDerivedKey={vm.setCurrentDerivedKey}
                    onFlow={vm.onFlow}
                />
            )}

            {vm.step.is(Step.EnterAddress) && (
                <AddExternalForm
                    name={vm.defaultAccountName}
                    loading={vm.loading}
                    error={vm.error}
                    onSubmit={vm.onAddExisting}
                    onBack={vm.onBack}
                />
            )}

            {vm.step.is(Step.EnterName) && (
                <AddAccountForm
                    keyEntry={vm.currentDerivedKey}
                    name={vm.defaultAccountName}
                    loading={vm.loading}
                    error={vm.error}
                    onSubmit={vm.onAddAccount}
                    onBack={vm.onBack}
                    onManageDerivedKey={vm.onManageDerivedKey}
                />
            )}

            {vm.step.is(Step.SelectContractType) && (
                <PageLoader active={vm.loading}>
                    <NewAccountContractType
                        onSubmit={vm.onSubmit}
                        onBack={vm.onBack}
                    />
                </PageLoader>
            )}
        </>
    )
})
