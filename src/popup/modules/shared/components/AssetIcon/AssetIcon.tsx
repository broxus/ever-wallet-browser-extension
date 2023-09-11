import classNames from 'classnames'
import { observer } from 'mobx-react-lite'

import { useResolve } from '../../hooks'
import { TokensStore } from '../../store'
import { UserAvatar } from '../UserAvatar'
import { EverAssetIcon } from './EverAssetIcon'
import './AssetIcon.scss'

type Props =
    | { type: 'ever_wallet', className?: string }
    | { type: 'token_wallet', address: string, old?: boolean, className?: string }

export const AssetIcon = observer((props: Props): JSX.Element => {
    const { tokens } = useResolve(TokensStore)

    if (props.type === 'ever_wallet') {
        return <EverAssetIcon className={classNames('asset-icon', props.className)} />
    }

    const { address, old, className } = props
    const logoURI = tokens[address]?.logoURI

    return (
        <div className={classNames('asset-icon _token', className)}>
            {logoURI ? <img src={logoURI} alt="" /> : <UserAvatar address={address} />}
            {old && <div className="outdated-asset-badge" />}
        </div>
    )
})
