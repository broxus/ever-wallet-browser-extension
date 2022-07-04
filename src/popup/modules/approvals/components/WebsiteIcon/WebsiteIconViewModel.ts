import { RpcStore } from '@app/popup/modules/shared';
import { DomainMetadata } from '@app/shared';
import { computed, makeObservable } from 'mobx';
import { singleton } from 'tsyringe';

@singleton()
export class WebsiteIconViewModel {
  constructor(private rpcStore: RpcStore) {
    makeObservable(this, {
      domainMetadata: computed,
    });
  }

  get domainMetadata(): { [p: string]: DomainMetadata } {
    return this.rpcStore.state.domainMetadata;
  }
}
