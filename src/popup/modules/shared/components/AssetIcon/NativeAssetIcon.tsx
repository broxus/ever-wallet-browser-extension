import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'

import EverLogo from '@app/popup/assets/img/networks/everscale.svg'
import TychoLogo from '@app/popup/assets/img/networks/tycho.svg'
import VenomLogo from '@app/popup/assets/img/networks/venom.svg'
import TonLogo from '@app/popup/assets/img/networks/ton.svg'
import SparxLogo from '@app/popup/assets/img/networks/sparx.svg'
import HamsterLogo from '@app/popup/assets/img/networks/hamster.svg'
import HumoLogo from '@app/popup/assets/img/networks/humo.svg'

import { useResolve } from '../../hooks'
import { RpcStore } from '../../store'

interface Props {
    className?: string;
}

export const NativeAssetIcon = observer(({ className }: Props): JSX.Element => {
    const { state } = useResolve(RpcStore)
    const group = state.selectedConnection.group
    const type = state.selectedConnection.network
    const logo = useMemo(() => {
        if (type === 'everscale') return EverLogo
        if (type === 'ton') return TonLogo
        if (type === 'tycho') return TychoLogo
        if (type === 'venom') return VenomLogo
        if (type === 'hamster') return HamsterLogo
        if (type === 'humo') return HumoLogo
        return SparxLogo
    }, [group])

    return (
        <img src={logo} alt="" className={className} />
    )
})
