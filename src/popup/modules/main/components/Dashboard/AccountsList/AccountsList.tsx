/* eslint-disable max-len */
import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import sortBy from 'lodash.sortby'
import { AssetsList } from '@broxus/ever-wallet-wasm'

import { Amount, Button, ConnectionStore, Container, Content, Empty, Footer, Icon, SearchInput, Space, useResolve, useSearch } from '@app/popup/modules/shared'
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
    const connection = useResolve(ConnectionStore)
    const search = useSearch(vm.accounts, vm.filter)
    const selectedRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        vm.handle.update({
            fullHeight: search.props.value.trim().length > 0,
        })
    }, [search.props.value])

    React.useEffect(() => {
        selectedRef.current?.scrollIntoView({ behavior: 'auto', block: 'center' })

        return vm.dispose
    }, [])

    const byMaster = React.useMemo(() => {
        const result: {[publickKey: string]: AssetsList[]} = {}
        for (let i = 0; i < search.list.length; i++) {
            const item = search.list[i]

            const external = vm.externalAccounts[item.tonWallet.address]
            if (external) {
                external.externalIn.forEach(publicKey => {
                    const master = vm.masterByPublicKey[publicKey]
                    if (master) {
                        result[master] = result[master] || []
                        result[master].push(item)
                    }
                })
            }

            const master = vm.masterByPublicKey[item.tonWallet.publicKey]
            if (master) {
                result[master] = result[master] || []
                result[master].push(item)
            }
        }
        return result
    }, [search.list, vm.externalAccounts, vm.masterByPublicKey])

    const withMaster = React.useMemo(
        () => Object.entries(byMaster)
            .map(([key, acc]) => ([vm.masterByKey[key], acc] as const))
            .filter(([master]) => !!master),
        [vm.masterByKey, byMaster],
    )

    const result = React.useMemo(
        () => sortBy(withMaster, ([master]) => master.name),
        [withMaster],
    )

    return (
        <>
            <SlidingPanelHeader
                showClose
                className={styles.header}
                onClose={vm.handle.close}
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

            <Container className={styles.container}>
                <Content className={styles.content}>
                    <Space direction="column" gap="l">
                        {search.props.value.trim().length > 0 && search.list.length === 0 && (
                            <Empty />
                        )}
                        <div className={styles.list}>
                            {result.map(([master, list]) => (
                                <React.Fragment key={master.masterKey}>
                                    {vm.masterCount > 1 && (
                                        <div className={styles.master}>{master.name}</div>
                                    )}

                                    {list
                                        .sort((a, b) => a.name.localeCompare(b.name))
                                        .map(item => {
                                            const selected = vm.selectedAccount?.tonWallet.address === item.tonWallet.address
                                            return (
                                                <div
                                                    key={item.tonWallet.address}
                                                    ref={selected ? selectedRef : null}
                                                >
                                                    <AccountsListItem
                                                        external={!!vm.externalAccounts[item.tonWallet.address]}
                                                        className={styles.account}
                                                        onClick={() => {
                                                            vm.selectAccount(item.tonWallet)
                                                            vm.handle.close()
                                                        }}
                                                        leftIcon={<Jdenticon size={20} value={item.tonWallet.address} className={styles.jdenticon} />}
                                                        rightIcon={selected && <Icon icon="check" />}
                                                        title={item.name}
                                                        info={(
                                                            <>
                                                                {convertAddress(item.tonWallet.address)}
                                                                <span>•</span>
                                                                <Amount
                                                                    value={convertEvers(
                                                                        connection.decimals,
                                                                        vm.accountContractStates[item.tonWallet.address]?.balance ?? '0',
                                                                    )}
                                                                    currency={connection.symbol}
                                                                />
                                                            </>
                                                        )}
                                                    />
                                                </div>
                                            )
                                        })}
                                </React.Fragment>
                            ))}
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
