import { observer } from 'mobx-react-lite'
import { FormattedMessage, useIntl } from 'react-intl'
import type nt from '@broxus/ever-wallet-wasm'
import { ReactNode } from 'react'

import CopyIcon from '@app/popup/assets/icons/copy.svg'
import { AddressQRCode, Container, Content, CopyText, Footer, Header, UserInfo } from '@app/popup/modules/shared'
import { DensContact } from '@app/models'

import './Receive.scss'

interface Props {
    account: nt.AssetsList;
    densContacts?: DensContact[];
    symbol?: ReactNode;
    canVerifyAddress: boolean;
    onVerifyAddress(address: string): void;
}

export const Receive = observer((props: Props): JSX.Element => {
    const { account, densContacts, symbol, canVerifyAddress, onVerifyAddress } = props
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

                {densContacts && densContacts.length !== 0 && (
                    <div className="receive-screen__dens">
                        <h3 className="receive-screen__dens-title">
                            {intl.formatMessage({ id: 'DENS_LIST_TITLE' })}
                        </h3>
                        <p className="receive-screen__dens-text">
                            {intl.formatMessage({ id: 'DENS_LIST_TEXT' })}
                        </p>
                        <div className="dens-list">
                            {densContacts.map(({ path }) => (
                                <div className="dens-list__item" key={path}>
                                    <div className="dens-list__item-path" title={path}>{path}</div>
                                    <CopyText
                                        className="dens-list__item-icon"
                                        place="left"
                                        id={`receive-copy-${path}`}
                                        text={path}
                                    >
                                        <CopyIcon />
                                    </CopyText>

                                </div>
                            ))}
                        </div>
                    </div>
                )}
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
