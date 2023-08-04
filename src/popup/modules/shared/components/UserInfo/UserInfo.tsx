import type * as nt from '@broxus/ever-wallet-wasm'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import AvatarSrc from '@app/popup/assets/img/avatar@2x.png'
import { convertAddress } from '@app/shared'

import styles from './UserInfo.module.scss'

interface Props {
    account: nt.AssetsList;
    className?: string;
    compact?: boolean;
}

export const UserInfo = observer(({ className, account, compact = false }: Props): JSX.Element => (
    <div className={classNames(styles.userInfo, { [styles._compact]: compact }, className)}>
        <img className={styles.avatar} src={AvatarSrc} alt={account.tonWallet.address} />
        <div className={styles.content}>
            <div className={styles.name}>{account.name}</div>
            <div className={styles.address}>{convertAddress(account.tonWallet.address)}</div>
        </div>
    </div>
))
