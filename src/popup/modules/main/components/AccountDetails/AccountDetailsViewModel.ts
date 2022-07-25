import type nt from '@wallet/nekoton-wasm'
import {
    makeAutoObservable, reaction, runInAction, when,
} from 'mobx'
import { Disposable, injectable } from 'tsyringe'

import { getScrollWidth } from '@app/popup/utils'
import {
    AccountabilityStore, DrawerContext, Panel, RpcStore,
} from '@app/popup/modules/shared'

@injectable()
export class AccountDetailsViewModel implements Disposable {

    drawer!: DrawerContext

    carouselIndex = 0

    private disposer: () => void

    constructor(
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
    ) {
        makeAutoObservable<AccountDetailsViewModel, any>(this, {
            rpcStore: false,
            accountability: false,
        })

        this.carouselIndex = Math.max(this.selectedAccountIndex, 0)

        this.disposer = reaction(() => this.accountability.selectedAccountAddress, async () => {
            await when(() => this.selectedAccountIndex !== -1)

            runInAction(() => {
                this.carouselIndex = this.selectedAccountIndex
            })
        })
    }

    dispose(): void | Promise<void> {
        this.disposer()
    }

    get tonWalletState(): nt.ContractState | undefined {
        return this.accountability.tonWalletState
    }

    get accounts(): Array<{ account: nt.AssetsList, state: nt.ContractState | undefined }> {
        return this.accountability.accounts.map(account => ({
            account,
            state: this.accountability.accountContractStates[account.tonWallet.address],
        }))
    }

    get isDeployed(): boolean {
        return this.tonWalletState?.isDeployed || this.accountability.selectedAccount?.tonWallet.contractType === 'WalletV3'
    }

    private get selectedAccountIndex(): number {
        const address = this.accountability.selectedAccountAddress
        return this.accountability.accounts.findIndex(account => account.tonWallet.address === address)
    }

    onReceive = () => this.drawer.setPanel(Panel.RECEIVE)

    onDeploy = () => this.drawer.setPanel(Panel.DEPLOY)

    onSend = async () => {
        await this.rpcStore.rpc.openExtensionInExternalWindow({
            group: 'send',
            width: 360 + getScrollWidth() - 1,
            height: 600 + getScrollWidth() - 1,
        })
    }

    onSlide = async (index: number) => {
        const account = this.accountability.accounts.length === index
            ? this.accountability.accounts[index - 1] // if not a last slide
            : this.accountability.accounts[index]

        this.carouselIndex = index

        if (!account || account.tonWallet.address === this.accountability.selectedAccountAddress) {
            return
        }

        await this.rpcStore.rpc.selectAccount(account.tonWallet.address)
    }

    addAccount = () => {
        const masterKey = this.accountability.masterKeys.find(
            key => key.masterKey === this.accountability.selectedMasterKey,
        )

        this.accountability.setCurrentMasterKey(masterKey)
        this.drawer.setPanel(Panel.CREATE_ACCOUNT)
    }

}
