import { memo, useCallback, useState } from 'react'

import { convertAddress } from '@app/shared'
import { Loader, RoundedIcon } from '@app/popup/modules/shared'
import { Icons } from '@app/popup/icons'

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

    return (
        <div className="change-account__item" onClick={!active ? handleClick : undefined}>
            <RoundedIcon icon={Icons.person} />
            <div className="change-account__item-content">
                <div className="change-account__item-name" title={name}>
                    {name}
                </div>
                <div className="change-account__item-address">
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
