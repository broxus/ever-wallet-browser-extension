import { useMemo } from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { ParamsPanel, useAsyncData, useResolve } from '@app/popup/modules/shared'
import { convertAddress, isNativeAddress } from '@app/shared'
import { ContactsStore } from '@app/popup/modules/contacts'

import './EnterSendPassword.scss'

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
