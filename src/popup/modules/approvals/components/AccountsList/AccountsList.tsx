import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import React from 'react'

import { convertEvers } from '@app/shared'
import {
    Amount,
    Empty,
    RadioButton,
    SearchInput,
    Space,
    useViewModel,
} from '@app/popup/modules/shared'
import { Jdenticon } from '@app/popup/modules/shared/components/Jdenticon'

import { AccountsListViewModel } from './AccountsListViewModel'
import styles from './AccountsList.module.scss'

interface Props {
    selectedAccount: nt.AssetsList | undefined;
    onSelect(account: nt.AssetsList | undefined): void;
}

export const AccountsList = observer(({ selectedAccount, onSelect }: Props): JSX.Element => {
    const vm = useViewModel(AccountsListViewModel)

    const selectedRef = React.useRef<HTMLDivElement | null>(null)

    React.useEffect(() => {
        selectedRef.current?.scrollIntoView({ behavior: 'auto', block: 'center' })
    }, [])

    const handleFocus = (e: any) => {
        e.target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        })
    }

    return (
        <Space direction="column" gap="m">
            <SearchInput size="xs" value={vm.search} onChange={vm.handleSearch} />
            {vm.accountEntries.length === 0 && <Empty />}

            {vm.accountEntries.map(
                (account) => {
                    const isSelected = selectedAccount?.tonWallet.address === account.tonWallet.address
                    return (
                        <RadioButton
                            labelPosition="before"
                            className={styles.item}
                            value={account.tonWallet.address}
                            checked={isSelected}
                            onChange={() => onSelect(account)}
                            onFocus={handleFocus}
                        >
                            <div className={styles.container} ref={isSelected ? selectedRef : null}>
                                <Jdenticon className={styles.icon} value={account.tonWallet.address} />
                                <div className={styles.wrap}>
                                    <div className={styles.name} title={account.name}>
                                        {account.name}
                                    </div>
                                    <Amount
                                        precise
                                        className={styles.balance}
                                        value={(
                                            convertEvers(
                                                vm.decimals,
                                                vm.contractStates[account.tonWallet.address]?.balance,
                                            )
                                        )}
                                        currency={vm.nativeCurrency}
                                    />
                                </div>
                            </div>
                        </RadioButton>
                    )
                },
            )}
        </Space>
    )
})
