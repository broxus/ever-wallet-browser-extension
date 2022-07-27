import { action, computed, makeObservable } from 'mobx'
import { createIntl, createIntlCache, IntlShape } from 'react-intl'
import { singleton } from 'tsyringe'

import { Logger } from '@app/shared'
import {
    en, id, ja, ko,
} from '@app/lang'

import { RpcStore } from './RpcStore'

@singleton()
export class LocalizationStore {

    private cache = createIntlCache()

    private current: IntlShape | undefined

    constructor(
        private rpcStore: RpcStore,
        private logger: Logger,
    ) {
        makeObservable(this, {
            locale: computed,
            intl: computed,
            setLocale: action.bound,
        })
    }

    get locale(): string {
        return this.rpcStore.state.selectedLocale || this.rpcStore.state.defaultLocale
    }

    get intl(): IntlShape {
        if (!this.current || this.current.locale !== this.locale) {
            this.current = createIntl({
                locale: this.locale,
                defaultLocale: this.rpcStore.state.defaultLocale,
                messages: ({ en, ko, ja, id } as { [key: string]: Record<string, string> })[this.locale],
                onError: error => this.logger.error(error),
            }, this.cache)
        }

        return this.current
    }

    async setLocale(locale: string) {
        try {
            await this.rpcStore.rpc.setLocale(locale)
        }
        catch (e) {
            this.logger.error(e)
        }
    }

}
