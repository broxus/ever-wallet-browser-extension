import { observer } from 'mobx-react-lite'
import { FormattedMessage, useIntl } from 'react-intl'
import { ReactNode } from 'react'

import { AddressQRCode, Container, Content, Footer, UserInfo, useViewModel } from '@app/popup/modules/shared'

import { ReceiveViewModel } from './ReceiveViewModel'
import './Receive.scss'

interface Props {
    address: string;
    symbol?: ReactNode;
    // densContacts?: DensContact[]; // TODO: remove or update design?
}

export const Receive = observer(({ address, symbol }: Props): JSX.Element => {
    const vm = useViewModel(ReceiveViewModel, (model) => {
        model.address = address
    }, [address])
    const intl = useIntl()

    return (
        <Container className="receive-screen">
            <Content>
                <h2 className="noselect">
                    {symbol && (
                        <FormattedMessage
                            id="RECEIVE_ASSET_LEAD_TEXT"
                            values={{ symbol: <span>{symbol}</span> }}
                        />
                    )}
                    {!symbol && intl.formatMessage({ id: 'RECEIVE_ASSET_LEAD_TEXT_DEFAULT' })}
                </h2>

                <div className="receive-screen__pane">
                    <div className="receive-screen__user">
                        <UserInfo account={vm.account} />
                    </div>

                    <AddressQRCode
                        className="receive-screen__qr"
                        address={address}
                    />
                </div>

                {/* {densContacts && densContacts.length !== 0 && (
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
                                    <CopyText className="dens-list__item-icon" place="left" text={path}>
                                        <CopyIcon />
                                    </CopyText>

                                </div>
                            ))}
                        </div>
                    </div>
                )} */}
            </Content>

            {vm.canVerify && (
                <Footer className="receive-screen__footer">
                    <div className="receive-screen__footer-text">
                        {intl.formatMessage({ id: 'RECEIVE_ASSET_VERIFY_TEXT' })}
                    </div>
                    <button
                        className="receive-screen__footer-btn"
                        type="button"
                        onClick={vm.onVerify}
                    >
                        {intl.formatMessage({ id: 'RECEIVE_ASSET_VERIFY' })}
                    </button>
                </Footer>
            )}
        </Container>
    )
})
