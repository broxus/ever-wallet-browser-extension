import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { convertEvers } from '@app/shared'
import { Amount, Button, Checkbox, Container, Content, Footer, ParamsPanel, Space, useViewModel } from '@app/popup/modules/shared'

import { AccountsList } from '../AccountsList'
import { ApprovalNetwork } from '../ApprovalNetwork'
import { ApproveRequestPermissionsViewModel, Step } from './ApproveRequestPermissionsViewModel'
import styles from './ApproveRequestPermissions.module.scss'

export const ApproveRequestPermissions = observer((): JSX.Element => {
    const vm = useViewModel(ApproveRequestPermissionsViewModel)
    const intl = useIntl()

    return (
        <Container>
            {vm.step.is(Step.SelectAccount) && (
                <>
                    <Content>
                        <ApprovalNetwork />
                        <Space direction="column" gap="l">
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
                        <ApprovalNetwork />
                        <h2>
                            {intl.formatMessage(
                                { id: 'APPROVE_REQUEST_PERMISSIONS_CONNECTED_TO' },
                                { name: vm.selectedAccount?.name || '' },
                            )}
                        </h2>
                        <div className={styles.balance}>
                            <Amount value={convertEvers(vm.balance)} currency={vm.nativeCurrency} />
                        </div>
                        <div className={styles.permissions}>
                            {intl.formatMessage({ id: 'APPROVE_REQUEST_PERMISSIONS_PERMISSIONS_SUBHEADING' })}
                        </div>
                        <ParamsPanel>
                            <ParamsPanel.Param>
                                <Checkbox
                                    labelPosition="before"
                                    className={styles.checkbox}
                                    checked={vm.confirmChecked}
                                    onChange={(e) => vm.setConfirmChecked(e.target.checked)}
                                >
                                    {vm.permissions}
                                </Checkbox>
                            </ParamsPanel.Param>
                        </ParamsPanel>
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
