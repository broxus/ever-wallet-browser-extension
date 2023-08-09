import { observer } from 'mobx-react-lite'
import { FormattedMessage, useIntl } from 'react-intl'
import { useCallback } from 'react'
import { Virtuoso } from 'react-virtuoso'

import { Icons } from '@app/popup/icons'
import { Button, Container, Content, EmptyPlaceholder, Footer, Header, Navbar, Scroller, SearchInput, SettingsMenu, Space, useConfirmation, useSearch, useViewModel } from '@app/popup/modules/shared'

import { List } from '../List'
import { ManageSeedsViewModel } from './ManageSeedsViewModel'
import { SeedListItem } from './SeedListItem'
import { PageHeader } from '../PageHeader'

export const ManageSeeds = observer((): JSX.Element => {
    const vm = useViewModel(ManageSeedsViewModel)
    const search = useSearch(vm.masterKeys, vm.filter)
    const confirmation = useConfirmation()
    const intl = useIntl()

    const handleDeleteAll = useCallback(async () => {
        const confirmed = await confirmation.show({
            title: intl.formatMessage({ id: 'DELETE_ALL_SEEDS_TITLE' }),
            body: intl.formatMessage({ id: 'DELETE_ALL_SEEDS_TEXT' }),
            confirmBtnText: intl.formatMessage({ id: 'DELETE_ALL_SEEDS_CONFIRMATION_BTN_TEXT' }),
        })

        if (confirmed) {
            await vm.logOut()
        }
    }, [])

    return (
        <Container>
            <Header>
                <Navbar
                    close="window"
                    settings={(
                        <SettingsMenu title={intl.formatMessage({ id: 'SEEDS_SETTINGS_TITLE' })}>
                            <SettingsMenu.Item icon={Icons.external} onClick={vm.onBackup}>
                                {intl.formatMessage({ id: 'BACKUP_ALL_BTN_TEXT' })}
                            </SettingsMenu.Item>
                            <SettingsMenu.Item icon={Icons.delete} onClick={handleDeleteAll} danger>
                                {intl.formatMessage({ id: 'DELETE_ALL_SEEDS_BTN_TEXT' })}
                            </SettingsMenu.Item>
                        </SettingsMenu>
                    )}
                />
            </Header>

            <Content>
                <Space direction="column" gap="l">
                    <PageHeader>
                        <FormattedMessage id="MANAGE_SEEDS_PAGE_HEADER" values={{ br: <br /> }} />
                    </PageHeader>

                    <SearchInput {...search.props} />

                    <List title={intl.formatMessage({ id: 'MANAGE_SEEDS_PANEL_HEADER' })}>
                        <Virtuoso
                            useWindowScroll
                            components={{ EmptyPlaceholder, Scroller }}
                            fixedItemHeight={72}
                            data={search.list}
                            computeItemKey={(_, key) => key.masterKey}
                            itemContent={(_, key) => (
                                <SeedListItem
                                    keyEntry={key}
                                    active={vm.selectedMasterKey === key.masterKey}
                                    keys={vm.keysByMasterKey[key.masterKey]?.length ?? 0}
                                    onClick={vm.onManageMasterKey}
                                />
                            )}
                        />
                    </List>
                </Space>
            </Content>

            <Footer>
                <Button disabled={vm.backupInProgress} onClick={vm.addSeed}>
                    {Icons.plus}
                    {intl.formatMessage({ id: 'MANAGE_SEEDS_LIST_ADD_NEW_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
