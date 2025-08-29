import * as React from 'react'
import { observer } from 'mobx-react-lite'

import { Jdenticon } from '@app/popup/modules/shared/components/Jdenticon'
import { Icon, useResolve } from '@app/popup/modules/shared'
import { AccountsList } from '@app/popup/modules/main/components/Dashboard/AccountsList/AccountsList'
import { AccountHeaderViewModel } from '@app/popup/modules/main/components/Dashboard/Header/Account/AccountHeaderViewModel'
import { getContractName } from '@app/shared'

import styles from './index.module.scss'

export const Account: React.FC = observer(() => {
    const vm = useResolve(AccountHeaderViewModel)

    return (
        <button
            className={styles.root}
            onClick={() => {
                vm.panel.open({
                    showClose: false,
                    render: () => <AccountsList />,
                })
            }}
        >
            {vm.selectedAccountAddress && (
                <Jdenticon value={vm.selectedAccountAddress} />
            )}

            <div className={styles.side}>
                <div className={styles.nameWrapper}>
                    <span className={styles.name}>{vm.selectedAccount?.name}</span>

                    <div className={styles.wallet}>
                        {vm.selectedWalletInfo?.supportsMultipleOwners && (
                            <Icon icon="usersRound" width={16} height={16} />
                        )}
                        {vm.selectedAccount?.tonWallet.contractType && (
                            getContractName(
                                vm.selectedAccount?.tonWallet.contractType,
                                vm.selectedConnectionNetworkGroup,
                                vm.connectionStore.connectionConfig,
                            )
                        )}
                        {vm.selectedWalletInfo?.supportsMultipleOwners
                        && vm.isDeployed
                        && vm.details?.requiredConfirmations
                        && vm.details?.requiredConfirmations > 1
                            ? ` ${vm.details.requiredConfirmations || 0}/${vm.selectedCustodians.length}`
                            : null}
                    </div>
                </div>


                <Icon icon="chevronDown" />
            </div>
        </button>
    )
})
