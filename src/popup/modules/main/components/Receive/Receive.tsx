import { observer } from 'mobx-react-lite'
import { FormattedMessage, useIntl } from 'react-intl'
import { ReactNode, useCallback } from 'react'
import QRCode from 'react-qr-code'
import classNames from 'classnames'

import { Button, Container, Content, CopyButton, Footer, useViewModel } from '@app/popup/modules/shared'
import { LedgerVerifyAddress } from '@app/popup/modules/ledger'

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
                    <div className={styles.qr}>
                        <QRCode value={`ton://chat/${address}`} size={70} />
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
                </div>
            </Content>

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
