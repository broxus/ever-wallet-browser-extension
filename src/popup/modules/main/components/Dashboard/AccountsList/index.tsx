/* eslint-disable max-len */
import * as React from 'react'
import { useIntl } from 'react-intl'

import { Amount, Button, Card, ConnectionStore, Container, Content, Footer, Icon, SearchInput, SlidingPanelHandle, Space, useResolve } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { AccountDetailsViewModel } from '@app/popup/modules/main/components/AccountDetails/AccountDetailsViewModel'
import { convertAddress, convertEvers, convertPublicKey } from '@app/shared'
import { Jdenticon } from '@app/popup/modules/shared/components/Jdenticon'
import { AccountsListItem } from '@app/popup/modules/main/components/Dashboard/AccountsList/Item'

import styles from './index.module.scss'

export const AccountsList: React.FC = () => {
    const intl = useIntl()
    const vm = useResolve(AccountDetailsViewModel)
    const handle = useResolve(SlidingPanelHandle)
    const connection = useResolve(ConnectionStore)

    const [active, setActive] = React.useState<{[k: string]: boolean}>(() => {
        const selected = Object.entries(vm.keysByMasterKey)
            .find(([, items]) => items.some(item => item.publicKey === vm.selectedAccount?.tonWallet.publicKey))
            ?.[0]
        return selected ? { [selected]: true } : {}
    })

    return (
        <Container>
            <Content className={styles.content}>
                <Space direction="column" gap="l">
                    <SearchInput
                        size="xs"
                        placeholder={intl.formatMessage({
                            id: 'SEARCH_NAME_ADDRESS_PUBLIC',
                        })}
                    />
                    {Object.keys(vm.keysByMasterKey).map((masterKey, index) => (
                        <Card size="s" bg="layer-2" key={masterKey}>
                            <AccountsListItem
                                onClick={() => {
                                    setActive(prev => ({
                                        ...prev,
                                        [masterKey]: !prev[masterKey],
                                    }))
                                }}
                                title={intl.formatMessage({
                                    id: 'SEED_N',
                                }, {
                                    n: index + 1,
                                })}
                                leftIcon={<Icon icon="lock" />}
                                rightIcon={<Icon icon={active[masterKey] ? 'chevronUp' : 'chevronDown'} />}
                            />

                            {active[masterKey] && (
                                vm.keysByMasterKey[masterKey].map(item => (
                                    <React.Fragment key={item.publicKey}>
                                        <hr />
                                        <AccountsListItem
                                            leftIcon={<Icon icon="key" />}
                                            title={item.name}
                                            info={convertPublicKey(item.publicKey)}

                                        />
                                        {vm.accountsByPublicKey[item.publicKey]?.map(item => (
                                            <React.Fragment key={item.tonWallet.address}>
                                                <hr />
                                                <AccountsListItem
                                                    onClick={() => {
                                                        vm.selectAccount(item.tonWallet.address)
                                                        handle.close()
                                                    }}
                                                    leftIcon={<Jdenticon value={item.tonWallet.address} />}
                                                    rightIcon={vm.selectedAccount?.tonWallet.address === item.tonWallet.address && (
                                                        <Icon icon="check" />
                                                    )}
                                                    title={item.name}
                                                    info={(
                                                        <>
                                                            {convertAddress(item.tonWallet.address)}
                                                            <span>•</span>
                                                            <Amount
                                                                value={convertEvers(vm.accountContractStates[item.tonWallet.address]?.balance ?? '0')}
                                                                currency={connection.symbol}
                                                            />
                                                        </>
                                                    )}
                                                />
                                            </React.Fragment>
                                        ))}
                                    </React.Fragment>
                                ))
                            )}
                        </Card>
                    ))}
                </Space>
            </Content>

            <Footer className={styles.footer} layer>
                <FooterAction
                    dir="column"
                    buttons={[
                        // TODO: Open page
                        <Button design="neutral" key="manage">
                            {intl.formatMessage({ id: 'MANAGE_SEEDS_ACCOUNTS' })}
                        </Button>,
                        // TODO: Open page
                        <Button design="accent" key="add">
                            {intl.formatMessage({ id: 'ADD_ACCOUNT' })}
                        </Button>,
                    ]}
                />
            </Footer>
        </Container>
    )
}
