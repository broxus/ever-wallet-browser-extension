import { observer } from 'mobx-react-lite'
import { useNavigate } from 'react-router'

import { isSubmitTransaction } from '@app/shared'
import { Container, Empty, Header, Navbar, useResolve } from '@app/popup/modules/shared'

import { GenericTransactionInfo, MultisigTransactionInfo } from './components'
import { TransactionInfoViewModel } from './TransactionInfoViewModel'

export const TransactionInfo = observer((): JSX.Element => {
    const vm = useResolve(TransactionInfoViewModel)
    const navigate = useNavigate()

    return (
        <Container>
            <Header>
                <Navbar back={() => navigate(-1)} />
            </Header>

            {!vm.selectedTransaction && <Empty />}

            {vm.selectedTransaction && (
                isSubmitTransaction(vm.selectedTransaction) ? (
                    <MultisigTransactionInfo
                        transaction={vm.selectedTransaction}
                        onOpenInExplorer={vm.openTransactionInExplorer}
                    />
                ) : (
                    <GenericTransactionInfo
                        transaction={vm.selectedTransaction}
                        symbol={vm.symbol}
                        token={vm.token}
                        nativeCurrency={vm.nativeCurrency}
                        onOpenInExplorer={vm.openTransactionInExplorer}
                    />
                )
            )}
        </Container>
    )
})
