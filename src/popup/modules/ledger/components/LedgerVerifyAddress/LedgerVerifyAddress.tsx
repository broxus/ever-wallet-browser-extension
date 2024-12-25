import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

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
import { SlidingPanelHeader } from '@app/popup/modules/shared/components/SlidingPanel/SlidingPanelHeader'
import { Toast } from '@app/popup/modules/shared/components/Toast/Toast'

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
        <>
            <SlidingPanelHeader
                title={intl.formatMessage({ id: 'LEDGER_VERIFY_HEADER' })}
                onClose={vm.handleClose}
            />
            <Container>
                {vm.ledgerLoading && <PageLoader />}

                <Content className={styles.content}>
                    <div className={styles.text}>{intl.formatMessage({ id: 'LEDGER_VERIFY_TEXT' })}</div>

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
                            <Toast>
                                {intl.formatMessage({ id: 'LEDGER_VERIFY_CONNECT_YOUR_LEDGER' })}
                            </Toast>
                        )}
                        {vm.progress && (
                            <Toast>
                                <Loader size={20} />
                                {intl.formatMessage({ id: 'LEDGER_VERIFY_WAITING' })}
                            </Toast>
                        )}
                        {vm.confirmed && (
                            <Toast type="success">
                                <Icon icon="check" width={20} height={20} />
                                {intl.formatMessage({ id: 'LEDGER_VERIFY_CONFIRMED' })}
                            </Toast>
                        )}
                    </div>
                </Content>
            </Container>
        </>
    )
})
