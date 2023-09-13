import { memo } from 'react'

import { AssetIcon, Switch } from '@app/popup/modules/shared'

import styles from './TokenItem.module.scss'

interface Props {
    old?: boolean;
    name: string;
    fullName: string;
    rootTokenContract: string;
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
}

export const TokenItem = memo((props: Props) => {
    const {
        name,
        fullName,
        rootTokenContract,
        enabled,
        old,
        onToggle,
    } = props

    return (
        <div className={styles.token} onClick={() => onToggle(!enabled)}>
            <AssetIcon
                type="token_wallet"
                className={styles.icon}
                address={rootTokenContract}
                old={old}
            />
            <div className={styles.container}>
                <p className={styles.name} title={name}>{name}</p>
                <p className={styles.fullname} title={fullName}>{fullName}</p>
            </div>
            <Switch className={styles.switch} checked={enabled} onChange={onToggle} />
        </div>
    )
})
