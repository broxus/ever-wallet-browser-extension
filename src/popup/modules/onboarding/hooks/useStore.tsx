import React from 'react'

type Store = {
    init?(): void;
    dispose?(): void;
    [key: string]: any;
}

const ctxs = new Map<any, React.Context<any>>()

export function useStore<S extends Store>(store: { new(...args: any[]): S }): S {
    const ctx = ctxs.get(store)

    if (!ctx) {
        throw new Error(`${store.name} context not found`)
    }

    const result = React.useContext(ctx)

    if (result === undefined) {
        throw new Error(`${store.name} must be defined`)
    }

    return result
}

type ProviderProps<S> = {
    children: React.ReactNode | ((store: S) => React.ReactNode);
}

export function useProvider<S extends Store, A extends any[]>(
    Store: { new(...args: A): S },
    ...deps: A
): (props: ProviderProps<S>) => JSX.Element {
    let ctx = ctxs.get(Store)

    if (!ctx) {
        ctx = React.createContext<S | undefined>(undefined)
        ctx.displayName = Store.name
        ctxs.set(Store, ctx)
    }

    const CtxProvider = ctx.Provider

    return React.useCallback(
        ({ children }: ProviderProps<S>) => {
            const ref = React.useRef<S>()
            ref.current = ref.current || new Store(...deps)

            React.useEffect(() => {
                ref.current?.init?.()
                return () => {
                    ref.current?.dispose?.()
                }
            }, [])

            return (
                <CtxProvider value={ref.current}>
                    {typeof children === 'function' ? children(ref.current) : children}
                </CtxProvider>
            )
        },
        deps,
    )
}
