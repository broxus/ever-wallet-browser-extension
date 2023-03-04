import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import EmptyIconSrc from '@app/popup/assets/img/contacts-empty.svg'
import AddIcon from '@app/popup/assets/icons/add-user.svg'
import DeleteIcon from '@app/popup/assets/icons/delete.svg'
import EditIcon from '@app/popup/assets/icons/edit.svg'
import { Container, Content, DropdownMenu, Header, Input, useViewModel } from '@app/popup/modules/shared'
import { Contact } from '@app/models'

import { useContacts } from '../../hooks'
import { ContactItem } from '../ContactItem'
import { ContactsNotificationContainer } from '../ContactsNotificationContainer'
import { ChooseContactViewModel } from './ChooseContactViewModel'

import './ChooseContact.scss'

const addIcon = <AddIcon />
const deleteIcon = <DeleteIcon />
const editIcon = <EditIcon />

interface Props {
    onChoose(address: string): void;
}

export const ChooseContact = observer(({ onChoose }: Props): JSX.Element | null => {
    const vm = useViewModel(ChooseContactViewModel)
    const intl = useIntl()
    const contacts = useContacts()

    const renderRecent = (address: string) => {
        const contact = vm.contacts[address] as Contact | undefined
        return (
            <div className="choose-contact__list-item" key={address}>
                <ContactItem
                    address={address}
                    name={contact?.name}
                    onClick={() => onChoose(address)}
                />
                <DropdownMenu>
                    {!contact && (
                        <DropdownMenu.Item
                            icon={addIcon}
                            onClick={() => contacts.add(address)}
                        >
                            {intl.formatMessage({ id: 'CONTACT_ADD_TO_CONTACTS' })}
                        </DropdownMenu.Item>
                    )}
                    {contact && (
                        <DropdownMenu.Item
                            icon={editIcon}
                            onClick={() => contacts.edit(contact.address)}
                        >
                            {intl.formatMessage({ id: 'CONTACT_EDIT_NAME' })}
                        </DropdownMenu.Item>
                    )}
                    <DropdownMenu.Item
                        icon={deleteIcon}
                        onClick={() => vm.removeRecentContact(address)}
                    >
                        {intl.formatMessage({ id: 'CONTACT_DELETE_FROM_RECENT' })}
                    </DropdownMenu.Item>
                    {contact && (
                        <DropdownMenu.Item
                            danger
                            icon={deleteIcon}
                            onClick={() => vm.removeContact(address)}
                        >
                            {intl.formatMessage({ id: 'CONTACT_DELETE_CONTACT' })}
                        </DropdownMenu.Item>
                    )}
                </DropdownMenu>
            </div>
        )
    }

    const renderContact = (contact: Contact) => (
        <div className="choose-contact__list-item" key={contact.address}>
            <ContactItem {...contact} onClick={() => onChoose(contact.address)} />
            <DropdownMenu>
                <DropdownMenu.Item
                    icon={editIcon}
                    onClick={() => contacts.edit(contact.address)}
                >
                    {intl.formatMessage({ id: 'CONTACT_EDIT_NAME' })}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                    danger
                    icon={deleteIcon}
                    onClick={() => vm.removeContact(contact.address)}
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
                    <h2>{intl.formatMessage({ id: 'CHOOSE_CONTACT' })}</h2>
                    <Input
                        className="choose-contact__search"
                        size="s"
                        placeholder={intl.formatMessage({ id: 'CONTACT_SEARCH_PLACEHOLDER' })}
                        value={vm.search}
                        onChange={vm.handleSearchChange}
                    />
                </Header>

                <Content>
                    {vm.empty && (
                        <div className="choose-contact__empty">
                            <img className="choose-contact__empty-icon" src={EmptyIconSrc} alt="" />
                            <p className="choose-contact__empty-text">
                                {intl.formatMessage({ id: 'CONTACT_EMPTY_TEXT' })}
                            </p>
                        </div>
                    )}

                    {!vm.empty && (
                        <>
                            {(!vm.search || vm.recentContacts.length !== 0) && (
                                <div className="choose-contact__recent">
                                    <h3>{intl.formatMessage({ id: 'CONTACT_RECENT' })}</h3>

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
                                <h3>{intl.formatMessage({ id: 'CONTACT_CONTACTS' })}</h3>

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

            {contacts.panel}
        </>
    )
})
