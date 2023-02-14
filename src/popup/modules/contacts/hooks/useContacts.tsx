import { useCallback, useState } from 'react'
import { SlidingPanel } from '@app/popup/modules/shared'

import { AddContact } from '../components/AddContact'
import { EditContact } from '../components/EditContact'
import { ContactDetails } from '../components/ContactDetails'

export function useContacts() {
    const [panel, setPanel] = useState<Panel>()
    const [address, setAddress] = useState<string>()

    const handleClose = useCallback(() => setPanel(undefined), [])

    return {
        add(address?: string): void {
            setAddress(address)
            setPanel(Panel.ADD)
        },
        edit(address: string): void {
            setAddress(address)
            setPanel(Panel.EDIT)
        },
        details(address: string): void {
            setAddress(address)
            setPanel(Panel.DETAILS)
        },
        panel: (
            <SlidingPanel showClose={panel !== Panel.DETAILS} active={!!panel} onClose={handleClose}>
                {panel === Panel.ADD && (
                    <AddContact address={address} onBack={handleClose} onResult={handleClose} />
                )}
                {panel === Panel.EDIT && address && (
                    <EditContact address={address} onBack={handleClose} onResult={handleClose} />
                )}
                {panel === Panel.DETAILS && address && (
                    <ContactDetails address={address} onClose={handleClose} />
                )}
            </SlidingPanel>
        ),
    }
}

export enum Panel {
    ADD = 1,
    EDIT,
    DETAILS,
}
