import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { convertEvers } from '@app/shared'
import {
    Button,
    ButtonGroup,
    Checkbox,
    Container,
    Content,
    Footer,
    Header,
    useViewModel,
} from '@app/popup/modules/shared'

import { AccountsList } from '../AccountsList'
import { ConnectingProcess } from '../ConnectingProcess'
import { WebsiteIcon } from '../WebsiteIcon'
import { ApproveRequestPermissionsViewModel, Step } from './ApproveRequestPermissionsViewModel'

import './ApproveRequestPermissions.scss'

export const ApproveRequestPermissions = observer((): JSX.Element => {
    const vm = useViewModel(ApproveRequestPermissionsViewModel)
    const intl = useIntl()

    return (
        <Container
            className={classNames('connect-wallet', {
                _connecting: vm.step.is(Step.Connecting),
            })}
        >
            {(vm.step.is(Step.SelectAccount) || vm.step.is(Step.Confirm)) && (
                <Header className="connect-wallet__header">
                    <div className="connect-wallet__origin-source">
                        <WebsiteIcon />
                        <div className="connect-wallet__origin-source-value">{vm.approval.origin}</div>
                    </div>
                    {vm.step.is(Step.SelectAccount) && (
                        <h2 className="connect-wallet__title noselect">
                            {intl.formatMessage({ id: 'APPROVE_REQUEST_PERMISSIONS_HEADER' })}
                        </h2>
                    )}
                    {vm.step.is(Step.Confirm) && (
                        <>
                            <h2 className="connect-wallet__title noselect">
                                {intl.formatMessage(
                                    { id: 'APPROVE_REQUEST_PERMISSIONS_CONNECTED_TO' },
                                    { name: vm.selectedAccount?.name || '' },
                                )}
                            </h2>
                            <div className="connect-wallet__account-balance">
                                {`${convertEvers(vm.balance)} ${vm.nativeCurrency}`}
                            </div>
                        </>
                    )}
                </Header>
            )}
            {vm.step.is(Step.SelectAccount) && (
                <>
                    <Content>
                        <AccountsList selectedAccount={vm.selectedAccount} onSelect={vm.setSelectedAccount} />
                    </Content>

                    <Footer>
                        <Button disabled={!vm.selectedAccount} onClick={vm.step.callback(Step.Confirm)}>
                            {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                        </Button>
                    </Footer>
                </>
            )}

            {vm.step.is(Step.Confirm) && (
                <>
                    <Content>
                        <div className="connect-wallet__permissions">
                            <h3 className="connect-wallet__permissions-heading noselect">
                                {intl.formatMessage({ id: 'APPROVE_REQUEST_PERMISSIONS_PERMISSIONS_SUBHEADING' })}
                            </h3>
                            <div className="connect-wallet__permissions-list">
                                <div className="connect-wallet__permissions-list-item">
                                    <Checkbox checked={vm.confirmChecked} onChange={(e) => vm.setConfirmChecked(e.target.checked)} />
                                    <div className="connect-wallet__permissions-names-list">
                                        {vm.permissions}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Content>

                    <Footer>
                        <ButtonGroup>
                            {vm.shouldSelectAccount && (
                                <Button group="small" design="secondary" onClick={vm.step.callback(Step.SelectAccount)}>
                                    {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                                </Button>
                            )}
                            <Button
                                disabled={!vm.confirmChecked || (vm.shouldSelectAccount && !vm.selectedAccount)}
                                onClick={vm.onSubmit}
                            >
                                {intl.formatMessage({ id: 'CONNECT_BTN_TEXT' })}
                            </Button>
                        </ButtonGroup>
                    </Footer>
                </>
            )}

            {vm.step.is(Step.Connecting) && (
                <ConnectingProcess />
            )}
        </Container>
    )
})
