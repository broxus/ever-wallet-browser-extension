import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { AccountQRCode, Button, Container, Content, Header, Loader, Navbar, PageLoader, useViewModel } from '@app/popup/modules/shared'

import { LedgerConnector } from '../LedgerConnector'
import { LedgerVerifyAddressViewModel } from './LedgerVerifyAddressViewModel'
import styles from './LedgerVerifyAddress.module.scss'


export const LedgerVerifyAddress = observer((): JSX.Element => {
    const vm = useViewModel(LedgerVerifyAddressViewModel)
    const intl = useIntl()

    if (!vm.ledgerConnected) {
        return (
            <LedgerConnector
                onNext={vm.validate}
                onBack={vm.handleClose}
            />
        )
    }

    return (
        <Container>
            {vm.ledgerLoading && <PageLoader />}

            <Header>
                <Navbar close={vm.handleClose} />
            </Header>

            <Content>
                <h2>{intl.formatMessage({ id: 'LEDGER_VERIFY_HEADER' })}</h2>
                <p className={styles.text}>
                    {intl.formatMessage({ id: 'LEDGER_VERIFY_TEXT' })}
                </p>

                <AccountQRCode className={styles.qr} account={vm.account} compact />

                <div className={styles.status}>
                    {vm.ledgerLoading && (
                        <Button>
                            {intl.formatMessage({ id: 'LEDGER_VERIFY_CONNECT_YOUR_LEDGER' })}
                        </Button>
                    )}
                    {vm.progress && (
                        <Button>
                            <Loader />
                            {intl.formatMessage({ id: 'LEDGER_VERIFY_WAITING' })}
                        </Button>
                    )}
                    {vm.confirmed && (
                        <Button design="ghost" className={styles.confirmed}>
                            {intl.formatMessage({ id: 'LEDGER_VERIFY_CONFIRMED' })}
                            {Icons.checkCircle}
                        </Button>
                    )}
                </div>
            </Content>
        </Container>
    )
})
