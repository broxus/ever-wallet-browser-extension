import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { Virtuoso } from 'react-virtuoso'

import { Icons } from '@app/popup/icons'
import { Button, Container, Content, EmptyPlaceholder, Footer, Header, Navbar, Scroller, SearchInput, SettingsMenu, Space, useSearch, useViewModel } from '@app/popup/modules/shared'

import { List } from '../List'
import { PageHeader } from '../PageHeader'
import { ExportSeed } from '../ExportSeed'
import { ChangeKeyName } from '../ChangeKeyName'
import { ChangePassword } from '../ChangePassword'
import { DeleteSeed } from '../DeleteSeed'
import { ManageSeedViewModel } from './ManageSeedViewModel'
import { KeyListItem } from './KeyListItem'

export const ManageSeed = observer((): JSX.Element => {
    const vm = useViewModel(ManageSeedViewModel)
    const search = useSearch(vm.derivedKeys, vm.filter)
    const intl = useIntl()

    const handleExport = () => vm.panel.open({
        render: () => <ExportSeed keyEntry={vm.currentMasterKey} />,
    })
    const handleChangeName = () => vm.panel.open({
        render: () => <ChangeKeyName keyEntry={vm.currentMasterKey} />,
    })
    const handleChangePwd = () => vm.panel.open({
        render: () => <ChangePassword keyEntry={vm.currentMasterKey} />,
    })
    const handleDelete = () => vm.panel.open({
        render: () => <DeleteSeed keyEntry={vm.currentMasterKey} onClose={() => {}} />,
    })

    return (
        <Container>
            <Header>
                <Navbar
                    back="/"
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
                                    {intl.formatMessage({ id: 'CHANGE_PASSWORD_BTN_TEXT' })}
                                </SettingsMenu.Item>
                            )}
                            <SettingsMenu.Item icon={Icons.delete} onClick={handleDelete} danger>
                                {intl.formatMessage({ id: 'DELETE_SEED_BTN_TEXT' })}
                            </SettingsMenu.Item>
                        </SettingsMenu>
                    )}
                />
            </Header>

            <Content>
                <Space direction="column" gap="l">
                    <PageHeader label={intl.formatMessage({ id: 'CURRENT_SEED_HINT' })}>
                        {vm.seedName}
                    </PageHeader>

                    <SearchInput {...search.props} />

                    <List title={intl.formatMessage({ id: 'MANAGE_SEED_LIST_KEYS_HEADING' })}>
                        <Virtuoso
                            useWindowScroll
                            components={{ EmptyPlaceholder, Scroller }}
                            fixedItemHeight={72}
                            data={search.list}
                            computeItemKey={(_, { key }) => key.publicKey}
                            itemContent={(_, { key, active, accounts }) => (
                                <KeyListItem
                                    keyEntry={key}
                                    active={active}
                                    accounts={accounts}
                                    onClick={vm.onManageDerivedKey}
                                />
                            )}
                        />
                    </List>
                </Space>
            </Content>

            <Footer>
                <Button disabled={vm.signerName === 'encrypted_key'} onClick={vm.addKey}>
                    {Icons.plus}
                    {intl.formatMessage({ id: 'MANAGE_SEED_LIST_KEYS_ADD_NEW_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
