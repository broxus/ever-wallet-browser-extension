import { observer } from 'mobx-react-lite'

import SparxLogo from '@app/popup/assets/img/networks/sparx.svg'

import { useResolve } from '../../hooks'
import { RpcStore } from '../../store'

interface Props {
    className?: string;
}

export const NativeAssetIcon = observer(({ className }: Props): JSX.Element => {
    const { state: { selectedConnection, connectionConfig: { blockchainsByGroup }}} = useResolve(RpcStore)

    const logo = blockchainsByGroup[selectedConnection.group]?.icons.nativeToken ?? SparxLogo

    return <img src={logo} alt="" className={className} />
})
