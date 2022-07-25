import type nt from '@wallet/nekoton-wasm'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useIntl } from 'react-intl'

import { convertAddress } from '@app/shared'
import { UserAvatar } from '@app/popup/modules/shared'
import Arrow from '@app/popup/assets/img/arrow.svg'

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
        <ul className="accounts-management__list">
            {items.map(account => {
                const name = account.name || convertAddress(account.tonWallet.address)
                const active = account.tonWallet.address === selectedAccountAddress

                return (
                    <li key={account.tonWallet.address}>
                        <div
                            className={classNames('accounts-management__list-item', { _active: active })}
                            onClick={() => onClick(account)}
                        >
                            <UserAvatar
                                className="accounts-management__list-item-icon"
                                address={account.tonWallet.address}
                                small
                            />
                            <div className="accounts-management__list-item-title" title={name}>
                                {name}
                            </div>
                            <div className="accounts-management__list-item-visibility">
                                {accountsVisibility[account.tonWallet.address]
                                    ? intl.formatMessage({ id: 'DISPLAYED' })
                                    : intl.formatMessage({ id: 'HIDDEN' })}
                            </div>
                            <img className="accounts-management__list-item-arrow" src={Arrow} alt="" />
                        </div>
                    </li>
                )
            })}
        </ul>
    )
})
