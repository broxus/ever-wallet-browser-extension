import { computed, makeObservable } from 'mobx'
import { singleton } from 'tsyringe'

import { DomainMetadata } from '@app/shared'

import { StandaloneStore } from '../../store'

@singleton()
export class WebsiteIconViewModel {

    constructor(private standaloneStore: StandaloneStore) {
        makeObservable(this, {
            domainMetadata: computed,
        })
    }

    public get domainMetadata(): DomainMetadata | undefined {
        return this.standaloneStore.state.domainMetadata
    }

}
