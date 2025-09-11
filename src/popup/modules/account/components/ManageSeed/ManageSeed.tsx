import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { Button, Card, Container, Content, Footer, Header, Icon, Navbar, Space, useViewModel } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { Menu } from '@app/popup/modules/shared/components/Menu/Menu'
import { MenuItem } from '@app/popup/modules/shared/components/Menu/MenuItem'

import { PageHeader } from '../PageHeader'
import { ExportSeed } from '../ExportSeed'
import { ChangeKeyName } from '../ChangeKeyName'
import { PasswordSettings } from '../ChangePassword'
import { DeleteSeed } from '../DeleteSeed'
import { ManageSeedViewModel } from './ManageSeedViewModel'
import { KeyListItem } from './KeyListItem'
import styles from './ManageSeed.module.scss'
import { ScanSeed } from '../ScanSeed'

export const ManageSeed = observer((): JSX.Element | null => {
    const vm = useViewModel(ManageSeedViewModel)
    const intl = useIntl()

    const handleExport = () => vm.panel.open({
        render: () => <ExportSeed keyEntry={vm.currentMasterKey!} />,
    })
    const handleChangeName = () => vm.panel.open({
        render: () => <ChangeKeyName keyEntry={vm.currentMasterKey!} />,
    })
    const handleChangePwd = () => vm.panel.open({
        title: intl.formatMessage({ id: 'PASSWORD_SETTINGS_PANEL_HEADER' }),
        render: () => <PasswordSettings keyEntry={vm.currentMasterKey!} />,
    })
    const handleDelete = () => vm.panel.open({
        render: () => <DeleteSeed keyEntry={vm.currentMasterKey!} onDeleted={vm.onSeedDeleted} />,
    })
    const handleScan = () => vm.panel.open({
        render: () => <ScanSeed />,
        title: intl.formatMessage({ id: 'PASSWORD_FORM_HEADER' }),
    })

    if (!vm.currentMasterKey) return null

    return (
        <Container>
            <Header>
                <Navbar
                    back=".."
                    settings={(
                        <Menu>
                            {vm.selectedMasterKey !== vm.currentMasterKey.masterKey && (
                                <MenuItem onClick={vm.selectMasterKey}>
                                    <Icon icon="chevronRight" width={16} height={16} />
                                    {intl.formatMessage({ id: 'USE_THIS_SEED_BTN_TEXT' })}
                                </MenuItem>
                            )}
                            <MenuItem onClick={handleChangeName}>
                                <Icon icon="edit" width={16} height={16} />
                                {intl.formatMessage({ id: 'CHANGE_NAME_BTN_TEXT' })}
                            </MenuItem>
                            {vm.currentMasterKey.signerName !== 'ledger_key' && (
                                <MenuItem onClick={handleExport}>
                                    <Icon icon="external" width={16} height={16} />
                                    {intl.formatMessage({ id: 'EXPORT_SEED_BTN_TEXT' })}
                                </MenuItem>
                            )}
                            {vm.currentMasterKey.signerName !== 'encrypted_key' && (
                                <MenuItem onClick={handleScan}>
                                    <Icon icon="search" width={16} height={16} />
                                    {intl.formatMessage({ id: 'SCAN_SEED' })}
                                </MenuItem>
                            )}
                            {vm.currentMasterKey.signerName !== 'ledger_key' && (
                                <MenuItem onClick={handleChangePwd}>
                                    <Icon icon="lock" width={16} height={16} />
                                    {intl.formatMessage({ id: 'PASSWORD_SETTINGS_BTN_TEXT' })}
                                </MenuItem>
                            )}
                            <MenuItem onClick={handleDelete} type="danger" disabled={vm.selectedMasterKey === vm.currentMasterKey.masterKey}>
                                <Icon icon="delete" width={16} height={16} />
                                {intl.formatMessage({ id: 'DELETE_SEED_BTN_TEXT' })}
                            </MenuItem>
                        </Menu>
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
                <FooterAction>
                    <Button design="accent" disabled={vm.signerName === 'encrypted_key'} onClick={vm.addKey}>
                        {Icons.plus}
                        {intl.formatMessage({ id: 'MANAGE_SEED_LIST_KEYS_ADD_NEW_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})
