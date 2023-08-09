import type * as nt from '@broxus/ever-wallet-wasm'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import { Icons } from '@app/popup/icons'
import { convertAddress } from '@app/shared'

import { RoundedIcon } from '../RoundedIcon'
import styles from './UserInfo.module.scss'

interface Props {
    account: nt.AssetsList;
    className?: string;
    compact?: boolean;
}

export const UserInfo = observer(({ className, account, compact = false }: Props): JSX.Element => (
    <div className={classNames(styles.userInfo, { [styles._compact]: compact }, className)}>
        <RoundedIcon className={styles.avatar} icon={Icons.person} />
        <div className={styles.content}>
            <div className={styles.name}>{account.name}</div>
            <div className={styles.address}>{convertAddress(account.tonWallet.address)}</div>
        </div>
    </div>
))
