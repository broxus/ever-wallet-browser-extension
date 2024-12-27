import { observer } from 'mobx-react-lite'
import { FormattedMessage } from 'react-intl'

import { Card, Container, Content, useViewModel } from '@app/popup/modules/shared'
import { CustodianList } from '@app/popup/modules/account'

import { AccountCustodiansViewModel } from './AccountCustodiansViewModel'
import styles from './AccountCustodians.module.scss'

interface Props {
    address: string;
}

export const AccountCustodians = observer(({ address }: Props): JSX.Element | null => {
    const vm = useViewModel(AccountCustodiansViewModel, (model) => {
        model.address = address
    })

    if (!vm.account) return null

    return (
        <Container>
            <Content>
                <p className={styles.desc}>
                    <FormattedMessage
                        id="ACCOUNT_CUSTODIANS_DESC"
                        values={{
                            b: (...parts) => <b>{parts}</b>,
                            required: vm.details?.requiredConfirmations ?? 0,
                            count: vm.custodians.length,
                        }}
                    />
                </p>

                <Card className={styles.card}>
                    <CustodianList address={address} />
                </Card>
            </Content>
        </Container>
    )
})
