import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import OutSrc from '@app/popup/assets/img/out@2x.png'
import { Icons } from '@app/popup/icons'
import { Amount, Chips, useViewModel } from '@app/popup/modules/shared'
import { convertAddress, convertCurrency } from '@app/shared'
import type { WithdrawRequest } from '@app/models'

import { WithdrawInfo } from '../WithdrawInfo'
import { WithdrawRequestListViewModel } from './WithdrawRequestListViewModel'
import styles from './WithdrawRequestList.module.scss'

interface Props {
    onRemove(request: WithdrawRequest): void;
}

export const WithdrawRequestList = observer(({ onRemove }: Props): JSX.Element => {
    const vm = useViewModel(WithdrawRequestListViewModel)
    const intl = useIntl()

    const openInfo = (request: WithdrawRequest) => vm.panel.open({
        fullHeight: true,
        showClose: false,
        render: () => (
            <WithdrawInfo withdrawRequest={request} onRemove={onRemove} />
        ),
    })

    return (
        <div className={styles.list}>
            {vm.withdrawRequests.map((request) => {
                const [, { amount, timestamp }] = request
                const handleClick = () => openInfo(request)
                const date = new Date(parseInt(timestamp, 10) * 1000).toLocaleString('default', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                })

                return (
                    <div key={timestamp} className={styles.item} onClick={handleClick}>
                        <div className={styles.data}>
                            <Icons.ChevronRight className={styles.arrow} />

                            <div className={styles.amount}>
                                <img className={styles.img} src={OutSrc} alt="" />
                                <Amount value={convertCurrency(amount, vm.decimals)} currency={vm.currencyName} />
                            </div>

                            <div className={styles.info}>
                                <span>{convertAddress(vm.transfer.account.tonWallet.address)}</span>
                                <span>•</span>
                                <span>{date}</span>
                            </div>

                            <div className={styles.status}>
                                <Chips type="warning">
                                    {intl.formatMessage({ id: 'STAKE_WITHDRAW_TERM_UNSTAKING_IN_PROGRESS' })}
                                </Chips>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
})
