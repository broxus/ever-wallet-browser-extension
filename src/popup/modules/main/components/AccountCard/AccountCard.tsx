import type nt from '@broxus/ever-wallet-wasm'
import { memo, useCallback } from 'react'
import { useIntl } from 'react-intl'

import Pattern from '@app/popup/assets/img/ever-pattern.svg'
import Elipsis from '@app/popup/assets/img/ellipsis.svg'
import DeleteIcon from '@app/popup/assets/icons/delete.svg'
import VerifyIcon from '@app/popup/assets/icons/verify.svg'
import ExternalIcon from '@app/popup/assets/icons/external.svg'
import { CopyText, DropdownMenu } from '@app/popup/modules/shared'
import { CONTRACT_TYPE_NAMES, convertAddress, convertPublicKey, formatCurrency } from '@app/shared'

import './AccountCard.scss'

interface Props {
    accountName: string;
    address?: string;
    densPath?: string;
    balance?: string;
    publicKey: string;
    type: nt.ContractType;
    canRemove: boolean;
    canVerifyAddress: boolean;
    requiredConfirmations?: number;
    custodians?: string[];
    onRemove: (address: string) => void;
    onVerifyAddress: (address: string) => void;
    onOpenInExplorer: (address: string) => void;
}

const menuIcon = <img src={Elipsis} alt="" />
const verifyIcon = <VerifyIcon />
const deleteIcon = <DeleteIcon />
const externalIcon = <ExternalIcon />

export const AccountCard = memo((props: Props): JSX.Element => {
    const {
        accountName,
        address,
        densPath,
        balance,
        publicKey,
        type,
        requiredConfirmations,
        custodians,
        canRemove,
        canVerifyAddress,
        onRemove,
        onVerifyAddress,
        onOpenInExplorer,
    } = props
    const hasMenu = canRemove || canVerifyAddress

    const intl = useIntl()

    const balanceFormated = balance ? `$${formatCurrency(balance || '0')}` : undefined

    const handleRemoveClick = useCallback(() => () => address && onRemove(address), [address, onRemove])
    const handleVerifyClick = useCallback(() => address && onVerifyAddress(address), [address, onVerifyAddress])
    const handleOpenInExplorer = useCallback(() => address && onOpenInExplorer(address), [address, onOpenInExplorer])

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
                        <span className="account-card__info-details-public-key-value">
                            {CONTRACT_TYPE_NAMES[type]}
                            {requiredConfirmations && custodians && custodians.length > 1 && (
                                <span>&nbsp;{requiredConfirmations}/{custodians.length}</span>
                            )}
                        </span>
                    </div>
                    {densPath && (
                        <div className="account-card__info-details-public-key">
                            {intl.formatMessage({ id: 'ACCOUNT_DENS_NAME_LABEL' })}
                            <CopyText
                                className="account-card__info-details-public-key-value"
                                place="top"
                                text={densPath}
                            >
                                {densPath}
                            </CopyText>
                        </div>
                    )}
                </div>
                {balance && (
                    <div className="account-card__info-balance" title={balanceFormated}>
                        {balanceFormated}
                    </div>
                )}
            </div>

            <div className="account-card__pattern">
                <img src={Pattern} alt="" />
            </div>

            {address && hasMenu && (
                <DropdownMenu className="account-card__menu" icon={menuIcon}>
                    <DropdownMenu.Item icon={externalIcon} onClick={handleOpenInExplorer}>
                        {intl.formatMessage({ id: 'VIEW_IN_EXPLORER_BTN_TEXT' })}
                    </DropdownMenu.Item>
                    {canVerifyAddress && (
                        <DropdownMenu.Item icon={verifyIcon} onClick={handleVerifyClick}>
                            {intl.formatMessage({ id: 'VERIFY_ON_LEDGER' })}
                        </DropdownMenu.Item>
                    )}
                    {canRemove && (
                        <DropdownMenu.Item icon={deleteIcon} onClick={handleRemoveClick} danger>
                            {intl.formatMessage({ id: 'DELETE_BTN_TEXT' })}
                        </DropdownMenu.Item>
                    )}
                </DropdownMenu>
            )}
        </div>
    )
})
