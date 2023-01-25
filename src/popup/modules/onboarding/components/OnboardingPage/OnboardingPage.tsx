import { observer } from 'mobx-react-lite'
import { CSSTransition, SwitchTransition } from 'react-transition-group'
import { useCallback, useRef } from 'react'

import { useViewModel } from '@app/popup/modules/shared'

import { ImportAccount } from '../ImportAccount'
import { NewAccount } from '../NewAccount'
import { Header } from '../Header'
import { Welcome } from '../Welcome'
import { Final } from '../Final'
import { LedgerSignIn } from '../LedgerSignIn'
import { useSlideTransition } from '../../hooks'
import { OnboardingPageViewModel, Step } from './OnboardingPageViewModel'

const FIRST_ACCOUNT_NAME = 'Account 1'

export const OnboardingPage = observer((): JSX.Element => {
    const vm = useViewModel(OnboardingPageViewModel)
    const ref = useRef(null)

    const { transitionProps, setClassName } = useSlideTransition(ref)
    const handleBack = useCallback(() => {
        if (vm.step.is(Step.ImportAccount)) {
            setClassName(['_back', '_import'])
        }
        else {
            setClassName('_back')
        }

        vm.step.setValue(Step.Welcome)
    }, [])
    const handleSuccess = useCallback(() => {
        setClassName('_forward')
        vm.step.setValue(Step.Final)
    }, [])
    const handleCleateAccount = useCallback(() => {
        setClassName('_forward')
        vm.step.setValue(Step.CreateAccount)
    }, [])
    const handleImportAccount = useCallback(() => {
        setClassName(['_forward', '_import'])
        vm.step.setValue(Step.ImportAccount)
    }, [])
    const handleLedgerAccount = useCallback(() => {
        setClassName('_forward')
        vm.step.setValue(Step.LedgerAccount)
    }, [])
    const handleRestore = useCallback(async () => {
        setClassName('_forward')
        await vm.restoreFromBackup()
    }, [])

    return (
        <>
            <Header selectedLocale={vm.selectedLocale} setLocale={vm.setLocale} />

            <main className="main">
                <div className="slides">
                    <SwitchTransition>
                        <CSSTransition
                            {...transitionProps}
                            key={vm.step.value}
                            nodeRef={ref}
                        >
                            <div ref={ref}>
                                {vm.step.is(Step.Welcome) && (
                                    <Welcome
                                        onCreate={handleCleateAccount}
                                        onImport={handleImportAccount}
                                        onLedger={handleLedgerAccount}
                                        onRestore={handleRestore}
                                    />
                                )}

                                {vm.step.is(Step.Final) && (
                                    <Final />
                                )}

                                {vm.step.is(Step.ImportAccount) && (
                                    <ImportAccount
                                        name={FIRST_ACCOUNT_NAME}
                                        onBack={handleBack}
                                        onSuccess={handleSuccess}
                                    />
                                )}

                                {vm.step.is(Step.CreateAccount) && (
                                    <NewAccount
                                        name={FIRST_ACCOUNT_NAME}
                                        onBack={handleBack}
                                        onSuccess={handleSuccess}
                                    />
                                )}

                                {vm.step.is(Step.LedgerAccount) && (
                                    <LedgerSignIn
                                        onBack={handleBack}
                                        onSuccess={handleSuccess}
                                    />
                                )}
                            </div>
                        </CSSTransition>
                    </SwitchTransition>
                </div>
            </main>
        </>
    )
})
