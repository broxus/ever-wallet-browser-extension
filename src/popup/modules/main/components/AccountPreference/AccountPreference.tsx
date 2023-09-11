import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import QRCode from 'react-qr-code'
import classNames from 'classnames'
import { useCallback } from 'react'

import { convertAddress, convertPublicKey } from '@app/shared'
import { Button, Container, Content, CopyButton, Footer, useConfirmation, useViewModel } from '@app/popup/modules/shared'

import { AccountPreferenceViewModel } from './AccountPreferenceViewModel'
import styles from './AccountPreference.module.scss'

interface Props {
    address: string;
    onRemove(): void;
}

export const AccountPreference = observer(({ address, onRemove }: Props): JSX.Element | null => {
    const vm = useViewModel(AccountPreferenceViewModel, (model) => {
        model.address = address
    })
    const intl = useIntl()
    const confirmation = useConfirmation()

    const handleRemove = useCallback(async () => {
        const confirmed = await confirmation.show({
            title: intl.formatMessage({ id: 'REMOVE_ACCOUNT_CONFIRMATION_TITLE' }),
            body: intl.formatMessage({ id: 'REMOVE_ACCOUNT_CONFIRMATION_TEXT' }),
            confirmBtnText: intl.formatMessage({ id: 'REMOVE_ACCOUNT_CONFIRMATION_BTN_TEXT' }),
        })

        if (confirmed) {
            vm.handle.close()
            onRemove()
        }
    }, [onRemove])

    if (!vm.account) return null

    return (
        <Container>
            <Content>
                <h2>{intl.formatMessage({ id: 'PREFERENCE_TITLE' })}</h2>

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
                                {convertAddress(address)}
                            </button>
                        </CopyButton>
                    </div>

                    <div className={classNames(styles.section, styles._pubkey)}>
                        <div className={styles.label}>
                            {intl.formatMessage({ id: 'PUBLIC_KEY_LABEL' })}
                        </div>
                        <CopyButton text={vm.account.tonWallet.publicKey}>
                            <button type="button" className={styles.value}>
                                {convertPublicKey(vm.account.tonWallet.publicKey)}
                            </button>
                        </CopyButton>
                    </div>
                </div>
            </Content>

            {vm.canRemove && (
                <Footer>
                    <Button
                        size="m"
                        design="secondary"
                        className={styles.btn}
                        onClick={handleRemove}
                    >
                        {intl.formatMessage({ id: 'DELETE_ACCOUNT_BTN_TEXT' })}
                    </Button>
                </Footer>
            )}
        </Container>
    )
})
