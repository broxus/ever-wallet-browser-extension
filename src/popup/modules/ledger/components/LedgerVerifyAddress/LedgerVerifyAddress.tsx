import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import CheckIcon from '@app/popup/assets/icons/check.svg'
import LedgerIcon from '@app/popup/assets/icons/ledger.svg'
import {
    AddressQRCode,
    Container,
    Content,
    Header,
    Loader,
    Spinner,
    UserInfo,
    useViewModel,
} from '@app/popup/modules/shared'

import { LedgerConnector } from '../LedgerConnector'
import { LedgerVerifyAddressViewModel } from './LedgerVerifyAddressViewModel'

import './LedgerVerifyAddress.scss'

interface Props {
    address: string;
    onBack(): void;
}

export const LedgerVerifyAddress = observer(({ address, onBack }: Props): JSX.Element => {
    const vm = useViewModel(LedgerVerifyAddressViewModel, model => {
        model.onBack = onBack
        model.address = address
    })
    const intl = useIntl()

    if (!vm.ledgerConnected) {
        return (
            <LedgerConnector
                className="ledger-verify-address__connector"
                onNext={vm.validate}
                onBack={onBack}
            />
        )
    }

    return (
        <Container className="ledger-verify-address">
            {vm.ledgerLoading && (
                <div className="ledger-verify-address__loader">
                    <Loader />
                </div>
            )}

            <Header>
                <UserInfo account={vm.account} />
            </Header>

            <Content className="ledger-verify-address__content">
                <h2 className="ledger-verify-address__header">
                    {intl.formatMessage({ id: 'LEDGER_VERIFY_HEADER' })}
                </h2>
                <p className="ledger-verify-address__text">
                    {intl.formatMessage({ id: 'LEDGER_VERIFY_TEXT' })}
                </p>

                <AddressQRCode
                    className="ledger-verify-address__qr-code"
                    address={vm.account.tonWallet.address}
                />

                {vm.ledgerLoading && (
                    <div className="ledger-verify-address__status _connect">
                        <LedgerIcon />
                        {intl.formatMessage({ id: 'LEDGER_VERIFY_CONNECT_YOUR_LEDGER' })}
                    </div>
                )}
                {vm.progress && (
                    <div className="ledger-verify-address__status _progress">
                        <Spinner />
                        {intl.formatMessage({ id: 'LEDGER_VERIFY_WAITING' })}
                    </div>
                )}
                {vm.confirmed && (
                    <div className="ledger-verify-address__status _confirmed">
                        <CheckIcon />
                        {intl.formatMessage({ id: 'LEDGER_VERIFY_CONFIRMED' })}
                    </div>
                )}
            </Content>

        </Container>
    )
})
