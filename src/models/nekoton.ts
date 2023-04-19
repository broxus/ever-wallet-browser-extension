import type * as nekoton from '@broxus/ever-wallet-wasm'
import type * as standalone from 'nekoton-wasm'

export type Nekoton = Omit<typeof nekoton, 'default' | 'initSync' | 'InitOutput' | 'InitInput'>;
export type StandaloneNekoton = Omit<typeof standalone, 'default' | 'initSync' | 'InitOutput' | 'InitInput'>;
