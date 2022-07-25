import React, { memo } from 'react'

import Arrow from '@app/popup/assets/img/arrow.svg'
import { AssetIcon } from '@app/popup/modules/shared'
import { AssetType, convertCurrency } from '@app/shared'

import './AssetListItem.scss'

interface Props {
    type: AssetType;
    address: string;
    balance?: string;
    name?: string;
    decimals?: number;
    old?: boolean;
    onClick: () => void;
}

export const AssetListItem = memo((props: Props): JSX.Element => {
    const { type, address, balance, name, decimals, old, onClick } = props

    return (
        <div
            className="assets-list-item" role="menuitem" tabIndex={0}
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
                    {decimals != null && convertCurrency(balance || '0', decimals)}
                </p>
                <p className="assets-list-item__balance-dollars">{name}</p>
            </div>
            <img className="assets-list-item__arrow" src={Arrow} alt="" />
        </div>
    )
})
