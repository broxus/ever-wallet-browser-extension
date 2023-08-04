import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Container, Header, Navbar, useViewModel } from '@app/popup/modules/shared'

import { MultisigForm } from '../MultisigForm'
import { DeployMultisigWalletViewModel } from './DeployMultisigWalletViewModel'

export const DeployMultisigWallet = observer((): JSX.Element | null => {
    const vm = useViewModel(DeployMultisigWalletViewModel)
    const intl = useIntl()

    return (
        <Container>
            <Header>
                <Navbar close="window">
                    {intl.formatMessage({ id: 'DEPLOY_MULTISIG_PANEL_HEADER' })}
                </Navbar>
            </Header>

            <MultisigForm
                data={vm.multisigData}
                contractType={vm.contractType}
                onSubmit={vm.submit}
            />
        </Container>
    )
})
