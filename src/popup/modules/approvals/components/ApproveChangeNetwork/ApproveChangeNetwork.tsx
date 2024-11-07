import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useMemo } from 'react'

import { Button, Container, Content, Footer, ParamsPanel, Select, Space, useViewModel } from '@app/popup/modules/shared'

import { ApprovalNetwork } from '../ApprovalNetwork'
import { WebsiteIcon } from '../WebsiteIcon'
import { ParamsView } from '../ParamsView'
import { ApproveChangeNetworkViewModel } from './ApproveChangeNetworkViewModel'

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
        <Container>
            <Content>
                <ApprovalNetwork />
                <ParamsPanel>
                    <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_ORIGIN_TITLE' })}>
                        <WebsiteIcon origin={vm.approval.origin} />
                    </ParamsPanel.Param>

                    {vm.networks.length > 1 && vm.selectedNetwork && (
                        <ParamsPanel.Param>
                            <Select
                                options={options}
                                value={vm.selectedNetwork.connectionId}
                                onChange={vm.onNetworkSelect}
                            />
                        </ParamsPanel.Param>
                    )}

                    {vm.providerNetwork && (
                        <ParamsPanel.Param>
                            <ParamsView params={{ network: vm.providerNetwork }} />
                        </ParamsPanel.Param>
                    )}
                </ParamsPanel>
            </Content>

            <Footer>
                <Space direction="row" gap="s">
                    <Button design="secondary" disabled={vm.loading} onClick={vm.onReject}>
                        {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
                    </Button>
                    <Button loading={vm.loading} onClick={vm.onSubmit}>
                        {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                    </Button>
                </Space>
            </Footer>
        </Container>
    )
})
