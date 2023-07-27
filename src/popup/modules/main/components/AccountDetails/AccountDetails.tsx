import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import classNames from 'classnames'
import { useCallback } from 'react'

import DeployIcon from '@app/popup/assets/icons/settings.svg'
import CurrencyIcon from '@app/popup/assets/icons/currency.svg'
import ArrowDownIcon from '@app/popup/assets/icons/arrow-down.svg'
import ArrowUpIcon from '@app/popup/assets/icons/arrow-up.svg'
import StakeIcon from '@app/popup/assets/icons/stake.svg'
import { IconButton, useViewModel } from '@app/popup/modules/shared'
import { Networks } from '@app/popup/modules/network'

import { ChangeAccount } from '../ChangeAccount'
import { AccountCard, Carousel, OldAccountSettings } from './components'
import { AccountDetailsViewModel } from './AccountDetailsViewModel'

import './AccountDetails.scss'

interface Props {
    onVerifyAddress(address: string): void;
    onNetworkSettings(): void;
}

export const AccountDetails = observer(({ onVerifyAddress, onNetworkSettings }: Props): JSX.Element => {
    const vm = useViewModel(AccountDetailsViewModel)
    const intl = useIntl()

    const handleChange = useCallback(() => vm.panel.open({
        whiteBg: true,
        render: () => <ChangeAccount />,
    }), [])

    return (
        <div className="account-details">
            <div className="account-details__top-panel">
                <Networks onSettings={onNetworkSettings} />
                <OldAccountSettings />
            </div>

            <Carousel
                current={vm.carouselIndex}
                onAddAccount={vm.addAccount}
                onChangeAccount={handleChange}
                onChange={vm.onSlide}
            >
                {vm.accounts.map(({ tonWallet }) => (
                    <AccountCard
                        key={tonWallet.address}
                        address={tonWallet.address}
                        onRename={() => { /* TODO */ }}
                        onRemove={vm.removeAccount}
                        onVerify={onVerifyAddress}
                        onOpenInExplorer={vm.openAccountInExplorer}
                    />
                ))}
            </Carousel>

            <div className="account-details__controls">
                <label className="account-details__controls-label">
                    <IconButton icon={<CurrencyIcon />} onClick={vm.onBuy} />
                    {intl.formatMessage({ id: 'BUY_EVER_BTN_TEXT' })}
                </label>

                <label className="account-details__controls-label">
                    <IconButton icon={<ArrowDownIcon />} onClick={vm.onReceive} />
                    {intl.formatMessage({ id: 'RECEIVE_BTN_TEXT' })}
                </label>

                {vm.everWalletState && vm.isDeployed && (
                    <label className="account-details__controls-label">
                        <IconButton icon={<ArrowUpIcon />} onClick={vm.onSend} />
                        {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
                    </label>
                )}

                {vm.everWalletState && vm.isDeployed && vm.stakingAvailable && (
                    <label className={classNames('account-details__controls-label', { _alert: vm.hasWithdrawRequest })}>
                        <IconButton icon={<StakeIcon />} onClick={vm.onStake} />
                        {intl.formatMessage({ id: 'STAKE_BTN_TEXT' })}
                    </label>
                )}

                {vm.everWalletState && !vm.isDeployed && (
                    <label className="account-details__controls-label">
                        <IconButton icon={<DeployIcon />} onClick={vm.onDeploy} />
                        {intl.formatMessage({ id: 'DEPLOY_BTN_TEXT' })}
                    </label>
                )}
            </div>
        </div>
    )
})
