import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router'

import { isSubmitTransaction } from '@app/shared'
import { Container, Content, Empty, Header, Navbar, useResolve } from '@app/popup/modules/shared'

import { GenericTransactionInfo, MultisigTransactionInfo } from './components'
import { TransactionInfoViewModel } from './TransactionInfoViewModel'

export const TransactionInfo = observer((): JSX.Element => {
    const vm = useResolve(TransactionInfoViewModel)
    const navigate = useNavigate()

    if (!vm.selectedTransaction) {
        return (
            <Container>
                <Header>
                    <Navbar back={() => navigate(-1)} />
                </Header>
                <Content>
                    <Empty />
                </Content>
            </Container>
        )
    }

    return isSubmitTransaction(vm.selectedTransaction) ? (
        <MultisigTransactionInfo
            transaction={vm.selectedTransaction}
            onOpenTransactionInExplorer={vm.openTransactionInExplorer}
            onOpenAccountInExplorer={vm.openAccountInExplorer}
        />
    ) : (
        <GenericTransactionInfo
            transaction={vm.selectedTransaction}
            symbol={vm.symbol}
            token={vm.token}
            nativeCurrency={vm.nativeCurrency}
            onOpenTransactionInExplorer={vm.openTransactionInExplorer}
            onOpenAccountInExplorer={vm.openAccountInExplorer}
        />
    )
})
