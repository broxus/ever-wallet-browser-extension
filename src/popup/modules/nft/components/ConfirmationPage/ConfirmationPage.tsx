import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router'

import { useViewModel } from '@app/popup/modules/shared'
import { EnterSendPassword } from '@app/popup/modules/send'

import { ConfirmationPageViewModel } from './ConfirmationPageViewModel'

export const ConfirmationPage = observer((): JSX.Element => {
    const vm = useViewModel(ConfirmationPageViewModel)
    const navigate = useNavigate()

    return (
        <EnterSendPassword
            account={vm.transfer.account}
            keyEntries={vm.transfer.selectableKeys.keys}
            keyEntry={vm.transfer.key!}
            amount={vm.transfer.messageParams?.amount}
            recipient={vm.transfer.messageParams?.recipient}
            fees={vm.transfer.fees}
            error={vm.error}
            txErrors={vm.transfer.txErrors}
            balanceError={vm.balanceError}
            loading={vm.loading}
            context={vm.context}
            onSubmit={vm.submit}
            onChangeKeyEntry={vm.transfer.setKey}
            onBack={() => navigate('/')}
        />
    )
})
