import { observer } from 'mobx-react-lite'
import { FormattedMessage, useIntl } from 'react-intl'
import type nt from '@broxus/ever-wallet-wasm'
import { ReactNode } from 'react'

import { AddressQRCode, Container, Content, Footer, Header, UserInfo } from '@app/popup/modules/shared'

import './Receive.scss'

interface Props {
    account: nt.AssetsList;
    symbol?: ReactNode;
    canVerifyAddress: boolean;
    onVerifyAddress(address: string): void;
}

export const Receive = observer(({ account, symbol, canVerifyAddress, onVerifyAddress }: Props): JSX.Element => {
    const intl = useIntl()

    return (
        <Container className="receive-screen">
            <Header>
                <UserInfo account={account} />
            </Header>

            <Content>
                <h3 className="receive-screen__title noselect">
                    {symbol && (
                        <FormattedMessage
                            id="RECEIVE_ASSET_LEAD_TEXT"
                            values={{ symbol: <span className="receive-screen__title-symbol">{symbol}</span> }}
                        />
                    )}
                    {!symbol && intl.formatMessage({ id: 'RECEIVE_ASSET_LEAD_TEXT_DEFAULT' })}
                </h3>

                <AddressQRCode
                    className="receive-screen__qr-code"
                    address={account.tonWallet.address}
                />
            </Content>

            {canVerifyAddress && (
                <Footer className="receive-screen__footer">
                    <div className="receive-screen__footer-text">
                        {intl.formatMessage({ id: 'RECEIVE_ASSET_VERIFY_TEXT' })}
                    </div>
                    <button
                        className="receive-screen__footer-btn"
                        type="button"
                        onClick={() => onVerifyAddress(account.tonWallet.address)}
                    >
                        {intl.formatMessage({ id: 'RECEIVE_ASSET_VERIFY' })}
                    </button>
                </Footer>
            )}
        </Container>
    )
})
