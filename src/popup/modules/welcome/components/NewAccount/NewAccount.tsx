import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'
import { useIntl } from 'react-intl'

import { ErrorMessage, Notification, useViewModel } from '@app/popup/modules/shared'

import { CheckSeed } from '../CheckSeed'
import { NewPassword } from '../NewPassword'
import { ExportedSeed } from '../ExportedSeed'
import { NewAccountViewModel, Step } from './NewAccountViewModel'

type Props = {
    name: string;
    onBack: () => void;
};

export const NewAccount = observer(({ name, onBack }: Props) => {
    const vm = useViewModel(NewAccountViewModel)
    const intl = useIntl()

    const submit = useCallback((pwd: string) => vm.submit(name, pwd), [name])

    return (
        <>
            {vm.step.is(Step.ShowPhrase) && (
                <ExportedSeed
                    onBack={onBack}
                    onNext={vm.step.setCheckPhrase}
                    seed={vm.seed.phrase}
                />
            )}
            {vm.step.is(Step.CheckPhrase) && (
                <CheckSeed
                    onSubmit={vm.step.setEnterPassword}
                    onBack={vm.step.setShowPhrase}
                    seed={vm.seed.phrase}
                />
            )}
            {vm.step.is(Step.EnterPassword) && (
                <NewPassword
                    disabled={vm.loading}
                    onSubmit={submit}
                    onBack={vm.step.setShowPhrase}
                />
            )}
            <Notification
                opened={!!vm.error}
                title={intl.formatMessage({ id: 'COULD_NOT_CREATE_WALLET' })}
                onClose={vm.resetError}
            >
                <ErrorMessage>{vm.error}</ErrorMessage>
            </Notification>
        </>
    )
})
