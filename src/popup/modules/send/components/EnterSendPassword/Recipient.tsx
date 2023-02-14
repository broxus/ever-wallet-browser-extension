import { memo, useMemo } from 'react'
import { useIntl } from 'react-intl'

import { ParamsPanel, useAsyncData } from '@app/popup/modules/shared'
import { convertAddress, isNativeAddress } from '@app/shared'

import './EnterSendPassword.scss'

interface Props {
    recipient: string;
    resolveDensPath(path: string): Promise<string | null>;
}

export const Recipient = memo(({ recipient, resolveDensPath }: Props): JSX.Element | null => {
    const intl = useIntl()
    const isNative = isNativeAddress(recipient)
    const resolvedAddress = useAsyncData(
        useMemo(() => (!isNative ? resolveDensPath(recipient) : null), [recipient]),
    )

    if (isNative) {
        return (
            <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_RECIPIENT' })} row>
                {convertAddress(recipient)}
            </ParamsPanel.Param>
        )
    }

    return (
        <>
            <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_RECIPIENT' })} row>
                {recipient}
            </ParamsPanel.Param>
            <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_ADDRESS' })} row>
                {convertAddress(resolvedAddress)}
            </ParamsPanel.Param>
        </>
    )
})
