import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Button, Card, Container, Content, Footer, Header, Icon, Navbar, useViewModel } from '@app/popup/modules/shared'
import { NetworkIcon } from '@app/popup/modules/network/components/NetworkIcon/NetworkIcon'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

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
                <Card bg="layer-1" size="s" className={styles.list}>
                    {vm.networks.map((network) => (
                        <button
                            type="button"
                            key={network.id}
                            className={styles.item}
                            onClick={() => navigate(`/edit/${network.id}`)}
                        >
                            <div className={styles.network}>
                                <NetworkIcon networkGroup={network.group} config={vm.config} />
                                <span className={styles.name} title={network.name}>
                                    {network.name}
                                </span>
                            </div>
                            <Icon icon="chevronRight" className={styles.icon} />
                        </button>
                    ))}
                </Card>
            </Content>

            <Footer layer>
                <FooterAction>
                    <Button design="accent" onClick={() => navigate('/add')}>
                        {intl.formatMessage({ id: 'NETWORK_ADD_CUSTOM_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})
