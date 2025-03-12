import { memo, useCallback, useState } from 'react'

import { convertAddress } from '@app/shared'
import { Loader, UserAvatar } from '@app/popup/modules/shared'
import { Icons } from '@app/popup/icons'

import styles from './ChangeAccount.module.scss'

interface Props {
    address: string;
    name: string;
    masterKey: string;
    masterKeyName: string;
    active: boolean;
    onClick(address: string, masterKey: string): Promise<void>;
}

export const AccountItem = memo(({ address, name, masterKey, masterKeyName, active, onClick }: Props): JSX.Element => {
    const [loading, setLoading] = useState(false)
    const handleClick = useCallback(() => {
        setLoading(true)
        onClick(address, masterKey).finally(() => setLoading(false))
    }, [address, onClick])

    const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
        e.target.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        })
    }

    return (
        <div className={styles.item} onClick={!active ? handleClick : undefined} onFocus={handleFocus}>
            <UserAvatar address={address} />
            <div className={styles.itemContent}>
                <div className={styles.itemName} title={name}>
                    {name}
                </div>
                <div className={styles.itemAddress}>
                    {convertAddress(address)}
                    &nbsp;•&nbsp;
                    {masterKeyName}
                </div>
            </div>
            {active && Icons.check}
            {loading && <Loader />}
        </div>
    )
})
