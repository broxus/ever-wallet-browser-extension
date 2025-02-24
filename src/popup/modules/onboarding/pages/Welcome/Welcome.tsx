import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import { useCallback } from 'react'

import LeftPhone from '@app/popup/assets/img/welcome/left-phone.png'
import RightPhone from '@app/popup/assets/img/welcome/right-phone.png'
import CircleBig from '@app/popup/assets/img/welcome/circle-line-1.png'
import CircleSmall from '@app/popup/assets/img/welcome/circle-line-2.png'
import { Button, PageLoader, Space, useResolve } from '@app/popup/modules/shared'
import { WALLET_TERMS_URL } from '@app/shared'
import { parseError } from '@app/popup/utils'

import { appRoutes } from '../../appRoutes'
import { OnboardingStore } from '../../store'
import s from './Welcome.module.scss'

export const Welcome = observer((): JSX.Element => {
    const { restoreFromBackup, loading, notification } = useResolve(OnboardingStore)
    const intl = useIntl()
    const navigate = useNavigate()

    const handleRestore = useCallback(() => {
        restoreFromBackup().then((e) => {
            if (e) {
                notification.error(parseError(e))
            }
            else {
                navigate(`${appRoutes.newAccount.path}/${appRoutes.confirmation.path}`)
            }
        })

    }, [navigate])

    return (
        <PageLoader active={loading}>
            <div className={s.welcome}>
                <img className={s.welcomeCircleBig} src={CircleBig} alt="circle1" />
                <img className={s.welcomeCircleSmall} src={CircleSmall} alt="circle2" />
                <img className={s.welcomePicLeft} src={LeftPhone} alt="phone" />
                <div className={s.welcomeContent}>
                    <Space direction="column" gap="m">
                        <h1 className={s.welcomeTitle}>
                            {intl.formatMessage({ id: 'WELCOME_TO_WALLET' })}
                        </h1>
                        <p className={s.welcomeText}>
                            {intl.formatMessage({ id: 'WELCOME_SUBTITLE' })}
                        </p>
                    </Space>
                    <div>
                        <Space direction="column" gap="s">
                            <Button
                                design="accent"
                                shape="pill"
                                size="l"
                                onClick={() => navigate(`${appRoutes.newAccount.path}/${appRoutes.selectNetwork.path}`)}
                            >
                                {intl.formatMessage({ id: 'CREATE_A_NEW_WALLET' })}
                            </Button>
                            <Button
                                design="neutral"
                                shape="pill"
                                size="l"
                                onClick={() => navigate(`${appRoutes.importAccount.path}/${appRoutes.selectNetwork.path}`)}
                            >
                                {intl.formatMessage({ id: 'SIGN_IN_WITH_SEED_PHRASE' })}
                            </Button>
                            <Button
                                design="neutral"
                                shape="pill"
                                size="l"
                                onClick={() => navigate(`${appRoutes.ledgerSignIn.path}/${appRoutes.selectNetwork.path}`)}
                            >
                                {intl.formatMessage({ id: 'SIGN_IN_WITH_LEDGER' })}
                            </Button>
                            <Button
                                design="ghost" shape="pill" size="l"
                                onClick={handleRestore}
                            >
                                {intl.formatMessage({ id: 'RESTORE_FROM_BACKUP' })}
                            </Button>
                        </Space>
                    </div>
                    <div>
                        <p className={s.welcomeAgreement}>
                            {intl.formatMessage({ id: 'WELCOME_AGREEMENT' })}
                            &nbsp;
                            <a href={WALLET_TERMS_URL} className={s.welcomeReadHere}>
                                {intl.formatMessage({ id: 'READ_HERE' })}
                            </a>
                        </p>
                    </div>
                </div>
                <img className={s.welcomePicRight} src={RightPhone} alt="phone" />
            </div>
        </PageLoader>
    )
})
