import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Icons } from '@app/popup/icons'
import { Button, Container, Content, Footer, Header, Navbar, useViewModel } from '@app/popup/modules/shared'

import { NetworkSettingsViewModel } from './NetworkSettingsViewModel'
import './NetworkSettings.scss'

export const NetworkSettings = observer((): JSX.Element => {
    const vm = useViewModel(NetworkSettingsViewModel)
    const intl = useIntl()
    const navigate = useNavigate()

    return (
        <Container className="network-settings">
            <Header>
                <Navbar close="window" />
            </Header>
            <Content>
                <h2>{intl.formatMessage({ id: 'NETWORK_HEADER' })}</h2>

                <ul className="network-settings__list">
                    {vm.networks.map((network) => (
                        <li className="network-settings__list-item" key={network.connectionId}>
                            <button
                                type="button"
                                className="network-settings__list-item-btn"
                                title={network.name}
                                onClick={() => navigate(`/edit/${network.connectionId}`)}
                            >
                                {network.name}
                            </button>
                            <Icons.ChevronRight className="network-settings__list-item-icon" />
                        </li>
                    ))}
                </ul>
            </Content>

            <Footer>
                <Button onClick={() => navigate('/add')}>
                    {intl.formatMessage({ id: 'NETWORK_ADD_CUSTOM_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
