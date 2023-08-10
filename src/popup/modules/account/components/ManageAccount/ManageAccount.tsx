import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { Virtuoso } from 'react-virtuoso'

import { convertAddress } from '@app/shared'
import { Button, Space, Container, Content, CopyButton, DropdownMenu, Footer, Header, IconButton, Input, UserAvatar, useSearch, useViewModel } from '@app/popup/modules/shared'
import EditIcon from '@app/popup/assets/icons/edit.svg'
import EyeIcon from '@app/popup/assets/icons/eye.svg'
import EyeOffIcon from '@app/popup/assets/icons/eye-off.svg'
import CopyIcon from '@app/popup/assets/icons/copy.svg'
import DeleteIcon from '@app/popup/assets/icons/delete.svg'

import { List } from '../List'
import { ChangeAccountName } from '../ChangeAccountName'
import { KeyListItem } from '../ManageSeed'
import { ManageAccountViewModel } from './ManageAccountViewModel'

import './ManageAccount.scss'

const editIcon = <EditIcon />
const eyeIcon = <EyeIcon />
const eyeOffIcon = <EyeOffIcon />
const copyIcon = <CopyIcon />
const deleteIcon = <DeleteIcon />

export const ManageAccount = observer((): JSX.Element | null => {
    const vm = useViewModel(ManageAccountViewModel)
    const search = useSearch(vm.linkedKeys, vm.filter)
    const intl = useIntl()

    const handleChangeName = () => vm.panel.open({
        render: () => <ChangeAccountName account={vm.currentAccount!} />,
    })

    if (!vm.currentAccount) return null

    return (
        <Container className="accounts-management manage-account">
            <Header>
                <div className="accounts-management__header">
                    <UserAvatar className="accounts-management__header-img" address={vm.currentAccount.tonWallet.address} />
                    <h2 className="accounts-management__header-title">
                        {vm.currentAccount.name || convertAddress(vm.currentAccount.tonWallet.address)}
                    </h2>
                    <DropdownMenu>
                        <DropdownMenu.Item
                            disabled={vm.isVisible && vm.isActive}
                            icon={vm.isVisible ? eyeOffIcon : eyeIcon}
                            onClick={vm.onToggleVisibility}
                        >
                            {vm.isVisible
                                ? intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_ACCOUNT_HIDE_TOOLTIP' })
                                : intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_ACCOUNT_SHOW_TOOLTIP' })}
                        </DropdownMenu.Item>
                        <DropdownMenu.Item icon={editIcon} onClick={handleChangeName}>
                            {intl.formatMessage({ id: 'CHANGE_NAME_BTN_TEXT' })}
                        </DropdownMenu.Item>
                        <DropdownMenu.Item danger icon={deleteIcon} onClick={vm.onDelete}>
                            {intl.formatMessage({ id: 'DELETE_ACCOUNT_BTN_TEXT' })}
                        </DropdownMenu.Item>
                    </DropdownMenu>
                </div>
            </Header>

            <Content>
                <div className="manage-account__address">
                    <div className="manage-account__address-text">{vm.currentAccount.tonWallet.address}</div>
                    <CopyButton text={vm.currentAccount.tonWallet.address}>
                        <IconButton className="manage-account__address-btn" icon={copyIcon} />
                    </CopyButton>
                </div>

                {vm.densContacts.length !== 0 && (
                    <>
                        <div className="manage-account__content-header">
                            {intl.formatMessage({ id: 'DENS_LIST_TITLE' })}
                        </div>
                        <div className="manage-account__dens">
                            {vm.densContacts.map(({ path }) => (
                                <div className="manage-account__dens-item" key={path}>
                                    <div className="manage-account__dens-item-path" title={path}>{path}</div>
                                    <CopyButton text={path}>
                                        <IconButton className="manage-account__dens-item-icon" icon={copyIcon} />
                                    </CopyButton>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {vm.linkedKeys.length > 0 && (
                    <>
                        <div className="manage-account__content-header">
                            {intl.formatMessage({
                                id: 'MANAGE_ACCOUNT_LIST_LINKED_KEYS_HEADING',
                            })}
                        </div>

                        <Input
                            className="manage-account__search"
                            placeholder={intl.formatMessage({ id: 'MANAGE_SEED_SEARCH_PLACEHOLDER' })}
                            {...search.props}
                        />

                        <List title="">
                            <Virtuoso
                                useWindowScroll
                                fixedItemHeight={54}
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
                    </>
                )}
            </Content>

            <Footer>
                <Space direction="column" gap="s">
                    <Button design="secondary" onClick={vm.onBack}>
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button disabled={!vm.isVisible} onClick={vm.onSelectAccount}>
                        {intl.formatMessage({ id: 'MANAGE_ACCOUNT_GO_TO_ACCOUNT_BTN_TEXT' })}
                    </Button>
                </Space>
            </Footer>
        </Container>
    )
})
