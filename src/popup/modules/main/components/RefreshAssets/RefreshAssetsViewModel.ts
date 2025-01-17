import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import type { TokenWalletsToUpdate } from '@app/models'
import { AccountabilityStore, NotificationStore, RpcStore, SlidingPanelHandle, TokensManifest, TokensStore, TokenWithBalance, Utils } from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'

@injectable()
export class RefreshAssetsViewModel {

    public checked = new Set<string>()

    public loading = false

    constructor(
        private handle: SlidingPanelHandle,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private tokensStore: TokensStore,
        private notification: NotificationStore,
        private utils: Utils,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get refreshing(): boolean {
        return this.accountability.newTokensLoading
    }

    public get tokensManifest(): TokensManifest | undefined {
        return this.tokensStore.manifest
    }

    public get newTokens(): TokenWithBalance[] {
        return this.accountability.newTokens
    }

    public get prices(): Record<string, string> {
        return this.tokensStore.prices
    }

    public selectAll() {
        this.newTokens.forEach(item => {
            this.checked.add(item.address)
        })
    }

    public toggle(address: string): void {
        if (this.checked.has(address)) {
            this.checked.delete(address)
        }
        else {
            this.checked.add(address)
        }
    }

    public async submit(): Promise<void> {
        if (this.loading) return
        this.loading = true

        try {
            const { selectedAccountAddress } = this.accountability
            const params: TokenWalletsToUpdate = {}

            for (const address of this.checked.values()) {
                params[address] = true
            }

            await this.rpcStore.rpc.updateTokenWallets(selectedAccountAddress!, params)
            this.handle.close()
        }
        catch (e: any) {
            this.notification.error(parseError(e))
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    public close(): void {
        this.handle.close()
    }

}
