import { observer } from 'mobx-react-lite'
import { useIntl } from 'react-intl'

import EmptyIconSrc from '@app/popup/assets/img/contacts-empty.svg'
import { Icons } from '@app/popup/icons'
import { Container, Content, Empty, SearchInput, SettingsButton, useViewModel } from '@app/popup/modules/shared'
import type { Contact, RawContact } from '@app/models'

import { useContacts } from '../../hooks'
import { ContactItem } from '../ContactItem'
import { ContactsNotificationContainer } from '../ContactsNotificationContainer'
import { ChooseContactViewModel } from './ChooseContactViewModel'
import styles from './ChooseContact.module.scss'

interface Props {
    type: RawContact['type'];
    onChoose(contact: RawContact): void;
}

export const ChooseContact = observer(({ type, onChoose }: Props): JSX.Element | null => {
    const vm = useViewModel(ChooseContactViewModel, (model) => {
        model.type = type
    })
    const intl = useIntl()
    const contacts = useContacts()

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
                <SettingsButton
                    className={styles.settings}
                    title={intl.formatMessage({ id: 'CONTACT_SETTINGS_TITLE' })}
                >
                    {!contact && (
                        <SettingsButton.Item
                            icon={Icons.addUser}
                            onClick={() => contacts.add({ type, value })}
                        >
                            {intl.formatMessage({ id: 'CONTACT_ADD_TO_CONTACTS' })}
                        </SettingsButton.Item>
                    )}
                    {contact && (
                        <SettingsButton.Item
                            icon={Icons.edit}
                            onClick={() => contacts.edit(contact)}
                        >
                            {intl.formatMessage({ id: 'CHANGE_NAME_BTN_TEXT' })}
                        </SettingsButton.Item>
                    )}
                    <SettingsButton.Item
                        icon={Icons.delete}
                        onClick={() => vm.removeRecentContact(value)}
                    >
                        {intl.formatMessage({ id: 'CONTACT_DELETE_FROM_RECENT' })}
                    </SettingsButton.Item>
                    {contact && (
                        <SettingsButton.Item
                            danger
                            icon={Icons.delete}
                            onClick={() => vm.removeContact(value)}
                        >
                            {intl.formatMessage({ id: 'CONTACT_DELETE_CONTACT' })}
                        </SettingsButton.Item>
                    )}
                </SettingsButton>
            </div>
        )
    }

    const renderContact = (contact: Contact) => (
        <div className={styles.item} key={contact.value}>
            <ContactItem {...contact} className={styles.contact} onClick={() => onChoose(contact)} />
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
                <SettingsButton.Item
                    danger
                    icon={Icons.delete}
                    onClick={() => vm.removeContact(contact.value)}
                >
                    {intl.formatMessage({ id: 'CONTACT_DELETE_CONTACT' })}
                </SettingsButton.Item>
            </SettingsButton>
        </div>
    )

    return (
        <>
            <Container>
                <Content>
                    <SearchInput
                        className={styles.search}
                        value={vm.search}
                        onChange={vm.handleSearchChange}
                    />

                    {vm.empty && (
                        <Empty>
                            {intl.formatMessage({ id: 'CONTACT_EMPTY_TEXT' })}
                        </Empty>
                    )}

                    {!vm.empty && (
                        <>
                            {(vm.recentContacts.length !== 0) && (
                                <div>
                                    <div className={styles.label}>
                                        {intl.formatMessage({ id: 'CONTACT_RECENT' })}
                                    </div>

                                    <div className={styles.list}>
                                        {vm.recentContacts.map(renderRecent)}
                                    </div>

                                    {!vm.recentContacts.length && (
                                        <div className={styles.empty}>
                                            <img className={styles.emptyIcon} src={EmptyIconSrc} alt="" />
                                            <p className={styles.emptyText}>
                                                {intl.formatMessage({ id: 'CONTACT_EMPTY_RECENT_HINT' })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className={styles.contacts}>
                                <div className={styles.label}>
                                    {intl.formatMessage({ id: 'CONTACT_CONTACTS' })}
                                </div>

                                <div className={styles.list}>
                                    {vm.contactsList.map(renderContact)}
                                </div>

                                {!vm.search && !vm.contactsList.length && (
                                    <div className={styles.empty}>
                                        <img className={styles.emptyIcon} src={EmptyIconSrc} alt="" />
                                        <p className={styles.emptyText}>
                                            {intl.formatMessage({ id: 'CONTACT_EMPTY_CONTACTS_HINT' })}
                                        </p>
                                    </div>
                                )}
                                {vm.search && !vm.contactsList.length && (
                                    <div className={styles.empty}>
                                        <img className={styles.emptyIcon} src={EmptyIconSrc} alt="" />
                                        <p className={styles.emptyText}>
                                            {intl.formatMessage({ id: 'CONTACT_EMPTY_SEARCH_HINT' })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </Content>
            </Container>

            <ContactsNotificationContainer />
        </>
    )
})
