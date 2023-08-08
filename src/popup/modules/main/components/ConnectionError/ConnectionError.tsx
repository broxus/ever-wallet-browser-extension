import { observer } from 'mobx-react-lite'
import { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'

import { Button, ButtonGroup, Container, Content, Footer, Select, useViewModel } from '@app/popup/modules/shared'

import { ConnectionErrorViewModel } from './ConnectionErrorViewModel'
import styles from './ConnectionError.module.scss'

interface OptionType {
    key: number;
    value: number;
    label: string;
}

export const ConnectionError = observer((): JSX.Element => {
    const vm = useViewModel(ConnectionErrorViewModel)
    const [value, setValue] = useState(vm.availableConnections[0].connectionId)
    const intl = useIntl()

    const options = useMemo<OptionType[]>(() => vm.availableConnections.map((connection) => ({
        key: connection.connectionId,
        value: connection.connectionId,
        label: connection.name,
    })), [vm.availableConnections])

    const handleSubmit = () => {
        const network = vm.availableConnections.find(({ connectionId }) => connectionId === value)

        if (network) {
            vm.changeNetwork(network)
        }
    }

    return (
        <Container>
            <Content>
                <h2>{intl.formatMessage({ id: 'CONNECTION_ERROR_HEADER' })}</h2>
                <p className={styles.message}>
                    {intl.formatMessage({ id: 'CONNECTION_ERROR_TEXT' })}
                </p>
                <Select
                    dropdownStyle={{ maxHeight: 144 }}
                    options={options}
                    value={value}
                    onChange={setValue}
                />
            </Content>
            <Footer>
                <ButtonGroup vertical>
                    <Button loading={vm.loading} onClick={handleSubmit}>
                        {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                    </Button>
                    <Button design="secondary" onClick={vm.openNetworkSettings}>
                        {intl.formatMessage({ id: 'NETWORK_DROPDOWN_BTN_TEXT' })}
                    </Button>
                </ButtonGroup>
            </Footer>
        </Container>
    )
})
