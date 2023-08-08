import { useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button, Container, Content, Footer, Header, Loader, Navbar, useViewModel } from '@app/popup/modules/shared'
import { closeCurrentWindow } from '@app/shared'
import { useContacts } from '@app/popup/modules/contacts'

import { SendResultViewModel } from './SendResultViewModel'
import styles from './SendResult.module.scss'

export const SendResult = observer((): JSX.Element => {
    const vm = useViewModel(SendResultViewModel)
    const intl = useIntl()
    const contacts = useContacts()

    useEffect(() => {
        if (vm.contacts[vm.recipient]) return

        vm.notification.show({
            message: intl.formatMessage({ id: 'SEND_MESSAGE_RESULT_MESSAGE' }),
            action: intl.formatMessage({ id: 'ADD_BTN_TEXT' }),
            onAction: () => contacts.add({ type: 'address', value: vm.recipient }),
        })
    }, [])

    return (
        <Container>
            <Header>
                <Navbar close="window" />
            </Header>

            <Content className={styles.content}>
                <Loader large />
                <p>{intl.formatMessage({ id: 'SEND_MESSAGE_RESULT_HEADER' })}</p>
            </Content>

            <Footer>
                <Button onClick={closeCurrentWindow}>
                    {intl.formatMessage({ id: 'CONTINUE_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
