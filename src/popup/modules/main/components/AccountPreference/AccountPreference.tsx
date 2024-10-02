import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import QRCode from 'react-qr-code'
import classNames from 'classnames'
import { useCallback } from 'react'

import { Button, Card, Container, Content, CopyButton, Footer, useViewModel } from '@app/popup/modules/shared'

import { AccountPreferenceViewModel } from './AccountPreferenceViewModel'
import styles from './AccountPreference.module.scss'
import { DeleteConfirmation } from './components'

interface Props {
    address: string;
    onRemove(): void;
}

export const AccountPreference = observer(({ address, onRemove }: Props): JSX.Element | null => {
    const vm = useViewModel(AccountPreferenceViewModel, (model) => {
        model.address = address
    })
    const intl = useIntl()

    const handleRemove = useCallback(async () => {
        if (!vm.account) return

        const { address } = vm.account.tonWallet
        const handleConfirm = () => {
            vm.handle.close()
            onRemove()
        }

        vm.panel.open({
            render: () => <DeleteConfirmation address={address} onConfirm={handleConfirm} />,
        })
    }, [onRemove])

    if (!vm.account) return null

    return (
        <Container>
            <Content>
                <h2>{intl.formatMessage({ id: 'PREFERENCE_TITLE' })}</h2>

                <Card bg="tertiary" size="s" className={styles.pane}>
                    <div className={styles.qr}>
                        <QRCode className={styles.qrSvg} value={`ton://chat/${address}`} size={78} />
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

                    <div className={classNames(styles.section, styles._pubkey)}>
                        <div className={styles.label}>
                            {intl.formatMessage({ id: 'PUBLIC_KEY_LABEL' })}
                        </div>
                        <CopyButton text={vm.account.tonWallet.publicKey}>
                            <button type="button" className={styles.value}>
                                {vm.account.tonWallet.publicKey}
                            </button>
                        </CopyButton>
                    </div>
                </Card>
            </Content>

            {vm.canRemove && (
                <Footer>
                    <Button
                        size="m"
                        design="danger"
                        onClick={handleRemove}
                    >
                        {intl.formatMessage({ id: 'DELETE_ACCOUNT_BTN_TEXT' })}
                    </Button>
                </Footer>
            )}
        </Container>
    )
})
