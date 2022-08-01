import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import {
    Button, Container, Content, Footer, Header, useViewModel,
} from '@app/popup/modules/shared'

import { AccountsList } from '../AccountsList'
import { ConnectingProcess } from '../ConnectingProcess'
import { WebsiteIcon } from '../WebsiteIcon'
import { ApproveChangeAccountViewModel, Step } from './ApproveChangeAccountViewModel'

import './ApproveChangeAccount.scss'

export const ApproveChangeAccount = observer((): JSX.Element => {
    const vm = useViewModel(ApproveChangeAccountViewModel)
    const intl = useIntl()

    return (
        <Container
            className={classNames('change-account', {
                _connecting: vm.step.is(Step.Connecting),
            })}
        >
            {vm.step.is(Step.SelectAccount) && (
                <>
                    <Header key="header">
                        <div className="change-account__origin-source">
                            <WebsiteIcon />
                            <div className="change-account__origin-source-value">{vm.approval.origin}</div>
                        </div>
                        <h2 className="change-account__title noselect">
                            {intl.formatMessage({ id: 'APPROVE_CHANGE_ACCOUNT_HEADER' })}
                        </h2>
                    </Header>

                    <Content>
                        <AccountsList selectedAccount={vm.selectedAccount} onSelect={vm.setSelectedAccount} />
                    </Content>

                    <Footer>
                        <Button disabled={!vm.selectedAccount} onClick={vm.onSubmit}>
                            {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                        </Button>
                    </Footer>
                </>
            )}

            {vm.step.is(Step.Connecting) && (
                <ConnectingProcess />
            )}
        </Container>
    )
})
