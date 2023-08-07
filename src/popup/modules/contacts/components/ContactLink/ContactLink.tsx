import { observer } from 'mobx-react-lite'

import { Icons } from '@app/popup/icons'
import { convertAddress, isNativeAddress } from '@app/shared'
import { CopyButton, useResolve } from '@app/popup/modules/shared'
import { Contact, RawContact } from '@app/models'

import { ContactsStore } from '../../store'

import './ContactLink.scss'

interface Props {
    address: string;
    onOpen?(contact: RawContact): void;
    onAdd?(contact: RawContact): void;
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
                onClick={() => contact && onOpen?.(contact)}
            >
                {contact && <Icons.Person className="contact-link__name-icon" />}
                <span className="contact-link__name-value">{name}</span>
            </button>
            {!contact && onAdd && (
                <button
                    type="button"
                    className="contact-link__btn"
                    onClick={() => onAdd({ type: 'address', value: address })}
                >
                    {Icons.addUser}
                </button>
            )}
            <CopyButton text={address}>
                <button type="button" className="contact-link__btn">
                    {Icons.copy}
                </button>
            </CopyButton>
        </div>
    )
})
