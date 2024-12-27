import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import { JettonSymbol } from '@app/models'

import { useResolve } from '../../hooks'
import { RpcStore, TokensStore } from '../../store'
import { UserAvatar } from '../UserAvatar'
import { NativeAssetIcon } from './NativeAssetIcon'

import './AssetIcon.scss'

type Props =
    | { type: 'ever_wallet', className?: string }
    | { type: 'token_wallet', address: string, old?: boolean, className?: string }

export const AssetIcon = observer((props: Props): JSX.Element => {
    const logoURI = useLogoURI(props.type === 'token_wallet' ? props.address : undefined)

    if (props.type === 'ever_wallet') {
        return <NativeAssetIcon className={classNames('asset-icon', props.className)} />
    }

    const { address, old, className } = props

    return (
        <div className={classNames('asset-icon _token', className)}>
            {logoURI ? <img src={logoURI} alt="" /> : <UserAvatar address={address} />}
            {old && <div className="outdated-asset-badge" />}
        </div>
    )
})

function useLogoURI(address?: string): string | undefined {
    const { tokens } = useResolve(TokensStore)
    const { state } = useResolve(RpcStore)

    return address
        ? tokens[address]?.logoURI ?? (state.knownTokens[address] as JettonSymbol | undefined)?.uri
        : undefined
}
