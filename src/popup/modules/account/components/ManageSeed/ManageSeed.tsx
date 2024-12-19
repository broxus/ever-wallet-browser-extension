import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { Button, Card, Container, Content, Footer, Header, Navbar, SettingsMenu, Space, useViewModel } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import { PageHeader } from '../PageHeader'
import { ExportSeed } from '../ExportSeed'
import { ChangeKeyName } from '../ChangeKeyName'
import { PasswordSettings } from '../ChangePassword'
import { DeleteSeed } from '../DeleteSeed'
import { ManageSeedViewModel } from './ManageSeedViewModel'
import { KeyListItem } from './KeyListItem'
import styles from './ManageSeed.module.scss'

export const ManageSeed = observer((): JSX.Element | null => {
    const vm = useViewModel(ManageSeedViewModel)
    const intl = useIntl()

    const handleExport = () => vm.panel.open({
        fullHeight: true,
        showClose: false,
        render: () => <ExportSeed keyEntry={vm.currentMasterKey!} />,
    })
    const handleChangeName = () => vm.panel.open({
        render: () => <ChangeKeyName keyEntry={vm.currentMasterKey!} />,
    })
    const handleChangePwd = () => vm.panel.open({
        fullHeight: true,
        render: () => <PasswordSettings keyEntry={vm.currentMasterKey!} />,
    })
    const handleDelete = () => vm.panel.open({
        render: () => <DeleteSeed keyEntry={vm.currentMasterKey!} onDeleted={vm.onSeedDeleted} />,
    })

    if (!vm.currentMasterKey) return null

    return (
        <Container>
            <Header>
                <Navbar
                    back=".."
                    settings={(
                        <SettingsMenu title={intl.formatMessage({ id: 'SEED_SETTINGS_TITLE' })}>
                            {vm.selectedMasterKey !== vm.currentMasterKey.masterKey && (
                                <SettingsMenu.Item icon={Icons.chevronRight} onClick={vm.selectMasterKey}>
                                    {intl.formatMessage({ id: 'USE_THIS_SEED_BTN_TEXT' })}
                                </SettingsMenu.Item>
                            )}
                            <SettingsMenu.Item icon={Icons.edit} onClick={handleChangeName}>
                                {intl.formatMessage({ id: 'CHANGE_NAME_BTN_TEXT' })}
                            </SettingsMenu.Item>
                            {vm.currentMasterKey.signerName !== 'ledger_key' && (
                                <SettingsMenu.Item icon={Icons.external} onClick={handleExport}>
                                    {intl.formatMessage({ id: 'EXPORT_SEED_BTN_TEXT' })}
                                </SettingsMenu.Item>
                            )}
                            {vm.currentMasterKey.signerName !== 'ledger_key' && (
                                <SettingsMenu.Item icon={Icons.lock} onClick={handleChangePwd}>
                                    {intl.formatMessage({ id: 'PASSWORD_SETTINGS_BTN_TEXT' })}
                                </SettingsMenu.Item>
                            )}
                            <SettingsMenu.Item icon={Icons.delete} onClick={handleDelete} danger>
                                {intl.formatMessage({ id: 'DELETE_SEED_BTN_TEXT' })}
                            </SettingsMenu.Item>
                        </SettingsMenu>
                    )}
                >
                    <PageHeader label={intl.formatMessage({ id: 'MANAGE_SEED_PANEL_HEADER' })}>
                        {vm.seedName}
                    </PageHeader>
                </Navbar>
            </Header>

            <Content>
                <Space direction="column" gap="l">
                    <div className={styles.title}>
                        {intl.formatMessage({ id: 'MANAGE_SEED_LIST_KEYS_HEADING' })}
                    </div>
                    <Card bg="layer-1" size="xs" className={styles.card}>
                        {vm.derivedKeys.map(({ key, active, accounts }) => (
                            <KeyListItem
                                keyEntry={key}
                                active={active}
                                accounts={accounts}
                                onClick={vm.onManageDerivedKey}
                            />
                        ))}
                    </Card>
                </Space>
            </Content>

            <Footer layer>
                <FooterAction
                    buttons={[
                        <Button design="accent" disabled={vm.signerName === 'encrypted_key'} onClick={vm.addKey}>
                            {Icons.plus}
                            {intl.formatMessage({ id: 'MANAGE_SEED_LIST_KEYS_ADD_NEW_BTN_TEXT' })}
                        </Button>,
                    ]}
                />
            </Footer>
        </Container>
    )
})
