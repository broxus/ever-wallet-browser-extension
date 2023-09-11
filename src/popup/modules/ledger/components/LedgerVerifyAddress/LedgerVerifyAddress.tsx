import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import QRCode from 'react-qr-code'

import { Icons } from '@app/popup/icons'
import { Button, Container, Content, CopyButton, Loader, PageLoader, UserInfo, useViewModel } from '@app/popup/modules/shared'

import { LedgerConnector } from '../LedgerConnector'
import { LedgerVerifyAddressViewModel } from './LedgerVerifyAddressViewModel'
import styles from './LedgerVerifyAddress.module.scss'

interface Props {
    address: string;
}

export const LedgerVerifyAddress = observer(({ address }: Props): JSX.Element => {
    const vm = useViewModel(LedgerVerifyAddressViewModel, (model) => {
        model.address = address
    })
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

            <Content>
                <h2>{intl.formatMessage({ id: 'LEDGER_VERIFY_HEADER' })}</h2>
                <p className={styles.text}>
                    {intl.formatMessage({ id: 'LEDGER_VERIFY_TEXT' })}
                </p>

                <div className={styles.pane}>
                    <div className={styles.user}>
                        <UserInfo account={vm.account} />
                    </div>

                    <div className={styles.qr}>
                        <QRCode value={`ton://chat/${address}`} size={70} />
                    </div>

                    <div className={styles.address}>
                        <div className={styles.label}>
                            {intl.formatMessage({ id: 'ADDRESS_LABEL' })}
                        </div>
                        <CopyButton text={address}>
                            <button type="button" className={styles.value}>
                                {address}
                            </button>
                        </CopyButton>
                    </div>
                </div>

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
