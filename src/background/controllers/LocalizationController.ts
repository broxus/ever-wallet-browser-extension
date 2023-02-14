import { NekotonRpcError, RpcErrorCode } from '@app/models'

import { BaseConfig, BaseController, BaseState } from './BaseController'
import { Deserializers, Storage } from '../utils/Storage'

interface LocalizationControllerConfig extends BaseConfig {
    storage: Storage<LocalizationStorage>,
}

interface LocalizationControllerState extends BaseState {
    selectedLocale: string;
}

function makeDefaultState(): LocalizationControllerState {
    return {
        selectedLocale: DEFAULT_LOCALE,
    }
}

const DEFAULT_LOCALE: string = 'en'
const locales = new Set(['en', 'ko', 'ja', 'id'])

export class LocalizationController extends BaseController<LocalizationControllerConfig, LocalizationControllerState> {

    constructor(config: LocalizationControllerConfig, state?: LocalizationControllerState) {
        super(config, state || makeDefaultState())

        this.initialize()
    }

    public initialSync() {
        const selectedLocale = this.config.storage.snapshot.selectedLocale ?? DEFAULT_LOCALE
        this.update({ selectedLocale })
    }

    public async setLocale(locale: string) {
        if (!locales.has(locale)) {
            throw new NekotonRpcError(
                RpcErrorCode.RESOURCE_UNAVAILABLE,
                `Locale "${locale}" is not supported.`,
            )
        }

        await this.config.storage.set({ selectedLocale: locale })
        this.update({ selectedLocale: locale })
    }

}

interface LocalizationStorage {
    selectedLocale: string;
}

Storage.register<LocalizationStorage>({
    selectedLocale: { deserialize: Deserializers.string },
})
