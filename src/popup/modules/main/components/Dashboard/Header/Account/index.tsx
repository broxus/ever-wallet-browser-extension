import * as React from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Jdenticon } from '@app/popup/modules/shared/components/Jdenticon'
import { Icon, useResolve } from '@app/popup/modules/shared'
import { AccountDetailsViewModel } from '@app/popup/modules/main/components/AccountDetails/AccountDetailsViewModel'
import { AccountsList } from '@app/popup/modules/main/components/Dashboard/AccountsList/AccountsList'
import { getContractName } from '@app/shared'

import styles from './index.module.scss'

export const Account: React.FC = observer(() => {
    const vm = useResolve(AccountDetailsViewModel)
    const intl = useIntl()

    return (
        <button
            className={styles.root}
            onClick={() => {
                vm.panel.open({
                    showClose: true,
                    render: () => <AccountsList />,
                    title: intl.formatMessage({
                        id: 'MANAGE_DERIVED_KEY_LIST_MY_ACCOUNTS_HEADING',
                    }),
                })
            }}
        >
            {vm.selectedAccountAddress && (
                <Jdenticon value={vm.selectedAccountAddress} />
            )}

            <div className={styles.side}>
                <div className={styles.name}>
                    {vm.selectedAccount?.name}
                    <Icon icon="chevronDown" />
                </div>

                <div className={styles.wallet}>
                    {vm.selectedWalletInfo?.supportsMultipleOwners && (
                        <Icon icon="usersRound" width={16} height={16} />
                    )}
                    {vm.selectedAccount?.tonWallet.contractType && (
                        getContractName(
                            vm.selectedAccount?.tonWallet.contractType,
                            vm.selectedConnectionNetworkType,
                        )
                    )}
                    {vm.selectedWalletInfo?.supportsMultipleOwners && vm.selectedCustodians && vm.isDeployed
                        ? ` ${vm.selectedWalletInfo.requiredConfirmations || 0}/${vm.selectedCustodians.length}`
                        : null}
                </div>
            </div>
        </button>
    )
})
