import type * as nt from '@broxus/ever-wallet-wasm'
import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { closeCurrentWindow, convertCurrency, convertEvers } from '@app/shared'
import { AccountabilityStep, AccountabilityStore, AppConfig, ConnectionStore, Router, RpcStore, SlidingPanelStore, TokensStore } from '@app/popup/modules/shared'
import { ContactsStore } from '@app/popup/modules/contacts'
import { ConnectionDataItem, DensContact } from '@app/models'
import BigNumber from 'bignumber.js'
import browser from 'webextension-polyfill'

@injectable()
export class ManageAccountViewModel {

    constructor(
        public panel: SlidingPanelStore,
        private router: Router,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private config: AppConfig,
        private contactsStore: ContactsStore,
        private tokensStore: TokensStore,
        private connectionStore: ConnectionStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get isVisible(): boolean {
        if (!this.currentAccount) return false
        return this.accountability.accountsVisibility[this.currentAccount.tonWallet.address]
    }

    public get isActive(): boolean {
        const { currentAccount, selectedAccount } = this.accountability
        return currentAccount?.tonWallet.address === selectedAccount?.tonWallet.address
    }

    public get linkedKeys(): Item[] {
        const publicKey = this.accountability.currentAccount?.tonWallet.publicKey
        const address = this.accountability.currentAccount?.tonWallet.address
        const { storedKeys } = this.accountability

        const keys = Object.values(storedKeys).filter(
            key => key.publicKey === publicKey,
        )

        const externalAccount = this.accountability.externalAccounts.find(
            account => account.address === address,
        )

        if (externalAccount !== undefined) {
            keys.push(
                ...externalAccount.externalIn
                    .map(key => storedKeys[key])
                    .filter(e => e),
            )
        }

        return keys
            .sort((a, b) => a.accountId - b.accountId)
            .map((key) => ({
                key,
                active: this.currentDerivedKeyPubKey === key.publicKey,
                accounts: this.accountability.accountsByKey[key.publicKey] ?? 0,
            }))
    }

    public get currentAccount(): nt.AssetsList | undefined {
        return this.accountability.currentAccount
    }

    public get densContacts(): DensContact[] {
        if (!this.currentAccount) return []
        return this.contactsStore.densContacts[this.currentAccount.tonWallet.address] ?? []
    }

    public get balance(): string | undefined {
        const { tokens, prices, everPrice } = this.tokensStore
        const { accountContractStates, tokenWalletStates } = this.accountability
        const account = this.currentAccount!
        const balance = accountContractStates[account.tonWallet.address]?.balance

        if (!everPrice || !balance) return undefined

        const assets = account.additionalAssets[this.selectedConnection.group]?.tokenWallets ?? []
        const assetsUsdtTotal = assets.reduce((sum, { rootTokenContract }) => {
            const token = tokens[rootTokenContract]
            const price = prices[rootTokenContract]
            const state = tokenWalletStates[rootTokenContract]

            if (token && price && state) {
                const usdt = new BigNumber(convertCurrency(state.balance, token.decimals)).times(price)
                return BigNumber.sum(usdt, sum)
            }

            return sum
        }, new BigNumber(convertEvers(balance)).times(everPrice))

        return assetsUsdtTotal.toFixed()
    }

    private get selectedConnection(): ConnectionDataItem {
        return this.connectionStore.selectedConnection
    }

    private get currentDerivedKeyPubKey(): string | undefined {
        if (this.accountability.selectedAccount) {
            return this.accountability.storedKeys[this.accountability.selectedAccount.tonWallet.publicKey]?.publicKey
        }

        return undefined
    }

    public async onSelectAccount(): Promise<void> {
        if (this.accountability.currentMasterKey?.masterKey == null) {
            return
        }

        await this.rpcStore.rpc.selectMasterKey(this.accountability.currentMasterKey.masterKey)

        if (!this.accountability.currentAccount) {
            return
        }

        await this.rpcStore.rpc.updateAccountVisibility(this.accountability.currentAccount.tonWallet.address, true)
        await this.rpcStore.rpc.selectAccount(this.accountability.currentAccount.tonWallet.address)

        this.accountability.reset()
        // this.drawer.close()

        if (this.config.activeTab?.type === 'notification') {
            await closeCurrentWindow()
        }
    }

    public onManageDerivedKey(key: nt.KeyStoreEntry): void {
        this.accountability.onManageDerivedKey(key)
        this.router.navigate('../key')
    }

    public async onToggleVisibility(): Promise<void> {
        if (this.accountability.currentAccount && !this.isActive) {
            await this.rpcStore.rpc.updateAccountVisibility(
                this.accountability.currentAccount.tonWallet.address,
                !this.isVisible,
            )
        }
    }

    public async onDelete(): Promise<void> {
        if (!this.currentAccount) return

        await this.rpcStore.rpc.removeAccount(this.currentAccount.tonWallet.address)
        await this.rpcStore.rpc.selectFirstAccount()

        this.router.navigate('../key')
        this.accountability.setCurrentAccountAddress(undefined)
    }

    public async openAccountInExplorer(): Promise<void> {
        if (!this.currentAccount) return
        await browser.tabs.create({
            url: this.connectionStore.accountExplorerLink(this.currentAccount.tonWallet.address),
            active: false,
        })
    }

    public filter(list: Item[], search: string): Item[] {
        return list.filter(({ key }) => key.name.toLowerCase().includes(search))
    }

}

interface Item {
    key: nt.KeyStoreEntry;
    active: boolean;
    accounts: number;
}
