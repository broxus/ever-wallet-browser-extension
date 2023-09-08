import type * as nt from '@broxus/ever-wallet-wasm'
import { memo } from 'react'
import classNames from 'classnames'

import { UserInfo } from '../UserInfo'
import { AddressQRCode } from '../AddressQRCode'
import styles from './AccountQRCode.module.scss'

interface Props {
    account: nt.AssetsList;
    className?: string;
    compact?: boolean;
}

// TODO: remove
export const AccountQRCode = memo(({ account, className, compact }: Props): JSX.Element => (
    <div className={classNames(styles.pane, className)}>
        <div className={styles.user}>
            <UserInfo account={account} />
        </div>

        <AddressQRCode address={account.tonWallet.address} compact={compact} />
    </div>
))
