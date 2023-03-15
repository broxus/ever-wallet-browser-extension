import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import DeployIcon from '@app/popup/assets/img/deploy.svg'
import NotificationsIcon from '@app/popup/assets/img/notifications.svg'
import BuyIcon from '@app/popup/assets/img/buy.svg'
import ReceiveIcon from '@app/popup/assets/img/receive.svg'
import SendIcon from '@app/popup/assets/img/send.svg'
import StakeIcon from '@app/popup/assets/img/stake/stake.svg'
import ChangeAccountSrc from '@app/popup/assets/img/change-account.svg'
import { Button, ButtonGroup, Carousel, useViewModel } from '@app/popup/modules/shared'
import { supportedByLedger } from '@app/shared'
import { Networks } from '@app/popup/modules/network'

import { AccountCard } from '../AccountCard'
import { AccountSettings } from '../AccountSettings'
import { AddNewAccountCard } from '../AddNewAccountCard'
import { AccountDetailsViewModel } from './AccountDetailsViewModel'

import './AccountDetails.scss'

interface Props {
    onVerifyAddress(address: string): void;
    onNetworkSettings(): void;
}

export const AccountDetails = observer(({ onVerifyAddress, onNetworkSettings }: Props): JSX.Element => {
    const vm = useViewModel(AccountDetailsViewModel)
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
                <Networks onSettings={onNetworkSettings} />
                <AccountSettings />
            </div>

            <div className="account-details__carousel-container">
                <Carousel selectedItem={vm.carouselIndex} onChange={vm.onSlide}>
                    {vm.accounts.map(({ account, key, total, details, custodians, densPath }) => (
                        <AccountCard
                            key={account.tonWallet.address}
                            accountName={account.name}
                            address={account.tonWallet.address}
                            densPath={densPath}
                            publicKey={account.tonWallet.publicKey}
                            type={account.tonWallet.contractType}
                            requiredConfirmations={details?.requiredConfirmations}
                            custodians={custodians}
                            balance={total}
                            canRemove={vm.accounts.length > 1}
                            canVerifyAddress={key?.signerName === 'ledger_key' && supportedByLedger(account.tonWallet.contractType)}
                            onRemove={vm.removeAccount}
                            onVerifyAddress={onVerifyAddress}
                            onOpenInExplorer={vm.openAccountInExplorer}
                        />
                    ))}
                    <AddNewAccountCard key="addSlide" onClick={vm.addAccount} />
                </Carousel>
                <button type="button" className="account-details__carousel-container-btn" onClick={vm.openChangeAccount}>
                    <img src={ChangeAccountSrc} alt="" />
                </button>
            </div>

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
        </div>
    )
})
