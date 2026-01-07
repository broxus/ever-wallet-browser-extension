import type * as nt from '@broxus/ever-wallet-wasm'
import BigNumber from 'bignumber.js'
import { makeAutoObservable, runInAction } from 'mobx'
import { inject, injectable } from 'tsyringe'
import type { ErrorOption } from 'react-hook-form'

import type { ConnectionDataItem, JettonSymbol, Nekoton, TokenMessageToPrepare, TransferMessageToPrepare } from '@app/models'
import { AccountabilityStore, ConnectionStore, LocalizationStore, Logger, NekotonToken, Router, RpcStore, Token, TokensStore, Utils } from '@app/popup/modules/shared'
import { convertCurrency, isMasterchain, isNativeAddress, isTokenSymbol, MULTISIG_UNCONFIRMED_LIMIT, parseAddress, parseCurrency, parseEvers, SelectedAsset, TokenWalletState } from '@app/shared'
import { ContactsStore } from '@app/popup/modules/contacts'

import { AssetTransferStore, MessageParams } from '../../store'
import { GaslessTokenTransferStore } from '../../store/GaslessTokenTransferStore'

@injectable()
export class PrepareMessageViewModel {

    public setFormError!: (field: keyof MessageFormData, error: ErrorOption) => void

    public loading = false

    public error = ''

    public commentVisible = false

    public gas = ''

    public isGassless = false

    public gasLoaded = false

