import type * as nt from '@broxus/ever-wallet-wasm'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import { convertAddress, convertPublicKey } from '@app/shared'
import { Jdenticon } from '@app/popup/modules/shared/components/Jdenticon'
import { Icon } from '@app/popup/modules/shared/components/Icon'

import { useResolve } from '../../hooks'
import { AccountabilityStore } from '../../store'
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
            <Jdenticon value={address} className={styles.avatar} />
            <div className={styles.wrap}>
                <div className={styles.name} title={name}>
                    {name}
                </div>
                <div className={styles.address}>
                    <span className={styles.item}>
                        <Icon icon="wallet" width={16} height={16} />
                        {convertAddress(address)}
                    </span>
                    <span className={styles.item}>
                        <Icon icon="key" width={16} height={16} />
                        {storedKeys[publicKey]?.name || convertPublicKey(publicKey)}
                    </span>
                </div>
            </div>
        </div>
    )
})
