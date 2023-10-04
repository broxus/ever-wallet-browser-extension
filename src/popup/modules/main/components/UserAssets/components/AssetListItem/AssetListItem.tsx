import { memo } from 'react'

import { Amount, AssetIcon, Badge, Icon, UsdtPrice } from '@app/popup/modules/shared'
import { AssetType, convertCurrency } from '@app/shared'

import './AssetListItem.scss'

interface Props {
    type: AssetType;
    address: string;
    balance?: string;
    currencyName?: string;
    decimals?: number;
    old?: boolean;
    badge?: boolean;
    onClick: () => void;
}

export const AssetListItem = memo((props: Props): JSX.Element => {
    const { type, address, balance, currencyName, decimals, old, badge, onClick } = props
    const amount = decimals != null ? convertCurrency(balance || '0', decimals) : ''

    return (
        <div
            className="assets-list-item"
            role="menuitem"
            tabIndex={0}
            onClick={onClick}
        >
            <AssetIcon
                className="assets-list-item__logo"
                type={type}
                address={address}
                old={old}
            />
            <div className="assets-list-item__balance">
                <p className="assets-list-item__balance-amount">
                    <Amount precise value={amount} currency={currencyName} />
                    {badge && <Badge className="assets-list-item__badge" type="error" />}
                </p>
                <p className="assets-list-item__balance-dollars">
                    <UsdtPrice amount={balance ?? '0'} tokenRoot={type === 'token_wallet' ? address : undefined} />
                </p>
            </div>
            <Icon icon="chevronRight" className="assets-list-item__arrow" />
        </div>
    )
})
