import { observer } from 'mobx-react-lite'

import { useViewModel } from '@app/popup/modules/shared'

import { EnterPasswordForm } from '../EnterPasswordForm'
import { SelectDerivedKeys } from '../SelectDerivedKeys'
import { CreateDerivedKeyViewModel, Step } from './CreateDerivedKeyViewModel'

export const CreateDerivedKey = observer((): JSX.Element | null => {
    const vm = useViewModel(CreateDerivedKeyViewModel)

    return (
        <>
            {vm.step.is(Step.Password) && (
                <EnterPasswordForm
                    loading={vm.loading}
                    error={vm.passwordError}
                    onSubmit={vm.onSubmitPassword}
                    onBack={vm.goToManageSeed}
                />
            )}

            {vm.step.is(Step.Select) && vm.selectedAccount && (
                <SelectDerivedKeys
                    preselectedKey={vm.selectedAccountPublicKey}
                    publicKeys={vm.publicKeys}
                    derivedKeys={vm.derivedKeys}
                    storedKeys={vm.storedKeys}
                    error={vm.selectKeysError}
                    loading={vm.loading}
                    onSubmit={vm.onSubmitKeys}
                    onBack={vm.goToManageSeed}
                />
            )}
        </>
    )
})
