import { ReactNode, useMemo, useRef } from 'react'

import { Confirmation, ConfirmationProps } from '../components/Confirmation'
import { useSlidingPanel } from './useSlidingPanel'

export function useConfirmation() {
    const ref = useRef<(confirmed: boolean) => void>()
    const panel = useSlidingPanel()

    return useMemo(() => ({
        show({ heading, ...params }: Params): Promise<boolean> {
            panel.open({
                title: heading,
                render: () => (
                    <Confirmation
                        {...params}
                        onConfirm={() => {
                            ref.current?.(true)
                            ref.current = undefined
                            panel.close()
                        }}
                        onCancel={() => {
                            ref.current?.(false)
                            ref.current = undefined
                            panel.close()
                        }}
                    />
                ),
                onClose: () => ref.current?.(false),
            })

            return new Promise<boolean>((resolve) => {
                ref.current = resolve
            })
        },
    }), [panel])
}

type Params = {
    heading?: ReactNode
} & Omit<ConfirmationProps, 'onConfirm' | 'onCancel'>
