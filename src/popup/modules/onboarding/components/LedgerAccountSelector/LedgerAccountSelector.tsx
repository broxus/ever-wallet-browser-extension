import { observer } from 'mobx-react-lite'

import { Container, Content, PageLoader, Pagination, useWhiteBg } from '@app/popup/modules/shared'
import { AccountSelector } from '@app/popup/modules/account/components/AccountSelector'
import { LedgerAccountSelectorViewModel } from '@app/popup/modules/ledger/components/LedgerAccountSelector/LedgerAccountSelectorViewModel'

import styles from './LedgerAccountSelector.module.scss'

interface Props {
    vm: LedgerAccountSelectorViewModel
}

export const LedgerAccountSelector = observer(({ vm }: Props): JSX.Element => {
    useWhiteBg()
    return (
        <PageLoader active={vm.loading}>
            <Container>
                <Content>
                    <div className={styles.list}>
                        {vm.ledgerAccounts.map(account => {
                            const { publicKey, index } = account
                            const isSelected = vm.selected.has(index) || publicKey in vm.storedKeys
                            const isChecked = !vm.keysToRemove.has(publicKey) && isSelected

                            return (
                                <AccountSelector
                                    key={publicKey}
                                    publicKey={publicKey}
                                    index={(index + 1).toString()}
                                    checked={isChecked}
                                    setChecked={checked => vm.setChecked(account, checked)}
                                />
                            )
                        })}
                    </div>
                    <Pagination
                        page={vm.currentPage}
                        pageLength={12}
                        totalPages={20}
                        onChange={vm.getPage}
                    />
                </Content>
            </Container>
        </PageLoader>
    )
})
