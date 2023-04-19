import { memo, useCallback, useState } from 'react'

import { convertAddress } from '@app/shared'
import { Spinner, UserAvatar } from '@app/popup/modules/shared'

interface Props {
    address: string;
    name: string;
    masterKey: string;
    masterKeyName: string;
    onClick(address: string, masterKey: string): Promise<void>;
}

export const AccountItem = memo(({ address, name, masterKey, masterKeyName, onClick }: Props): JSX.Element => {
    const [loading, setLoading] = useState(false)
    const handleClick = useCallback(() => {
        setLoading(true)
        onClick(address, masterKey).finally(() => setLoading(false))
    }, [address, onClick])

    return (
        <div className="change-account__account" onClick={handleClick}>
            <UserAvatar className="change-account__account-avatar" address={address} small />
            <div className="change-account__account-content">
                <div className="change-account__account-name" title={name}>
                    {name}
                </div>
                <div className="change-account__account-address">
                    {convertAddress(address)}
                    &nbsp;•&nbsp;
                    {masterKeyName}
                </div>
            </div>
            {loading && <Spinner />}
        </div>
    )
})
