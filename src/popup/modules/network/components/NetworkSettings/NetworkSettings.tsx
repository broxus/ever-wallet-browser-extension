import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Button, Container, Content, Footer, Header, Icon, Navbar, useViewModel, useWhiteBg } from '@app/popup/modules/shared'

import { NetworkSettingsViewModel } from './NetworkSettingsViewModel'
import styles from './NetworkSettings.module.scss'

export const NetworkSettings = observer((): JSX.Element => {
    const vm = useViewModel(NetworkSettingsViewModel)
    const intl = useIntl()
    const navigate = useNavigate()

    useWhiteBg()

    return (
        <Container>
            <Header>
                <Navbar close="window">
                    {intl.formatMessage({ id: 'NETWORK_HEADER' })}
                </Navbar>
            </Header>
            <Content>
                <div className={styles.list}>
                    {vm.networks.map((network) => (
                        <button
                            type="button"
                            key={network.connectionId}
                            className={styles.item}
                            onClick={() => navigate(`/edit/${network.connectionId}`)}
                        >
                            <span className={styles.name} title={network.name}>
                                {network.name}
                            </span>
                            <Icon icon="chevronRight" className={styles.icon} />
                        </button>
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
