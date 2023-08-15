import { ReactElement, useCallback } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { useIntl } from 'react-intl'

import { useResolve } from '../../hooks'
import { NotificationStore } from '../../store'

type Props = {
    text: string;
    children: ReactElement;
};

export function CopyButton({ children, text }: Props): JSX.Element {
    const notification = useResolve(NotificationStore)
    const intl = useIntl()

    const handleCopy = useCallback(() => {
        notification.success(intl.formatMessage({ id: 'COPIED_TOOLTIP' }))
    }, [])

    return (
        <CopyToClipboard text={text} onCopy={handleCopy}>
            {children}
        </CopyToClipboard>
    )
}
