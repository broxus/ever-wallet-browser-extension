import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router'
import { useIntl } from 'react-intl'

import { isSubmitTransaction } from '@app/shared'
import { Container, Empty, Header, Navbar, useViewModel } from '@app/popup/modules/shared'
import { usePage } from '@app/popup/modules/shared/hooks/usePage'
import { Page } from '@app/popup/modules/shared/components/Page'

import { GenericTransactionInfo, MultisigTransactionInfo } from './components'
import { TransactionInfoViewModel } from './TransactionInfoViewModel'
import styles from './TransactionInfo.module.scss'

export const TransactionInfo = observer((): JSX.Element => {
    const page = usePage()
    const intl = useIntl()
    const vm = useViewModel(TransactionInfoViewModel)
    const navigate = useNavigate()

    return (
        <Page animated page={page}>
            <Container className={styles.container}>
                <Header className={styles.header}>
                    <Navbar back={page.close(() => navigate(-1))}>
                        {intl.formatMessage({
                            id: 'DETAILS',
                        })}
                    </Navbar>
                </Header>
                {!vm.transaction ? (
                    <Empty />
                ) : (
                    isSubmitTransaction(vm.transaction) ? (
                        <MultisigTransactionInfo
                            transaction={vm.transaction}
                            onOpenTransactionInExplorer={vm.openTransactionInExplorer}
                            onOpenAccountInExplorer={vm.openAccountInExplorer}
                        />
                    ) : (
                        <GenericTransactionInfo
                            transaction={vm.transaction}
                            symbol={vm.symbol}
                            token={vm.token}
                            nativeCurrency={vm.nativeCurrency}
                            onOpenTransactionInExplorer={vm.openTransactionInExplorer}
                            onOpenAccountInExplorer={vm.openAccountInExplorer}
                        />
                    )
                )}
            </Container>
        </Page>
    )
})
