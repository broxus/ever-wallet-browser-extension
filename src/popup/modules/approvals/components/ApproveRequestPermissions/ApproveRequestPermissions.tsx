import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button, Checkbox, Container, Content, Footer, ParamsPanel, Space, UserInfo, useViewModel } from '@app/popup/modules/shared'

import { AccountsList } from '../AccountsList'
import { ApproveRequestPermissionsViewModel, Step } from './ApproveRequestPermissionsViewModel'

export const ApproveRequestPermissions = observer((): JSX.Element => {
    const vm = useViewModel(ApproveRequestPermissionsViewModel)
    const intl = useIntl()

    return (
        <Container>
            {vm.step.is(Step.SelectAccount) && (
                <>
                    <Content>
                        <Space direction="column" gap="m">
                            <h2>{intl.formatMessage({ id: 'APPROVE_REQUEST_PERMISSIONS_HEADER' })}</h2>

                            <AccountsList selectedAccount={vm.selectedAccount} onSelect={vm.setSelectedAccount} />
                        </Space>
                    </Content>

                    <Footer>
                        <Button disabled={!vm.selectedAccount} onClick={vm.step.callback(Step.Confirm)}>
                            {intl.formatMessage({ id: 'NEXT_BTN_TEXT' })}
                        </Button>
                    </Footer>
                </>
            )}

            {vm.step.is(Step.Confirm) && vm.selectedAccount && (
                <>
                    <Content>
                        <Space direction="column" gap="m">
                            <ParamsPanel>
                                <ParamsPanel.Param>
                                    <UserInfo account={vm.selectedAccount} />
                                </ParamsPanel.Param>
                                <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_ORIGIN_TITLE' })}>
                                    {vm.approval.origin}
                                </ParamsPanel.Param>
                            </ParamsPanel>

                            <ParamsPanel title={intl.formatMessage({ id: 'APPROVE_REQUEST_PERMISSIONS_PERMISSIONS_SUBHEADING' })}>
                                <ParamsPanel.Param>
                                    <Checkbox
                                        labelPosition="after"
                                        checked={vm.confirmChecked}
                                        onChange={(e) => vm.setConfirmChecked(e.target.checked)}
                                    >
                                        {vm.permissions}
                                    </Checkbox>
                                </ParamsPanel.Param>
                            </ParamsPanel>
                        </Space>
                    </Content>

                    <Footer>
                        <Space direction="row" gap="s">
                            {vm.shouldSelectAccount && (
                                <Button design="secondary" onClick={vm.step.callback(Step.SelectAccount)}>
                                    {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                                </Button>
                            )}
                            <Button
                                disabled={!vm.confirmChecked || (vm.shouldSelectAccount && !vm.selectedAccount)}
                                loading={vm.loading}
                                onClick={vm.onSubmit}
                            >
                                {intl.formatMessage({ id: 'CONNECT_BTN_TEXT' })}
                            </Button>
                        </Space>
                    </Footer>
                </>
            )}
        </Container>
    )
})
