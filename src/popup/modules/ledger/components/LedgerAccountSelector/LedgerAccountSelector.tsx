import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button, Container, Content, Footer, Header, Navbar, PageLoader, Pagination, useViewModel, useWhiteBg } from '@app/popup/modules/shared'
import { AccountSelector } from '@app/popup/modules/account/components/AccountSelector'

import { LedgerAccountSelectorViewModel } from './LedgerAccountSelectorViewModel'
import styles from './LedgerAccountSelector.module.scss'

interface Props {
    onBack: () => void;
    onSuccess: () => void;
    onError: (e: any) => void;
}

export const LedgerAccountSelector = observer(({ onBack, onSuccess, onError }: Props): JSX.Element => {
    const vm = useViewModel(LedgerAccountSelectorViewModel, model => {
        model.onSuccess = onSuccess
        model.onError = onError
    })
    const intl = useIntl()

    useWhiteBg()

    return (
        <PageLoader active={vm.loading}>
            <Container>
                <Header>
                    <Navbar back={onBack} />
                </Header>

                <Content>
                    <h2>{intl.formatMessage({ id: 'LEDGER_SELECT_KEYS' })}</h2>

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
                </Content>

                <Footer>
                    <div className={styles.pagination}>
                        <Pagination
                            page={vm.currentPage}
                            totalPages={20}
                            onChange={vm.getPage}
                        />
                    </div>
                    <Button disabled={!vm.canSave} loading={vm.saving} onClick={vm.saveAccounts}>
                        {intl.formatMessage({ id: 'SELECT_BTN_TEXT' })}
                    </Button>
                </Footer>
            </Container>
        </PageLoader>
    )
})
