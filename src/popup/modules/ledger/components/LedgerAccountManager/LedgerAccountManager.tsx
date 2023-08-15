import { observer } from 'mobx-react-lite'

import { useViewModel } from '@app/popup/modules/shared'

import { LedgerAccountSelector } from '../LedgerAccountSelector'
import { LedgerConnector } from '../LedgerConnector'
import { LedgerAccountManagerViewModel, Step } from './LedgerAccountManagerViewModel'

interface Props {
    name?: string;
    onBack: () => void;
}

export const LedgerAccountManager = observer(({ onBack, name }: Props): JSX.Element => {
    const vm = useViewModel(LedgerAccountManagerViewModel, model => {
        model.name = name
        model.onBack = onBack
    })

    return (
        <>
            {vm.step.value === Step.Connect && (
                <LedgerConnector
                    onBack={onBack}
                    onNext={vm.step.callback(Step.Select)}
                />
            )}

            {vm.step.value === Step.Select && (
                <LedgerAccountSelector
                    onBack={onBack}
                    onSuccess={vm.onSuccess}
                    onError={vm.step.callback(Step.Connect)}
                />
            )}
        </>
    )
})
