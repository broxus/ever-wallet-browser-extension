/* eslint-disable max-len */
import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Amount, Button, ConnectionStore, Container, Content, Empty, Footer, Icon, SearchInput, SlidingPanelHandle, Space, useResolve, useSearch } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { convertAddress, convertEvers } from '@app/shared'
import { Jdenticon } from '@app/popup/modules/shared/components/Jdenticon'
import { AccountsListItem } from '@app/popup/modules/main/components/Dashboard/AccountsList/Item'
import { AccountListViewModel } from '@app/popup/modules/main/components/Dashboard/AccountsList/AccountListViewModel'
import { SlidingPanelHeader } from '@app/popup/modules/shared/components/SlidingPanel/SlidingPanelHeader'

import styles from './AccountList.module.scss'

export const AccountsList: React.FC = observer(() => {
    const intl = useIntl()
    const vm = useResolve(AccountListViewModel)
    const handle = useResolve(SlidingPanelHandle)
    const connection = useResolve(ConnectionStore)
    const search = useSearch(vm.accounts, vm.filter)
    const selectedRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        handle.update({
            fullHeight: search.props.value.trim().length > 0,
        })
    }, [search.props.value])

    React.useEffect(() => {
        selectedRef.current?.scrollIntoView({ behavior: 'auto', block: 'center' })
    }, [])

    return (
        <>
            <SlidingPanelHeader
                showClose
                className={styles.header}
                onClose={handle.close}
                title={intl.formatMessage({
                    id: 'MANAGE_DERIVED_KEY_LIST_MY_ACCOUNTS_HEADING',
                })}
            >
                <SearchInput
                    {...search.props}
                    autoFocus
                    size="xxs"
                    placeholder={intl.formatMessage({
                        id: 'SEARCH_NAME_ADDRESS_PUBLIC',
                    })}
                />
            </SlidingPanelHeader>

            <Container>
                <Content className={styles.content}>
                    <Space direction="column" gap="l">
                        {search.props.value.trim().length > 0 && search.list.length === 0 && (
                            <Empty />
                        )}
                        <div className={styles.list}>
                            {search.list
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map(item => {
                                    const selected = vm.selectedAccount?.tonWallet.address === item.tonWallet.address
                                    return (
                                        <div
                                            key={item.tonWallet.address}
                                            ref={selected ? selectedRef : null}
                                        >
                                            <AccountsListItem
                                                className={styles.account}
                                                onClick={() => {
                                                    vm.selectAccount(item.tonWallet)
                                                    handle.close()
                                                }}
                                                leftIcon={<Jdenticon size={20} value={item.tonWallet.address} className={styles.jdenticon} />}
                                                rightIcon={selected && <Icon icon="check" />}
                                                title={item.name}
                                                info={(
                                                    <>
                                                        {convertAddress(item.tonWallet.address)}
                                                        <span>•</span>
                                                        <Amount value={convertEvers(vm.accountContractStates[item.tonWallet.address]?.balance ?? '0')} currency={connection.symbol} />
                                                    </>
                                                )}
                                            />
                                        </div>
                                    )
                                })}
                        </div>
                    </Space>
                </Content>

                <Footer className={styles.footer} layer>
                    <FooterAction dir="column">
                        <Button design="accent" key="add" onClick={vm.createAccount}>
                            {intl.formatMessage({ id: 'ADD_ACCOUNT' })}
                        </Button>
                        <Button design="neutral" key="manage" onClick={vm.manageSeeds}>
                            {intl.formatMessage({ id: 'MANAGE_SEEDS_ACCOUNTS' })}
                        </Button>
                    </FooterAction>
                </Footer>
            </Container>
        </>
    )
})
