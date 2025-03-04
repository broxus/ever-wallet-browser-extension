import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router'
import { useIntl } from 'react-intl'

import { useResolve, useViewModel } from '@app/popup/modules/shared'
import { EnterSendPassword } from '@app/popup/modules/send'

import { ConfirmationPageViewModel } from './ConfirmationPageViewModel'
import { StakeTransferStore } from '../../store'

export const ConfirmationPage = observer((): JSX.Element => {
    const vm = useViewModel(ConfirmationPageViewModel)
    const navigate = useNavigate()
    const { messageParams } = useResolve(StakeTransferStore)
    const intl = useIntl()

    let title = ''
    if (messageParams?.action === 'stake') {
        title = intl.formatMessage({ id: 'STAKE_CONFIRM' })
    }
    if (messageParams?.action === 'unstake' || messageParams?.action === 'cancel') {
        title = intl.formatMessage({ id: 'UNSTAKE_CONFIRM' })
    }


    return (
        <EnterSendPassword
            account={vm.transfer.account}
            keyEntries={vm.transfer.selectableKeys.keys}
            keyEntry={vm.transfer.key!}
            amount={vm.transfer.messageParams?.amount}
            recipient={vm.transfer.messageToPrepare?.recipient}
            fees={vm.transfer.fees}
            error={vm.error}
            txErrors={vm.transfer.txErrors}
            txErrorsLoaded={vm.transfer.txErrorsLoaded}
            balanceError={vm.balanceError}
            loading={vm.loading}
            context={vm.context}
            onSubmit={vm.submit}
            onChangeKeyEntry={vm.transfer.setKey}
            onBack={() => navigate('/')}
            title={title}
            buttonText={intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
        />
    )
})
