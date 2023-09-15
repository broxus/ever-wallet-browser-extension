import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Button, Container, Content, Footer, Header, Icon, Navbar, useViewModel } from '@app/popup/modules/shared'

import { NetworkSettingsViewModel } from './NetworkSettingsViewModel'
import styles from './NetworkSettings.module.scss'

export const NetworkSettings = observer((): JSX.Element => {
    const vm = useViewModel(NetworkSettingsViewModel)
    const intl = useIntl()
    const navigate = useNavigate()

    return (
        <Container>
            <Header>
                <Navbar close="window">
                    {intl.formatMessage({ id: 'NETWORK_HEADER' })}
                </Navbar>
            </Header>
            <Content>
                <div className={styles.pane}>
                    {vm.networks.map((network) => (
                        <div className={styles.item} key={network.connectionId}>
                            <button
                                type="button"
                                className={styles.btn}
                                title={network.name}
                                onClick={() => navigate(`/edit/${network.connectionId}`)}
                            >
                                {network.name}
                            </button>
                            <Icon icon="chevronRight" className={styles.icon} />
                        </div>
                    ))}
                </div>
            </Content>

            <Footer>
                <Button onClick={() => navigate('/add')}>
                    {intl.formatMessage({ id: 'NETWORK_ADD_CUSTOM_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
