import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'

import EverLogo from '@app/popup/assets/img/networks/everscale.svg'
import TychoLogo from '@app/popup/assets/img/networks/tycho.svg'
import VenomLogo from '@app/popup/assets/img/networks/venom.svg'
import TonLogo from '@app/popup/assets/img/networks/ton.svg'

import { useResolve } from '../../hooks'
import { RpcStore } from '../../store'

interface Props {
    className?: string;
}

export const NativeAssetIcon = observer(({ className }: Props): JSX.Element => {
    const { state } = useResolve(RpcStore)
    const group = state.selectedConnection.group
    const logo = useMemo(() => {
        if (group === 'ton') return TonLogo
        if (group.includes('tycho')) return TychoLogo
        if (group.includes('venom')) return VenomLogo

        return EverLogo
    }, [group])

    return (
        <img src={logo} alt="" className={className} />
    )
})
