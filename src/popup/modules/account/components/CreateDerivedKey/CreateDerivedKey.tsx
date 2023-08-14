import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router'

import { useViewModel } from '@app/popup/modules/shared'
import { LedgerAccountManager } from '@app/popup/modules/ledger'

import { EnterPasswordForm } from '../EnterPasswordForm'
import { SelectDerivedKeys } from '../SelectDerivedKeys'
import { CreateDerivedKeyViewModel, Step } from './CreateDerivedKeyViewModel'

export const CreateDerivedKey = observer((): JSX.Element | null => {
    const vm = useViewModel(CreateDerivedKeyViewModel)
    const navigate = useNavigate()

    if (vm.currentMasterKey?.signerName === 'ledger_key') {
        // TODO
        return <LedgerAccountManager onBack={() => navigate('..')} />
    }

    return (
        <>
            {vm.step.is(Step.Password) && (
                <EnterPasswordForm
                    masterKeyName={vm.masterKeyName}
                    loading={vm.loading}
                    error={vm.passwordError}
                    onSubmit={vm.onSubmitPassword}
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
                />
            )}
        </>
    )
})
