import { memo } from 'react'
import classNames from 'classnames'

import type { RawContact } from '@app/models'
import { Icons } from '@app/popup/icons'
import { convertAddress, convertPublicKey, isNativeAddress } from '@app/shared'
import { RoundedIcon, UserAvatar } from '@app/popup/modules/shared'

import styles from './ContactItem.module.scss'

interface Props {
    type: RawContact['type'];
    value: string;
    name?: string;
    className?: string;
    onClick?(): void;
}

export const ContactItem = memo(({ type, value, name, className, onClick }: Props): JSX.Element => (
    <div className={classNames(styles.contactItem, className)} onClick={onClick}>
        {type === 'address' && <UserAvatar address={value} />}
        {/* {type === 'address' && <RoundedIcon icon={Icons.person} />} */}{/* TODO: design */}
        {type === 'public_key' && <RoundedIcon icon={Icons.key} />}
        <div className={styles.info}>
            <div className={styles.name}>
                {name}
            </div>
            {type === 'address' && (
                <div className={styles.address}>
                    {isNativeAddress(value) ? convertAddress(value) : value}
                </div>
            )}
            {type === 'public_key' && (
                <div className={styles.address}>
                    {convertPublicKey(value)}
                </div>
            )}
        </div>
    </div>
))
