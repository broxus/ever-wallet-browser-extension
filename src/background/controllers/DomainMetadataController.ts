import { DomainMetadata } from '@app/shared';
import browser from 'webextension-polyfill';
import { BaseConfig, BaseController, BaseState } from './BaseController';

export interface DomainMetadataConfig extends BaseConfig {
  origin: string;
  getDomainMetadata: () => Promise<DomainMetadata>;
}

export interface DomainMetadataState extends BaseState {
  domainMetadata: DomainMetadata | undefined;
}

function makeDefaultState(): DomainMetadataState {
  return {
    domainMetadata: undefined,
  };
}

export class DomainMetadataController extends BaseController<DomainMetadataConfig, DomainMetadataState> {
  constructor(config: DomainMetadataConfig, state?: DomainMetadataState) {
    super(config, state || makeDefaultState());
    this.initialize();
  }

  public async initialSync() {
    let { domainMetadata } = await browser.storage.local.get('domainMetadata');

    if (typeof domainMetadata !== 'object') {
      domainMetadata = {};
    }

    if (domainMetadata[this.config.origin]) {
      this.update({
        domainMetadata: domainMetadata[this.config.origin],
      });
    }

    this.config.getDomainMetadata().then((metadata) => {
      this.addDomainMetadata(metadata);
    });
  }

  private async addDomainMetadata(metadata: DomainMetadata) {
    await this._saveDomainMetadata(metadata);

    this.update({
      domainMetadata: metadata,
    });
  }

  private async _saveDomainMetadata(metadata: DomainMetadata): Promise<void> {
    const domainMetadata = {
      ...(await browser.storage.local.get('domainMetadata')).domainMetadata,
      [this.config.origin]: metadata,
    };

    await browser.storage.local.set({ domainMetadata });
  }
}