    constructor(
        public transfer: AssetTransferStore,
        public gasslessTransfer: GaslessTokenTransferStore,
        private router: Router,
        @inject(NekotonToken) private nekoton: Nekoton,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private localization: LocalizationStore,
        private connectionStore: ConnectionStore,
        private contactsStore: ContactsStore,
        private tokensStore: TokensStore,
        private utils: Utils,
        private logger: Logger,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })

        utils.autorun(async () => {
            const isGassless = await this.checkGasslessToken()
            runInAction(() => {
                this.gas = ''
                this.gasLoaded = false
                this.isGassless = isGassless
            })

            try {
                if (isGassless) {
                    await this.estimateGasslessTransfer()
                }
                else {
                    await this.estimateTransfer()
                }
            }
            catch (e) {
                this.logger.error(e)
            }
            finally {
                runInAction(() => {
                    this.gasLoaded = true
                })
            }
        })
    }

    public get account(): nt.AssetsList {
        return this.transfer.account
    }

    public get asset(): SelectedAsset {
        return this.transfer.asset
    }

    public get key(): nt.KeyStoreEntry | undefined {
        return this.transfer.key
    }

    public get everWalletState(): nt.ContractState | undefined {
        return this.accountability.accountContractStates[this.account.tonWallet.address]
    }

    public get tokenWalletStates(): Record<string, TokenWalletState> {
        return this.accountability.accountTokenStates?.[this.account.tonWallet.address] ?? {}
    }

    public get knownTokens(): Record<string, nt.Symbol | JettonSymbol> {
        return this.rpcStore.state.knownTokens
    }

    public get symbol(): nt.Symbol | JettonSymbol | undefined {
        if (this.asset.type === 'ever_wallet') return undefined
        return this.knownTokens[this.asset.data.rootTokenContract]
    }

    public get token(): Token | undefined {
        if (this.asset.type === 'ever_wallet') return undefined
        return this.tokensStore.tokens[this.asset.data.rootTokenContract]
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.rpcStore.state.selectedConnection
    }

    public get everWalletAsset(): nt.TonWalletAsset {
        return this.account.tonWallet
    }

    public get walletInfo(): nt.TonWalletDetails {
        const { address, contractType } = this.everWalletAsset
        return this.accountability.accountDetails[address] ?? this.nekoton.getContractTypeDefaultDetails(contractType)
    }

    public get balance(): string {
        return this.asset.type === 'token_wallet'
            ? this.tokenWalletStates[this.asset.data.rootTokenContract]?.balance || '0'
            : this.everWalletState?.balance || '0'
    }

    public get decimals(): number {
        return this.asset.type === 'token_wallet' ? this.symbol?.decimals ?? 0 : this.connectionStore.decimals
    }

    public get currencyName(): string | undefined {
        return this.asset.type === 'token_wallet'
            ? this.token?.symbol ?? this.symbol?.name
            : this.connectionStore.symbol
    }

    public get old(): boolean {
        if (this.symbol && isTokenSymbol(this.symbol)) {
            return this.symbol.version === 'OldTip3v4'
        }

        return false
    }

    public get isMultisigLimit(): boolean {
        const { requiredConfirmations } = this.walletInfo
        const { address } = this.everWalletAsset

        if (!requiredConfirmations || requiredConfirmations === 1) return false

        return Object.keys(
            this.rpcStore.state.accountUnconfirmedTransactions[address] ?? {},
        ).length >= MULTISIG_UNCONFIRMED_LIMIT
    }

    public onChangeAsset(asset: SelectedAsset): void {
        this.transfer.setAsset(asset)
    }

    public get isTon(): boolean {
        return this.connectionStore.selectedConnectionNetworkType === 'ton'
    }

    public async checkGasslessToken() {
        if (!this.key) return false

        const isLedger = this.key.signerName === 'ledger_key'
        const isNative = this.asset.type === 'ever_wallet'

        let isGassLess = false
        if (!isNative) {
            isGassLess = await this.gasslessTransfer.checkGasslessToken(
                this.asset.data.rootTokenContract,
                this.accountability.selectedAccount?.tonWallet.contractType,
            )
        }

        return !(isLedger || isNative || !isGassLess)
    }

    public async submit(data: MessageFormData): Promise<void> {
        if (!this.key) {
            this.error = this.localization.intl.formatMessage({
                id: 'ERROR_SIGNER_KEY_NOT_SELECTED',
            })
            return
        }

        const isGassLess = await this.checkGasslessToken()

        if (!isGassLess) {
            await this.submitBasicMessageParams(this.key.publicKey, data)
        }
        else {
            await this.submitGasslessMessageParams(this.key.publicKey, data)
        }

        this.router.navigate('/confirm')
    }

    private async submitBasicMessageParams(publicKey: string, data:MessageFormData) {
        const { address, densPath } = await this.contactsStore.resolveAddress(data.recipient.trim())

        if (!address) {
            this.setFormError('recipient', { type: 'invalid' })
            return
        }

        await this.contactsStore.addRecentContacts([{ type: 'address', value: densPath ?? address }])

        let messageParams: MessageParams,
            messageToPrepare: TransferMessageToPrepare
        const plain = this.isTon

        if (this.asset.type === 'ever_wallet') {
            messageToPrepare = {
                publicKey,
                params: [{
                    recipient: this.nekoton.repackAddress(address), // shouldn't throw exceptions due to higher level validation
                    amount: parseEvers(data.amount.trim()),
                    payload: data.comment ? this.nekoton.encodeComment(data.comment, plain) : undefined,
                }],
            }
            messageParams = {
                amount: { type: 'ever_wallet', data: { amount: parseEvers(data.amount.trim()) }},
                originalAmount: data.amount,
                recipient: densPath ?? address,
                comment: data.comment,
                notify: data.notify,
            }
        }
        else {
            if (typeof this.decimals !== 'number') {
                this.error = 'Invalid decimals'
                return
            }

            const tokenAmount = parseCurrency(data.amount.trim(), this.decimals)
            const tokenRecipient = this.nekoton.repackAddress(address)

            const internalMessage = await this.prepareTokenMessage(
                this.everWalletAsset.address,
                this.asset.data.rootTokenContract,
                {
                    amount: tokenAmount,
                    recipient: tokenRecipient,
                    payload: data.comment ? this.nekoton.encodeComment(data.comment, plain) : undefined,
                    notifyReceiver: data.notify,
                },
            )

            messageToPrepare = {
                publicKey,
                params: [{
                    recipient: internalMessage.destination,
                    amount: internalMessage.amount,
                    payload: internalMessage.body,
                }],
            }
            messageParams = {
                amount: {
                    type: 'token_wallet',
                    data: {
                        amount: tokenAmount,
                        attachedAmount: internalMessage.amount,
                        symbol: this.currencyName || '',
                        decimals: this.decimals,
                        rootTokenContract: this.asset.data.rootTokenContract,
                        old: this.old,
                    },
                },
                originalAmount: data.amount,
                recipient: densPath ?? address,
                comment: data.comment,
                notify: data.notify,
            }
        }

        this.transfer.submitMessageParams(messageParams, messageToPrepare)
    }

    private async submitGasslessMessageParams(publicKey: string, data:MessageFormData) {
        if (this.asset.type === 'ever_wallet') return

        const tokenAmount = parseCurrency(data.amount.trim(), this.decimals)

        await this.gasslessTransfer.prepareTransfer({
            publicKey,
            amount: {
                type: 'token_wallet',
                data: {
                    amount: tokenAmount,
                    attachedAmount: '',
                    symbol: this.currencyName || '',
                    decimals: this.decimals,
                    rootTokenContract: this.asset.data.rootTokenContract,
                    old: this.old,
                },
            },
            owner: this.everWalletAsset.address,
            rootTokenContract: this.asset.data.rootTokenContract,
            recipient: data.recipient,
            comment: data.comment,
            notifyReceiver: data.notify,
        })
    }

    private async estimateTransfer() {
        const fee = await this.transfer.estimateFees({
            publicKey: this.transfer.key!.publicKey,
            params: [{
                recipient:
                        this.nekoton.repackAddress('0:0000000000000000000000000000000000000000000000000000000000000000'),
                amount: parseCurrency(this.balance, this.decimals),
                payload: undefined,
            }],
        })

        this.gas = BigNumber(convertCurrency(fee ?? '0', this.decimals)).multipliedBy(-1.2).toFormat(this.decimals)
    }

    private async estimateGasslessTransfer() {
        if (this.asset.type === 'ever_wallet') return
        const tokenAmount = parseCurrency('0.01', this.decimals)
        const fee = await this.gasslessTransfer.estimateFees({
            publicKey: this.key!.publicKey,
            amount: {
                type: 'token_wallet',
                data: {
                    amount: tokenAmount,
                    attachedAmount: '',
                    symbol: this.currencyName || '',
                    decimals: this.decimals,
                    rootTokenContract: this.asset.data.rootTokenContract,
                    old: this.old,
                },
            },
            owner: this.everWalletAsset.address,
            rootTokenContract: this.asset.data.rootTokenContract,
            recipient: '0:0000000000000000000000000000000000000000000000000000000000000000',
        })

        this.gas = BigNumber(convertCurrency(fee, this.decimals)).multipliedBy(-1.2).toFixed()
    }


    public validateAddress(value: string): boolean {
        return !!value
            && (value !== this.account.tonWallet.address || this.asset.type === 'ever_wallet') // can't send tokens to myself
            && (this.nekoton.checkAddress(value) || !isNativeAddress(value))
    }

    public validateAmount(value?: string): boolean {
        if (this.decimals == null) {
            return false
        }
        try {
            const current = new BigNumber(
                parseCurrency(value || '', this.decimals),
            )

            if (this.asset.type === 'ever_wallet') {
                return current.isGreaterThanOrEqualTo(this.walletInfo.minAmount)
            }

            return current.isGreaterThan(0)
        }
        catch (e: any) {
            return false
        }
    }

    public validateBalance(value?: string): boolean {
        if (this.decimals == null) {
            return false
        }

        let balance = convertCurrency(this.balance || '0', this.decimals)

        if (this.gasLoaded && !this.gas) return false

        if (this.asset.type === 'ever_wallet') {
            balance = BigNumber.max(0, BigNumber.sum(balance, this.gas || '0')).toFixed()
        }

        if (this.isGassless) {
            balance = BigNumber.max(0, BigNumber.sum(balance, this.gas || '0')).toFixed()
        }

        try {
            const current = new BigNumber(
                value || '',
            )

            return current.isLessThanOrEqualTo(balance)
        }
        catch (e: any) {
            return false
        }
    }

    public validateWorkchain(value:string) {
        if (this.nekoton.checkAddress(value) && isNativeAddress(value)) {
            const [workchain] = parseAddress(value)
            return workchain === this.connectionStore.workchainId || isMasterchain(workchain)
        }

        return true
    }

    public showComment(): void {
        this.commentVisible = true
    }

    public isDens(address: string | undefined): boolean {
        return !!address && !this.nekoton.checkAddress(address) && !isNativeAddress(address)
    }

    private prepareTokenMessage(
        owner: string,
        rootTokenContract: string,
        params: TokenMessageToPrepare,
    ): Promise<nt.InternalMessage> {
        if (this.isTon) {
            return this.rpcStore.rpc.prepareJettonMessage(owner, rootTokenContract, params)
        }

        return this.rpcStore.rpc.prepareTokenMessage(owner, rootTokenContract, params)
    }

}

export interface MessageFormData {
    amount: string;
    comment?: string;
    recipient: string;
    notify: boolean;
}
