import { Nekoton } from '@app/models';
import { NekotonToken } from '@app/popup/modules/shared';
import { inject, singleton } from 'tsyringe';

@singleton()
export class AccountSelectorViewModel {
  constructor(@inject(NekotonToken) private nekoton: Nekoton) {
  }

  computeTonWalletAddress(publicKey: string): string {
    return this.nekoton.computeTonWalletAddress(publicKey, 'SafeMultisigWallet', 0);
  }
}
