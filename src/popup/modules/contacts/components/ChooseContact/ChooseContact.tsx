import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Container, Content, Empty, Header, Navbar, SearchInput, useViewModel } from '@app/popup/modules/shared'
import type { Contact, RawContact } from '@app/models'

import { ContactItem } from '../ContactItem'
import { ContactsNotificationContainer } from '../ContactsNotificationContainer'
import { ChooseContactViewModel } from './ChooseContactViewModel'
import styles from './ChooseContact.module.scss'

interface Props {
    type: RawContact['type'];
    onChoose(contact: RawContact): void;
    onBack?(): void;
}

export const ChooseContact = observer(({ type, onChoose, onBack }: Props): JSX.Element | null => {
    const vm = useViewModel(ChooseContactViewModel, (model) => {
        model.type = type
    })
    const intl = useIntl()

    const renderRecent = ({ type, value }: RawContact) => {
        const contact = vm.contacts[value] as Contact | undefined
        return (
            <div className={styles.item} key={value}>
                <ContactItem
                    className={styles.contact}
                    type={type}
                    value={value}
                    name={contact?.name}
                    onClick={() => onChoose({ type, value })}
                />
            </div>
        )
    }

    const renderContact = (contact: Contact) => (
        <div className={styles.item} key={contact.value}>
            <ContactItem {...contact} className={styles.contact} onClick={() => onChoose(contact)} />
        </div>
    )

    return (
        <>
            <Container>
                <Header>
                    <Navbar back={onBack}>
                        {intl.formatMessage({ id: 'CHOOSE_CONTACT' })}
                    </Navbar>
                </Header>

                <Content>
                    <SearchInput className={styles.search} value={vm.search} onChange={vm.handleSearchChange} />

                    {vm.empty && (
                        <Empty>
                            {intl.formatMessage({ id: 'CONTACT_EMPTY_TEXT' })}
                        </Empty>
                    )}

                    {!vm.empty && (
                        <>
                            {(!vm.search || vm.recentContacts.length !== 0) && (
                                <div>
                                    <div className={styles.label}>
                                        {intl.formatMessage({ id: 'CONTACT_RECENT' })}
                                    </div>

                                    <div>
                                        {vm.recentContacts.map(renderRecent)}

                                        {!vm.recentContacts.length && (
                                            <p className={styles.hint}>
                                                {intl.formatMessage({ id: 'CONTACT_EMPTY_RECENT_HINT' })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className={styles.contacts}>
                                <div className={styles.label}>
                                    {intl.formatMessage({ id: 'CONTACT_CONTACTS' })}
                                </div>

                                <div>
                                    {vm.contactsList.map(renderContact)}

                                    {!vm.search && !vm.contactsList.length && (
                                        <p className={styles.hint}>
                                            {intl.formatMessage({ id: 'CONTACT_EMPTY_CONTACTS_HINT' })}
                                        </p>
                                    )}
                                    {vm.search && !vm.contactsList.length && (
                                        <p className={styles.hint}>
                                            {intl.formatMessage({ id: 'CONTACT_EMPTY_SEARCH_HINT' })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </Content>
            </Container>

            <ContactsNotificationContainer />
        </>
    )
})
