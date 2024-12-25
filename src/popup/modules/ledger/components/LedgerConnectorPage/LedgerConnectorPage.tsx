import { observer } from 'mobx-react-lite'

import LogoSrc from '@app/popup/assets/img/welcome/logo.svg'
import { useViewModel } from '@app/popup/modules/shared'

import { LedgerConnector } from '../LedgerConnector'
import { LedgerConnectorPageViewModel } from './LedgerConnectorPageViewModel'
import styles from './LedgerConnectorPage.module.scss'

export const LedgerConnectorPage = observer((): JSX.Element => {
    const vm = useViewModel(LedgerConnectorPageViewModel)

    return (
        <div className={styles.ledgerConnectorPage}>
            <header className={styles.header}>
                <img src={LogoSrc} alt="Sparx" />
            </header>
            <LedgerConnector className={styles.ledgerConnector} onNext={vm.handleConnect} onBack={vm.handleClose} />
        </div>
    )
})
