import { memo } from 'react'

import { Amount, AssetIcon, Badge, UsdtPrice } from '@app/popup/modules/shared'
import { AssetType, convertCurrency } from '@app/shared'

import styles from './AssetListItem.module.scss'

interface Props {
    type: AssetType;
    address: string;
    balance?: string;
    currencyName?: string;
    currencySymbol?: string;
    decimals?: number;
    old?: boolean;
    badge?: boolean;
    onClick: () => void;
}

export const AssetListItem = memo((props: Props): JSX.Element => {
    const { type, address, balance, currencyName, decimals, old, badge, onClick, currencySymbol } = props
    const amount = decimals != null ? convertCurrency(balance || '0', decimals) : ''

    return (
        <div
            className={styles.item}
            role="menuitem"
            tabIndex={0}
            onClick={onClick}
        >
            <AssetIcon
                className={styles.logo}
                type={type}
                address={address}
                old={old}
            />
            <div className={styles.left}>
                <div className={styles.name}>
                    {currencyName}
                    {badge && <Badge className={styles.badge} type="error" />}
                </div>
                <div className={styles.evers}>
                    <Amount precise value={amount} currency={currencySymbol} />
                </div>
            </div>
            <div className={styles.right}>
                <UsdtPrice symbol="$" amount={balance ?? '0'} tokenRoot={type === 'token_wallet' ? address : undefined} />
            </div>
        </div>
    )
})
