import type nt from '@wallet/nekoton-wasm'
import { memo } from 'react'
import { useIntl } from 'react-intl'

import Pattern from '@app/popup/assets/img/ever-pattern.svg'
import { CONTRACT_TYPE_NAMES, CopyText } from '@app/popup/modules/shared'
import { convertAddress, convertPublicKey, NATIVE_CURRENCY } from '@app/shared'

import './AccountCard.scss'

interface Props {
    accountName: string;
    address?: string;
    balance: string;
    publicKey: string;
    type: nt.ContractType;
}

export const AccountCard = memo(({ accountName, address, balance, publicKey, type }: Props): JSX.Element => {
    const intl = useIntl()
    const wholePart = balance.split('.')?.[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    const decimals = balance.split('.')?.[1]
    const balanceFormated = `${wholePart}.${decimals || '00'} ${NATIVE_CURRENCY}`

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
                        {address !== undefined ? (
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
        </div>
    )
})
