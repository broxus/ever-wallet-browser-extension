import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useMemo } from 'react'

import { Button, Card, Container, Content, Footer, Header, Navbar, Select, Space, UserInfo, useViewModel } from '@app/popup/modules/shared'
import { Data } from '@app/popup/modules/shared/components/Data'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import { WebsiteIcon } from '../WebsiteIcon'
import { ParamsView } from '../ParamsView'
import { ApproveChangeNetworkViewModel } from './ApproveChangeNetworkViewModel'
import styles from './ApproveChangeNetwork.module.scss'

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
            <Header>
                <Navbar>
                    {intl.formatMessage({ id: 'CHANGE_NETWORK' })}
                </Navbar>
            </Header>

            <Content>
                {vm.selectedAccount && (
                    <Card
                        size="s" bg="layer-1" padding="xs"
                        className={styles.user}
                    >
                        <UserInfo account={vm.selectedAccount} />
                    </Card>
                )}

                <Space direction="column" gap="m">
                    {vm.networks.length > 1 && vm.selectedNetwork && (
                        // TODO: redesign
                        <Select
                            options={options}
                            value={vm.selectedNetwork.connectionId}
                            onChange={vm.onNetworkSelect}
                        />
                    )}

                    <Data
                        dir="v"
                        label={intl.formatMessage({
                            id: 'WEBSITE',
                        })}
                        value={(
                            <WebsiteIcon iconSize="m" origin={vm.approval.origin} />
                        )}
                    />

                    <hr />

                    <ParamsView params={{ network: vm.providerNetwork }} />
                </Space>
            </Content>

            <Footer layer>
                <FooterAction>
                    <Button design="neutral" disabled={vm.loading} onClick={vm.onReject}>
                        {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
                    </Button>
                    <Button design="accent" loading={vm.loading} onClick={vm.onSubmit}>
                        {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})
