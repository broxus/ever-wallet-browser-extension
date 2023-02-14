import { observer } from 'mobx-react-lite'

import { convertAddress, isNativeAddress } from '@app/shared'
import { CopyButton, useResolve } from '@app/popup/modules/shared'
import { Contact } from '@app/models'
import ProfileIcon from '@app/popup/assets/icons/profile.svg'
import AddUserIcon from '@app/popup/assets/icons/add-user.svg'
import CopyIcon from '@app/popup/assets/icons/copy.svg'

import { ContactsStore } from '../../store'

import './ContactLink.scss'

interface Props {
    address: string;
    onOpen?(address: string): void;
    onAdd?(address: string): void;
}

export const ContactLink = observer(({ address, onOpen, onAdd }: Props): JSX.Element => {
    const { contacts } = useResolve(ContactsStore)
    const contact = contacts[address] as Contact | undefined
    const name = contact?.name ?? (isNativeAddress(address) ? convertAddress(address) : address)

    return (
        <div className="contact-link">
            <button
                type="button"
                className="contact-link__name"
                title={address}
                onClick={() => contact && onOpen?.(address)}
            >
                {contact && <ProfileIcon className="contact-link__name-icon" />}
                <span className="contact-link__name-value">{name}</span>
            </button>
            {!contact && onAdd && (
                <button type="button" className="contact-link__btn" onClick={() => onAdd(address)}>
                    <AddUserIcon />
                </button>
            )}
            <CopyButton text={address}>
                <button type="button" className="contact-link__btn">
                    <CopyIcon />
                </button>
            </CopyButton>
        </div>
    )
})
