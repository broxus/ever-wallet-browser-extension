import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router'

import { useViewModel } from '@app/popup/modules/shared'

import { EnterSendPassword } from '../EnterSendPassword'
import { ConfirmationPageViewModel } from './ConfirmationPageViewModel'

export const ConfirmationPage = observer(() => {
    const vm = useViewModel(ConfirmationPageViewModel)
    const navigate = useNavigate()

    return (
        <EnterSendPassword
            account={vm.transfer.account}
            userInfoAccount={vm.transfer.accountInfo}
            keyEntries={vm.transfer.selectableKeys.keys}
            keyEntry={vm.transfer.key!}
            recipient={vm.messageParams?.recipient}
            amount={vm.messageParams?.amount}
            fees={vm.fees}
            error={vm.error}
            feeLoaded={vm.feeLoaded}
            isGassless={vm.isGasless}
            txErrors={vm.txErrors}
            txErrorsLoaded={vm.txErrorsLoaded}
            balanceError={vm.balanceError}
            loading={vm.loading}
            context={vm.context}
            onSubmit={vm.submit}
            onChangeKeyEntry={vm.transfer.setKey}
            onBack={() => navigate('/')}
        />
    )
})
