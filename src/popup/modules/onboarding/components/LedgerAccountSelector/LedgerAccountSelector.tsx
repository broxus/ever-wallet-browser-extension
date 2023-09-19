import { observer } from 'mobx-react-lite'

import { convertPublicKey } from '@app/shared'
import { Checkbox, Container, Content, PageLoader, Pagination } from '@app/popup/modules/shared'
import { LedgerSignInViewModel } from '@app/popup/modules/onboarding/components/LedgerSignIn/LedgerSignInViewModel'

import styles from './LedgerAccountSelector.module.scss'

interface Props {
    vm: LedgerSignInViewModel;
}

export const LedgerAccountSelector = observer(({ vm }: Props): JSX.Element => (
    <PageLoader active={vm.loading}>
        <Container>
            <Content>
                <div className={styles.list}>
                    {vm.accountSlice.map(account => {
                        const { publicKey, index } = account
                        const isSelected = vm.selected.has(index)

                        return (
                            <Checkbox
                                labelPosition="before"
                                key={publicKey}
                                className={styles.item}
                                checked={isSelected}
                                onChange={(e) => vm.setChecked(account, e.target.checked)}
                            >
                                <span className={styles.name}>
                                    {index + 1}.&nbsp;{convertPublicKey(publicKey)}
                                </span>
                            </Checkbox>
                        )
                    })}
                </div>
                <div className={styles.pagination}>
                    <Pagination
                        page={vm.currentPage}
                        pageLength={10}
                        totalPages={20}
                        onChange={vm.getPage}
                    />
                </div>
            </Content>
        </Container>
    </PageLoader>
))
