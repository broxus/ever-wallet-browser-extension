import type * as nt from '@broxus/ever-wallet-wasm'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'
import { observer } from 'mobx-react-lite'

import { convertEvers } from '@app/shared'
import { AccountQRCode, Container, Content, Header, Navbar } from '@app/popup/modules/shared'

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

                <AccountQRCode className="deploy-receive__qr" account={account} compact />
            </Content>
        </Container>
    )
})
