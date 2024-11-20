import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { convertCurrency, delay } from '@app/shared'
import type { ConnectionDataItem, TokenWalletsToUpdate } from '@app/models'
import { AccountabilityStore, NotificationStore, RpcStore, SlidingPanelHandle, Token, TokensManifest, TokensStore, Utils } from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'

@injectable()
export class RefreshAssetsViewModel {

    public newTokens: TokenWithBalance[] = []

    public checked = new Set<string>()

    public refreshing = true

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

        utils.when(() => !!this.tokensManifest, this.refresh)
    }

    public get tokensManifest(): TokensManifest | undefined {
        return this.tokensStore.manifest
    }

    public get tokens(): Token[] {
        const tokenWallets = new Set<string>(
            this.tokenWalletAssets.map(({ rootTokenContract }) => rootTokenContract),
        )

        return Object
            .values(this.tokensStore.tokens)
            .filter((token): token is Token => !!token && !tokenWallets.has(token.address))
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.rpcStore.state.selectedConnection
    }

    public get tokenWalletAssets(): nt.TokenWalletAsset[] {
        return this.accountability.selectedAccount?.additionalAssets[this.selectedConnection.group]?.tokenWallets ?? []
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

    private async refresh(): Promise<void> {
        const { selectedAccountAddress } = this.accountability

        try {
            for (const token of this.tokens) {
                try {
                    const balance = await this.rpcStore.rpc.getTokenBalance(
                        selectedAccountAddress!,
                        token.address,
                    )

                    if (balance && balance !== '0') {
                        runInAction(() => {
                            this.newTokens.push({
                                ...token,
                                balance: convertCurrency(balance, token.decimals),
                            })
                        })
                    }

                    await delay(100) // check rate limits
                }
                catch {}
            }
        }
        finally {
            runInAction(() => {
                this.refreshing = false
            })
        }
    }

}

interface TokenWithBalance extends Token {
    balance: string;
}
