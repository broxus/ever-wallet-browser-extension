import { makeAutoObservable } from 'mobx';
import { injectable } from 'tsyringe';
import type * as nt from '@broxus/ever-wallet-wasm';

import { RpcStore, SlidingPanelHandle } from '@app/popup/modules/shared';

@injectable()
export class ChangeAccountColorViewModel {
    public account!: nt.AssetsList;

    constructor(
        public handle: SlidingPanelHandle,
        private rpcStore: RpcStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true });
    }

    public async updateAccountColor(account: nt.AssetsList, color: string) {
        await this.rpcStore.rpc.updateAccountColor(account.tonWallet.address, color);
    }

    public get accountColor(): string {
        return this.rpcStore.state.accountsColor[this.account.tonWallet.address];
    }
}
