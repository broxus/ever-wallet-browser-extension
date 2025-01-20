import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { ReactNode, useCallback } from 'react'
import classNames from 'classnames'

import { Button, Container, Content, CopyButton, Footer, Icon, useViewModel } from '@app/popup/modules/shared'
import { LedgerVerifyAddress } from '@app/popup/modules/ledger'
import { QRCode } from '@app/popup/modules/shared/components/QRCode'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { SlidingPanelHeader } from '@app/popup/modules/shared/components/SlidingPanel/SlidingPanelHeader'

import { ReceiveViewModel } from './ReceiveViewModel'
import styles from './Receive.module.scss'

interface Props {
    address: string;
    symbol?: ReactNode;
    hint?: string;
}

export const Receive = observer(({ address, symbol, hint }: Props): JSX.Element => {
    const vm = useViewModel(
        ReceiveViewModel,
        (model) => {
            model.address = address
        },
        [address],
    )
    const intl = useIntl()

    const handleVerify = useCallback(() => {
        vm.handle.close()
        vm.panel.open({
            showClose: false,
            render: () => <LedgerVerifyAddress address={address} />,
        })
    }, [address])

    return (
        <>
            <SlidingPanelHeader
                onClose={vm.close}
                title={symbol
                    ? intl.formatMessage({
                        id: 'RECEIVE_SYMBOL',
                    }, {
                        symbol,
                    })
                    : intl.formatMessage({
                        id: 'RECEIVE_ASSET_LEAD_TEXT_DEFAULT',
                    })}
            />
            <Container>
                <Content className={styles.content}>
                    {hint && <p className={styles.hint}>{hint}</p>}

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

                    {vm.densContacts.length !== 0 && (
                        <div className={classNames(styles.dens)}>
                            {vm.densContacts.map(({ path }) => (
                                <CopyButton key={path} text={path}>
                                    <button className={styles.den}>
                                        {path}

                                        <Icon icon="copy" />
                                    </button>
                                </CopyButton>
                            ))}
                        </div>
                    )}
                </Content>

                {vm.canVerify && (
                    <Footer layer>
                        <FooterAction>
                            <Button design="accent" className={styles.footerBtn} onClick={handleVerify}>
                                {intl.formatMessage({ id: 'RECEIVE_ASSET_VERIFY' })}
                            </Button>
                        </FooterAction>
                    </Footer>
                )}
            </Container>
        </>
    )
})
