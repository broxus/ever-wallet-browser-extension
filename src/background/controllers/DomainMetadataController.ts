import { DomainMetadata } from '@app/shared'

import { Deserializers, Storage } from '../utils/Storage'
import { BaseConfig, BaseController, BaseState } from './BaseController'

export interface DomainMetadataConfig extends BaseConfig {
    origin: string;
    getDomainMetadata: () => Promise<DomainMetadata>;
    storage: Storage<DomainMetadataStorage>;
}

export interface DomainMetadataState extends BaseState {
    domainMetadata: DomainMetadata | undefined;
}

function makeDefaultState(): DomainMetadataState {
    return {
        domainMetadata: undefined,
    }
}

export class DomainMetadataController extends BaseController<DomainMetadataConfig, DomainMetadataState> {

    constructor(config: DomainMetadataConfig, state?: DomainMetadataState) {
        super(config, state || makeDefaultState())
        this.initialize()
    }

    public initialSync(): void {
        const domainMetadata = this.config.storage.snapshot.domainMetadata ?? {}

        if (domainMetadata[this.config.origin]) {
            this.update({
                domainMetadata: domainMetadata[this.config.origin],
            })
        }

        this.config.getDomainMetadata().then(metadata => {
            this.addDomainMetadata(metadata)
        })
    }

    private async addDomainMetadata(metadata: DomainMetadata) {
        await this._saveDomainMetadata(metadata)

        this.update({
            domainMetadata: metadata,
        })
    }

    private async _saveDomainMetadata(metadata: DomainMetadata): Promise<void> {
        const domainMetadata = {
            ...(await this.config.storage.get('domainMetadata')),
            [this.config.origin]: metadata,
        }

        await this.config.storage.set({ domainMetadata })
    }

}

interface DomainMetadataStorage {
    domainMetadata: Record<string, DomainMetadata>;
}

Storage.register<DomainMetadataStorage>({
    domainMetadata: { deserialize: Deserializers.object },
})
