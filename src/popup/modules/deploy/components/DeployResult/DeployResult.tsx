import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { useIntl } from 'react-intl'

import { Button, Container, Content, Footer, Header, Loader, Navbar, ParamsPanel, useViewModel } from '@app/popup/modules/shared'
import { closeCurrentWindow } from '@app/shared'
import { ContactLink, useContacts } from '@app/popup/modules/contacts'

import { DeployResultViewModel } from './DeployResultViewModel'
import styles from './DeployResult.module.scss'

export const DeployResult = observer((): JSX.Element => {
    const vm = useViewModel(DeployResultViewModel)
    const contacts = useContacts()
    const intl = useIntl()

    const newCustodians = useMemo(() => vm.custodians.filter((key) => !vm.contacts[key]), [])

    return (
        <Container>
            <Header>
                <Navbar close="window" />
            </Header>

            <Content className={styles.content}>
                <div className={styles.loader}>
                    <Loader large />
                    <p>{intl.formatMessage({ id: 'DEPLOY_MULTISIG_RESULT_HEADER' })}</p>
                </div>
                {newCustodians.length !== 0 && (
                    <ParamsPanel className={styles.panel}>
                        <ParamsPanel.Param>
                            <div className={styles.text}>
                                {intl.formatMessage({ id: 'SEND_MESSAGE_RESULT_TEXT' })}
                            </div>
                        </ParamsPanel.Param>

                        {newCustodians.map((custodian, i) => (
                            <ParamsPanel.Param
                                key={custodian}
                                label={intl.formatMessage(
                                    { id: 'DEPLOY_MULTISIG_DETAILS_TERM_CUSTODIAN' },
                                    { index: i + 1 },
                                )}
                            >
                                <ContactLink type="public_key" address={custodian} onAdd={contacts.add} />
                            </ParamsPanel.Param>
                        ))}
                    </ParamsPanel>
                )}
            </Content>

            <Footer>
                <Button onClick={closeCurrentWindow}>
                    {intl.formatMessage({ id: 'CONTINUE_BTN_TEXT' })}
                </Button>
            </Footer>
        </Container>
    )
})
