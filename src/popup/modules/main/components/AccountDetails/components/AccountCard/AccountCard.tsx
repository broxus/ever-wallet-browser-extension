import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Icons } from '@app/popup/icons'
import { SettingsButton, useCopyToClipboard, useViewModel } from '@app/popup/modules/shared'
import { CONTRACT_TYPE_NAMES, convertAddress, formatCurrency } from '@app/shared'

import { AccountCardViewModel } from './AccountCardViewModel'
import styles from './AccountCard.module.scss'

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
    const copy = useCopyToClipboard()
    const balanceFormated = vm.balance ? formatCurrency(vm.balance) : undefined

    const handleRename = useCallback(() => onRename(address), [address])
    const handleVerify = useCallback(() => onVerify(address), [address])
    const handleOpen = useCallback(() => onOpenInExplorer(address), [address])
    const handleRemove = useCallback(() => onRemove(address), [address])

    return (
        <div className={styles.card}>
            <div className={styles.info}>
                <div className={styles.infoRow}>
                    <div className={styles.infoName} title={vm.account.name}>
                        {vm.account.name}
                    </div>
                    <SettingsButton className={styles.infoMenu} title={intl.formatMessage({ id: 'ACCOUNT_SETTINGS_TITLE' })}>
                        <SettingsButton.Item icon={Icons.edit} onClick={handleRename}>
                            {intl.formatMessage({ id: 'RENAME' })}
                        </SettingsButton.Item>
                        {vm.canVerify && (
                            <SettingsButton.Item icon={Icons.checkboxActive} onClick={handleVerify}>
                                {intl.formatMessage({ id: 'VERIFY_ON_LEDGER' })}
                            </SettingsButton.Item>
                        )}
                        <SettingsButton.Item icon={Icons.planet} onClick={handleOpen}>
                            {intl.formatMessage({ id: 'VIEW_IN_EXPLORER_BTN_TEXT' })}
                        </SettingsButton.Item>
                        {vm.canRemove && (
                            <SettingsButton.Item icon={Icons.delete} onClick={handleRemove} danger>
                                {intl.formatMessage({ id: 'DELETE_BTN_TEXT' })}
                            </SettingsButton.Item>
                        )}
                    </SettingsButton>
                </div>
                <div className={styles.infoRow}>
                    <div className={styles.infoWallet}>
                        <Icons.WalletType className={styles.infoWalletIcon} />
                        <div className={styles.infoWalletValue}>
                            {CONTRACT_TYPE_NAMES[vm.account.tonWallet.contractType]}
                        </div>
                    </div>

                    {vm.details?.requiredConfirmations && vm.custodians.length > 1 && (
                        <div className={styles.infoWallet}>
                            <Icons.Users className={styles.infoWalletIcon} />
                            <div className={styles.infoWalletValue}>
                                {vm.details.requiredConfirmations}/{vm.custodians.length}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {vm.balance && (
                <div className={styles.balance}>
                    <span className={styles.balanceValue} title={balanceFormated}>
                        {balanceFormated}
                    </span>
                    <span className={styles.balanceLabel}>
                        USD
                    </span>
                </div>
            )}

            <div className={styles.addresses}>
                <div className={styles.address} onClick={() => copy(address)}>
                    <div className={styles.addressLabel}>
                        {intl.formatMessage({ id: 'ACCOUNT_CARD_ADDRESS_LABEL' })}
                    </div>
                    <div className={styles.addressValue}>
                        {address ? convertAddress(address) : intl.formatMessage({ id: 'ACCOUNT_CARD_NO_ADDRESS_LABEL' })}
                    </div>
                    <div className={styles.addressIcon}>
                        {Icons.copy}
                    </div>
                </div>

                {vm.densPath && (
                    <div className={styles.address} onClick={() => copy(vm.densPath)}>
                        <div className={styles.addressLabel}>
                            {intl.formatMessage({ id: 'ACCOUNT_DENS_NAME_LABEL' })}
                        </div>
                        <div className={styles.addressValue} title={vm.densPath}>
                            {vm.densPath}
                        </div>
                        <div className={styles.addressIcon}>
                            {Icons.copy}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
})
