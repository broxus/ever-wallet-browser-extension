import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import {
    Button,
    Container,
    Content,
    CopyButton,
    Icon,
    Loader,
    PageLoader,
    useViewModel,
} from '@app/popup/modules/shared'
import { QRCode } from '@app/popup/modules/shared/components/QRCode'

import { LedgerVerifyAddressViewModel } from './LedgerVerifyAddressViewModel'
import styles from './LedgerVerifyAddress.module.scss'
import { LedgerConnector } from '../LedgerConnector'

interface Props {
    address: string;
}

export const LedgerVerifyAddress = observer(({ address }: Props): JSX.Element => {
    const vm = useViewModel(LedgerVerifyAddressViewModel, (model) => {
        model.address = address
    })
    const intl = useIntl()

    if (!vm.ledgerConnected) {
        return <LedgerConnector onNext={vm.validate} onBack={vm.handleClose} />
    }

    return (
        <Container>
            {vm.ledgerLoading && <PageLoader />}

            <Content className={styles.content}>
                <h2 className={styles.title}>{intl.formatMessage({ id: 'LEDGER_VERIFY_HEADER' })}</h2>
                <p className={styles.text}>{intl.formatMessage({ id: 'LEDGER_VERIFY_TEXT' })}</p>

                <Button
                    shape="icon" size="s" design="transparency"
                    className={styles.close} onClick={vm.handleClose}
                >
                    <Icon icon="x" width={16} height={16} />
                </Button>

                <div className={styles.address}>
                    <QRCode size={100} value={address} bgColor="rgba(30, 32, 58, 1)" />
                    {address}
                    <CopyButton text={address}>
                        <Button size="m" design="accent" width={200}>
                            <Icon icon="copy" width={16} height={16} />
                            {intl.formatMessage({
                                id: 'COPY_BTN_TEXT',
                            })}
                        </Button>
                    </CopyButton>
                </div>

                <div className={styles.status}>
                    {vm.ledgerLoading && (
                        <Button>{intl.formatMessage({ id: 'LEDGER_VERIFY_CONNECT_YOUR_LEDGER' })}</Button>
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
