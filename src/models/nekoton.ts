import { type Address, type ProviderEvent as EverscaleProviderEvent, type ProviderEvents as EverscaleProviderEvents } from 'everscale-inpage-provider'
import type * as nekoton from '@broxus/ever-wallet-wasm'
import type * as standalone from 'nekoton-wasm'

// TODO: refactor like Router
export type Nekoton = Omit<typeof nekoton, 'default' | 'initSync' | 'InitOutput' | 'InitInput'>
export type StandaloneNekoton = Omit<typeof standalone, 'default' | 'initSync' | 'InitOutput' | 'InitInput'>

export type ProviderEvent = EverscaleProviderEvent | 'tonDisconnected'
export type ProviderEvents<Addr> = EverscaleProviderEvents<Addr> & {
    tonDisconnected: undefined
}

export type ProviderEventData<T extends ProviderEvent, Addr = Address> = ProviderEvents<Addr>[T]
export type RawProviderEventData<T extends ProviderEvent> = ProviderEventData<T, string>
