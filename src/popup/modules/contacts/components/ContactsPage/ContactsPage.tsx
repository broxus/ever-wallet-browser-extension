import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import EmptyIconSrc from '@app/popup/assets/img/contacts-empty.svg'
import { Icons } from '@app/popup/icons'
import { Button, Container, Content, Empty, Footer, Header, Navbar, SearchInput, SettingsButton, useCopyToClipboard, useSearch, useViewModel, useWhiteBg } from '@app/popup/modules/shared'
import { Contact } from '@app/models'

import { useContacts } from '../../hooks'
import { ContactItem } from '../ContactItem'
import { ContactsNotificationContainer } from '../ContactsNotificationContainer'
import { ContactsPageViewModel } from './ContactsPageViewModel'
import styles from './ContactsPage.module.scss'

export const ContactsPage = observer((): JSX.Element => {
    const vm = useViewModel(ContactsPageViewModel)
    const intl = useIntl()
    const search = useSearch(vm.contacts, vm.filter)
    const contacts = useContacts()
    const copy = useCopyToClipboard()

    useWhiteBg()

    return (
        <>
            <Container>
                <Header>
                    <Navbar close="window">
                        {intl.formatMessage({ id: 'CONTACT_CONTACTS' })}
                    </Navbar>
                </Header>

                <Content>
                    {vm.empty && (
                        <div className={styles.empty}>
                            <img className={styles.emptyIcon} src={EmptyIconSrc} alt="" />
                            <p className={styles.emptyText}>
                                {intl.formatMessage({ id: 'CONTACT_EMPTY_TEXT' })}
                            </p>
                        </div>
                    )}

                    {!vm.empty && (
                        <>
                            <SearchInput design="gray" {...search.props} />
                            <div className={styles.list}>
                                {search.list.map((contact: Contact) => (
                                    <div className={styles.item} key={contact.value}>
                                        <ContactItem {...contact} className={styles.contact} />
                                        <SettingsButton
                                            className={styles.settings}
                                            title={intl.formatMessage({ id: 'CONTACT_SETTINGS_TITLE' })}
                                        >
                                            <SettingsButton.Item
                                                icon={Icons.edit}
                                                onClick={() => contacts.edit(contact)}
                                            >
                                                {intl.formatMessage({ id: 'CHANGE_NAME_BTN_TEXT' })}
                                            </SettingsButton.Item>
                                            <SettingsButton.Item icon={Icons.copy} onClick={() => copy(contact.value)}>
                                                {intl.formatMessage({ id: 'COPY_ADDRESS_BTN_TEXT' })}
                                            </SettingsButton.Item>
                                            <SettingsButton.Item
                                                danger
                                                icon={Icons.delete}
                                                onClick={() => vm.removeContact(contact.value)}
                                            >
                                                {intl.formatMessage({ id: 'CONTACT_DELETE_CONTACT' })}
                                            </SettingsButton.Item>
                                        </SettingsButton>
                                    </div>
                                ))}

                                {!search.list.length && (
                                    <div className={styles.emptySearch}>
                                        <Empty />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </Content>

                <Footer>
                    <Button onClick={() => contacts.add()}>
                        {intl.formatMessage({ id: 'CONTACT_ADD_NEW_TILE' })}
                    </Button>
                </Footer>
            </Container>

            <ContactsNotificationContainer />
        </>
    )
})
