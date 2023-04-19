import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import Pattern from '@app/popup/assets/img/ever-pattern.svg'
import Elipsis from '@app/popup/assets/img/ellipsis.svg'
import DeleteIcon from '@app/popup/assets/icons/delete.svg'
import VerifyIcon from '@app/popup/assets/icons/verify.svg'
import ExternalIcon from '@app/popup/assets/icons/external.svg'
import { CopyText, DropdownMenu, useViewModel } from '@app/popup/modules/shared'
import { CONTRACT_TYPE_NAMES, convertAddress, convertPublicKey, formatCurrency } from '@app/shared'

import { AccountCardViewModel } from './AccountCardViewModel'

import './AccountCard.scss'

interface Props {
    address: string;
    onRemove(address: string): void;
    onVerifyAddress(address: string): void;
    onOpenInExplorer(address: string): void;
}

const menuIcon = <img src={Elipsis} alt="" />
const verifyIcon = <VerifyIcon />
const deleteIcon = <DeleteIcon />
const externalIcon = <ExternalIcon />

export const AccountCard = observer(({ address, onRemove, onVerifyAddress, onOpenInExplorer }: Props): JSX.Element => {
    const vm = useViewModel(AccountCardViewModel, (model) => {
        model.address = address
    })
    const intl = useIntl()

    const balanceFormated = vm.balance ? `$${formatCurrency(vm.balance)}` : undefined

    const handleRemoveClick = useCallback(() => onRemove(address), [address, onRemove])
    const handleVerifyClick = useCallback(() => onVerifyAddress(address), [address, onVerifyAddress])
    const handleOpenInExplorer = useCallback(() => onOpenInExplorer(address), [address, onOpenInExplorer])

    return (
        <div className="account-card">
            <div className="account-card__info">
                <div className="account-card__info-details">
                    <div className="account-card__info-details-name" title={vm.account.name}>
                        {vm.account.name}
                    </div>
                    <div className="account-card__info-details-public-key">
                        {intl.formatMessage({ id: 'ACCOUNT_CARD_PUBLIC_KEY_LABEL' })}
                        <CopyText
                            className="account-card__info-details-public-key-value"
                            place="top"
                            text={vm.account.tonWallet.publicKey}
                        >
                            {convertPublicKey(vm.account.tonWallet.publicKey)}
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
                            {CONTRACT_TYPE_NAMES[vm.account.tonWallet.contractType]}
                            {vm.details?.requiredConfirmations && vm.custodians.length > 1 && (
                                <span>&nbsp;{vm.details.requiredConfirmations}/{vm.custodians.length}</span>
                            )}
                        </span>
                    </div>
                    {vm.densPath && (
                        <div className="account-card__info-details-public-key">
                            {intl.formatMessage({ id: 'ACCOUNT_DENS_NAME_LABEL' })}
                            <CopyText
                                className="account-card__info-details-public-key-value"
                                place="top"
                                text={vm.densPath}
                            >
                                {vm.densPath}
                            </CopyText>
                        </div>
                    )}
                </div>
                {vm.balance && (
                    <div className="account-card__info-balance" title={balanceFormated}>
                        {balanceFormated}
                    </div>
                )}
            </div>

            <div className="account-card__pattern">
                <img src={Pattern} alt="" />
            </div>

            <DropdownMenu className="account-card__menu" icon={menuIcon}>
                <DropdownMenu.Item icon={externalIcon} onClick={handleOpenInExplorer}>
                    {intl.formatMessage({ id: 'VIEW_IN_EXPLORER_BTN_TEXT' })}
                </DropdownMenu.Item>
                {vm.canVerifyAddress && (
                    <DropdownMenu.Item icon={verifyIcon} onClick={handleVerifyClick}>
                        {intl.formatMessage({ id: 'VERIFY_ON_LEDGER' })}
                    </DropdownMenu.Item>
                )}
                {vm.canRemove && (
                    <DropdownMenu.Item icon={deleteIcon} onClick={handleRemoveClick} danger>
                        {intl.formatMessage({ id: 'DELETE_BTN_TEXT' })}
                    </DropdownMenu.Item>
                )}
            </DropdownMenu>
        </div>
    )
})
