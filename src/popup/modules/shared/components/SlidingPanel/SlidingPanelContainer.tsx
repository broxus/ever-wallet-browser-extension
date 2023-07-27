/* eslint-disable react/no-children-prop */
import { observer } from 'mobx-react-lite'
import { memo, PropsWithChildren } from 'react'

import { useChildContainer, useResolve } from '../../hooks'
import { SlidingPanelHandle, SlidingPanelStore } from '../../store'
import { DIProvider } from '../../providers'
import { SlidingPanel } from './SlidingPanel'

type Props = PropsWithChildren<{
    handle: SlidingPanelHandle;
}>

const InternalContainer = memo(({ handle, children }: Props) => {
    const container = useChildContainer((container) => {
        container.registerInstance(SlidingPanelHandle, handle)
    })

    return (
        <DIProvider value={container}>
            {children}
        </DIProvider>
    )
})

export const SlidingPanelContainer = observer((): JSX.Element => (
    <>
        {useResolve(SlidingPanelStore).panels.map((item) => {
            const { render, ...props } = item.params
            return (
                <InternalContainer key={item.id} handle={item.handle}>
                    <SlidingPanel
                        {...props}
                        active={item.active}
                        children={render()}
                        onClose={item.onClose}
                        onClosed={item.onClosed}
                    />
                </InternalContainer>
            )
        })}
    </>
))
