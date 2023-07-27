import { memo, useCallback, useState } from 'react'

import { convertAddress } from '@app/shared'
import { Loader } from '@app/popup/modules/shared'
import AvatarSrc from '@app/popup/assets/img/avatar@2x.png'
import CheckIcon from '@app/popup/assets/icons/check.svg'

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
            <img className="change-account__item-avatar" src={AvatarSrc} alt="" />
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
            {active && <CheckIcon />}
            {loading && <Loader />}
        </div>
    )
})
