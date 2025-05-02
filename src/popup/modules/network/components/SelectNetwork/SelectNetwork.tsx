import { memo } from 'react'
import { useIntl } from 'react-intl'

import { ConnectionDataItem } from '@app/models'
import { Button, Container, Content, Footer, Icon } from '@app/popup/modules/shared'

import styles from './SelectNetwork.module.scss'

interface Props {
    networks: ConnectionDataItem[];
    selectedConnectionId: string;
    onSelectNetwork(network: ConnectionDataItem): void;
    onSettings(): void;
}

export const SelectNetwork = memo((props: Props): JSX.Element => {
    const { networks, selectedConnectionId, onSelectNetwork, onSettings } = props
    const intl = useIntl()

    return (
        <Container>
            <Content>
                <h2>{intl.formatMessage({ id: 'SELECT_NETWORK_TITLE' })}</h2>

                <div className={styles.list}>
                    {networks.map((network) => (
                        <button
                            type="button"
                            key={network.id}
                            className={styles.item}
                            onClick={() => onSelectNetwork(network)}
                        >
                            <span className={styles.name} title={network.name}>
                                {network.name}
                            </span>
                            {network.id === selectedConnectionId && (
                                <Icon icon="check" className={styles.icon} />
                            )}
                        </button>
                    ))}
                </div>
            </Content>
            <Footer>
                <Button design="primary" onClick={onSettings}>
                    {intl.formatMessage({ id: 'NETWORK_DROPDOWN_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
