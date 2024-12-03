import { useMemo } from 'react'
import { useIntl } from 'react-intl'
import { observer } from 'mobx-react-lite'

import { useAsyncData, useResolve } from '@app/popup/modules/shared'
import { isNativeAddress } from '@app/shared'
import { ContactsStore } from '@app/popup/modules/contacts'
import { Data } from '@app/popup/modules/shared/components/Data'

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
            <Data
                dir="v"
                label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_RECIPIENT' })}
                value={recipient}
            />
        )
    }

    return (
        <>
            <Data
                dir="v"
                label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_RECIPIENT' })}
                value={recipient}
            />
            <hr />
            <Data
                label={intl.formatMessage({ id: 'APPROVE_SEND_MESSAGE_TERM_ADDRESS' })}
                value={resolvedAddress}
            />
        </>
    )
})
