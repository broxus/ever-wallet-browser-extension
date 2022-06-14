import { closeCurrentWindow } from '@app/background';
import { DeployMessageToPrepare, WalletMessageToSend } from '@app/models';
import { AccountabilityStore, createEnumField, RpcStore } from '@app/popup/modules/shared';
import { parseError, prepareKey } from '@app/popup/utils';
import { Logger, NATIVE_CURRENCY } from '@app/shared';
import type nt from '@wallet/nekoton-wasm';
import { autorun, makeAutoObservable, runInAction } from 'mobx';
import { Disposable, injectable } from 'tsyringe';
import { MultisigData } from '../MultisigForm';

@injectable()
export class DeployMultisigWalletViewModel implements Disposable {
  step = createEnumField(Step, Step.EnterData);
  multisigData: MultisigData | undefined;
  inProcess = false;
  error = '';
  fees = '';

  private disposer: () => void;

  constructor(
    private rpcStore: RpcStore,
    private accountability: AccountabilityStore,
    private logger: Logger,
  ) {
    makeAutoObservable<DeployMultisigWalletViewModel, any>(this, {
      rpcStore: false,
      accountability: false,
      logger: false,
    });

    this.disposer = autorun(async () => {
      if (this.isDeployed) return;

      try {
        const fees = await this.rpcStore.rpc.estimateDeploymentFees(this.address);

        runInAction(() => {
          this.fees = fees;
        });
      } catch (e) {
        this.logger.error(e);
      }
    });
  }

  dispose(): void {
    this.disposer();
  }

  get selectedAccount(): nt.AssetsList | undefined {
    return this.accountability.selectedAccount;
  }

  get tonWalletAsset(): nt.TonWalletAsset {
    return this.selectedAccount!.tonWallet;
  }

  get address() {
    return this.tonWalletAsset.address;
  }

  get isDeployed(): boolean {
    return this.tonWalletState?.isDeployed ?? false;
  }

  get tonWalletState(): nt.ContractState | undefined {
    return this.accountability.tonWalletState;
  }

  get selectedDerivedKeyEntry() {
    return this.tonWalletAsset.publicKey ? this.accountability.storedKeys[this.tonWalletAsset.publicKey] : undefined;
  }

  sendMessage = (message: WalletMessageToSend) => {
    this.rpcStore.rpc.sendMessage(this.address, message).catch(this.logger.error);
    closeCurrentWindow().catch(this.logger.error);
  };

  onSubmit = async (password: string) => {
    if (!this.selectedDerivedKeyEntry) return;

    const keyPassword = prepareKey(this.selectedDerivedKeyEntry, password, {
      address: this.address,
      amount: '0',
      asset: NATIVE_CURRENCY,
      decimals: 9,
    });
    const params: DeployMessageToPrepare = {
      type: 'multiple_owners',
      custodians: this.multisigData?.custodians || [],
      reqConfirms: parseInt(this.multisigData?.reqConfirms as unknown as string) || 0,
    };

    this.error = '';
    this.inProcess = true;

    try {
      const signedMessage = await this.rpcStore.rpc.prepareDeploymentMessage(this.address, params, keyPassword);

      this.sendMessage({ signedMessage, info: { type: 'deploy', data: undefined } });
    } catch (e) {
      runInAction(() => {
        this.error = parseError(e);
      });
    } finally {
      runInAction(() => {
        this.inProcess = false;
      });
    }
  };

  onNext = (data: MultisigData) => {
    this.multisigData = data;
    this.step.setDeployMessage();
  };
}

export enum Step {
  EnterData,
  DeployMessage,
}
