import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router'

import { LedgerConnector as LedgerConnectorInner } from '@app/popup/modules/ledger'

import s from './LedgerConnector.module.scss'
import { appRoutes } from '../..'

export const LedgerConnector = memo((): JSX.Element => {
    const navigate = useNavigate()
    const handleCheckPhrase = useCallback(() => {
        navigate(`${appRoutes.ledgerSignIn.path}/${appRoutes.selectKeys.path}`)
    }, [appRoutes])

    const handleBack = useCallback(() => {
        navigate(appRoutes.welcome.path)
    }, [appRoutes])


    return (
        <LedgerConnectorInner
            theme="sign-in"
            onNext={handleCheckPhrase}
            onBack={handleBack}
            className={s.ledgerConnector}
        />
    )
})
