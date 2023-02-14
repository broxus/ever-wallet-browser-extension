import { memo } from 'react'

import { convertAddress, isNativeAddress } from '@app/shared'
import { UserAvatar } from '@app/popup/modules/shared'

import './ContactItem.scss'

interface Props {
    address: string;
    name?: string;
    onClick?(): void;
}

export const ContactItem = memo(({ address, name, onClick }: Props): JSX.Element => {
    const isNative = isNativeAddress(address)

    return (
        <div className="contact-item" onClick={onClick}>
            <UserAvatar className="contact-item__avatar" address={address} small />
            <div className="contact-item__info">
                <div className="contact-item__info-name">
                    {name}
                </div>
                <div className="contact-item__info-address">
                    {isNative ? convertAddress(address) : address}
                </div>
            </div>
        </div>
    )
})
