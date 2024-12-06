import { observer } from 'mobx-react-lite'
import { useState } from 'react'
import { useIntl } from 'react-intl'

import { Button, Container, Content, Footer, RadioButton, useViewModel } from '@app/popup/modules/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

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
                <p className={styles.message}>
                    {intl.formatMessage({ id: 'CONNECTION_ERROR_TEXT' })}
                </p>
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
            </Content>
            <Footer>
                <FooterAction
                    buttons={[
                        <Button design="neutral" onClick={vm.openNetworkSettings}>
                            {intl.formatMessage({ id: 'CONFIGURE' })}
                        </Button>,
                        <Button design="accent" loading={vm.loading} onClick={handleSubmit}>
                            {intl.formatMessage({ id: 'CONFIRM_BTN_TEXT' })}
                        </Button>,
                    ]}
                />
            </Footer>
        </Container>
    )
})
