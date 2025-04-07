import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useCallback } from 'react'

import { Icons } from '@app/popup/icons'
import { Button, Card, Container, Content, Footer, Header, Icon, Navbar, Space, useCopyToClipboard, useViewModel } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { Menu } from '@app/popup/modules/shared/components/Menu/Menu'
import { MenuItem } from '@app/popup/modules/shared/components/Menu/MenuItem'

import { ChangeKeyName } from '../ChangeKeyName'
import { ShowPrivateKey } from '../ShowPrivateKey'
import { PageHeader } from '../PageHeader'
import { DeleteKey } from '../DeleteKey'
import { SelectAccountAddingFlow } from '../SelectAccountAddingFlow'
import { ManageDerivedKeyViewModel } from './ManageDerivedKeyViewModel'
import { AccountListItem } from './AccountListItem'
import styles from './ManageDerivedKey.module.scss'

export const ManageDerivedKey = observer((): JSX.Element | null => {
    const vm = useViewModel(ManageDerivedKeyViewModel)
    const copy = useCopyToClipboard()
    const intl = useIntl()

    const handleChangeName = useCallback(() => {
        vm.panel.open({
            render: () => <ChangeKeyName keyEntry={vm.currentDerivedKey!} derivedKey />,
        })
    }, [])
    const handleShowPrivateKey = useCallback(() => {
        vm.panel.open({
            showClose: false,
            render: () => <ShowPrivateKey keyEntry={vm.currentDerivedKey!} />,
        })
    }, [])
    const handleCopy = useCallback(() => {
        copy(
            vm.currentDerivedKey!.publicKey,
            intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_COPIED_NOTIFICATION' }),
        )
    }, [])
    const handleDelete = useCallback(() => {
        vm.panel.open({
            title: intl.formatMessage({ id: 'DELETE_KEY_HEADER' }),
            render: () => <DeleteKey keyEntry={vm.currentDerivedKey!} onDeleted={vm.onKeyDeleted} />,
        })
    }, [])
    const handleAddAccount = useCallback(() => {
        vm.panel.open({
            title: intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_LISTS_ACCOUNTS_ADD_NEW_BTN_TEXT' }),
            render: () => <SelectAccountAddingFlow onFlow={vm.addAccount} />,
        })
    }, [])

    if (!vm.currentDerivedKey) return null

    return (
        <Container>
            <Header>
                <Navbar
                    back="../seed"
                    settings={(
                        <Menu>
                            <MenuItem onClick={handleChangeName}>
                                <Icon icon="edit" width={16} height={16} />
                                {intl.formatMessage({ id: 'CHANGE_NAME_BTN_TEXT' })}
                            </MenuItem>
                            <MenuItem onClick={handleCopy}>
                                <Icon icon="copy" width={16} height={16} />
                                {intl.formatMessage({ id: 'COPY_PUBLIC_KEY_BTN_TEXT' })}
                            </MenuItem>
                            {vm.currentDerivedKey.signerName !== 'ledger_key' && (
                                <MenuItem onClick={handleShowPrivateKey}>
                                    <Icon icon="eye" width={16} height={16} />
                                    {intl.formatMessage({ id: 'SHOW_PRIVATE_KEY_BTN_TEXT' })}
                                </MenuItem>
                            )}
                            <MenuItem
                                type="danger"
                                disabled={!vm.canDelete}
                                onClick={handleDelete}
                            >
                                <Icon icon="delete" width={16} height={16} />
                                {intl.formatMessage({ id: 'DELETE_KEY_BTN_TEXT' })}
                            </MenuItem>
                        </Menu>
                    )}
                >
                    <PageHeader label={intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_PLACEHOLDER_LABEL' })}>
                        {vm.currentDerivedKey.name}
                    </PageHeader>
                </Navbar>
            </Header>

            <Content>
                <Space direction="column" gap="l">
                    <div className={styles.title}>
                        {intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_LISTS_ACCOUNTS_HEADER' })}
                    </div>
                    <Card bg="layer-1" size="xs" className={styles.list}>
                        {vm.accounts.map(account => (
                            <AccountListItem
                                account={account}
                                active={vm.selectedAccountAddress === account.tonWallet.address}
                                visible={vm.accountsVisibility[account.tonWallet.address]}
                                external={account.tonWallet.publicKey !== vm.currentDerivedKey?.publicKey}
                                onChangeVisibility={vm.onChangeVisibility}
                                onClick={vm.onManageAccount}
                            />
                        ))}
                    </Card>
                </Space>
            </Content>

            <Footer layer>
                <FooterAction>
                    <Button onClick={handleAddAccount}>
                        {Icons.plus}
                        {intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_LISTS_ACCOUNTS_ADD_NEW_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})
