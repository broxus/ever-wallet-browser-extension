import { observer } from 'mobx-react-lite'
import React from 'react'

import { useViewModel } from '@app/popup/modules/shared'

import { LedgerAccountSelector } from '../LedgerAccountSelector'
import { LedgerConnector } from '../LedgerConnector'
import { LedgerSignInViewModel, Step } from './LedgerSignInViewModel'

import './LedgerSignIn.scss'

interface Props {
    onBack: () => void;
}

export const LedgerSignIn = observer(({ onBack }: Props) => {
    const vm = useViewModel(LedgerSignInViewModel)

    return (
        <div className="ledger-sign-in">
            {vm.step.value === Step.Connect && (
                <LedgerConnector
                    theme="sign-in"
                    onBack={onBack}
                    onNext={vm.step.setSelect}
                />
            )}

            {vm.step.value === Step.Select && (
                <LedgerAccountSelector
                    theme="sign-in"
                    onBack={onBack}
                    onSuccess={vm.onSuccess}
                    onError={vm.step.setConnect}
                />
            )}
        </div>
    )
})
