import { memo } from 'react'
import { useIntl } from 'react-intl'
import classNames from 'classnames'

import { ConnectionDataItem } from '@app/models'
import { Button, Container, Content, Footer, SearchInput, useSearch } from '@app/popup/modules/shared'
import CheckIcon from '@app/popup/assets/icons/check.svg'

import './ChooseNetwork.scss'

interface Props {
    networks: ConnectionDataItem[];
    selectedConnectionId: number;
    onSelectNetwork(network: ConnectionDataItem): void;
    onSettings(): void;
}

const filter = (list: ConnectionDataItem[], search: string): ConnectionDataItem[] => list.filter(
    (item) => item.name.toLowerCase().includes(search),
)

export const ChooseNetwork = memo((props: Props): JSX.Element => {
    const { networks, selectedConnectionId, onSelectNetwork, onSettings } = props
    const search = useSearch(networks, filter)
    const intl = useIntl()

    return (
        <Container className="choose-network">
            <Content>
                <SearchInput {...search.props} />
                <h2 className="choose-network__header">
                    {intl.formatMessage({ id: 'CHOOSE_NETWORK_TITLE' })}
                </h2>
                <ul className="networks-list">
                    {search.list.map(network => {
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
                                {active && <CheckIcon className="networks-list__item-icon" />}
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
