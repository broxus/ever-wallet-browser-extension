import type * as nt from '@broxus/ever-wallet-wasm';
import { makeAutoObservable, runInAction } from 'mobx';
import { ChangeEvent } from 'react';
import { inject, injectable } from 'tsyringe';

import { parseError } from '@app/popup/utils';
import {
    AccountabilityStore,
    createEnumField,
    LocalizationStore,
    NekotonToken,
    NotificationStore,
    Router,
    RpcStore,
    ConnectionStore,
    SettingsStore,
} from '@app/popup/modules/shared';
import type { ConnectionDataItem, Nekoton, UserMnemonic } from '@app/models';
import { getDefaultContractType } from '@app/shared/contracts';
import { getContractName, type ConnectionConfig } from '@app/shared';
import { LedgerUtils } from '@app/popup/modules/ledger/utils/LedgerUtils';

@injectable()
export class CreateSeedViewModel {
    public name: string | undefined;

    public loading = false;

    public error = '';

    public flow = AddSeedFlow.Create;

    public step = createEnumField<typeof Step>(Step.Index);

    private _seed: nt.GeneratedMnemonic | null = null;

    private userMnemonic?: UserMnemonic = undefined;

    constructor(
        public ledger: LedgerUtils,
        @inject(NekotonToken) private nekoton: Nekoton,
        private router: Router,
        private rpcStore: RpcStore,
        private accountability: AccountabilityStore,
        private notification: NotificationStore,
        private localization: LocalizationStore,
        private connectionStore: ConnectionStore,
        private settings: SettingsStore,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true });

        this.name = localization.intl.formatMessage(
            { id: 'SEED' },
            { number: this.accountability.masterKeys.length + 1 },
        );
    }

    public get seed(): nt.GeneratedMnemonic {
        if (!this._seed) {
            this._seed = this.nekoton.generateMnemonic(
                this.nekoton.makeBip39Mnemonic({ accountId: 0, path: 'ever', entropy: 'bits128' }),
            );
        }

        return this._seed;
    }

    public get seedWords(): string[] {
        return this.seed.phrase.split(' ');
    }

    public get countSeeds(): number {
        return this.accountability.masterKeys.length;
    }

    public get config(): ConnectionConfig {
        return this.connectionStore.connectionConfig;
    }

    public get selectedConnection(): ConnectionDataItem {
        return this.connectionStore.selectedConnection;
    }

    public onNameChange(e: ChangeEvent<HTMLInputElement>): void {
        this.name = e.target.value;
    }

    public onFlowChange(value: AddSeedFlow): void {
        this.flow = value;
    }

    public async onSubmit(password: string, cache: boolean): Promise<void> {
        this.loading = true;

        try {
            let nameToSave = this.name?.trim();
            if (nameToSave?.length === 0) {
                nameToSave = undefined;
            }

            const key = await this.rpcStore.rpc.createMasterKey(
                {
                    select: false,
                    seed: this.seed,
                    name: nameToSave,
                    password,
                },
                this.userMnemonic,
            );

            if (this.flow === AddSeedFlow.Create) {
                const account = await this.createSeed(key);
                await this.router.navigate(`/success/seed/${key.publicKey}/${account.tonWallet.address}`);
            }

            if (this.flow === AddSeedFlow.Import || this.flow === AddSeedFlow.ImportLegacy) {
                const keysToScan = this.accountability.getKeysToScan(key, password);
                const account = await this.scanSeed(keysToScan);
                if (account) await this.router.navigate(`/success/seed/${key.publicKey}/${account.tonWallet.address}`);
                else {
                    this.accountability.onManageMasterKey(key);
                    this.accountability.onManageDerivedKey(key);

                    await this.router.navigate('../../seed');
                }
            }

            this.settings.update({
                [key.masterKey]: { cache },
            });
        } catch (e: any) {
            runInAction(() => {
                this.error = parseError(e);
            });
        } finally {
            runInAction(() => {
                this.loading = false;
            });
        }
    }

    public onNext(): void {
        switch (this.step.value) {
            case Step.ShowPhrase:
                this.step.setValue(Step.CheckPhrase);
                break;

            case Step.CheckPhrase:
                this.step.setValue(Step.PasswordRequest);
                break;

            default:
                if (this.flow === AddSeedFlow.Create) {
                    this.step.setValue(Step.ShowPhrase);
                } else if (this.flow === AddSeedFlow.Import || this.flow === AddSeedFlow.ImportLegacy) {
                    this.step.setValue(Step.ImportPhrase);
                } else if (this.flow === AddSeedFlow.ConnectLedger) {
                    this.connectLedger();
                }
        }
    }

    public onImportSubmit(words: string[], userMnemonic?: UserMnemonic): void {
        const phrase = words.join(' ');

        const mnemonicType: nt.MnemonicType =
            this.flow === AddSeedFlow.Import
                ? userMnemonic === 'TONTypesWallet'
                    ? { type: 'bip39', data: { accountId: 0, path: 'ton', entropy: 'bits128' } }
                    : { type: 'bip39', data: { accountId: 0, path: 'ever', entropy: 'bits128' } }
                : userMnemonic === 'TONBip39'
                  ? { type: 'bip39', data: { accountId: 0, path: 'ton', entropy: 'bits256' } }
                  : { type: 'legacy' };

        try {
            this.nekoton.validateMnemonic(phrase, mnemonicType);
            this.userMnemonic = userMnemonic;
            this._seed = { phrase, mnemonicType };
            this.step.setValue(Step.PasswordRequest);
        } catch (_) {
            this.notification.error(this.localization.intl.formatMessage({ id: 'THE_SEED_WRONG' }));
        }
    }

    public onBack(): void {
        this.error = '';

        switch (this.step.value) {
            case Step.ShowPhrase:
            case Step.ImportPhrase:
                this.step.setValue(Step.Index);
                break;

            case Step.CheckPhrase:
                this.step.setValue(Step.ShowPhrase);
                break;

            case Step.PasswordRequest:
                if (this.flow === AddSeedFlow.Create) {
                    this.step.setValue(Step.ShowPhrase);
                } else if (this.flow === AddSeedFlow.Import || this.flow === AddSeedFlow.ImportLegacy) {
                    this.step.setValue(Step.ImportPhrase);
                } else if (this.flow === AddSeedFlow.ConnectLedger) {
                    this.step.setValue(Step.ConnectLedger);
                }
                break;

            default:
                this.step.setValue(Step.Index);
                break;
        }
    }

    public getBip39Hints(word: string): string[] {
        return this.nekoton.getBip39Hints(word);
    }

    public async onLedgerSuccess() {
        this.loading = true;

        try {
            let nameToSave = this.name?.trim();
            if (nameToSave?.length === 0) {
                nameToSave = undefined;
            }

            const key = await this.rpcStore.rpc.createLedgerKey({ accountId: 0 });

            if (nameToSave) {
                await this.rpcStore.rpc.updateMasterKeyName(key.publicKey, nameToSave);
            }

            const keysToScan = this.accountability.getLedgerKeysToScan(key);
            const account = await this.scanSeed(keysToScan);

            if (account) await this.router.navigate(`/success/seed/${key.publicKey}/${account.tonWallet.address}`);
        } catch (e: any) {
            runInAction(() => {
                this.error = parseError(e);
            });
        } finally {
            runInAction(() => {
                this.loading = false;
            });
        }
    }

    private async connectLedger(): Promise<void> {
        const connected = await this.ledger.checkLedger();

        if (!connected) {
            this.step.setValue(Step.ConnectLedger);
        } else {
            await this.onLedgerSuccess();
        }
    }

    private async createSeed(key: nt.KeyStoreEntry) {
        const { selectedConnectionNetworkGroup, connectionConfig, workchainId } = this.connectionStore;
        const contractType = getDefaultContractType(selectedConnectionNetworkGroup, connectionConfig);
        const account = await this.rpcStore.rpc.createAccount(
            {
                name: getContractName(contractType, selectedConnectionNetworkGroup, connectionConfig),
                publicKey: key.publicKey,
                workchain: workchainId,
                contractType,
            },
            false,
        );

        return account;
    }

    private async scanSeed(keys: AsyncIterable<nt.KeyStoreEntry>): Promise<nt.AssetsList> {
        let account: nt.AssetsList;

        for await (const key of keys) {
            const isMasterKey = key.masterKey === key.publicKey;
            const accounts = await this.accountability.addExistingWallets(key.publicKey);

            if (isMasterKey) {
                const { selectedConnectionNetworkGroup, connectionConfig, workchainId } = this.connectionStore;
                const contractType = getDefaultContractType(selectedConnectionNetworkGroup, connectionConfig);
                account =
                    accounts.at(0) ??
                    (await this.rpcStore.rpc.createAccount(
                        {
                            name: getContractName(contractType, selectedConnectionNetworkGroup, connectionConfig),
                            publicKey: key.publicKey,
                            workchain: workchainId,
                            contractType,
                        },
                        false,
                    ));
            }

            if (!isMasterKey && !accounts.length && !this.accountability.accountsByPublicKey[key.publicKey]) {
                await this.rpcStore.rpc.removeKey({ publicKey: key.publicKey });
                // stop scanning on first empty key
                break;
            }
        }

        // The master key will always be scanned first and default account will be created for it if not exists, so account will always be defined
        return account!;
    }
}

export enum AddSeedFlow {
    Create,
    Import,
    ImportLegacy,
    ConnectLedger,
}

export enum Step {
    Index,
    ShowPhrase,
    CheckPhrase,
    PasswordRequest,
    ImportPhrase,
    ConnectLedger,
}

export interface OptionType {
    key: AddSeedFlow;
    value: AddSeedFlow;
    label: string;
}
