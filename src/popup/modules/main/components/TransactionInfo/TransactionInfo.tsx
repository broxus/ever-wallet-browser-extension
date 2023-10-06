import { observer } from 'mobx-react-lite'

import { isSubmitTransaction, SelectedAsset } from '@app/shared'
import { Container, Content, Empty, useViewModel } from '@app/popup/modules/shared'

import { GenericTransactionInfo, MultisigTransactionInfo } from './components'
import { TransactionInfoViewModel } from './TransactionInfoViewModel'

interface Props {
    asset: SelectedAsset;
    hash: string;
}

export const TransactionInfo = observer(({ asset, hash }: Props): JSX.Element => {
    const vm = useViewModel(TransactionInfoViewModel, (model) => {
        model.asset = asset
        model.hash = hash
    })

    if (!vm.transaction) {
        return (
            <Container>
                <Content>
                    <Empty />
                </Content>
            </Container>
        )
    }

    return isSubmitTransaction(vm.transaction) ? (
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
})
