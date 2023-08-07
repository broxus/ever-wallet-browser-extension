import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import { Icons } from '@app/popup/icons'
import { Container, Content, DropdownMenu, Empty, Header, Navbar, SearchInput, useViewModel } from '@app/popup/modules/shared'
import type { Contact, RawContact } from '@app/models'

import { useContacts } from '../../hooks'
import { ContactItem } from '../ContactItem'
import { ContactsNotificationContainer } from '../ContactsNotificationContainer'
import { ChooseContactViewModel } from './ChooseContactViewModel'
import './ChooseContact.scss'


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
    const contacts = useContacts()

    const renderRecent = ({ type, value }: RawContact) => {
        const contact = vm.contacts[value] as Contact | undefined
        return (
            <div className="choose-contact__list-item" key={value}>
                <ContactItem
                    type={type}
                    value={value}
                    name={contact?.name}
                    onClick={() => onChoose({ type, value })}
                />
                <DropdownMenu>
                    {!contact && (
                        <DropdownMenu.Item
                            icon={Icons.addUser}
                            onClick={() => contacts.add({ type, value })}
                        >
                            {intl.formatMessage({ id: 'CONTACT_ADD_TO_CONTACTS' })}
                        </DropdownMenu.Item>
                    )}
                    {contact && (
                        <DropdownMenu.Item
                            icon={Icons.edit}
                            onClick={() => contacts.edit(contact)}
                        >
                            {intl.formatMessage({ id: 'CONTACT_EDIT_NAME' })}
                        </DropdownMenu.Item>
                    )}
                    <DropdownMenu.Item
                        icon={Icons.delete}
                        onClick={() => vm.removeRecentContact(value)}
                    >
                        {intl.formatMessage({ id: 'CONTACT_DELETE_FROM_RECENT' })}
                    </DropdownMenu.Item>
                    {contact && (
                        <DropdownMenu.Item
                            danger
                            icon={Icons.delete}
                            onClick={() => vm.removeContact(value)}
                        >
                            {intl.formatMessage({ id: 'CONTACT_DELETE_CONTACT' })}
                        </DropdownMenu.Item>
                    )}
                </DropdownMenu>
            </div>
        )
    }

    const renderContact = (contact: Contact) => (
        <div className="choose-contact__list-item" key={contact.value}>
            <ContactItem {...contact} onClick={() => onChoose(contact)} />
            <DropdownMenu>
                <DropdownMenu.Item
                    icon={Icons.edit}
                    onClick={() => contacts.edit(contact)}
                >
                    {intl.formatMessage({ id: 'CONTACT_EDIT_NAME' })}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                    danger
                    icon={Icons.delete}
                    onClick={() => vm.removeContact(contact.value)}
                >
                    {intl.formatMessage({ id: 'CONTACT_DELETE_CONTACT' })}
                </DropdownMenu.Item>
            </DropdownMenu>
        </div>
    )

    return (
        <>
            <Container className="choose-contact">
                <Header>
                    <Navbar back={onBack}>
                        {intl.formatMessage({ id: 'CHOOSE_CONTACT' })}
                    </Navbar>
                </Header>

                <Content>
                    <SearchInput className="choose-contact__search" value={vm.search} onChange={vm.handleSearchChange} />

                    {vm.empty && (
                        <Empty>
                            {intl.formatMessage({ id: 'CONTACT_EMPTY_TEXT' })}
                        </Empty>
                    )}

                    {!vm.empty && (
                        <>
                            {(!vm.search || vm.recentContacts.length !== 0) && (
                                <div className="choose-contact__recent">
                                    <div className="choose-contact__label">
                                        {intl.formatMessage({ id: 'CONTACT_RECENT' })}
                                    </div>

                                    <div className="choose-contact__list">
                                        {vm.recentContacts.map(renderRecent)}

                                        {!vm.recentContacts.length && (
                                            <p className="choose-contact__hint">
                                                {intl.formatMessage({ id: 'CONTACT_EMPTY_RECENT_HINT' })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="choose-contact__contacts">
                                <div className="choose-contact__label">
                                    {intl.formatMessage({ id: 'CONTACT_CONTACTS' })}
                                </div>

                                <div className="choose-contact__list">
                                    {vm.contactsList.map(renderContact)}

                                    {!vm.search && !vm.contactsList.length && (
                                        <p className="choose-contact__hint">
                                            {intl.formatMessage({ id: 'CONTACT_EMPTY_CONTACTS_HINT' })}
                                        </p>
                                    )}
                                    {vm.search && !vm.contactsList.length && (
                                        <p className="choose-contact__hint">
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
