import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { useIntl } from 'react-intl'

import { Button, Container, Content, Footer, RadioButton, Space, useViewModel } from '@app/popup/modules/shared'

import { ConnectionErrorViewModel } from './ConnectionErrorViewModel'
import styles from './ConnectionError.module.scss'

export const ConnectionError = observer((): JSX.Element => {
    const vm = useViewModel(ConnectionErrorViewModel)
    const [value, setValue] = useState(vm.availableConnections[0].connectionId)
    const intl = useIntl()

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
                <div className={styles.list}>
                    {vm.availableConnections.map((connection) => (
                        <RadioButton
                            labelPosition="before"
                            className={styles.item}
                            key={connection.connectionId}
                            value={connection.connectionId}
                            checked={connection.connectionId === value}
                            onChange={setValue}
                        >
                            {connection.name}
                        </RadioButton>
                    ))}
                </div>
            </Content>
            <Footer>
                <Space direction="column" gap="s">
                    <Button loading={vm.loading} onClick={handleSubmit}>
                        {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                    </Button>
                    <Button design="secondary" onClick={vm.openNetworkSettings}>
                        {intl.formatMessage({ id: 'NETWORK_DROPDOWN_BTN_TEXT' })}
                    </Button>
                </Space>
            </Footer>
        </Container>
    )
})
