import { observer } from 'mobx-react-lite'
import { useCallback, useRef } from 'react'
import { useIntl } from 'react-intl'
import { CSSTransition, SwitchTransition } from 'react-transition-group'

import { ErrorMessage, Notification, useViewModel } from '@app/popup/modules/shared'

import { useSlideTransition } from '../../hooks'
import { CheckSeed } from '../CheckSeed'
import { NewPassword } from '../NewPassword'
import { ExportedSeed } from '../ExportedSeed'
import { NewAccountViewModel, Step } from './NewAccountViewModel'


type Props = {
    name: string;
    onBack: () => void;
    onSuccess: () => void;
};

export const NewAccount = observer(({ name, onBack, onSuccess }: Props) => {
    const vm = useViewModel(NewAccountViewModel, (model) => {
        model.onSuccess = onSuccess
    })
    const intl = useIntl()

    const ref = useRef(null)
    const { transitionProps, setClassName } = useSlideTransition(ref)

    const submit = useCallback((pwd: string) => vm.submit(name, pwd), [name])
    const handleBack = useCallback(() => {
        setClassName('_back')
        vm.step.setValue(Step.ShowPhrase)
    }, [])
    const handleCheckPhrase = useCallback(() => {
        setClassName('_forward')
        vm.step.setValue(Step.CheckPhrase)
    }, [])
    const handleEnterPassword = useCallback(() => {
        setClassName('_forward')
        vm.step.setValue(Step.EnterPassword)
    }, [])

    return (
        <>
            <SwitchTransition>
                <CSSTransition
                    {...transitionProps}
                    key={vm.step.value}
                    nodeRef={ref}
                >
                    <div ref={ref}>
                        {vm.step.is(Step.ShowPhrase) && (
                            <ExportedSeed
                                onBack={onBack}
                                onNext={handleCheckPhrase}
                                onSkip={handleEnterPassword}
                                seed={vm.seed.phrase}
                            />
                        )}
                        {vm.step.is(Step.CheckPhrase) && (
                            <CheckSeed
                                seed={vm.seed.phrase}
                                getBip39Hints={vm.getBip39Hints}
                                onSubmit={handleEnterPassword}
                                onBack={handleBack}
                            />
                        )}
                        {vm.step.is(Step.EnterPassword) && (
                            <NewPassword
                                disabled={vm.loading}
                                onSubmit={submit}
                                onBack={handleBack}
                            />
                        )}
                    </div>
                </CSSTransition>
            </SwitchTransition>
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
