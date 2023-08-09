import { observer } from 'mobx-react-lite'

import { LedgerAccountManager } from '@app/popup/modules/ledger'
import { AccountabilityStep, useViewModel } from '@app/popup/modules/shared'

import { CreateAccount } from '../CreateAccount'
import { CreateDerivedKey } from '../CreateDerivedKey'
import { CreateSeed } from '../CreateSeed'
import { ManageAccount } from '../ManageAccount'
import { ManageDerivedKey } from '../ManageDerivedKey'
import { ManageSeed } from '../ManageSeed'
import { ManageSeeds } from '../ManageSeeds'
import { AccountsManagerViewModel } from './AccountsManagerViewModel'

export const AccountsManager = observer((): JSX.Element => {
    const vm = useViewModel(AccountsManagerViewModel)

    return (
        <>
            {/*{vm.step === AccountabilityStep.MANAGE_SEEDS && <ManageSeeds key="namageSeeds" onBack={vm.close} />}*/}

            {vm.step === AccountabilityStep.CREATE_SEED && <CreateSeed key="createSeed" />}

            {vm.step === AccountabilityStep.MANAGE_SEED && <ManageSeed key="manageSeed" />}

            {vm.step === AccountabilityStep.CREATE_DERIVED_KEY && vm.signerName !== 'ledger_key' && (
                <CreateDerivedKey key="createDerivedKey" />
            )}

            {vm.step === AccountabilityStep.CREATE_DERIVED_KEY && vm.signerName === 'ledger_key' && (
                <LedgerAccountManager onBack={vm.backToManageSeed} />
            )}

            {vm.step === AccountabilityStep.MANAGE_DERIVED_KEY && (
                <ManageDerivedKey key="manageDerivedKey" />
            )}

            {vm.step === AccountabilityStep.CREATE_ACCOUNT && (
                <CreateAccount key="createAccount" onBackFromIndex={vm.onBackInCreateAccountIndex} />
            )}

            {vm.step === AccountabilityStep.MANAGE_ACCOUNT && <ManageAccount key="manageAccount" />}
        </>
    )
})
