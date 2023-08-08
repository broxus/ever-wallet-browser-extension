import { useMemo } from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { ParamsPanel, useAsyncData, useResolve } from '@app/popup/modules/shared'
import { convertAddress, isNativeAddress } from '@app/shared'
import { ContactsStore } from '@app/popup/modules/contacts'

import './EnterSendPassword.module.scss'

interface Props {
    recipient: string;
}

export const Recipient = observer(({ recipient }: Props): JSX.Element | null => {
    const contactsStore = useResolve(ContactsStore)
    const intl = useIntl()
    const resolvedAddress = useAsyncData(
        useMemo(
            () => (!contactsStore.checkAddress(recipient)
                ? contactsStore.resolveDensPath(recipient)
                : Promise.resolve(contactsStore.tryRepackAddress(recipient))),
            [recipient],
        ),
    )

    if (isNativeAddress(recipient)) {
        return (
            <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_RECIPIENT' })}>
                {convertAddress(recipient)}
            </ParamsPanel.Param>
        )
    }

    return (
        <>
            <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_RECIPIENT' })}>
                {recipient}
            </ParamsPanel.Param>
            <ParamsPanel.Param label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_ADDRESS' })}>
                {convertAddress(resolvedAddress)}
            </ParamsPanel.Param>
        </>
    )
})
