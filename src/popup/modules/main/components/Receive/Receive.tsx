import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { ReactNode, useCallback } from 'react'

import { Button, Container, Content, CopyButton, Footer, Icon, useViewModel } from '@app/popup/modules/shared'
import { LedgerVerifyAddress } from '@app/popup/modules/ledger'
import { QRCode } from '@app/popup/modules/shared/components/QRCode'

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

    const handleVerify = useCallback(() => {
        vm.handle.close()
        vm.panel.open({
            render: () => <LedgerVerifyAddress address={address} />,
        })
    }, [address])

    return (
        <Container>
            <Content className={styles.content}>
                <h2 className={styles.title}>
                    {symbol ? intl.formatMessage({
                        id: 'RECEIVE_SYMBOL',
                    }, {
                        symbol,
                    }) : intl.formatMessage({
                        id: 'RECEIVE_ASSET_LEAD_TEXT_DEFAULT',
                    })}
                </h2>

                <QRCode
                    size={100}
                    value={address}
                    bgColor="rgba(30, 32, 58, 1)"
                />

                <div className={styles.address}>
                    {address}
                    <CopyButton text={address}>
                        <Button
                            size="m"
                            design="accent"
                            width={200}
                        >
                            <Icon icon="copy" width={16} height={16} />
                            {intl.formatMessage({
                                id: 'COPY_BTN_TEXT',
                            })}
                        </Button>
                    </CopyButton>
                </div>

                {/* TODO: Dens */}
                {/* <Card bg="tertiary" size="s" className={styles.pane}>
                    <div className={styles.account}>
                        <UserInfo account={vm.account} />
                    </div>

                    <div className={styles.qr}>
                        <QRCode className={styles.qrSvg} value={address} size={78} />
                    </div>

                    <div className={classNames(styles.section, styles._address)}>
                        <div className={styles.label}>
                            {intl.formatMessage({ id: 'ADDRESS_LABEL' })}
                        </div>
                        <CopyButton text={address}>
                            <button type="button" className={styles.value}>
                                {address}
                            </button>
                        </CopyButton>
                    </div>

                    {vm.densContacts.length !== 0 && (
                        <div className={classNames(styles.section, styles._dens)}>
                            <div className={styles.label}>
                                {intl.formatMessage({ id: 'DENS_LIST_TITLE' })}
                            </div>
                            {vm.densContacts.map(({ path }) => (
                                <CopyButton key={path} text={path}>
                                    <button type="button" className={styles.value}>
                                        {path}
                                    </button>
                                </CopyButton>
                            ))}
                        </div>
                    )}
                </Card> */}
            </Content>

            <Footer className={styles.footer}>
                <Button
                    size="m"
                    design="neutral"
                    width={200}
                    onClick={vm.close}
                >
                    {intl.formatMessage({
                        id: 'BACK_BTN_TEXT',
                    })}
                </Button>
            </Footer>

            {/* TODO: Redesign */}
            {vm.canVerify && (
                <Footer className={styles.footer}>
                    <div className={styles.footerText}>
                        {intl.formatMessage({ id: 'RECEIVE_ASSET_VERIFY_TEXT' })}
                    </div>
                    <Button size="s" className={styles.footerBtn} onClick={handleVerify}>
                        {intl.formatMessage({ id: 'RECEIVE_ASSET_VERIFY' })}
                    </Button>
                </Footer>
            )}
        </Container>
    )
})
