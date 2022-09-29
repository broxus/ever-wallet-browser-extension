import nt from '@wallet/nekoton-wasm'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import { convertAddress } from '@app/shared'

import { UserAvatar } from '../UserAvatar'

import './UserInfo.scss'

interface Props {
    account: nt.AssetsList;
    className?: string;
}

export const UserInfo = observer(({ className, account }: Props): JSX.Element => {
    return (
        <div className={classNames('user-info', className)}>
            <UserAvatar className="user-info__avatar" address={account.tonWallet.address} />
            <div className="user-info__content">
                <div className="user-info__name">{account.name}</div>
                <div className="user-info__address">{convertAddress(account.tonWallet.address)}</div>
            </div>
        </div>
    )
})
