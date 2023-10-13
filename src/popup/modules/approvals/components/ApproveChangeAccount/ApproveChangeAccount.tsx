import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button, Card, Container, Content, Footer, Header, Navbar, useViewModel } from '@app/popup/modules/shared'

import { AccountsList } from '../AccountsList'
import { WebsiteIcon } from '../WebsiteIcon'
import { ApproveChangeAccountViewModel } from './ApproveChangeAccountViewModel'
import styles from './ApproveChangeAccount.module.scss'

export const ApproveChangeAccount = observer((): JSX.Element => {
    const vm = useViewModel(ApproveChangeAccountViewModel)
    const intl = useIntl()

    return (
        <Container>
            <Header>
                <Navbar close="window">
                    {intl.formatMessage({ id: 'APPROVE_CHANGE_ACCOUNT_HEADER' })}
                </Navbar>
                <Card size="s" className={styles.website}>
                    <WebsiteIcon iconSize="l" origin={vm.approval.origin} />
                </Card>
            </Header>

            <Content>
                <AccountsList selectedAccount={vm.selectedAccount} onSelect={vm.setSelectedAccount} />
            </Content>

            <Footer>
                <Button disabled={!vm.selectedAccount} loading={vm.loading} onClick={vm.onSubmit}>
                    {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
