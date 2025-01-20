import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useCallback } from 'react'

import { Icons } from '@app/popup/icons'
import { Button, Card, Container, Content, Footer, Header, Icon, Navbar, useConfirmation, useViewModel } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { Menu } from '@app/popup/modules/shared/components/Menu/Menu'
import { MenuItem } from '@app/popup/modules/shared/components/Menu/MenuItem'

import { ManageSeedsViewModel } from './ManageSeedsViewModel'
import { SeedListItem } from './SeedListItem'
import styles from './SeedListItem.module.scss'

export const ManageSeeds = observer((): JSX.Element => {
    const vm = useViewModel(ManageSeedsViewModel)
    const confirmation = useConfirmation()
    const intl = useIntl()

    const handleDeleteAll = useCallback(async () => {
        const confirmed = await confirmation.show({
            heading: 'Delete all seeds',
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
                        <Menu>
                            <MenuItem onClick={vm.onBackup}>
                                <Icon icon="external" width={16} height={16} />
                                {intl.formatMessage({ id: 'BACKUP_ALL_BTN_TEXT' })}
                            </MenuItem>
                            <MenuItem type="danger" onClick={handleDeleteAll}>
                                <Icon icon="delete" width={16} height={16} />
                                {intl.formatMessage({ id: 'DELETE_ALL_SEEDS_BTN_TEXT' })}
                            </MenuItem>
                        </Menu>
                    )}
                >
                    {intl.formatMessage({ id: 'MY_SEEDS' })}
                </Navbar>
            </Header>

            <Content>
                <Card bg="layer-1" size="s" className={styles.card}>
                    {vm.masterKeys.map((key, index) => (
                        <SeedListItem
                            index={index}
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
                <FooterAction>
                    <Button design="accent" disabled={vm.backupInProgress} onClick={vm.addSeed}>
                        {Icons.plus}
                        {intl.formatMessage({ id: 'MANAGE_SEEDS_LIST_ADD_NEW_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})
