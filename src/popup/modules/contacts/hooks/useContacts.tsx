import { useMemo } from 'react'

import { useSlidingPanel } from '@app/popup/modules/shared'
import { RawContact } from '@app/models'

import { AddContact } from '../components/AddContact'
import { EditContact } from '../components/EditContact'
import { ContactDetails } from '../components/ContactDetails'

export function useContacts() {
    const panel = useSlidingPanel()

    return useMemo(() => ({
        add(contact?: RawContact): void {
            panel.open({
                render: () => <AddContact contact={contact} onResult={panel.close} />,
            })
        },
        edit(contact: RawContact): void {
            panel.open({
                render: () => <EditContact contact={contact} onResult={panel.close} />,
            })
        },
        details(contact: RawContact): void {
            panel.open({
                showClose: false,
                render: () => <ContactDetails contact={contact} onClose={panel.close} />,
            })
        },
    }), [panel])
}
