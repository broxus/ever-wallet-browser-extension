import type nt from '@wallet/nekoton-wasm'
import { observer } from 'mobx-react-lite'

import { convertEvers, NATIVE_CURRENCY } from '@app/shared'
import { Input, RadioButton, UserAvatar, useViewModel } from '@app/popup/modules/shared';
import { useIntl } from 'react-intl';

import { AccountsListViewModel } from './AccountsListViewModel'

import './AccountsList.scss'

interface Props {
    selectedAccount: nt.AssetsList | undefined;

    onSelect(account: nt.AssetsList | undefined): void;
}

export const AccountsList = observer(({ selectedAccount, onSelect }: Props): JSX.Element => {
    const vm = useViewModel(AccountsListViewModel)
    const intl = useIntl()

    return (
        <div className="approval-accounts-list">
            <Input
                className="approval-accounts-list__search"
                type="search"
                placeholder={intl.formatMessage({ id: 'ACCOUNT_LIST_SEARCH' })}
                value={vm.search}
                onChange={vm.handleSearch}
            />

            {vm.accountEntries.map(account => (
                <div
                    key={account.tonWallet.address}
                    className="approval-accounts-list__item"
                >
                    <RadioButton
                        id={`account-${account.tonWallet.address}`}
                        value={account.tonWallet.address}
                        checked={selectedAccount?.tonWallet.address === account.tonWallet.address}
                        onChange={() => onSelect(account)}
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
