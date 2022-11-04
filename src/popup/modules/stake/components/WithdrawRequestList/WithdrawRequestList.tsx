import type nt from '@wallet/nekoton-wasm'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { Panel, SlidingPanel, useDrawerPanel, useViewModel } from '@app/popup/modules/shared'
import { convertAddress, convertCurrency, splitAddress } from '@app/shared'
import type { WithdrawRequest } from '@app/models'

import { WithdrawInfo } from '../WithdrawInfo'
import { WithdrawRequestListViewModel } from './WithdrawRequestListViewModel'
import './WithdrawRequestList.scss'

interface Props {
    selectedAccount: nt.AssetsList;
    onRemove(request: WithdrawRequest): void;
}

export const WithdrawRequestList = observer(({ selectedAccount, onRemove }: Props): JSX.Element => {
    const drawer = useDrawerPanel()
    const vm = useViewModel(WithdrawRequestListViewModel, (model) => {
        model.selectedAccount = selectedAccount
        model.drawer = drawer
    })
    const intl = useIntl()

    return (
        <>
            <div className="withdraw-request-list">
                {vm.withdrawRequests.map((request) => {
                    const [, { amount, timestamp }] = request
                    const handleClick = () => vm.openInfo(request)

                    return (
                        <div key={timestamp} className="withdraw-request-list__item" onClick={handleClick}>
                            <div className="withdraw-request-list__item-amount">
                                {convertCurrency(amount, vm.decimals)}
                                &nbsp;
                                {vm.currencyName}
                            </div>

                            <div className="withdraw-request-list__item-bottom">
                                <span
                                    className="withdraw-request-list__item-description _address"
                                    data-tooltip={splitAddress(vm.selectedAccount.tonWallet.address)}
                                >
                                    {convertAddress(vm.selectedAccount.tonWallet.address)}
                                </span>
                                <span className="withdraw-request-list__item-description _date">
                                    {new Date(parseInt(timestamp, 10) * 1000).toLocaleString('default', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: 'numeric',
                                    })}
                                </span>
                            </div>

                            <div className="withdraw-request-list__item-labels">
                                <div className="withdraw-request-list__item-label">
                                    {intl.formatMessage({ id: 'STAKE_WITHDRAW_TERM_UNSTAKING_IN_PROGRESS' })}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <SlidingPanel
                className="stake-sliding-panel"
                active={drawer.panel !== undefined}
                onClose={() => drawer.setPanel(undefined)}
            >
                {drawer.panel === Panel.STAKE_WITHDRAW_INFO && vm.withdrawRequest && (
                    <WithdrawInfo
                        selectedAccount={vm.selectedAccount}
                        withdrawRequest={vm.withdrawRequest}
                        onRemove={onRemove}
                    />
                )}
            </SlidingPanel>
        </>
    )
})
