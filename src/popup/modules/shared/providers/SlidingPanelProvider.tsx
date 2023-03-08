import { createContext, PropsWithChildren, useMemo } from 'react'
import { Observer } from 'mobx-react-lite'
import { action, makeObservable, observable, runInAction } from 'mobx'

import { SlidingPanel, SlidingPanelProps } from '../components/SlidingPanel'

let globalId = 1

export const SlidingPanelContext = createContext<PanelController>(null!)

export function SlidingPanelProvider({ children }: PropsWithChildren<{}>): JSX.Element {
    const panels = useMemo(() => observable.array<JSX.Element>([], { deep: false }), [])
    const controller: PanelController = useMemo(() => ({
        add() {
            const id = `panel-${globalId++}`
            const vm = createViewModel(id)
            const panel = (
                <Observer key={id}>
                    {() => (
                        <SlidingPanel {...vm.params?.props} active={vm.active} onClose={vm.close}>
                            {vm.params?.render()}
                        </SlidingPanel>
                    )}
                </Observer>
            )

            queueMicrotask(() => {
                // prevent react error https://reactjs.org/link/setstate-in-render
                runInAction(() => panels.push(panel))
            })

            return vm as PanelView
        },
        remove(id: string): void {
            const index = panels.findIndex(({ key }) => key === id)
            if (index !== -1) {
                runInAction(() => panels.splice(index, 1))
            }
        },
    }), [])

    return (
        <SlidingPanelContext.Provider value={controller}>
            {children}
            <Observer render={() => panels.slice() as any} />
        </SlidingPanelContext.Provider>
    )
}

function createViewModel(id: string) {
    const vm = {
        id,
        active: false,
        params: null as PanelViewParams | null,
        open(params: PanelViewParams) {
            this.active = true
            this.params = params
        },
        close() {
            this.active = false
            this.params?.onClose?.()
        },
    }

    makeObservable(vm, {
        active: observable,
        params: observable,
        open: action.bound,
        close: action.bound,
    })

    return vm
}

export interface PanelController {
    add(): PanelView;
    remove(id: string): void;
}

export interface PanelView {
    readonly id: string;
    open(params: PanelViewParams): void;
    close(): void;
}

export interface PanelViewParams {
    render: () => JSX.Element | null;
    onClose?: () => void;
    props?: Omit<SlidingPanelProps, 'active' | 'onClose'>;
}
