import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useMemo } from 'react'

import { Button, ButtonGroup, Content, Footer, Select, useViewModel } from '@app/popup/modules/shared'

import { Approval } from '../Approval'
import { ParamsView } from '../ParamsView'
import { ApproveChangeNetworkViewModel } from './ApproveChangeNetworkViewModel'

import './ApproveChangeNetwork.scss'

interface OptionType {
    key: number;
    value: number;
    label: string;
}

export const ApproveChangeNetwork = observer((): JSX.Element | null => {
    const vm = useViewModel(ApproveChangeNetworkViewModel)
    const intl = useIntl()

    const options = useMemo<OptionType[]>(() => vm.networks.map((network) => ({
        key: network.connectionId,
        value: network.connectionId,
        label: network.name,
    })), [vm.networks])

    return (
        <Approval
            className="approval--change-network"
            title={intl.formatMessage({ id: 'APPROVE_CHANGE_NETWORK_TITLE' })}
            origin={vm.approval.origin}
            networkName={vm.selectedConnection.name}
            loading={vm.loading}
        >
            <Content>
                {vm.networks.length > 1 && vm.selectedNetwork && (
                    <div className="network-select">
                        <Select
                            options={options}
                            value={vm.selectedNetwork.connectionId}
                            onChange={vm.onNetworkSelect}
                        />
                    </div>
                )}
                {vm.providerNetwork && (
                    <div className="network-params">
                        <ParamsView params={{ network: vm.providerNetwork }} />
                    </div>
                )}
            </Content>

            <Footer>
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
