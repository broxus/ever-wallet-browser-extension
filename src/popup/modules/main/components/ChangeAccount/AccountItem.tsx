import { memo } from 'react'

import { convertAddress } from '@app/shared'
import { UserAvatar } from '@app/popup/modules/shared'

interface Props {
    address: string;
    name: string;
    seed: string;
    onClick(address: string): void;
}

export const AccountItem = memo(({ address, name, seed, onClick }: Props): JSX.Element => (
    <div
        className="change-account__account"
        onClick={() => onClick(address)}
    >
        <UserAvatar className="change-account__account-avatar" address={address} small />
        <div className="change-account__account-content">
            <div className="change-account__account-name" title={name}>
                {name}
            </div>
            <div className="change-account__account-address">
                {convertAddress(address)}
                &nbsp;•&nbsp;
                {seed}
            </div>
        </div>
    </div>
))
