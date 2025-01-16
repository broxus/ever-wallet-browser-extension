import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import {
    Button,
    Card,
    Container,
    Content,
    ErrorMessage,
    Footer,
    Header,
    Navbar,
    Space,
    Switch,
    UserInfo,
    useViewModel,
} from '@app/popup/modules/shared'
import { Data } from '@app/popup/modules/shared/components/Data'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import { WebsiteIcon } from '../WebsiteIcon'
import { ParamsView } from '../ParamsView'
import { ApproveAddNetworkViewModel } from './ApproveAddNetworkViewModel'
import styles from './ApproveAddNetwork.module.scss'


export const ApproveAddNetwork = observer((): JSX.Element | null => {
    const vm = useViewModel(ApproveAddNetworkViewModel)
    const intl = useIntl()

    return (
        <Container>
            <Header>
                <Navbar>
                    {intl.formatMessage({ id: 'ADD_NETWORK' })}
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

                    <ParamsView params={{ network: vm.approval.requestData.addNetwork }} />

                    <Switch checked={vm.switchNetwork} onChange={vm.onSwitch}>
                        {intl.formatMessage({ id: 'APPROVE_ADD_NETWORK_SWITCH_LABEL' })}
                    </Switch>
                </Space>
            </Content>

            <Footer layer>
                <Space direction="column" gap="l">
                    {vm.error && (
                        <ErrorMessage>
                            {vm.error}
                        </ErrorMessage>
                    )}
                    <FooterAction>
                        <Button design="secondary" disabled={vm.loading} onClick={vm.onReject}>
                            {intl.formatMessage({ id: 'REJECT_BTN_TEXT' })}
                        </Button>
                        <Button loading={vm.loading} onClick={vm.onSubmit}>
                            {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                        </Button>
                    </FooterAction>
                </Space>
            </Footer>
        </Container>
    )
})
