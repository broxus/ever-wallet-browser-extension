import type * as nt from '@broxus/ever-wallet-wasm'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import { convertAddress, convertPublicKey } from '@app/shared'

import { UserAvatar } from '../UserAvatar'
import styles from './UserInfo.module.scss'

interface Props {
    account: nt.AssetsList;
    className?: string;
    compact?: boolean;
}

export const UserInfo = observer(({ className, account, compact = false }: Props): JSX.Element => (
    <div className={classNames(styles.userInfo, { [styles._compact]: compact }, className)}>
        <UserAvatar className={styles.avatar} address={account.tonWallet.address} />
        <div className={styles.wrap}>
            <div className={styles.name} title={account.name}>
                {account.name}
            </div>
            <div className={styles.address}>
                {convertAddress(account.tonWallet.address)}
                <span>•</span>
                {convertPublicKey(account.tonWallet.publicKey)}
            </div>
        </div>
    </div>
))
