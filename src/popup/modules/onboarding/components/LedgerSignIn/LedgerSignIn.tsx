import { observer } from 'mobx-react-lite'

import { useViewModel } from '@app/popup/modules/shared'
import { LedgerAccountSelector, LedgerConnector } from '@app/popup/modules/ledger'

import { LedgerSignInViewModel, Step } from './LedgerSignInViewModel'

import './LedgerSignIn.scss'

interface Props {
    onBack: () => void;
    onSuccess: () => void;
}

export const LedgerSignIn = observer(({ onBack, onSuccess }: Props) => {
    const vm = useViewModel(LedgerSignInViewModel, (model) => {
        model.onSuccess = onSuccess
    })

    return (
        <div className="slide slide--connect-ledger">
            <div className="container">
                <div className="slide__wrap">
                    <div className="ledger-sign-in slide__animate">
                        {vm.step.value === Step.Connect && (
                            <LedgerConnector
                                theme="sign-in"
                                onBack={onBack}
                                onNext={vm.step.callback(Step.Select)}
                            />
                        )}

                        {vm.step.value === Step.Select && (
                            <LedgerAccountSelector
                                theme="sign-in"
                                onBack={onBack}
                                onSuccess={vm.handleSuccess}
                                onError={vm.step.callback(Step.Connect)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
})
