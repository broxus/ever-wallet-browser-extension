import { memo } from 'react'

import { AssetIcon, Checkbox } from '@app/popup/modules/shared'

import styles from './TokenItem.module.scss'

interface Props {
    old?: boolean;
    name: string;
    fullName: string;
    rootTokenContract: string;
    enabled: boolean;
    disabled?: boolean;
    onToggle: (enabled: boolean) => void;
}

export const TokenItem = memo((props: Props) => {
    const {
        name,
        fullName,
        rootTokenContract,
        enabled,
        old,
        disabled,
        onToggle,
    } = props

    return (
        <div className={styles.token} onClick={() => (disabled ? undefined : onToggle(!enabled))}>
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
            <Checkbox
                disabled={disabled}
                className={styles.switch}
                checked={enabled}
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    )
})
