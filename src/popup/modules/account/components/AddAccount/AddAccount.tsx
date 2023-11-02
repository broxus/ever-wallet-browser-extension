import { observer } from 'mobx-react-lite'

import { useViewModel } from '@app/popup/modules/shared'

import { AddAccountFlow } from '../../models'
import { CreateAccountForm, ImportAccountForm } from './components'
import { AddAccountViewModel } from './AddAccountViewModel'

export const AddAccount = observer((): JSX.Element => {
    const vm = useViewModel(AddAccountViewModel)

    // TODO: move to router
    return (
        <>
            {vm.flow === AddAccountFlow.CREATE && (
                <CreateAccountForm
                    error={vm.error}
                    loading={vm.loading}
                    defaultAccountName={vm.defaultAccountName}
                    availableContracts={vm.availableContracts}
                    onSubmit={vm.createAccount}
                />
            )}

            {vm.flow === AddAccountFlow.IMPORT && (
                <ImportAccountForm
                    error={vm.error}
                    loading={vm.loading}
                    defaultAccountName={vm.defaultAccountName}
                    onSubmit={vm.importAccount}
                />
            )}
        </>
    )
})
