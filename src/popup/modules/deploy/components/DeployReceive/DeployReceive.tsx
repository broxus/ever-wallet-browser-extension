import type * as nt from '@broxus/ever-wallet-wasm'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import QRCode from 'react-qr-code'

import { convertEvers, formatCurrency } from '@app/shared'
import { Button, Card, Container, Content, CopyButton, Footer } from '@app/popup/modules/shared'

import styles from './DeployReceive.module.scss'

interface Props {
    account: nt.AssetsList;
    totalAmount: string;
    currencyName: string;
}

export const DeployReceive = observer(({ account, totalAmount, currencyName }: Props): JSX.Element => {
    const intl = useIntl()

    return (
        <Container>
            <Content>
                <h2>{intl.formatMessage({ id: 'DEPLOY_WALLET_HEADER' })}</h2>

                <div className={styles.hint}>
                    {intl.formatMessage(
                        { id: 'DEPLOY_WALLET_INSUFFICIENT_BALANCE_HINT' },
                        {
                            value: formatCurrency(convertEvers(totalAmount), true),
                            symbol: currencyName,
                        },
                    )}
                </div>

                <Card size="s" className={styles.pane}>
                    <div className={styles.qr}>
                        <QRCode value={`ton://chat/${account.tonWallet.address}`} size={70} />
                    </div>

                    <div className={styles.address}>
                        <div className={styles.label}>
                            {intl.formatMessage({ id: 'ADDRESS_LABEL' })}
                        </div>
                        <CopyButton text={account.tonWallet.address}>
                            <button type="button" className={styles.value}>
                                {account.tonWallet.address}
                            </button>
                        </CopyButton>
                    </div>
                </Card>
            </Content>

            <Footer>
                <CopyButton text={account.tonWallet.address}>
                    <Button>
                        {intl.formatMessage({ id: 'COPY_ADDRESS_BTN_TEXT' })}
                    </Button>
                </CopyButton>
            </Footer>
        </Container>
    )
})
