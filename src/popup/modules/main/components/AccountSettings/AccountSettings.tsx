import { useCallback } from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Card, Container, Content, Space, useConfirmation, useViewModel } from '@app/popup/modules/shared'
import { QRCode } from '@app/popup/modules/shared/components/QRCode'
import { ChangeAccountName } from '@app/popup/modules/account'
import { LedgerVerifyAddress } from '@app/popup/modules/ledger'

import { AccountSettingsViewModel } from './AccountSettingsViewModel'
import { CopyItem, SettingsItem } from './components'
import styles from './AccountSettings.module.scss'

interface Props {
    address: string;
}

export const AccountSettings = observer(({ address }: Props): JSX.Element => {
    const intl = useIntl()
    const confirmation = useConfirmation()
    const vm = useViewModel(
        AccountSettingsViewModel,
        (model) => {
            model.address = address
        },
        [address],
    )

    const handleRename = useCallback(() => vm.panel.open({
        title: intl.formatMessage({ id: 'RENAME_ACCOUNT' }),
        render: () => <ChangeAccountName account={vm.account!} />,
    }), [vm.account])

    const handleHide = useCallback(async () => {
        const confirmed = await confirmation.show({
            heading: intl.formatMessage({ id: 'HIDE_ACCOUNT' }),
            title: intl.formatMessage({ id: 'HIDE_ACCOUNT_CONFIRMATION_TITLE' }),
            body: intl.formatMessage({ id: 'HIDE_ACCOUNT_CONFIRMATION_TEXT' }),
            confirmBtnText: intl.formatMessage({ id: 'HIDE_ACCOUNT_CONFIRMATION_BTN_TEXT' }),
        })

        if (confirmed) {
            await vm.hideAccount(address)
        }
    }, [])

    const handleVerify = useCallback(() => {
        vm.handle.close()
        vm.panel.open({
            showClose: false,
            render: () => <LedgerVerifyAddress address={address} />,
        })
    }, [address])

    return (
        <Container>
            <Content>
                <Space direction="column" gap="l">
                    <Card className={styles.info}>
                        <div className={styles.qr}>
                            <QRCode className={styles.qrSvg} size={54} value={address} />
                        </div>
                        <div>
                            <CopyItem
                                value={address}
                                label={intl.formatMessage({
                                    id: 'ACCOUNT_CARD_ADDRESS_LABEL',
                                })}
                            />
                            <CopyItem
                                value={vm.key.publicKey}
                                label={intl.formatMessage({
                                    id: 'ACCOUNT_CARD_PUBLIC_KEY_LABEL',
                                })}
                            />
                        </div>
                    </Card>
                    <Card>
                        <SettingsItem
                            label={intl.formatMessage({
                                id: 'RENAME_ACCOUNT',
                            })}
                            icon="edit"
                            onClick={handleRename}
                        />
                        <SettingsItem
                            label={intl.formatMessage({
                                id: 'ACCOUNT_CUSTODIANS_TITLE',
                            })}
                            icon="users"
                            onClick={console.log}
                        />
                        {vm.canVerify && (
                            <SettingsItem
                                label={intl.formatMessage({
                                    id: 'VERIFY_ON_LEDGER',
                                })}
                                icon="ledger"
                                onClick={handleVerify}
                            />
                        )}
                        <SettingsItem
                            label={intl.formatMessage({
                                id: 'VIEW_IN_EXPLORER_BTN_TEXT',
                            })}
                            icon="planet"
                            onClick={vm.openAccountInExplorer}
                        />
                        <SettingsItem
                            danger
                            label={intl.formatMessage({
                                id: 'HIDE_ACCOUNT',
                            })}
                            icon="eyeOff"
                            onClick={handleHide}
                        />
                    </Card>
                </Space>
            </Content>
        </Container>
    )
})
