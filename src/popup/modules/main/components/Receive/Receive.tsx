import { observer } from 'mobx-react-lite'
import { FormattedMessage, useIntl } from 'react-intl'
import { ReactNode } from 'react'

import { Icons } from '@app/popup/icons'
import { AddressQRCode, Container, Content, CopyButton, Footer, UserInfo, useViewModel } from '@app/popup/modules/shared'

import { ReceiveViewModel } from './ReceiveViewModel'
import styles from './Receive.module.scss'

interface Props {
    address: string;
    symbol?: ReactNode;
}

export const Receive = observer(({ address, symbol }: Props): JSX.Element => {
    const vm = useViewModel(ReceiveViewModel, (model) => {
        model.address = address
    }, [address])
    const intl = useIntl()

    return (
        <Container>
            <Content>
                <h2>
                    {symbol && (
                        <FormattedMessage
                            id="RECEIVE_ASSET_LEAD_TEXT"
                            values={{ symbol: <span>{symbol}</span> }}
                        />
                    )}
                    {!symbol && intl.formatMessage({ id: 'RECEIVE_ASSET_LEAD_TEXT_DEFAULT' })}
                </h2>

                <div className={styles.pane}>
                    <div className={styles.user}>
                        <UserInfo account={vm.account} />
                    </div>

                    <AddressQRCode className={styles.qr} address={address} />
                </div>

                {vm.densContacts.length !== 0 && (
                    <div className={styles.pane}>
                        <h2 className={styles.densTitle}>
                            {intl.formatMessage({ id: 'DENS_LIST_TITLE' })}
                        </h2>
                        {vm.densContacts.map(({ path }) => (
                            <CopyButton key={path} text={path}>
                                <button type="button" className={styles.densItem}>
                                    {path}
                                    {Icons.copy}
                                </button>
                            </CopyButton>
                        ))}
                    </div>
                )}
            </Content>

            {vm.canVerify && (
                <Footer className={styles.footer}>
                    <div className={styles.footerText}>
                        {intl.formatMessage({ id: 'RECEIVE_ASSET_VERIFY_TEXT' })}
                    </div>
                    <button
                        className={styles.footerBtn}
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
