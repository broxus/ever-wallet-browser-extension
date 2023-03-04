import { observer } from 'mobx-react-lite'
import { useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import {
    Button,
    ButtonGroup,
    Container,
    Content,
    Footer,
    Header,
    Select,
    useDrawerPanel,
} from '@app/popup/modules/shared'
import type { ConnectionDataItem } from '@app/models'

import './ConnectionError.scss'

interface Props {
    availableConnections: ConnectionDataItem[];
    onChangeNetwork(connection: ConnectionDataItem): void;
    onNetworkSettings(): void;
}

interface OptionType {
    key: number;
    value: number;
    label: string;
}

export const ConnectionError = observer((props: Props): JSX.Element => {
    const { availableConnections, onChangeNetwork, onNetworkSettings } = props
    const [value, setValue] = useState(availableConnections[0].connectionId)
    const drawer = useDrawerPanel()
    const intl = useIntl()

    const options = useMemo<OptionType[]>(() => availableConnections.map((connection) => ({
        key: connection.connectionId,
        value: connection.connectionId,
        label: connection.name,
    })), [availableConnections])

    const handleSubmit = () => {
        const network = availableConnections.find(({ connectionId }) => connectionId === value)

        if (network) {
            onChangeNetwork(network)
        }
    }

    useEffect(() => {
        drawer.setConfig({
            showClose: false,
            closeOnBackdropClick: false,
        })
        return () => drawer.setConfig(undefined)
    }, [])

    return (
        <Container className="connection-error">
            <Header>
                <h2>{intl.formatMessage({ id: 'CONNECTION_ERROR_HEADER' })}</h2>
            </Header>
            <Content>
                <p className="connection-error__message">
                    {intl.formatMessage({ id: 'CONNECTION_ERROR_TEXT' })}
                </p>
                <Select
                    options={options}
                    value={value}
                    onChange={setValue}
                />
            </Content>
            <Footer>
                <ButtonGroup vertical>
                    <Button onClick={handleSubmit}>
                        {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                    </Button>
                    <Button design="secondary" className="networks__dropdown-btn" onClick={onNetworkSettings}>
                        {intl.formatMessage({ id: 'NETWORK_DROPDOWN_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Container>
    )
})
