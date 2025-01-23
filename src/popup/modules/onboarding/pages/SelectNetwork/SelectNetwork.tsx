import { useIntl } from 'react-intl'
import { useNavigate } from 'react-router'
import { observer } from 'mobx-react-lite'
import { FC, useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'

import { ConnectionStore, Space, useResolve } from '@app/popup/modules/shared'
import { appRoutes } from '@app/popup/modules/onboarding/appRoutes'
import { NetworkIcon } from '@app/popup/modules/network/components/NetworkIcon/NetworkIcon'
import { NETWORK_ID } from '@app/shared'

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
                    <button
                        type="button"
                        className={classNames(s.item, {
                            [s.active]: connectionId === NETWORK_ID.VENOM,
                        })}
                        onClick={() => {
                            setConnectionId(NETWORK_ID.VENOM)
                        }}
                    >
                        <NetworkIcon connectionId={NETWORK_ID.VENOM} />
                        <div className={s.label}>Venom</div>
                    </button>
                    <button
                        type="button"
                        className={classNames(s.item, {
                            [s.active]: connectionId === NETWORK_ID.EVERSCALE,
                        })}
                        onClick={() => {
                            setConnectionId(NETWORK_ID.EVERSCALE)
                        }}
                    >
                        <NetworkIcon connectionId={NETWORK_ID.EVERSCALE} />
                        <div className={s.label}>Everscale</div>
                    </button>
                    <button
                        type="button"
                        className={classNames(s.item, {
                            [s.active]: connectionId === NETWORK_ID.TYCHO_TESTNET,
                        })}
                        onClick={() => {
                            setConnectionId(NETWORK_ID.TYCHO_TESTNET)
                        }}
                    >
                        <NetworkIcon connectionId={NETWORK_ID.TYCHO_TESTNET} />
                        <div className={s.label}>Tycho</div>
                    </button>
                    <button
                        type="button"
                        className={classNames(s.item, {
                            [s.active]: connectionId === NETWORK_ID.TON,
                        })}
                        onClick={() => {
                            setConnectionId(NETWORK_ID.TON)
                        }}
                    >
                        <NetworkIcon connectionId={NETWORK_ID.TON} />
                        <div className={s.label}>Ton</div>
                    </button>
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
