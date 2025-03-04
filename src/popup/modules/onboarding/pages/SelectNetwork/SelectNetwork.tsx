import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'
import { observer } from 'mobx-react-lite'
import { FC, useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'

import { ConnectionStore, Space, useResolve } from '@app/popup/modules/shared'
import { appRoutes } from '@app/popup/modules/onboarding/appRoutes'
import { NetworkIcon } from '@app/popup/modules/network/components/NetworkIcon/NetworkIcon'

import s from './SelectNetwork.module.scss'
import { NavigationBar } from '../../components/NavigationBar'

type Props = {
    nextPath: string
}

export const SelectNetwork: FC<Props> = observer(({ nextPath }) => {
    const intl = useIntl()
    const navigate = useNavigate()
    const connection = useResolve(ConnectionStore)
    const [connectionId, setConnectionId] = useState<number>()

    const onBack = () => {
        navigate(appRoutes.welcome.path)
    }

    const onNext = () => {
        navigate(nextPath)
    }

    const description = useMemo(() => intl.formatMessage({ id: nextPath === `${appRoutes.importAccount.path}/${appRoutes.enterSeed.path}` ? 'SELECT_NETWORK_SEED_DESC' : 'SELECT_NETWORK_DESC' }), [intl, nextPath])

    useEffect(() => {
        if (connectionId !== undefined) {
            const network = connection.connectionItems.find(item => item.connectionId === connectionId)

            if (network) {
                connection.changeNetwork(network)
            }
        }
    }, [connectionId])

    return (
        <div className={s.container}>
            <div>
                <div className={s.header}>
                    <Space direction="column" gap="m">
                        <h2 className={s.title}>
                            {intl.formatMessage({ id: 'SELECT_NETWORK_TITLE' })}
                        </h2>
                        <p className={s.text}>
                            {description}
                        </p>
                    </Space>
                </div>

                <div className={s.list}>
                    {connection.connectionItems.map(item => (
                        <button
                            key={item.connectionId}
                            type="button"
                            className={classNames(s.item, {
                                [s.active]: connectionId === item.connectionId,
                            })}
                            onClick={() => {
                                setConnectionId(item.connectionId)
                            }}
                        >
                            <NetworkIcon connectionId={item.connectionId} />
                            <div className={s.label}>{item.name}</div>
                        </button>
                    ))}
                </div>
            </div>
            <NavigationBar
                disabled={connectionId === undefined}
                onNext={onNext}
                onBack={onBack}
            />
        </div>
    )
})
