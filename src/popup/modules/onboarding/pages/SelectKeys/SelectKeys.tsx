import { memo, useCallback } from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Space, useViewModel } from '@app/popup/modules/shared'
import { LedgerAccountSelectorViewModel } from '@app/popup/modules/ledger/components/LedgerAccountSelector/LedgerAccountSelectorViewModel'
import { LedgerSignInViewModel } from '@app/popup/modules/onboarding/components/LedgerSignIn/LedgerSignInViewModel'
import { LedgerAccountSelector } from '@app/popup/modules/onboarding/components/LedgerAccountSelector/LedgerAccountSelector'

import { appRoutes } from '../..'
import { NavigationBar } from '../../components/NavigationBar'
import s from './SelectKeys.module.scss'


export const SelectKeys = memo((): JSX.Element => {
    const navigate = useNavigate()
    const intl = useIntl()

    const vm = useViewModel(LedgerSignInViewModel)
    const vmAccount = useViewModel(LedgerAccountSelectorViewModel, model => {
        model.onSuccess = vm.handleSuccess
    })

    const handleCheckPhrase = useCallback(() => {
        vmAccount.saveAccounts()
        navigate(`${appRoutes.ledgerSignIn.path}/${appRoutes.confirmation.path}`)
    }, [])

    const handleBack = useCallback(() => {
        navigate(appRoutes.ledgerSignIn.path)

    }, [])

    return (
        <div className={s.selectKeys}>
            <div className={s.container}>
                <div>
                    <div className={s.header}>
                        <Space direction="column" gap="l">
                            <h2 className={s.title}>
                                {intl.formatMessage({ id: 'LEDGER_SELECT_KEYS' })}
                            </h2>
                        </Space>
                    </div>

                    <LedgerAccountSelector
                        vm={vmAccount}
                    />
                </div>
                <NavigationBar
                    onNext={handleCheckPhrase}
                    onBack={handleBack}
                />
            </div>
        </div>
    )
})
