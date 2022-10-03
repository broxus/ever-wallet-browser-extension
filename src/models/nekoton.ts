import type nekoton from '@wallet/nekoton-wasm'
import type * as standalone from 'nekoton-wasm'

export type Nekoton = typeof nekoton;
export type StandaloneNekoton = Omit<typeof standalone, 'default' | 'initSync' | 'InitOutput' | 'InitInput'>;
