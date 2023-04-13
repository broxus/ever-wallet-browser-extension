import { memo } from 'react'

import type { RawContact } from '@app/models'
import { convertAddress, convertPublicKey, isNativeAddress } from '@app/shared'
import { UserAvatar } from '@app/popup/modules/shared'
import KeyIcon from '@app/popup/assets/icons/key.svg'

import './ContactItem.scss'

interface Props {
    type: RawContact['type'];
    value: string;
    name?: string;
    onClick?(): void;
}

export const ContactItem = memo(({ type, value, name, onClick }: Props): JSX.Element => (
    <div className="contact-item" onClick={onClick}>
        {type === 'address' && <UserAvatar className="contact-item__avatar" address={value} small />}
        {type === 'public_key' && <KeyIcon className="contact-item__avatar" />}
        <div className="contact-item__info">
            <div className="contact-item__info-name">
                {name}
            </div>
            {type === 'address' && (
                <div className="contact-item__info-address">
                    {isNativeAddress(value) ? convertAddress(value) : value}
                </div>
            )}
            {type === 'public_key' && (
                <div className="contact-item__info-address">
                    {convertPublicKey(value)}
                </div>
            )}
        </div>
    </div>
))
