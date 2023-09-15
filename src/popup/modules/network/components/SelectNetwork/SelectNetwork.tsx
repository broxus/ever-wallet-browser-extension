import { memo } from 'react'
import { useIntl } from 'react-intl'

import { ConnectionDataItem } from '@app/models'
import { Button, Container, Content, Footer, RadioButton } from '@app/popup/modules/shared'

import styles from './SelectNetwork.module.scss'

interface Props {
    networks: ConnectionDataItem[];
    selectedConnectionId: number;
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

                <div className={styles.pane}>
                    {networks.map((network) => (
                        <RadioButton
                            labelPosition="before"
                            className={styles.item}
                            key={network.connectionId}
                            value={network.connectionId}
                            checked={network.connectionId === selectedConnectionId}
                            onChange={() => onSelectNetwork(network)}
                        >
                            {network.name}
                        </RadioButton>
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
