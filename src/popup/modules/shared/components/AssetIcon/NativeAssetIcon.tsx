import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'

import TonLogo from '@app/popup/assets/img/ton-logo.svg'
import EverLogo from '@app/popup/assets/img/ever-logo.svg'
import TychoLogo from '@app/popup/assets/img/tycho-logo.svg'
import VenomLogo from '@app/popup/assets/img/venom-logo.svg'

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
