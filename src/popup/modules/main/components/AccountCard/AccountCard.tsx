import type nt from '@wallet/nekoton-wasm'
import { memo, useRef, useState } from 'react'
import { useIntl } from 'react-intl'

import Pattern from '@app/popup/assets/img/ever-pattern.svg'
import Elipsis from '@app/popup/assets/img/ellipsis.svg'
import { CopyText, Dropdown, useOnClickOutside } from '@app/popup/modules/shared'
import { CONTRACT_TYPE_NAMES, convertAddress, convertPublicKey, NATIVE_CURRENCY } from '@app/shared'

import './AccountCard.scss'

interface Props {
    accountName: string;
    address?: string;
    balance: string;
    publicKey: string;
    type: nt.ContractType;
    canRemove: boolean;
    onRemove: (address: string) => void;
}

export const AccountCard = memo((props: Props): JSX.Element => {
    const { accountName, address, balance, publicKey, type, canRemove, onRemove } = props

    const intl = useIntl()
    const [dropdownActive, setDropdownActive] = useState(false)
    const btnRef = useRef(null)
    const dropdownRef = useRef(null)

    const wholePart = balance.split('.')?.[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    const decimals = balance.split('.')?.[1]
    const balanceFormated = `${wholePart}.${decimals || '00'} ${NATIVE_CURRENCY}`

    const handleMenuClick = () => setDropdownActive((active) => !active)
    const handleRemoveClick = () => {
        if (address) {
            setDropdownActive(false)
            onRemove(address)
        }
    }

    useOnClickOutside(dropdownRef, btnRef, () => setDropdownActive(false))

    return (
        <div className="account-card">
            <div className="account-card__info">
                <div className="account-card__info-details">
                    <div className="account-card__info-details-name" title={accountName}>
                        {accountName}
                    </div>
                    <div className="account-card__info-details-public-key">
                        {intl.formatMessage({ id: 'ACCOUNT_CARD_PUBLIC_KEY_LABEL' })}
                        <CopyText
                            className="account-card__info-details-public-key-value"
                            id={`copy-${publicKey}-${address}`}
                            place="top"
                            text={publicKey}
                        >
                            {convertPublicKey(publicKey)}
                        </CopyText>
                    </div>
                    <div className="account-card__info-details-public-key">
                        {intl.formatMessage({ id: 'ACCOUNT_CARD_ADDRESS_LABEL' })}
                        {address ? (
                            <CopyText
                                className="account-card__info-details-public-key-value"
                                id={`copy-${address}`}
                                place="top"
                                text={address}
                            >
                                {convertAddress(address)}
                            </CopyText>
                        ) : (
                            <span className="account-card__info-details-public-key-value">
                                {intl.formatMessage({ id: 'ACCOUNT_CARD_NO_ADDRESS_LABEL' })}
                            </span>
                        )}
                    </div>
                    <div className="account-card__info-details-public-key">
                        {intl.formatMessage({ id: 'ACCOUNT_CARD_ACCOUNT_TYPE_LABEL' })}
                        <span className="account-card__info-details-public-key-value _type">
                            {CONTRACT_TYPE_NAMES[type]}
                        </span>
                    </div>
                </div>
                <div className="account-card__info-balance" title={balanceFormated}>
                    {balanceFormated}
                </div>
            </div>

            <div className="account-card__pattern">
                <img src={Pattern} alt="" />
            </div>

            {address && canRemove && (
                <div className="account-card__menu">
                    <button
                        type="button"
                        className="account-card__menu-btn"
                        ref={btnRef}
                        onClick={handleMenuClick}
                    >
                        <img src={Elipsis} alt="" />
                    </button>
                    <Dropdown className="account-card__dropdown" ref={dropdownRef} active={dropdownActive}>
                        <button
                            type="button"
                            className="account-card__dropdown-btn"
                            onClick={handleRemoveClick}
                        >
                            {intl.formatMessage({ id: 'DELETE_BTN_TEXT' })}
                        </button>
                    </Dropdown>
                </div>
            )}
        </div>
    )
})
