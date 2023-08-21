import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button, Container, Content, Footer, Space, useViewModel } from '@app/popup/modules/shared'

import { AccountsList } from '../AccountsList'
import { ApprovalNetwork } from '../ApprovalNetwork'
import { ApproveChangeAccountViewModel } from './ApproveChangeAccountViewModel'

export const ApproveChangeAccount = observer((): JSX.Element => {
    const vm = useViewModel(ApproveChangeAccountViewModel)
    const intl = useIntl()

    return (
        <Container>
            <Content>
                <ApprovalNetwork />
                <Space direction="column" gap="l">
                    <h2>{intl.formatMessage({ id: 'APPROVE_CHANGE_ACCOUNT_HEADER' })}</h2>
                    <AccountsList selectedAccount={vm.selectedAccount} onSelect={vm.setSelectedAccount} />
                </Space>
            </Content>

            <Footer>
                <Button disabled={!vm.selectedAccount} loading={vm.loading} onClick={vm.onSubmit}>
                    {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
