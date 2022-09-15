import { memo } from 'react'

import { LedgerConnector } from '../LedgerConnector'

export const LedgerConnectorPage = memo((): JSX.Element => {
    const handleClose = () => window.close()

    return (
        <LedgerConnector onNext={handleClose} onBack={handleClose} />
    )
})
