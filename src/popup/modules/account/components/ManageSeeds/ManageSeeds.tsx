import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useCallback } from 'react'

import { Icons } from '@app/popup/icons'
import { Button, Card, Container, Content, Footer, Header, Navbar, SettingsMenu, useConfirmation, useViewModel } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import { ManageSeedsViewModel } from './ManageSeedsViewModel'
import { SeedListItem } from './SeedListItem'
import styles from './SeedListItem.module.scss'

export const ManageSeeds = observer((): JSX.Element => {
    const vm = useViewModel(ManageSeedsViewModel)
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
                >
                    {intl.formatMessage({ id: 'MY_SEEDS' })}
                </Navbar>
            </Header>

            <Content>
                <Card bg="layer-1" size="s" className={styles.card}>
                    {vm.masterKeys.map(key => (
                        <SeedListItem
                            keyEntry={key}
                            active={vm.selectedMasterKey === key.masterKey}
                            keys={vm.keysByMasterKey[key.masterKey]?.length ?? 0}
                            onSelect={vm.selectMasterKey}
                            onClick={vm.onManageMasterKey}
                        />
                    ))}
                </Card>
            </Content>

            <Footer layer>
                <FooterAction
                    buttons={[
                        <Button design="accent" disabled={vm.backupInProgress} onClick={vm.addSeed}>
                            {Icons.plus}
                            {intl.formatMessage({ id: 'MANAGE_SEEDS_LIST_ADD_NEW_BTN_TEXT' })}
                        </Button>,
                    ]}
                />
            </Footer>
        </Container>
    )
})
