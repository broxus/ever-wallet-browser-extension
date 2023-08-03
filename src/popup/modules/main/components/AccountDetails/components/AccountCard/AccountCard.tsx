import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import EditIcon from '@app/popup/assets/icons/edit.svg'
import CheckboxIcon from '@app/popup/assets/icons/checkbox-active.svg'
import PlanetIcon from '@app/popup/assets/icons/planet.svg'
import DeleteIcon from '@app/popup/assets/icons/delete.svg'
import CopyIcon from '@app/popup/assets/icons/copy.svg'
import WalletTypeIcon from '@app/popup/assets/icons/wallet-type.svg'
import UsersIcon from '@app/popup/assets/icons/users.svg'
import { CopyButton, CopyText, SettingsButton, useViewModel } from '@app/popup/modules/shared'
import { CONTRACT_TYPE_NAMES, convertAddress, convertPublicKey, formatCurrency } from '@app/shared'

import { AccountCardViewModel } from './AccountCardViewModel'
import './AccountCard.scss'

interface Props {
    address: string;
    onRename(address: string): void;
    onRemove(address: string): void;
    onVerify(address: string): void;
    onOpenInExplorer(address: string): void;
}

export const AccountCard = observer((props: Props): JSX.Element => {
    const { address, onRename, onRemove, onVerify, onOpenInExplorer } = props
    const vm = useViewModel(AccountCardViewModel, (model) => {
        model.address = address
    })
    const intl = useIntl()
    const balanceFormated = vm.balance ? formatCurrency(vm.balance) : undefined

    const handleRename = useCallback(() => onRename(address), [address])
    const handleVerify = useCallback(() => onVerify(address), [address])
    const handleOpen = useCallback(() => onOpenInExplorer(address), [address])
    const handleRemove = useCallback(() => onRemove(address), [address])

    return (
        <div className="account-card">
            <div className="account-card__info">
                <div className="account-card__info-row">
                    <div className="account-card__info-name" title={vm.account.name}>
                        {vm.account.name}
                    </div>
                    <SettingsButton className="account-card__info-menu" title={intl.formatMessage({ id: 'ACCOUNT_SETTINGS_TITLE' })}>
                        <SettingsButton.Item icon={<EditIcon />} onClick={handleRename}>
                            {intl.formatMessage({ id: 'RENAME' })}
                        </SettingsButton.Item>
                        {vm.canVerify && (
                            <SettingsButton.Item icon={<CheckboxIcon />} onClick={handleVerify}>
                                {intl.formatMessage({ id: 'VERIFY_ON_LEDGER' })}
                            </SettingsButton.Item>
                        )}
                        <SettingsButton.Item icon={<PlanetIcon />} onClick={handleOpen}>
                            {intl.formatMessage({ id: 'VIEW_IN_EXPLORER_BTN_TEXT' })}
                        </SettingsButton.Item>
                        {vm.canRemove && (
                            <SettingsButton.Item icon={<DeleteIcon />} onClick={handleRemove} danger>
                                {intl.formatMessage({ id: 'DELETE_BTN_TEXT' })}
                            </SettingsButton.Item>
                        )}
                    </SettingsButton>
                </div>
                <div className="account-card__info-row">
                    <div className="account-card__info-wallet">
                        <WalletTypeIcon className="account-card__info-wallet-icon" />
                        <div className="account-card__info-wallet-value">
                            {CONTRACT_TYPE_NAMES[vm.account.tonWallet.contractType]}
                        </div>
                    </div>

                    {vm.details?.requiredConfirmations && vm.custodians.length > 1 && (
                        <div className="account-card__info-wallet">
                            <UsersIcon className="account-card__info-wallet-icon" />
                            <div className="account-card__info-wallet-value">
                                {vm.details.requiredConfirmations}/{vm.custodians.length}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {vm.balance && (
                <div className="account-card__balance">
                    <span className="account-card__balance-value" title={balanceFormated}>
                        {balanceFormated}
                    </span>
                    <span className="account-card__balance-label">
                        USD
                    </span>
                </div>
            )}

            <div className="account-card__addresses">
                <div className="account-card__address">
                    <div className="account-card__address-label">
                        {intl.formatMessage({ id: 'ACCOUNT_CARD_ADDRESS_LABEL' })}
                    </div>
                    <div className="account-card__address-value">
                        {address ? convertAddress(address) : intl.formatMessage({ id: 'ACCOUNT_CARD_NO_ADDRESS_LABEL' })}
                    </div>
                    <CopyButton text={address}>
                        <button className="account-card__address-btn">
                            <CopyIcon />
                        </button>
                    </CopyButton>
                </div>

                {vm.densPath && (
                    <div className="account-card__address">
                        <div className="account-card__address-label">
                            {intl.formatMessage({ id: 'ACCOUNT_DENS_NAME_LABEL' })}
                        </div>
                        <div className="account-card__address-value" title={vm.densPath}>
                            {vm.densPath}
                        </div>
                        <CopyButton text={vm.densPath}>
                            <button className="account-card__address-btn">
                                <CopyIcon />
                            </button>
                        </CopyButton>
                    </div>
                )}
            </div>

            <div className="account-card__info" style={{ display: 'none' }}>
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
            </div>
        </div>
    )
})
