import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'

import { closeCurrentWindow } from '@app/background'
import { Loader, Panel, SlidingPanel, useDrawerPanel, useViewModel } from '@app/popup/modules/shared'

import { StakePrepareMessage } from '../StakePrepareMessage'
import { StakeTutorial } from '../StakeTutorial'
import { StakePageViewModel } from './StakePageViewModel'

import './StakePage.scss'

export const StakePage = observer((): JSX.Element => {
    const drawer = useDrawerPanel()
    const vm = useViewModel(StakePageViewModel)

    const handleClose = useCallback(() => drawer.setPanel(undefined), [])

    if (!vm.selectedAccount || !vm.everWalletState) {
        return <Loader />
    }

    return (
        <>
            <StakePrepareMessage
                onBack={closeCurrentWindow}
                onNext={closeCurrentWindow}
            />
            <SlidingPanel
                className="stake-sliding-panel"
                active={drawer.panel !== undefined}
                onClose={handleClose}
            >
                {drawer.panel === Panel.STAKE_TUTORIAL && <StakeTutorial />}
            </SlidingPanel>
        </>
    )
})
