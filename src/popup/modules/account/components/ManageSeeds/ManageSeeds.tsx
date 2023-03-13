import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useCallback } from 'react'

import SeedImg from '@app/popup/assets/img/seed.svg'
import PlusIcon from '@app/popup/assets/icons/plus.svg'
import DeleteIcon from '@app/popup/assets/icons/delete.svg'
import RecieveIcon from '@app/popup/assets/icons/recieve.svg'
import {
    Button,
    Container,
    Content,
    DropdownMenu,
    Footer,
    Header, Input,
    useConfirmation,
    useViewModel,
} from '@app/popup/modules/shared'
import { convertAddress } from '@app/shared'

import { List } from '../List'
import { SeedDropdownMenu } from '../SeedDropdownMenu'
import { ManageSeedsViewModel } from './ManageSeedsViewModel'

interface Props {
    onBack: () => void;
}

const deleteIcon = <DeleteIcon />
const recieveIcon = <RecieveIcon />

export const ManageSeeds = observer(({ onBack }: Props): JSX.Element => {
    const vm = useViewModel(ManageSeedsViewModel)
    const confirmation = useConfirmation()
    const intl = useIntl()

    const handleDeleteAll = useCallback(async () => {
        const confirmed = await confirmation.show({
            title: intl.formatMessage({ id: 'DELETE_ALL_SEEDS_TITLE' }),
            body: intl.formatMessage({ id: 'DELETE_ALL_SEEDS_TEXT' }),
            confirmBtnText: intl.formatMessage({ id: 'DELETE_ALL_SEEDS_BTN_TEXT' }),
        })

        if (confirmed) {
            await vm.logOut()
        }
    }, [])

    return (
        <Container key="manageSeeds" className="accounts-management">
            <Header>
                <div className="accounts-management__header">
                    <h2>{intl.formatMessage({ id: 'MANAGE_SEEDS_PANEL_HEADER' })}</h2>

                    <DropdownMenu>
                        <DropdownMenu.Item icon={recieveIcon} onClick={vm.onBackup}>
                            {intl.formatMessage({ id: 'BACKUP_ALL_BTN_TEXT' })}
                        </DropdownMenu.Item>
                        <DropdownMenu.Item danger icon={deleteIcon} onClick={handleDeleteAll}>
                            {intl.formatMessage({ id: 'DELETE_ALL_SEEDS_BTN_TEXT' })}
                        </DropdownMenu.Item>
                    </DropdownMenu>
                </div>

                <div className="accounts-management__search">
                    <div className="accounts-management__search-title">
                        {intl.formatMessage({ id: 'MANAGE_SEEDS_LIST_HEADER' })}
                    </div>
                    <button type="button" className="accounts-management__add-btn" onClick={vm.addSeed}>
                        <PlusIcon />
                        {intl.formatMessage({ id: 'MANAGE_SEEDS_LIST_ADD_NEW_LINK_TEXT' })}
                    </button>
                </div>

                <Input
                    size="s"
                    placeholder={intl.formatMessage({ id: 'MANAGE_SEEDS_SEARCH_PLACEHOLDER' })}
                    value={vm.search}
                    onChange={vm.handleSearch}
                />
            </Header>

            <Content className="accounts-management__seeds-content">
                <List className="accounts-management__seeds">
                    {vm.masterKeys.map((key) => {
                        let name = vm.masterKeysNames[key.masterKey] || convertAddress(key.masterKey)
                        const active = vm.selectedMasterKey === key.masterKey
                        const info = intl.formatMessage(
                            { id: 'PUBLIC_KEYS_PLURAL' },
                            { count: vm.keysByMasterKey[key.masterKey]?.length ?? 0 },
                        )

                        if (active) {
                            name += ` ${intl.formatMessage({ id: 'MANAGE_SEEDS_LIST_ITEM_CURRENT' })}`
                        }

                        return (
                            <List.Item
                                className="accounts-management__seeds-item"
                                key={key.masterKey}
                                icon={<img src={SeedImg} alt="" />}
                                active={active}
                                name={name}
                                info={info}
                                addon={<SeedDropdownMenu keyEntry={key} />}
                                onClick={() => vm.onManageMasterKey(key)}
                            />
                        )
                    })}
                </List>

                {vm.masterKeys.length === 0 && (
                    <div className="accounts-management__empty">
                        {intl.formatMessage({ id: 'MANAGE_SEEDS_EMPTY_SEARCH_HINT' })}
                    </div>
                )}
            </Content>

            <Footer>
                <Button design="secondary" disabled={vm.backupInProgress} onClick={onBack}>
                    {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
