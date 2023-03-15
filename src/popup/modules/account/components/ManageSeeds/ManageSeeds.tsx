import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { CSSProperties, ReactNode, useCallback } from 'react'
import { Tooltip } from 'react-tooltip'

import SeedImg from '@app/popup/assets/img/seed.svg'
import PlusIcon from '@app/popup/assets/icons/plus.svg'
import DeleteIcon from '@app/popup/assets/icons/delete.svg'
import RecieveIcon from '@app/popup/assets/icons/recieve.svg'
import CheckIcon from '@app/popup/assets/icons/check.svg'
import {
    Button,
    ButtonGroup,
    Container,
    Content,
    DropdownMenu,
    Footer,
    Header,
    IconButton,
    Input,
    useConfirmation,
    useSearch,
    useViewModel,
} from '@app/popup/modules/shared'

import { List } from '../List'
import { SeedDropdownMenu } from '../SeedDropdownMenu'
import { ManageSeedsViewModel } from './ManageSeedsViewModel'

interface Props {
    onBack: () => void;
}

const deleteIcon = <DeleteIcon />
const recieveIcon = <RecieveIcon />
const plusIcon = <PlusIcon />
const checkIcon = <CheckIcon />

const tooltipStyle: CSSProperties = {
    fontSize: '12px',
    lineHeight: '16px',
    padding: '8px',
    zIndex: 102,
}

export const ManageSeeds = observer(({ onBack }: Props): JSX.Element => {
    const vm = useViewModel(ManageSeedsViewModel)
    const search = useSearch(vm.masterKeys, vm.filter)
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
                        <DropdownMenu.Item icon={plusIcon} onClick={vm.addSeed}>
                            {intl.formatMessage({ id: 'MANAGE_SEEDS_LIST_ADD_NEW_BTN_TEXT' })}
                        </DropdownMenu.Item>
                        <DropdownMenu.Item icon={recieveIcon} onClick={vm.onBackup}>
                            {intl.formatMessage({ id: 'BACKUP_ALL_BTN_TEXT' })}
                        </DropdownMenu.Item>
                        <DropdownMenu.Item danger icon={deleteIcon} onClick={handleDeleteAll}>
                            {intl.formatMessage({ id: 'DELETE_ALL_SEEDS_BTN_TEXT' })}
                        </DropdownMenu.Item>
                    </DropdownMenu>
                </div>

                <Input
                    className="accounts-management__search"
                    size="s"
                    placeholder={intl.formatMessage({ id: 'MANAGE_SEEDS_SEARCH_PLACEHOLDER' })}
                    {...search.props}
                />
            </Header>

            <Content className="accounts-management__content">
                <List className="accounts-management__seeds">
                    {search.list.map((key) => {
                        let name: ReactNode = key.name
                        const active = vm.selectedMasterKey === key.masterKey
                        const info = intl.formatMessage(
                            { id: 'PUBLIC_KEYS_PLURAL' },
                            { count: vm.keysByMasterKey[key.masterKey]?.length ?? 0 },
                        )
                        const addon = (
                            <>
                                {!active && (
                                    <IconButton
                                        className="tooltip-anchor-element"
                                        icon={checkIcon}
                                        onClick={() => vm.selectMasterKey(key)}
                                    />
                                )}
                                <SeedDropdownMenu keyEntry={key} />
                            </>
                        )

                        if (active) {
                            name = (
                                <>
                                    <span>{name}</span>
                                    <small>{intl.formatMessage({ id: 'MANAGE_SEEDS_LIST_ITEM_CURRENT' })}</small>
                                </>
                            )
                        }

                        return (
                            <List.Item
                                key={key.masterKey}
                                icon={<img src={SeedImg} alt="" />}
                                active={active}
                                name={name}
                                info={info}
                                addon={addon}
                                onClick={() => vm.onManageMasterKey(key)}
                            />
                        )
                    })}
                    <Tooltip
                        variant="dark"
                        anchorSelect=".tooltip-anchor-element"
                        content={intl.formatMessage({ id: 'USE_THIS_SEED_BTN_TEXT' })}
                        style={tooltipStyle}
                        noArrow
                    />
                </List>

                {search.list.length === 0 && (
                    <div className="accounts-management__empty">
                        {intl.formatMessage({ id: 'MANAGE_SEEDS_EMPTY_SEARCH_HINT' })}
                    </div>
                )}
            </Content>

            <Footer>
                <ButtonGroup>
                    <Button
                        design="secondary"
                        group="small"
                        disabled={vm.backupInProgress}
                        onClick={onBack}
                    >
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button disabled={vm.backupInProgress} onClick={vm.addSeed}>
                        {intl.formatMessage({ id: 'MANAGE_SEEDS_LIST_ADD_NEW_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Container>
    )
})
