import type nt from '@wallet/nekoton-wasm'
import { observer } from 'mobx-react-lite'
import React from 'react'

import { convertEvers, NATIVE_CURRENCY } from '@app/shared'
import { Checkbox, UserAvatar, useViewModel } from '@app/popup/modules/shared'

import { AccountsListViewModel } from './AccountsListViewModel'

import './AccountsList.scss'

interface Props {
    selectedAccount: nt.AssetsList | undefined;

    onSelect(account: nt.AssetsList | undefined): void;
}

export const AccountsList = observer(({ selectedAccount, onSelect }: Props): JSX.Element => {
    const vm = useViewModel(AccountsListViewModel)

    return (
        <div className="approval-accounts-list">
            {Object.values(vm.accountEntries).map(account => (
                <div
                    key={account.tonWallet.address}
                    className="approval-accounts-list__item"
                >
                    <Checkbox
                        checked={selectedAccount?.tonWallet.address === account.tonWallet.address}
                        id={`account-${account.tonWallet.address}`}
                        onChange={checked => onSelect(checked ? account : undefined)}
                    />
                    <UserAvatar address={account.tonWallet.address} small />
                    <label
                        className="approval-accounts-list__scope"
                        htmlFor={`account-${account.tonWallet.address}`}
                    >
                        <div className="approval-accounts-list__name">
                            {account.name}
                        </div>
                        <div className="approval-accounts-list__balance">
                            {`${convertEvers(vm.accountContractStates[account.tonWallet.address]?.balance ?? '0')} ${NATIVE_CURRENCY}`}
                        </div>
                    </label>
                </div>
            ))}
        </div>
    )
})
