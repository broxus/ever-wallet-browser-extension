import { observer } from 'mobx-react-lite'
import { useEffect, useState } from 'react'
import { useIntl, type IntlShape } from 'react-intl'

import { useResolve } from '../../hooks'
import { RpcStore } from '../../store'
import { getTimeComponents } from '../../utils/time'

const getRemainingSeconds = (expiresAt: number, clockOffset: number, now: number) => (
    Math.max(0, expiresAt - Math.floor((now + clockOffset) / 1000))
)

const getUpdateDelay = (remainingSeconds: number) => ((remainingSeconds % 60) || 60) * 1000

const formatDuration = (intl: IntlShape, remainingSeconds: number) => {
    const { h, m } = getTimeComponents(remainingSeconds)
    const parts = h > 0
        ? [
            intl.formatMessage({ id: 'TIME_HOURS_SHORT' }, { value: h }),
            intl.formatMessage({ id: 'TIME_MINUTES_SHORT' }, { value: m }),
        ]
        : [intl.formatMessage({ id: 'TIME_MINUTES_SHORT' }, { value: m })]

    return parts.join(' ')
}

interface Props {
    expiresAt: number;
}

export const ExpirationTimer = observer(({ expiresAt }: Props) => {
    const { state: { clockOffset }} = useResolve(RpcStore)
    const intl = useIntl()

    const [now, setNow] = useState(() => Date.now())

    const remainingSeconds = getRemainingSeconds(expiresAt, clockOffset, now)
    const duration = formatDuration(intl, remainingSeconds)

    useEffect(() => {
        let timeoutId: number | undefined

        const scheduleUpdate = () => {
            const currentNow = Date.now()
            const currentRemainingSeconds = getRemainingSeconds(expiresAt, clockOffset, currentNow)

            setNow(currentNow)

            if (currentRemainingSeconds <= 0) {
                return
            }

            timeoutId = window.setTimeout(scheduleUpdate, getUpdateDelay(currentRemainingSeconds))
        }

        scheduleUpdate()

        return () => {
            if (timeoutId != null) {
                window.clearTimeout(timeoutId)
            }
        }
    }, [clockOffset, expiresAt])

    return intl.formatMessage(
        { id: 'TRANSACTIONS_LIST_ITEM_LABEL_EXPIRES_IN' },
        { duration },
    )
})
