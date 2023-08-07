import { memo } from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { ConnectionDataItem } from '@app/models'
import { Icons } from '@app/popup/icons'
import { Button, Container, Content, Footer } from '@app/popup/modules/shared'

import './SelectNetwork.scss'

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
        <Container className="choose-network">
            <Content>
                <h2>
                    {intl.formatMessage({ id: 'SELECT_NETWORK_TITLE' })}
                </h2>
                <ul className="networks-list">
                    {networks.map(network => {
                        const active = network.connectionId === selectedConnectionId
                        const className = classNames('networks-list__item', {
                            _active: active,
                        })

                        return (
                            <li key={network.connectionId} className={className}>
                                <button
                                    type="button"
                                    className="networks-list__item-btn"
                                    title={network.name}
                                    onClick={() => onSelectNetwork(network)}
                                >
                                    {network.name}
                                </button>
                                {active && <Icons.Check className="networks-list__item-icon" />}
                            </li>
                        )
                    })}
                </ul>
            </Content>
            <Footer>
                <Button design="primary" onClick={onSettings}>
                    {intl.formatMessage({ id: 'NETWORK_DROPDOWN_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
