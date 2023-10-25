import { memo } from 'react'

import { Amount, AssetIcon, Badge, Icon, UsdtPrice } from '@app/popup/modules/shared'
import { AssetType, convertCurrency } from '@app/shared'

import styles from './AssetListItem.module.scss'

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
            <div className={styles.balance}>
                <p className={styles.amount}>
                    <Amount precise value={amount} currency={currencyName} />
                    {badge && <Badge className={styles.badge} type="error" />}
                </p>
                <p className={styles.dollars}>
                    <UsdtPrice amount={balance ?? '0'} tokenRoot={type === 'token_wallet' ? address : undefined} />
                </p>
            </div>
            <Icon icon="chevronRight" className={styles.arrow} />
        </div>
    )
})
