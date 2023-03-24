import copy from 'copy-to-clipboard'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { Virtuoso } from 'react-virtuoso'
import { CSSProperties } from 'react'
import { Tooltip } from 'react-tooltip'

import {
    Button,
    ButtonGroup,
    Container,
    Content, DropdownMenu,
    Footer,
    Header,
    Input,
    useSearch, useSlidingPanel,
    useViewModel,
} from '@app/popup/modules/shared'
import KeyIcon from '@app/popup/assets/icons/key.svg'
import EditIcon from '@app/popup/assets/icons/edit.svg'
import CopyIcon from '@app/popup/assets/icons/copy.svg'
import DeleteIcon from '@app/popup/assets/icons/delete.svg'

import { List } from '../List'
import { ChangeKeyName } from '../ChangeKeyName'
import { ManageDerivedKeyViewModel } from './ManageDerivedKeyViewModel'
import { AccountListItem } from './AccountListItem'

const editIcon = <EditIcon />
const copyIcon = <CopyIcon />
const deleteIcon = <DeleteIcon />

const tooltipStyle: CSSProperties = {
    fontSize: '12px',
    lineHeight: '16px',
    padding: '8px',
    zIndex: 102,
}

export const ManageDerivedKey = observer((): JSX.Element => {
    const vm = useViewModel(ManageDerivedKeyViewModel)
    const search = useSearch(vm.accounts, vm.filter)
    const panel = useSlidingPanel()
    const intl = useIntl()

    const handleChangeName = () => panel.open({
        render: () => <ChangeKeyName derivedKey keyEntry={vm.currentDerivedKey} onClose={panel.close} />,
    })
    const handleCopy = () => {
        copy(vm.currentDerivedKey.publicKey)
        vm.notification.show(
            intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_COPIED_NOTIFICATION' }),
        )
    }

    return (
        <Container className="accounts-management">
            <Header>
                <div className="accounts-management__header">
                    <KeyIcon className="accounts-management__header-img" />
                    <h2 className="accounts-management__header-title">
                        {vm.currentDerivedKey.name}
                    </h2>
                    <DropdownMenu>
                        <DropdownMenu.Item icon={copyIcon} onClick={handleCopy}>
                            {intl.formatMessage({ id: 'COPY_PUBLIC_KEY_BTN_TEXT' })}
                        </DropdownMenu.Item>
                        <DropdownMenu.Item icon={editIcon} onClick={handleChangeName}>
                            {intl.formatMessage({ id: 'CHANGE_NAME_BTN_TEXT' })}
                        </DropdownMenu.Item>
                        <DropdownMenu.Item danger icon={deleteIcon} onClick={vm.onDelete}>
                            {intl.formatMessage({ id: 'DELETE_KEY_BTN_TEXT' })}
                        </DropdownMenu.Item>
                    </DropdownMenu>
                </div>

                <Input
                    className="accounts-management__search"
                    size="s"
                    placeholder={intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_SEARCH_PLACEHOLDER' })}
                    {...search.props}
                />
            </Header>

            <Content>
                <List className="accounts-management__accounts">
                    <Virtuoso
                        useWindowScroll
                        fixedItemHeight={54}
                        data={search.list}
                        computeItemKey={(_, account) => account.tonWallet.address}
                        itemContent={(_, account) => (
                            <AccountListItem
                                account={account}
                                active={vm.selectedAccountAddress === account.tonWallet.address}
                                visible={vm.accountsVisibility[account.tonWallet.address]}
                                external={account.tonWallet.publicKey !== vm.currentDerivedKey?.publicKey}
                                onChangeVisibility={vm.onChangeVisibility}
                                onClick={vm.onManageAccount}
                            />
                        )}
                    />
                    <Tooltip
                        noArrow
                        variant="dark"
                        anchorSelect=".tooltip-anchor-element"
                        style={tooltipStyle}
                        render={({ activeAnchor }) => {
                            if (!activeAnchor) return null
                            return activeAnchor.dataset.visible === 'true'
                                ? intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_ACCOUNT_HIDE_TOOLTIP' })
                                : intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_ACCOUNT_SHOW_TOOLTIP' })
                        }}
                    />
                </List>

                {vm.accounts.length === 0 && (
                    <div className="accounts-management__list-empty">
                        {intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_LIST_NO_ACCOUNTS' })}
                    </div>
                )}
            </Content>

            <Footer>
                <ButtonGroup>
                    <Button group="small" design="secondary" onClick={vm.onBack}>
                        {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                    </Button>
                    <Button onClick={vm.addAccount}>
                        {intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_LISTS_ACCOUNTS_ADD_NEW_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Container>
    )
})
