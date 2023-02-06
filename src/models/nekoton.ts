import type nekoton from '@broxus/ever-wallet-wasm'
import type * as standalone from 'nekoton-wasm'

export type Nekoton = typeof nekoton;
export type StandaloneNekoton = Omit<typeof standalone, 'default' | 'initSync' | 'InitOutput' | 'InitInput'>;
