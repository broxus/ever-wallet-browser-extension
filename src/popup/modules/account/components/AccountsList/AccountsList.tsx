import type nt from '@broxus/ever-wallet-wasm'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { convertAddress } from '@app/shared'
import { UserAvatar } from '@app/popup/modules/shared'

import { List } from '../List'

interface Props {
    items: nt.AssetsList[];
    selectedAccountAddress: string | undefined;
    accountsVisibility: Record<string, boolean>;

    onClick(account: nt.AssetsList): void;
}

export const AccountsList = observer(({
    items,
    selectedAccountAddress,
    accountsVisibility,
    onClick,
}: Props): JSX.Element => {
    const intl = useIntl()

    return (
        <List>
            {items.map(account => {
                const name = account.name || convertAddress(account.tonWallet.address)
                const active = account.tonWallet.address === selectedAccountAddress

                return (
                    <List.Item
                        key={account.tonWallet.address}
                        icon={<UserAvatar address={account.tonWallet.address} small />}
                        active={active}
                        onClick={() => onClick(account)}
                    >
                        <div className="accounts-management__account-content">
                            <div className="accounts-management__account-content-name" title={name}>{name}</div>
                            <div className="accounts-management__account-content-visibility">
                                {accountsVisibility[account.tonWallet.address]
                                    ? intl.formatMessage({ id: 'DISPLAYED' })
                                    : intl.formatMessage({ id: 'HIDDEN' })}
                            </div>
                        </div>
                    </List.Item>
                )
            })}
        </List>
    )
})
