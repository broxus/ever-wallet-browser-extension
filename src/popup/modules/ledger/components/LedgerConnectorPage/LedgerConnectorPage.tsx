import { observer } from 'mobx-react-lite'

import { useViewModel } from '@app/popup/modules/shared'

import { LedgerConnector } from '../LedgerConnector'
import { LedgerConnectorPageViewModel } from './LedgerConnectorPageViewModel'

import './LedgerConnectorPage.scss'

export const LedgerConnectorPage = observer((): JSX.Element => {
    const vm = useViewModel(LedgerConnectorPageViewModel)

    return (
        <div className="ledger-connector-page">
            <LedgerConnector onNext={vm.handleConnect} onBack={vm.handleClose} />
        </div>
    )
})
