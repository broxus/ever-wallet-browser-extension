import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Button, Container, Content, Footer, Icon } from '@app/popup/modules/shared'
import { closeCurrentWindow } from '@app/shared'
import { FooterAction } from '@app/popup/modules/shared/components/layout/Footer/FooterAction'

import styles from './SendResult.module.scss'

export const SendResult = observer((): JSX.Element => {
    const intl = useIntl()
    // const vm = useViewModel(SendResultViewModel)
    // const contacts = useContacts()

    return (
        <Container>
            <Content className={styles.content}>
                <Icon icon="rocket" />
                <p>{intl.formatMessage({ id: 'SEND_MESSAGE_RESULT_HEADER' })}</p>
            </Content>

            <Footer>
                {/* TODO: contacts */}
                {/* {vm.showContact && (
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
                )} */}
                <FooterAction>
                    <Button
                        design="neutral"
                        onClick={closeCurrentWindow}
                    >
                        {intl.formatMessage({ id: 'OK_BTN_TEXT' })}
                    </Button>
                </FooterAction>
            </Footer>
        </Container>
    )
})
