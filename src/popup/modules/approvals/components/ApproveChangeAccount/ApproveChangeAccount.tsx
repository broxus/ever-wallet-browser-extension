import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button, Container, Content, Footer, Header, Navbar, useViewModel } from '@app/popup/modules/shared'
import { Data } from '@app/popup/modules/shared/components/Data'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'
import { closeCurrentWindow } from '@app/shared'

import { AccountsList } from '../AccountsList'
import { WebsiteIcon } from '../WebsiteIcon'
import { ApproveChangeAccountViewModel } from './ApproveChangeAccountViewModel'
import styles from './ApproveChangeAccount.module.scss'

export const ApproveChangeAccount = observer((): JSX.Element => {
    const vm = useViewModel(ApproveChangeAccountViewModel)
    const intl = useIntl()

    return (
        <Container>
            <Header className={styles.header}>
                <Navbar>
                    {intl.formatMessage({ id: 'APPROVE_CHANGE_ACCOUNT_HEADER' })}
                </Navbar>
                <Data
                    dir="v"
                    label={intl.formatMessage({
                        id: 'WEBSITE',
                    })}
                    value={(
                        <WebsiteIcon iconSize="m" origin={vm.approval.origin} />
                    )}
                />
            </Header>

            <Content className={styles.content}>
                <AccountsList selectedAccount={vm.selectedAccount} onSelect={vm.setSelectedAccount} />
            </Content>

            <Footer layer>
                <FooterAction
                    buttons={[
                        <Button design="neutral" onClick={closeCurrentWindow}>
                            {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
                        </Button>,
                        <Button
                            design="accent" disabled={!vm.selectedAccount} loading={vm.loading}
                            onClick={vm.onSubmit}
                        >
                            {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                        </Button>,
                    ]}
                />
            </Footer>
        </Container>
    )
})
