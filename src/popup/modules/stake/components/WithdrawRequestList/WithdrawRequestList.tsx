import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router'

import { Amount, Chips, Icon, Space, useResolve, useViewModel } from '@app/popup/modules/shared'
import { convertAddress, convertCurrency } from '@app/shared'
import type { WithdrawRequest } from '@app/models'

import { WithdrawRequestListViewModel } from './WithdrawRequestListViewModel'
import styles from './WithdrawRequestList.module.scss'
import { WithdrawInfoViewModel } from '../WithdrawInfo/WithdrawInfoViewModel'


interface Props {
    onRemove(request: WithdrawRequest): void;
}

export const WithdrawRequestList = observer(({ onRemove }: Props): JSX.Element => {
    const vm = useViewModel(WithdrawRequestListViewModel)
    const vmInfo = useResolve(WithdrawInfoViewModel)
    const intl = useIntl()
    const navigate = useNavigate()

    const openInfo = (request: WithdrawRequest) => {
        vmInfo.setWithdrawRequest(request, onRemove)
        navigate('/details')
    }

    const requests = vm.withdrawRequests.reduce((acc, request) => {
        const [, { timestamp }] = request
        const date = new Date(parseInt(timestamp, 10) * 1000)
        const dayKey = date.toISOString().split('T')[0]
        if (!acc[dayKey]) {
            acc[dayKey] = []
        }
        acc[dayKey].push(request)

        return acc
    }, {} as Record<string, WithdrawRequest[]>)

    return (
        <div className={styles.list}>
            {Object.entries(requests).map(([, requests], index) => (
                <Space direction="column" gap="s">
                    <span>{intl.formatMessage({ id: index ? 'YESTERDAY' : 'TODAY' })}</span>
                    {requests.map((request) => {
                        const [, { amount, timestamp }] = request
                        const handleClick = () => openInfo(request)
                        const date = new Date(parseInt(timestamp, 10) * 1000).toLocaleString('default', {
                            hour: 'numeric',
                            minute: 'numeric',
                        })
                        return (
                            <div key={timestamp} className={styles.item} onClick={handleClick}>
                                <Icon icon="arrowRight" className={styles.arrow} />
                                <div className={styles.data}>
                                    <div className={styles.amount}>
                                        <Amount
                                            precise
                                            value={convertCurrency(amount, vm.decimals)}
                                            currency={vm.currencyName}
                                        />
                                    </div>

                                    <div className={styles.info}>
                                        <span>{convertAddress(vm.transfer.account.tonWallet.address)}</span>
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
                </Space>
            ))}
        </div>
    )
})
