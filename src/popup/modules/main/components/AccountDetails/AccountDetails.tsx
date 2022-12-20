import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import DeployIcon from '@app/popup/assets/img/deploy.svg'
import NotificationsIcon from '@app/popup/assets/img/notifications.svg'
import BuyIcon from '@app/popup/assets/img/buy.svg'
import ReceiveIcon from '@app/popup/assets/img/receive.svg'
import SendIcon from '@app/popup/assets/img/send.svg'
import StakeIcon from '@app/popup/assets/img/stake/stake.svg'
import CloseIcon from '@app/popup/assets/img/stake/stake-banner-close.svg'
import {
    Button,
    ButtonGroup,
    Carousel,
    useDrawerPanel,
    useViewModel,
} from '@app/popup/modules/shared'
import { STAKE_APY_PERCENT } from '@app/shared'

import { AccountCard } from '../AccountCard'
import { AccountSettings } from '../AccountSettings'
import { AddNewAccountCard } from '../AddNewAccountCard'
import { NetworkSettings } from '../NetworkSettings'
import { AccountDetailsViewModel } from './AccountDetailsViewModel'

import './AccountDetails.scss'

export const AccountDetails = observer((): JSX.Element => {
    const drawer = useDrawerPanel()
    const vm = useViewModel(AccountDetailsViewModel, model => {
        model.drawer = drawer
    })
    const intl = useIntl()

    return (
        <div className="account-details">
            <div className="account-details__top-panel">
                <div
                    className="account-details__notification-bell"
                    onClick={() => { /* TODO: notifications */
                    }}
                >
                    <img src={NotificationsIcon} alt="" />
                </div>
                <NetworkSettings />
                <AccountSettings />
            </div>

            <Carousel selectedItem={vm.carouselIndex} onChange={vm.onSlide}>
                {vm.accounts.map(({ account, total, details, custodians }) => (
                    <AccountCard
                        key={account.tonWallet.address}
                        accountName={account.name}
                        address={account.tonWallet.address}
                        publicKey={account.tonWallet.publicKey}
                        type={account.tonWallet.contractType}
                        requiredConfirmations={details?.requiredConfirmations}
                        custodians={custodians}
                        balance={total}
                        canRemove={vm.accounts.length > 1}
                        onRemove={vm.removeAccount}
                    />
                ))}
                <AddNewAccountCard key="addSlide" onClick={vm.addAccount} />
            </Carousel>

            <ButtonGroup className="account-details__controls">
                <label className="account-details__controls-label">
                    <Button className="account-details__controls-btn" design="dark" onClick={vm.onBuy}>
                        <img src={BuyIcon} alt="" />
                    </Button>
                    {intl.formatMessage({ id: 'BUY_EVER_BTN_TEXT' })}
                </label>

                <label className="account-details__controls-label">
                    <Button className="account-details__controls-btn" design="dark" onClick={vm.onReceive}>
                        <img src={ReceiveIcon} alt="" />
                    </Button>
                    {intl.formatMessage({ id: 'RECEIVE_BTN_TEXT' })}
                </label>

                {vm.everWalletState && vm.isDeployed && (
                    <label className="account-details__controls-label">
                        <Button className="account-details__controls-btn" design="dark" onClick={vm.onSend}>
                            <img src={SendIcon} alt="" />
                        </Button>
                        {intl.formatMessage({ id: 'SEND_BTN_TEXT' })}
                    </label>
                )}

                {vm.everWalletState && vm.isDeployed && vm.stakingAvailable && (
                    <label className={classNames('account-details__controls-label', { _alert: vm.hasWithdrawRequest })}>
                        <Button className="account-details__controls-btn" design="dark" onClick={vm.onStake}>
                            <img src={StakeIcon} alt="" />
                        </Button>
                        {intl.formatMessage({ id: 'STAKE_BTN_TEXT' })}
                    </label>
                )}

                {vm.everWalletState && !vm.isDeployed && (
                    <label className="account-details__controls-label">
                        <Button className="account-details__controls-btn" design="dark" onClick={vm.onDeploy}>
                            <img src={DeployIcon} alt="" />
                        </Button>
                        {intl.formatMessage({ id: 'DEPLOY_BTN_TEXT' })}
                    </label>
                )}
            </ButtonGroup>

            {vm.everWalletState && vm.isDeployed && vm.stakeBannerVisible && (
                <div className="account-details__staking" onClick={vm.onStake}>
                    <div className="account-details__staking-bg">
                        <button type="button" className="account-details__staking-close" onClick={vm.hideBanner}>
                            <img src={CloseIcon} alt="" />
                        </button>
                        <div className="account-details__staking-text">
                            {intl.formatMessage({ id: 'STAKE_BANNER_TEXT' }, { apy: STAKE_APY_PERCENT })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
})
