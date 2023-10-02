import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Icons } from '@app/popup/icons'
import { Amount, CopyButton, Icon, SettingsButton, useViewModel } from '@app/popup/modules/shared'
import { formatCurrency } from '@app/shared'

import { AccountCardViewModel } from './AccountCardViewModel'
import styles from './AccountCard.module.scss'

interface Props {
    address: string;
    onRename(): void;
    onPreference(): void;
    onVerify(): void;
    onOpenInExplorer(): void;
    onHide(): void;
}

export const AccountCard = observer((props: Props): JSX.Element => {
    const { address, onRename, onPreference, onVerify, onOpenInExplorer, onHide } = props
    const vm = useViewModel(AccountCardViewModel, (model) => {
        model.address = address
    })
    const intl = useIntl()
    const balanceFormated = vm.balance ? formatCurrency(vm.balance) : undefined

    return (
        <div className={styles.card}>
            <div className={styles.info}>
                <div className={styles.infoRow}>
                    <div className={styles.infoName} title={vm.account.name}>
                        {vm.account.name}
                    </div>
                    {vm.details?.requiredConfirmations && vm.custodians.length > 1 && (
                        <div className={styles.infoWallet}>
                            <Icon icon="users" className={styles.infoWalletIcon} />
                            <div className={styles.infoWalletValue}>
                                {vm.details.requiredConfirmations}/{vm.custodians.length}
                            </div>
                        </div>
                    )}
                    <SettingsButton className={styles.infoMenu} title={intl.formatMessage({ id: 'ACCOUNT_SETTINGS_TITLE' })}>
                        <SettingsButton.Item icon={Icons.card} onClick={onPreference}>
                            {intl.formatMessage({ id: 'PREFERENCE_BTN_TEXT' })}
                        </SettingsButton.Item>
                        <SettingsButton.Item icon={Icons.edit} onClick={onRename}>
                            {intl.formatMessage({ id: 'RENAME' })}
                        </SettingsButton.Item>
                        {vm.canVerify && (
                            <SettingsButton.Item icon={Icons.checkboxActive} onClick={onVerify}>
                                {intl.formatMessage({ id: 'VERIFY_ON_LEDGER' })}
                            </SettingsButton.Item>
                        )}
                        <SettingsButton.Item icon={Icons.planet} onClick={onOpenInExplorer}>
                            {intl.formatMessage({ id: 'VIEW_IN_EXPLORER_BTN_TEXT' })}
                        </SettingsButton.Item>
                        {vm.canRemove && (
                            <SettingsButton.Item icon={Icons.eyeOff} onClick={onHide} danger>
                                {intl.formatMessage({ id: 'HIDE_BTN_TEXT' })}
                            </SettingsButton.Item>
                        )}
                    </SettingsButton>
                </div>

                {vm.densPath && (
                    <CopyButton text={vm.densPath}>
                        <button type="button" className={styles.dens} title={vm.densPath}>
                            {vm.densPath}
                        </button>
                    </CopyButton>
                )}

                {/* <div className={styles.infoRow}>
                    <div className={styles.infoWallet}>
                        <Icons.WalletType className={styles.infoWalletIcon} />
                        <div className={styles.infoWalletValue}>
                            {CONTRACT_TYPE_NAMES[vm.account.tonWallet.contractType]}
                        </div>
                    </div>
                </div> */}
            </div>

            {vm.balance && (
                <div>
                    <div className={styles.balance}>
                        <span className={styles.balanceValue} title={balanceFormated}>
                            {balanceFormated}
                        </span>
                        <span className={styles.balanceLabel}>
                            USD
                        </span>
                    </div>
                    <div className={styles.evers}>
                        <Amount precise value={vm.nativeBalance} currency={vm.nativeCurrency} />
                    </div>
                </div>
            )}

            {!vm.balance && (
                <div className={styles.balance}>
                    <span className={styles.balanceValue} title={formatCurrency(vm.nativeBalance, true)}>
                        {formatCurrency(vm.nativeBalance, true)}
                    </span>
                    <span className={styles.balanceLabel}>
                        {vm.nativeCurrency}
                    </span>
                </div>
            )}

            <CopyButton text={address}>
                <button type="button" className={styles.address} title={address}>
                    {address
                        ? `${address?.slice(0, 22)}...${address?.slice(-20)}`
                        : intl.formatMessage({ id: 'ACCOUNT_CARD_NO_ADDRESS_LABEL' })}
                </button>
            </CopyButton>
        </div>
    )
})
