import type * as nt from '@broxus/ever-wallet-wasm'
import { observer } from 'mobx-react-lite'
import { Virtuoso } from 'react-virtuoso'

import { convertEvers } from '@app/shared'
import {
    Amount,
    EmptyPlaceholder,
    RadioButton,
    Scroller,
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

    return (
        <Space direction="column" gap="m">
            <SearchInput size="xs" value={vm.search} onChange={vm.handleSearch} />

            <Virtuoso
                customScrollParent={document.body}
                components={{ EmptyPlaceholder, Scroller }}
                fixedItemHeight={60}
                data={vm.accountEntries}
                computeItemKey={(_, account) => account.tonWallet.address}
                itemContent={(_, account) => (
                    <RadioButton
                        labelPosition="before"
                        className={styles.item}
                        value={account.tonWallet.address}
                        checked={selectedAccount?.tonWallet.address === account.tonWallet.address}
                        onChange={() => onSelect(account)}
                    >
                        <div className={styles.container}>
                            <Jdenticon className={styles.icon} value={account.tonWallet.address} />
                            <div className={styles.wrap}>
                                <div className={styles.name} title={account.name}>
                                    {account.name}
                                </div>
                                <Amount
                                    precise
                                    className={styles.balance}
                                    value={convertEvers(vm.contractStates[account.tonWallet.address]?.balance)}
                                    currency={vm.nativeCurrency}
                                />
                            </div>
                        </div>
                    </RadioButton>
                )}
            />
        </Space>
    )
})
