import type * as nt from '@broxus/ever-wallet-wasm'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import AvatarSrc from '@app/popup/assets/img/avatar@2x.png'
import { convertAddress } from '@app/shared'

import './UserInfo.scss'

interface Props {
    account: nt.AssetsList;
    className?: string;
}

export const UserInfo = observer(({ className, account }: Props): JSX.Element => {
    return (
        <div className={classNames('user-info', className)}>
            <img className="user-info__avatar" src={AvatarSrc} alt={account.tonWallet.address} />
            <div className="user-info__content">
                <div className="user-info__name">{account.name}</div>
                <div className="user-info__address">{convertAddress(account.tonWallet.address)}</div>
            </div>
        </div>
    )
})
