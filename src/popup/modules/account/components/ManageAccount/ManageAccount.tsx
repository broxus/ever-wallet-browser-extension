import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { convertAddress } from '@app/shared'
import { Amount, Button, Card, Container, Content, CopyButton, Footer, Header, Icon, Navbar, Space, useViewModel } from '@app/popup/modules/shared'
import { Data } from '@app/popup/modules/shared/components/Data'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { Menu } from '@app/popup/modules/shared/components/Menu/Menu'
import { MenuItem } from '@app/popup/modules/shared/components/Menu/MenuItem'

import { ChangeAccountName } from '../ChangeAccountName'
import { KeyListItem } from '../ManageSeed'
import { PageHeader } from '../PageHeader'
import { CustodianList } from '../CustodianList'
import { ManageAccountViewModel } from './ManageAccountViewModel'
import styles from './ManageAccount.module.scss'

export const ManageAccount = observer((): JSX.Element | null => {
    const vm = useViewModel(ManageAccountViewModel)
    const intl = useIntl()

    const handleChangeName = () => vm.panel.open({
        title: intl.formatMessage({ id: 'RENAME_ACCOUNT' }),
        render: () => <ChangeAccountName account={vm.currentAccount!} />,
    })

    if (!vm.currentAccount) return null

    return (
        <Container>
            <Header>
                <Navbar
                    back="../key"
                    settings={(
                        <Menu>
                            <MenuItem onClick={handleChangeName}>
                                <Icon icon="edit" width={16} height={16} />
                                {intl.formatMessage({ id: 'CHANGE_NAME_BTN_TEXT' })}
                            </MenuItem>
                            <MenuItem
                                disabled={vm.isVisible && vm.isActive}
                                onClick={vm.onToggleVisibility}
                            >
                                <Icon icon={vm.isVisible ? 'eyeOff' : 'eye'} width={16} height={16} />
                                {vm.isVisible
                                    ? intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_ACCOUNT_HIDE_TOOLTIP' })
                                    : intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_ACCOUNT_SHOW_TOOLTIP' })}
                            </MenuItem>
                            <MenuItem onClick={vm.onDelete} type="danger">
                                <Icon icon="delete" width={16} height={16} />
                                {intl.formatMessage({ id: 'DELETE_ACCOUNT_BTN_TEXT' })}
                            </MenuItem>
                        </Menu>
                    )}
                >
                    <PageHeader label={intl.formatMessage({ id: 'MANAGE_ACCOUNT_PANEL_HEADER' })}>
                        {vm.currentAccount.name || convertAddress(vm.currentAccount.tonWallet.address)}
                    </PageHeader>
                </Navbar>
            </Header>

            <Content>
                <Space direction="column" gap="xl">
                    <Space direction="column" gap="m">
                        {vm.balance && (
                            <>
                                <Data
                                    dir="v"
                                    label={intl.formatMessage({ id: 'TOTAL_BALANCE_LABEL' })}
                                    value={<Amount value={vm.balance} currency="USD" />}
                                />
                                <hr />
                            </>
                        )}

                        <Data
                            dir="v"
                            label={intl.formatMessage({ id: 'ADDRESS_LABEL' })}
                            value={(
                                <CopyButton text={vm.currentAccount.tonWallet.address}>
                                    <button type="button" className={styles.copy}>
                                        <div className={styles.copyLink}>
                                            {vm.currentAccount.tonWallet.address}
                                        </div>
                                        <div className={styles.copyBtn}>
                                            <Icon icon="copy" width={16} height={16} />
                                        </div>
                                    </button>
                                </CopyButton>
                            )}
                        />
                        <hr />
                    </Space>

                    {vm.linkedKeys.length > 0 && (
                        <Space direction="column" gap="s">
                            <div className={styles.title}>
                                {intl.formatMessage({ id: 'MANAGE_ACCOUNT_LIST_LINKED_KEYS_HEADING' })}
                            </div>

                            <Card bg="layer-1" size="xs" className={styles.list}>
                                {vm.linkedKeys.map(({ key, active, accounts }) => (
                                    <KeyListItem
                                        keyEntry={key}
                                        active={active}
                                        accounts={accounts}
                                        onClick={vm.onManageDerivedKey}
                                    />
                                ))}
                            </Card>
                        </Space>
                    )}

                    {vm.densContacts.length !== 0 && (
                        <Space direction="column" gap="s">
                            <div className={styles.title}>
                                {intl.formatMessage({ id: 'DENS_LIST_TITLE' })}
                            </div>

                            <Card bg="layer-1" size="xs" className={styles.list}>
                                {vm.densContacts.map(({ path }) => (
                                    <CopyButton key={path} text={path}>
                                        <button type="button" className={styles.densItem}>
                                            {path}
                                            <Icon icon="copy" width={16} height={16} />
                                        </button>
                                    </CopyButton>
                                ))}
                            </Card>
                        </Space>
                    )}

                    {vm.custodians.length > 1 && (
                        <Space direction="column" gap="s">
                            <div className={styles.title}>
                                {intl.formatMessage({ id: 'ACCOUNT_CUSTODIANS_TITLE' })}
                            </div>

                            <Card bg="layer-1" size="xs" className={styles.list}>
                                <CustodianList address={vm.currentAccount.tonWallet.address} />
                            </Card>
                        </Space>
                    )}
                </Space>
            </Content>

            <Footer layer>
                <FooterAction
                    buttons={[
                        <Button design="accent" disabled={!vm.isVisible} onClick={vm.onSelectAccount}>
                            {intl.formatMessage({ id: 'MANAGE_ACCOUNT_GO_TO_ACCOUNT_BTN_TEXT' })}
                        </Button>,
                    ]}
                />
            </Footer>
        </Container>
    )
})
