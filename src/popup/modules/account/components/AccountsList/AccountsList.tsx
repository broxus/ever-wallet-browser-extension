import type nt from '@broxus/ever-wallet-wasm'
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
                        name={name}
                        addon={(
                            <div className="accounts-management__account-visibility-hint">
                                {accountsVisibility[account.tonWallet.address]
                                    ? intl.formatMessage({ id: 'DISPLAYED' })
                                    : intl.formatMessage({ id: 'HIDDEN' })}
                            </div>
                        )}
                        onClick={() => onClick(account)}
                    />
                )
            })}
        </List>
    )
})
