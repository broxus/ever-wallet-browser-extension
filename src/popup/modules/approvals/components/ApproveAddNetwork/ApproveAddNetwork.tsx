import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button, ButtonGroup, Content, ErrorMessage, Footer, Switch, useViewModel } from '@app/popup/modules/shared'

import { Approval } from '../Approval'
import { ParamsView } from '../ParamsView'
import { ApproveAddNetworkViewModel } from './ApproveAddNetworkViewModel'

import './ApproveAddNetwork.scss'

export const ApproveAddNetwork = observer((): JSX.Element | null => {
    const vm = useViewModel(ApproveAddNetworkViewModel)
    const intl = useIntl()

    return (
        <Approval
            className="approval--add-network"
            title={intl.formatMessage({ id: 'APPROVE_ADD_NETWORK_TITLE' })}
            origin={vm.approval.origin}
            networkName={vm.selectedConnection.name}
            loading={vm.loading}
        >
            <Content>
                <div className="network-params">
                    <ParamsView params={{ network: vm.approval.requestData.addNetwork }} />
                </div>
                <Switch checked={vm.switchNetwork} onChange={vm.onSwitch}>
                    {intl.formatMessage({ id: 'APPROVE_ADD_NETWORK_SWITCH_LABEL' })}
                </Switch>
            </Content>

            <Footer>
                {vm.error && (
                    <ErrorMessage className="approval__footer-error">
                        {vm.error}
                    </ErrorMessage>
                )}

                <ButtonGroup>
                    <Button design="secondary" onClick={vm.onReject}>
                        {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
                    </Button>
                    <Button disabled={vm.loading} onClick={vm.onSubmit}>
                        {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Approval>
    )
})
