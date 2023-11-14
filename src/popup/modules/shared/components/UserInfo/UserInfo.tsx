import type * as nt from '@broxus/ever-wallet-wasm'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import { convertAddress, convertPublicKey } from '@app/shared'

import { useResolve } from '../../hooks'
import { AccountabilityStore } from '../../store'
import { UserAvatar } from '../UserAvatar'
import styles from './UserInfo.module.scss'

interface Props {
    account: nt.AssetsList;
    className?: string;
    compact?: boolean;
}

export const UserInfo = observer(({ className, account, compact = false }: Props): JSX.Element => {
    const { storedKeys } = useResolve(AccountabilityStore)
    const { name, tonWallet: { address, publicKey }} = account

    return (
        <div className={classNames(styles.userInfo, { [styles._compact]: compact }, className)}>
            <UserAvatar className={styles.avatar} address={address} />
            <div className={styles.wrap}>
                <div className={styles.name} title={name}>
                    {name}
                </div>
                <div className={styles.address}>
                    {convertAddress(address)}
                    <span>•</span>
                    {storedKeys[publicKey]?.name || convertPublicKey(publicKey)}
                </div>
            </div>
        </div>
    )
})
