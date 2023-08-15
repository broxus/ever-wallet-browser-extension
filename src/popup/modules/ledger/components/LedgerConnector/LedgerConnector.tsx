import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useCallback, useEffect, useRef } from 'react'

import { LEDGER_BRIDGE_URL } from '@app/shared'
import { PageLoader, useViewModel } from '@app/popup/modules/shared'

import { LedgerConnectorViewModel } from './LedgerConnectorViewModel'
import styles from './LedgerConnector.module.scss'

interface Props {
    className?: string;
    theme?: 'sign-in';
    onNext: () => void;
    onBack: () => void;
}

export const LedgerConnector = observer(({ className, theme, onNext, onBack }: Props) => {
    const vm = useViewModel(LedgerConnectorViewModel, (model) => {
        model.onNext = onNext
        model.onBack = onBack
    }, [onNext, onBack])

    if (vm.isPopup) {
        useEffect(() => {
            vm.openLedgerTab()
        }, [])

        return <PageLoader />
    }

    const ref = useRef<HTMLIFrameElement>(null)
    const url = theme === 'sign-in'
        ? `${LEDGER_BRIDGE_URL}?theme=onboarding-sparx`
        : `${LEDGER_BRIDGE_URL}?theme=sparx`

    /**
     * multiple ledger iframe workaround (see LedgerRpcServer)
     * @see {@link LedgerRpcServer}
     */
    const messageHandler = useCallback(async (reply: any) => {
        if (
            typeof reply.data?.action === 'string'
            && reply.data.action.endsWith('-reply')
        ) return

        if (reply.data?.action === 'ledger-bridge-back') {
            onBack()
            return
        }

        const success = await vm.handleMessage(reply)

        if (success) {
            onNext?.()
        }
    }, [])

    const handleLoad = useCallback(() => {
        vm.setLoading(false)
        window.addEventListener('message', messageHandler)
    }, [])

    useEffect(() => () => window.removeEventListener('message', messageHandler), [])

    return (
        <PageLoader active={vm.loading}>
            <div className={classNames(styles.ledgerConnector, className)}>
                <iframe
                    title="ladger"
                    name="ledger-iframe"
                    allow="hid"
                    ref={ref}
                    className={styles.iframe}
                    src={url}
                    onLoad={handleLoad}
                />
            </div>
        </PageLoader>
    )
})
