import { type ReactElement } from 'react'
import { useIntl } from 'react-intl'

import { useResolve } from '../../hooks'
import { NotificationStore } from '../../store'
import { CopyToClipboard } from '../CopyToClipboard'

type Props = {
    text: string;
    children: ReactElement;
    notificationId?: string;
}

export function CopyButton({ children, text, notificationId = 'copy' }: Props) {
    const notification = useResolve(NotificationStore)
    const intl = useIntl()

    const handleCopy = () => notification.success(intl.formatMessage({ id: 'COPIED_TOOLTIP' }), notificationId)

    return (
        <CopyToClipboard text={text} onCopy={handleCopy}>
            {children}
        </CopyToClipboard>
    )
}
