import { observer } from 'mobx-react-lite'
import { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import { Button, Container, Content, Footer, Header, Select } from '@app/popup/modules/shared'
import type { ConnectionDataItem } from '@app/models'

import './ConnectionError.scss'

interface Props {
    availableConnections: ConnectionDataItem[];
    onChangeNetwork(connection: ConnectionDataItem): void;
}

interface OptionType {
    key: number;
    value: number;
    label: string;
}

export const ConnectionError = observer(({ availableConnections, onChangeNetwork }: Props): JSX.Element => {
    const [value, setValue] = useState(availableConnections[0].connectionId)
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
                <Button onClick={handleSubmit}>
                    {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
