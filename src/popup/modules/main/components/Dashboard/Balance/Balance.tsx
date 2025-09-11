import * as React from 'react'
import { observer } from 'mobx-react-lite'

import { CopyButton, Icon, useViewModel } from '@app/popup/modules/shared'
import { convertAddress, formatFiat } from '@app/shared'

import styles from './Balance.module.scss'
import { DashboardViewModel } from '../DashboardViewModel'
import { AccountCardViewModel } from '../AccountViewModel'

export const DashboardBalance: React.FC = observer(() => {
    const vmDetails = useViewModel(DashboardViewModel)
    const vm = useViewModel(
        AccountCardViewModel,
        (model) => {
            model.address = vmDetails.selectedAccountAddress!
        },
        [vmDetails.selectedAccountAddress],
    )

    const [int, frac] = formatFiat(vm.balance || '0').split('.')

    return (
        <div className={styles.root}>
            <div className={styles.balance}>
                <span className={styles.symbol}>$&nbsp;</span>
                <span className={styles.amount1}>{int}</span>
                <span className={styles.amount2}>.{frac ? `${frac}` : '00'}</span>
            </div>
            <CopyButton text={vmDetails.selectedAccountAddress!}>
                <div className={styles.wallet}>
                    <Icon icon="wallet" />
                    {convertAddress(vmDetails.selectedAccountAddress)}
                </div>
            </CopyButton>
        </div>
    )
})
