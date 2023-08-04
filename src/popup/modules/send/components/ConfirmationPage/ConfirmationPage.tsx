import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router'

import { useViewModel } from '@app/popup/modules/shared'

import { EnterSendPassword } from '../EnterSendPassword'
import { ConfirmationPageViewModel } from './ConfirmationPageViewModel'

export const ConfirmationPage = observer((): JSX.Element => {
    const vm = useViewModel(ConfirmationPageViewModel)
    const navigate = useNavigate()

    return (
        <EnterSendPassword
            contractType={vm.store.account.tonWallet.contractType}
            keyEntries={vm.store.selectableKeys.keys}
            keyEntry={vm.store.key!}
            amount={vm.store.messageParams?.amount}
            recipient={vm.store.messageParams?.recipient}
            fees={vm.store.fees}
            error={vm.error}
            balanceError={vm.balanceError}
            loading={vm.loading}
            context={vm.context}
            onSubmit={vm.submit}
            onBack={() => navigate('/')}
            onChangeKeyEntry={vm.store.setKey}
        />
    )
})
