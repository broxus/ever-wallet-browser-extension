import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import EmptyIconSrc from '@app/popup/assets/img/contacts-empty.svg'
import DeleteIcon from '@app/popup/assets/icons/delete.svg'
import EditIcon from '@app/popup/assets/icons/edit.svg'
import {
    Button,
    ButtonGroup,
    Container,
    Content,
    DropdownMenu,
    Footer,
    Header,
    Input,
    useViewModel,
} from '@app/popup/modules/shared'
import { Contact } from '@app/models'

import { useContacts } from '../../hooks'
import { ContactItem } from '../ContactItem'
import { ContactsNotificationContainer } from '../ContactsNotificationContainer'
import { ContactsPageViewModel } from './ContactsPageViewModel'

import './ContactsPage.scss'

const deleteIcon = <DeleteIcon />
const editIcon = <EditIcon />

export const ContactsPage = observer((): JSX.Element => {
    const vm = useViewModel(ContactsPageViewModel)
    const intl = useIntl()
    const contacts = useContacts()

    return (
        <>
            <Container className="contacts-page">
                <Header>
                    <h2>{intl.formatMessage({ id: 'CONTACT_CONTACTS' })}</h2>
                    <Input
                        className="contacts-page__search"
                        size="s"
                        placeholder={intl.formatMessage({ id: 'CONTACT_SEARCH_PLACEHOLDER' })}
                        value={vm.search}
                        onChange={vm.handleSearchChange}
                    />
                </Header>

                <Content className="contacts-page__content">
                    {vm.empty && (
                        <div className="contacts-page__empty">
                            <img className="contacts-page__empty-icon" src={EmptyIconSrc} alt="" />
                            <p className="contacts-page__empty-text">
                                {intl.formatMessage({ id: 'CONTACT_EMPTY_TEXT' })}
                            </p>
                        </div>
                    )}

                    {!vm.empty && (
                        <div className="contacts-page__list">
                            {vm.contactsList.map((contact: Contact) => (
                                <div className="contacts-page__list-item" key={contact.address}>
                                    <ContactItem {...contact} onClick={() => contacts.details(contact.address)} />
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
                            ))}

                            {!vm.contactsList.length && (
                                <p className="contacts-page__hint">
                                    {intl.formatMessage({ id: 'CONTACT_EMPTY_SEARCH_HINT' })}
                                </p>
                            )}
                        </div>
                    )}
                </Content>

                <Footer>
                    <ButtonGroup>
                        <Button group="small" design="secondary" onClick={vm.handleBack}>
                            {intl.formatMessage({ id: 'BACK_BTN_TEXT' })}
                        </Button>
                        <Button onClick={() => contacts.add()}>
                            {intl.formatMessage({ id: 'CONTACT_ADD_NEW_TILE' })}
                        </Button>
                    </ButtonGroup>
                </Footer>
            </Container>

            <ContactsNotificationContainer offset />

            {contacts.panel}
        </>
    )
})
