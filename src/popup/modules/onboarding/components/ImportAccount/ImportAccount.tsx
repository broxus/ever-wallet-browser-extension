import type nt from '@wallet/nekoton-wasm'
import { observer } from 'mobx-react-lite'
import { useCallback, useRef } from 'react'
import { useIntl } from 'react-intl'
import { CSSTransition, SwitchTransition } from 'react-transition-group'

import { ErrorMessage, Notification, useViewModel } from '@app/popup/modules/shared'

import { useSlideTransition } from '../../hooks'
import { EnterSeed } from '../EnterSeed'
import { NewPassword } from '../NewPassword'
import { ImportAccountViewModel, Step } from './ImportAccountViewModel'

interface Props {
    name: string;
    onBack: () => void;
    onSuccess: () => void;
}

export const ImportAccount = observer(({ name, onBack, onSuccess }: Props): JSX.Element => {
    const vm = useViewModel(ImportAccountViewModel, (model) => {
        model.onSuccess = onSuccess
    })
    const intl = useIntl()

    const ref = useRef(null)
    const { transitionProps, setClassName } = useSlideTransition(ref)

    const submit = useCallback((pwd: string) => vm.submit(name, pwd), [name])
    const handleBack = useCallback(() => {
        setClassName('_back')
        vm.step.setValue(Step.EnterPhrase)
    }, [])
    const handleSubmitSeed = useCallback((words: string[], mnemonicType: nt.MnemonicType) => {
        setClassName('_forward')
        vm.submitSeed(words, mnemonicType)
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
                        {vm.step.is(Step.EnterPhrase) && (
                            <EnterSeed
                                disabled={vm.loading}
                                error={vm.seedError}
                                getBip39Hints={vm.getBip39Hints}
                                onSubmit={handleSubmitSeed}
                                onBack={onBack}
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
                title={intl.formatMessage({ id: 'COULD_NOT_IMPORT_WALLET' })}
                onClose={vm.resetError}
            >
                <ErrorMessage>{vm.error}</ErrorMessage>
            </Notification>
        </>
    )
})
