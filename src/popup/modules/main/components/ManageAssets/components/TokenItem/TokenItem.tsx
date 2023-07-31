import { memo } from 'react'

import { AssetIcon, Switch } from '@app/popup/modules/shared'

import './TokenItem.scss'

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
        <div className="token-select" onClick={() => onToggle(!enabled)}>
            <AssetIcon
                className="token-select__icon"
                type="token_wallet"
                address={rootTokenContract}
                old={old}
            />
            <div className="token-select__container">
                <p className="token-select__name" title={name}>{name}</p>
                <p className="token-select__fullname" title={fullName}>{fullName}</p>
            </div>
            <Switch className="token-select__switch" checked={enabled} onChange={onToggle} />
        </div>
    )
})
