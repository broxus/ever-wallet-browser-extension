import type * as nt from '@broxus/ever-wallet-wasm'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'
import { observer } from 'mobx-react-lite'

import { convertEvers } from '@app/shared'
import { AddressQRCode, Container, Content, Header, Navbar, UserInfo } from '@app/popup/modules/shared'

import './DeployReceive.scss'

interface Props {
    account: nt.AssetsList;
    totalAmount: string;
    currencyName: string;
}

export const DeployReceive = observer(({ account, totalAmount, currencyName }: Props): JSX.Element => {
    const intl = useIntl()
    const navigate = useNavigate()

    return (
        <Container>
            <Header>
                <Navbar back={() => navigate(-1)} />
            </Header>

            <Content className="deploy-receive">
                <h2>
                    {intl.formatMessage(
                        { id: 'DEPLOY_WALLET_INSUFFICIENT_BALANCE_HINT' },
                        {
                            value: convertEvers(totalAmount),
                            symbol: currencyName,
                        },
                    )}
                </h2>

                <div className="deploy-receive__pane">
                    <div className="deploy-receive__user">
                        <UserInfo account={account} />
                    </div>

                    <AddressQRCode
                        className="deploy-receive__qr"
                        address={account.tonWallet.address}
                    />
                </div>
            </Content>
        </Container>
    )
})
