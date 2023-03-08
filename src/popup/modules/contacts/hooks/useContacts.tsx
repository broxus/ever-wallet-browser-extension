import { useMemo } from 'react'

import { useSlidingPanel } from '@app/popup/modules/shared'

import { AddContact } from '../components/AddContact'
import { EditContact } from '../components/EditContact'
import { ContactDetails } from '../components/ContactDetails'

export function useContacts() {
    const panel = useSlidingPanel()

    return useMemo(() => ({
        add(address?: string): void {
            panel.open({
                render: () => <AddContact address={address} onBack={panel.close} onResult={panel.close} />,
            })
        },
        edit(address: string): void {
            panel.open({
                render: () => <EditContact address={address} onBack={panel.close} onResult={panel.close} />,
            })
        },
        details(address: string): void {
            panel.open({
                render: () => <ContactDetails address={address} onClose={panel.close} />,
                props: { showClose: false },
            })
        },
    }), [panel])
}
