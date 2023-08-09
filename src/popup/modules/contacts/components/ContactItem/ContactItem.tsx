import { memo } from 'react'
import classNames from 'classnames'

import type { RawContact } from '@app/models'
import { Icons } from '@app/popup/icons'
import { convertAddress, convertPublicKey, isNativeAddress } from '@app/shared'
import { RoundedIcon } from '@app/popup/modules/shared'

import './ContactItem.scss'


interface Props {
    type: RawContact['type'];
    value: string;
    name?: string;
    className?: string;
    onClick?(): void;
}

export const ContactItem = memo(({ type, value, name, className, onClick }: Props): JSX.Element => (
    <div className={classNames('contact-item', className)} onClick={onClick}>
        {/* {type === 'address' && <UserAvatar className="contact-item__avatar" address={value} small />} */}
        {type === 'address' && <RoundedIcon className="contact-item__avatar" icon={Icons.person} />}
        {type === 'public_key' && <RoundedIcon className="contact-item__avatar" icon={Icons.key} />}
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
