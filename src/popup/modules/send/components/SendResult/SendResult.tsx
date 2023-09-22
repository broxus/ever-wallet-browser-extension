import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button, Container, Content, Footer, Loader, ParamsPanel, useViewModel } from '@app/popup/modules/shared'
import { closeCurrentWindow } from '@app/shared'
import { ContactLink, useContacts } from '@app/popup/modules/contacts'

import { SendResultViewModel } from './SendResultViewModel'
import styles from './SendResult.module.scss'

export const SendResult = observer((): JSX.Element => {
    const vm = useViewModel(SendResultViewModel)
    const intl = useIntl()
    const contacts = useContacts()

    return (
        <Container>
            <Content className={styles.content}>
                <Loader large />
                <p>{intl.formatMessage({ id: 'SEND_MESSAGE_RESULT_HEADER' })}</p>
            </Content>

            <Footer>
                {vm.showContact && (
                    <ParamsPanel
                        className={styles.panel}
                        title={(
                            <div className={styles.title}>
                                {intl.formatMessage({ id: 'SEND_MESSAGE_RESULT_MESSAGE' })}
                            </div>
                        )}
                    >
                        <ParamsPanel.Param label={intl.formatMessage({ id: 'TRANSACTION_TERM_TO' })}>
                            <ContactLink type="address" address={vm.recipient} onAdd={contacts.add} />
                        </ParamsPanel.Param>
                    </ParamsPanel>
                )}
                <Button onClick={closeCurrentWindow}>
                    {intl.formatMessage({ id: 'OK_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
