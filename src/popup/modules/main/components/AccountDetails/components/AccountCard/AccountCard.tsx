import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import CopyIcon from '@app/popup/assets/icons/copy.svg'
import SettingsIcon from '@app/popup/assets/icons/settings.svg'
import WalletTypeIcon from '@app/popup/assets/icons/wallet-type.svg'
import UsersIcon from '@app/popup/assets/icons/users.svg'
import { CopyButton, CopyText, useSlidingPanel, useViewModel } from '@app/popup/modules/shared'
import { CONTRACT_TYPE_NAMES, convertAddress, convertPublicKey, formatCurrency } from '@app/shared'

import { AccountSettings } from '../AccountSettings'
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
    const panel = useSlidingPanel()
    const intl = useIntl()
    const balanceFormated = vm.balance ? formatCurrency(vm.balance) : undefined

    // TODO: refactor
    const handleRename = () => {
        panel.close()
        onRename(address)
    }
    const handleOpenInExplorer = () => {
        panel.close()
        onOpenInExplorer(address)
    }
    const handleVerify = () => {
        panel.close()
        onVerify(address)
    }
    const handleRemove = () => {
        panel.close()
        onRemove(address)
    }
    const handleSettings = () => {
        panel.open({
            render: () => (
                <AccountSettings
                    onRename={handleRename}
                    onOpenInExplorer={handleOpenInExplorer}
                    onVerify={vm.canVerify ? handleVerify : undefined}
                    onRemove={vm.canRemove ? handleRemove : undefined}
                />
            ),
        })
    }

    return (
        <div className="account-card">
            <div className="account-card__info">
                <div className="account-card__info-row">
                    <div className="account-card__info-name" title={vm.account.name}>
                        {vm.account.name}
                    </div>
                    <button className="account-card__info-btn" onClick={handleSettings}>
                        <SettingsIcon />
                    </button>
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
