import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { Virtuoso } from 'react-virtuoso'

import { convertAddress, convertPublicKey } from '@app/shared'
import { Icons } from '@app/popup/icons'
import { Amount, Button, Container, Content, CopyButton, EmptyPlaceholder, Footer, Header, Navbar, ParamsPanel, Scroller, SettingsMenu, Space, useSearch, useViewModel } from '@app/popup/modules/shared'

import { List } from '../List'
import { ChangeAccountName } from '../ChangeAccountName'
import { KeyListItem } from '../ManageSeed'
import { ManageAccountViewModel } from './ManageAccountViewModel'
import { PageHeader } from '../PageHeader'
import styles from './ManageAccount.module.scss'

export const ManageAccount = observer((): JSX.Element | null => {
    const vm = useViewModel(ManageAccountViewModel)
    const search = useSearch(vm.linkedKeys, vm.filter)
    const intl = useIntl()

    const handleChangeName = () => vm.panel.open({
        render: () => <ChangeAccountName account={vm.currentAccount!} />,
    })

    if (!vm.currentAccount) return null

    return (
        <Container>
            <Header>
                <Navbar
                    back="../key"
                    settings={(
                        <SettingsMenu title={intl.formatMessage({ id: 'ACCOUNT_SETTINGS_TITLE' })}>
                            <SettingsMenu.Item icon={Icons.edit} onClick={handleChangeName}>
                                {intl.formatMessage({ id: 'CHANGE_NAME_BTN_TEXT' })}
                            </SettingsMenu.Item>
                            <SettingsMenu.Item
                                disabled={vm.isVisible && vm.isActive}
                                icon={vm.isVisible ? Icons.eyeOff : Icons.eye}
                                onClick={vm.onToggleVisibility}
                            >
                                {vm.isVisible
                                    ? intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_ACCOUNT_HIDE_TOOLTIP' })
                                    : intl.formatMessage({ id: 'MANAGE_DERIVED_KEY_ACCOUNT_SHOW_TOOLTIP' })}
                            </SettingsMenu.Item>
                            <SettingsMenu.Item icon={Icons.delete} onClick={vm.onDelete} danger>
                                {intl.formatMessage({ id: 'DELETE_ACCOUNT_BTN_TEXT' })}
                            </SettingsMenu.Item>
                        </SettingsMenu>
                    )}
                >
                    <PageHeader label={intl.formatMessage({ id: 'MANAGE_ACCOUNT_PANEL_HEADER' })}>
                        {vm.currentAccount.name || convertAddress(vm.currentAccount.tonWallet.address)}
                    </PageHeader>
                </Navbar>
            </Header>

            <Content>
                <Space direction="column" gap="l">
                    {/* {vm.linkedKeys.length > 0 && (
                        <SearchInput {...search.props} />
                    )} */}

                    <ParamsPanel>
                        {vm.balance && (
                            <ParamsPanel.Param label={intl.formatMessage({ id: 'TOTAL_BALANCE_LABEL' })}>
                                <Amount value={vm.balance} currency="USD" />
                            </ParamsPanel.Param>
                        )}
                        <ParamsPanel.Param label={intl.formatMessage({ id: 'ADDRESS_LABEL' })}>
                            <CopyButton text={vm.currentAccount.tonWallet.address}>
                                <button type="button" className={styles.copy}>
                                    <div className={styles.copyLink}>
                                        {vm.currentAccount.tonWallet.address}
                                    </div>
                                    <div className={styles.copyBtn}>
                                        {Icons.copy}
                                    </div>
                                </button>
                            </CopyButton>
                        </ParamsPanel.Param>
                    </ParamsPanel>

                    {vm.linkedKeys.length > 0 && (
                        <List title={intl.formatMessage({ id: 'MANAGE_ACCOUNT_LIST_LINKED_KEYS_HEADING' })}>
                            <Virtuoso
                                customScrollParent={document.body}
                                components={{ EmptyPlaceholder, Scroller }}
                                fixedItemHeight={64}
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
                    )}

                    {vm.densContacts.length !== 0 && (
                        <div className={styles.pane}>
                            <div className={styles.title}>
                                {intl.formatMessage({ id: 'DENS_LIST_TITLE' })}
                            </div>
                            {vm.densContacts.map(({ path }) => (
                                <CopyButton key={path} text={path}>
                                    <button type="button" className={styles.densItem}>
                                        {path}
                                        {Icons.copy}
                                    </button>
                                </CopyButton>
                            ))}
                        </div>
                    )}

                    {vm.custodians.length > 1 && (
                        <div className={styles.pane}>
                            <div className={styles.title}>
                                {intl.formatMessage({ id: 'ACCOUNT_CUSTODIANS_TITLE' })}
                            </div>

                            {vm.custodians.map((publicKey) => (
                                <div key={publicKey} className={styles.custodian}>
                                    <div className={styles.wrap}>
                                        <div className={styles.custodianName}>
                                            {convertPublicKey(publicKey)} {/* TODO: name? */}
                                        </div>
                                        <div className={styles.custodianKey}>
                                            {convertPublicKey(publicKey)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Space>
            </Content>

            <Footer>
                <Button disabled={!vm.isVisible} onClick={vm.onSelectAccount}>
                    {intl.formatMessage({ id: 'MANAGE_ACCOUNT_GO_TO_ACCOUNT_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
