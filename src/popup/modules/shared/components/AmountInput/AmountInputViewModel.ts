import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { NATIVE_CURRENCY_DECIMALS, SelectedAsset } from '@app/shared'

import { RpcStore } from '../../store'

@injectable()
export class AmountInputViewModel {

    public asset!: SelectedAsset

    constructor(
        private rpcStore: RpcStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get knownTokens(): Record<string, nt.Symbol> {
        return this.rpcStore.state.knownTokens
    }

    public get symbol(): nt.Symbol | undefined {
        if (this.asset.type === 'ever_wallet') return undefined
        return this.knownTokens[this.asset.data.rootTokenContract]
    }

    public get decimals(): number {
        return this.asset.type === 'token_wallet' ? (this.symbol?.decimals ?? 0) : NATIVE_CURRENCY_DECIMALS
    }

}
