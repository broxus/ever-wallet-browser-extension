import { observer } from 'mobx-react-lite'

import { Container, useViewModel } from '@app/popup/modules/shared'

import { MultisigForm } from '../MultisigForm'
import { DeployMultisigWalletViewModel } from './DeployMultisigWalletViewModel'

export const DeployMultisigWallet = observer((): JSX.Element | null => {
    const vm = useViewModel(DeployMultisigWalletViewModel)

    return (
        <Container>
            <MultisigForm data={vm.multisigData} contractType={vm.contractType} onSubmit={vm.submit} />
        </Container>
    )
})
