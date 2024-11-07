import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import {
    Button,
    Container,
    Content,
    ErrorMessage,
    Footer,
    ParamsPanel,
    Space,
    Switch,
    useViewModel,
} from '@app/popup/modules/shared'

import { ApprovalNetwork } from '../ApprovalNetwork'
import { WebsiteIcon } from '../WebsiteIcon'
import { ParamsView } from '../ParamsView'
import { ApproveAddNetworkViewModel } from './ApproveAddNetworkViewModel'

export const ApproveAddNetwork = observer((): JSX.Element | null => {
    const vm = useViewModel(ApproveAddNetworkViewModel)
    const intl = useIntl()

    return (
        <Container>
            <Content>
                <ApprovalNetwork />
                <ParamsPanel>
                    <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_ORIGIN_TITLE' })}>
                        <WebsiteIcon origin={vm.approval.origin} />
                    </ParamsPanel.Param>

                    <ParamsPanel.Param>
                        <ParamsView params={{ network: vm.approval.requestData.addNetwork }} />
                    </ParamsPanel.Param>
                </ParamsPanel>

                <Switch checked={vm.switchNetwork} onChange={vm.onSwitch}>
                    {intl.formatMessage({ id: 'APPROVE_ADD_NETWORK_SWITCH_LABEL' })}
                </Switch>
            </Content>

            <Footer>
                <Space direction="column" gap="s">
                    {vm.error && (
                        <ErrorMessage>
                            {vm.error}
                        </ErrorMessage>
                    )}
                    <Space direction="row" gap="s">
                        <Button design="secondary" disabled={vm.loading} onClick={vm.onReject}>
                            {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
                        </Button>
                        <Button loading={vm.loading} onClick={vm.onSubmit}>
                            {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                        </Button>
                    </Space>
                </Space>
            </Footer>
        </Container>
    )
})
