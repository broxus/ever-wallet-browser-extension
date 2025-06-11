import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import { AssetType } from '@app/shared'
import type { JettonSymbol } from '@app/models'

import { useResolve } from '../../hooks'
import { RpcStore, TokensStore } from '../../store'
import { UserAvatar } from '../UserAvatar'
import { NativeAssetIcon } from './NativeAssetIcon'

import './AssetIcon.scss'

interface Props {
    type: AssetType;
    address: string;
    className?: string;
    old?: boolean;
}

export const AssetIcon = observer(({ type, address, old, className }: Props): JSX.Element => {
    const logoURI = useLogoURI(address)

    if (type === 'ever_wallet') {
        return <NativeAssetIcon className={classNames('asset-icon', className)} />
    }

    return (
        <div className={classNames('asset-icon _token', className)}>
            {logoURI ? <img src={logoURI} alt="" /> : <UserAvatar address={address} />}
            {old && <div className="outdated-asset-badge" />}
        </div>
    )
})

function useLogoURI(address: string): string | undefined {
    const { tokens } = useResolve(TokensStore)
    const { state } = useResolve(RpcStore)

    return tokens[address]?.logoURI ?? (state.knownTokens[address] as JettonSymbol | undefined)?.uri
}
