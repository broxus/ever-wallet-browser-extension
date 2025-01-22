/* eslint-disable max-len */
import type * as nt from '@broxus/ever-wallet-wasm'
import * as React from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import classNames from 'classnames'

import { Amount, Button, Card, ConnectionStore, Container, Content, Empty, Footer, Icon, SearchInput, SlidingPanelHandle, Space, useResolve, useSearch } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { convertAddress, convertEvers, convertPublicKey } from '@app/shared'
import { Jdenticon } from '@app/popup/modules/shared/components/Jdenticon'
import { AccountsListItem } from '@app/popup/modules/main/components/Dashboard/AccountsList/Item'
import { AccountListViewModel } from '@app/popup/modules/main/components/Dashboard/AccountsList/AccountListViewModel'

import styles from './AccountList.module.scss'

export const AccountsList: React.FC = observer(() => {
    const intl = useIntl()
    const vm = useResolve(AccountListViewModel)
    const handle = useResolve(SlidingPanelHandle)
    const connection = useResolve(ConnectionStore)
    const search = useSearch(vm.accounts, vm.filter)

    const accounts = React.useMemo(
        () => search.list.reduce<{ [k: string]: nt.AssetsList[] }>((acc, item) => {
            if (!acc[item.tonWallet.publicKey]) acc[item.tonWallet.publicKey] = []
            acc[item.tonWallet.publicKey].push(item)
            return acc
        }, {}),
        [search.list],
    )

    const keys = React.useMemo(
        () => Object.keys(accounts).reduce<{ [k: string]: nt.KeyStoreEntry[] }>((acc, publicKey) => {
            const master = vm.masterByPublicKey[publicKey]
            if (!acc[master]) acc[master] = []
            acc[master].push(vm.storedKeys[publicKey])
            acc[master] = acc[master].sort((a, b) => a.accountId - b.accountId)
            return acc
        }, {}),
        [accounts, vm.masterByPublicKey, vm.storedKeys],
    )

    const seeds = React.useMemo(
        () => Object.keys(accounts)
            .reduce<string[]>((acc, publicKey) => {
                const master = vm.masterByPublicKey[publicKey]
                if (!acc.includes(master) && master) acc.push(master)
                return acc
            }, [])
            .map((masterKey) => vm.masterByKey[masterKey]),
        [accounts, vm.masterByPublicKey, vm.masterByKey],
    )

    const [active, setActive] = React.useState<{ [k: string]: boolean }>(() => {
        const selected = Object.entries(vm.keysByMasterKey).find(([, items]) => items.some((item) => item.publicKey === vm.selectedAccount?.tonWallet.publicKey))?.[0]
        return selected ? { [selected]: true } : {}
    })

    React.useEffect(() => {
        handle.update({
            fullHeight: search.props.value.trim().length > 0,
        })
    }, [search.props.value])

    return (
        <Container>
            <Content className={styles.content}>
                <Space direction="column" gap="l">
                    <SearchInput
                        {...search.props}
                        size="xxs"
                        placeholder={intl.formatMessage({
                            id: 'SEARCH_NAME_ADDRESS_PUBLIC',
                        })}
                    />
                    {search.props.value.trim().length > 0 && seeds.length === 0 && (
                        <Empty />
                    )}
                    {seeds.sort((a, b) => a.name.localeCompare(b.name) || a.masterKey.localeCompare(b.masterKey)).map((masterKey, index) => {
                        const info = convertPublicKey(masterKey.masterKey)
                        const seedName = intl.formatMessage({ id: 'SEED' }, { number: index + 1 })
                        return (
                            <Card size="s" bg="layer-2" key={masterKey.masterKey}>
                                <AccountsListItem
                                    onClick={() => {
                                        setActive((prev) => ({
                                            ...prev,
                                            [masterKey.masterKey]: !prev[masterKey.masterKey],
                                        }))
                                    }}
                                    heading={info === masterKey.name ? seedName : masterKey.name}
                                    leftIcon={<Icon icon="lock" className={styles.lock} />}
                                    rightIcon={<Icon icon={active[masterKey.masterKey] ? 'chevronUp' : 'chevronDown'} />}
                                />

                                {(active[masterKey.masterKey] || search.props.value.trim().length > 0)
                                    && keys[masterKey.masterKey].map((item, index) => {
                                        const info = convertPublicKey(item.publicKey)
                                        return (
                                            <React.Fragment key={item.publicKey}>
                                                <hr />
                                                <AccountsListItem
                                                    className={styles.pkey}
                                                    leftIcon={<Icon icon="keyRound" />} title={(
                                                        <>
                                                            <span className={styles.number}>#{index + 1}. {' '}</span>
                                                            {item.name}
                                                        </>
                                                    )} info={item.name !== info ? info : undefined}
                                                />
                                                {accounts[item.publicKey].map((item, i, arr) => (
                                                    <div key={item.tonWallet.address}>
                                                        <AccountsListItem
                                                            className={classNames(styles.account, { [styles.topDivider]: i === 0 }, { [styles.bottomDivider]: i !== arr.length - 1 })}
                                                            onClick={() => {
                                                                vm.selectAccount(item.tonWallet.address, masterKey.masterKey)
                                                                handle.close()
                                                            }}
                                                            leftIcon={<Jdenticon size={20} value={item.tonWallet.address} className={styles.jdenticon} />}
                                                            rightIcon={vm.selectedAccount?.tonWallet.address === item.tonWallet.address && <Icon icon="check" />}
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
                                                ))}
                                            </React.Fragment>
                                        )
                                    })}
                            </Card>
                        )
                    })}
                </Space>
            </Content>

            <Footer className={styles.footer} layer>
                <FooterAction dir="column">
                    <Button design="neutral" key="manage" onClick={vm.manageSeeds}>
                        {intl.formatMessage({ id: 'MANAGE_SEEDS_ACCOUNTS' })}
                    </Button>
                    <Button design="accent" key="add" onClick={vm.createAccount}>
                        {intl.formatMessage({ id: 'ADD_ACCOUNT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})
