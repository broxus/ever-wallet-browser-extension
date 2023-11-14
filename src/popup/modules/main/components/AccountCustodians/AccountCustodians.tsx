import { observer } from 'mobx-react-lite'
import { FormattedMessage, useIntl } from 'react-intl'

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
    const intl = useIntl()

    if (!vm.account) return null

    return (
        <Container>
            <Content>
                <h2>{intl.formatMessage({ id: 'ACCOUNT_CUSTODIANS_TITLE' })}</h2>
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

            {/* <Footer>
                <Button
                    size="m"
                    design="secondary"
                    className={styles.btn}
                    onClick={() => {}}
                >
                    {intl.formatMessage({ id: 'Edit custodians' })}
                </Button>
            </Footer> */}
        </Container>
    )
})
