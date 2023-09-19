import { memo, useCallback } from 'react'
import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'

import { Space } from '@app/popup/modules/shared'

import { NavigationBar } from '../../components/NavigationBar'
import { appRoutes } from '../../appRoutes'
import s from './ConnectLedger.module.scss'


export const ConnectLedger = memo((): JSX.Element => {
    const navigate = useNavigate()
    const intl = useIntl()
    const handleCheckPhrase = useCallback(() => {
        navigate(appRoutes.selectKeys.path)

    }, [])

    const handleBack = useCallback(() => {
        navigate(appRoutes.welcome.path)

    }, [])

    return (
        <div className={s.connectLedger}>
            <div className={s.container}>
                <div>
                    <div className={s.header}>
                        <Space direction="column" gap="l">
                            <h2 className={s.title}>
                                {intl.formatMessage({ id: 'SAVE_THE_SEED_PHRASE' })}
                            </h2>
                            <p className={s.text}>
                                {intl.formatMessage({ id: 'SAVE_THE_SEED_PHRASE_NOTE' })}
                            </p>
                        </Space>
                    </div>

                </div>
                <NavigationBar
                    onNext={handleCheckPhrase}
                    onBack={handleBack}
                />
            </div>
        </div>
    )
})
