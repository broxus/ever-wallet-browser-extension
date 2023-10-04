import { useCallback } from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'
import { observer } from 'mobx-react-lite'

import { Space, useViewModel } from '@app/popup/modules/shared'
import { LedgerSignInViewModel } from '@app/popup/modules/onboarding/components/LedgerSignIn/LedgerSignInViewModel'
import { LedgerAccountSelector } from '@app/popup/modules/onboarding/components/LedgerAccountSelector/LedgerAccountSelector'

import { NavigationBar } from '../../components/NavigationBar'
import { appRoutes } from '../../appRoutes'
import s from './SelectKeys.module.scss'

export const SelectKeys = observer((): JSX.Element => {
    const vm = useViewModel(LedgerSignInViewModel)
    const navigate = useNavigate()
    const intl = useIntl()

    const handleCheckPhrase = useCallback(async () => {
        await vm.saveAccounts()
        navigate(`${appRoutes.ledgerSignIn.path}/${appRoutes.confirmation.path}`)
    }, [])

    const handleBack = useCallback(() => {
        navigate(appRoutes.welcome.path)

    }, [])

    return (
        <div className={s.container}>
            <div>
                <div className={s.header}>
                    <Space direction="column" gap="l">
                        <h2 className={s.title}>
                            {intl.formatMessage({ id: 'LEDGER_SELECT_KEYS' })}
                        </h2>
                    </Space>
                </div>

                <LedgerAccountSelector vm={vm} />
            </div>
            <NavigationBar
                disabled={!vm.canSave}
                loading={vm.saving}
                onNext={handleCheckPhrase}
                onBack={handleBack}
            />
        </div>
    )
})
