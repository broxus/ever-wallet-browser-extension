import browser from 'webextension-polyfill'

import { NekotonRpcError, RpcErrorCode } from '@app/models'

import { BaseConfig, BaseController, BaseState } from './BaseController'

export type LocalizationControllerConfig = BaseConfig

export interface LocalizationControllerState extends BaseState {
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

    public async initialSync() {
        const selectedLocale = await LocalizationController._loadSelectedLocale() ?? DEFAULT_LOCALE
        this.update({ selectedLocale })
    }

    public async setLocale(locale: string) {
        if (!locales.has(locale)) {
            throw new NekotonRpcError(
                RpcErrorCode.RESOURCE_UNAVAILABLE,
                `Locale "${locale}" is not supported.`,
            )
        }

        await LocalizationController._saveSelectedLocale(locale)
        this.update({ selectedLocale: locale })
    }

    private static async _loadSelectedLocale(): Promise<string | undefined> {
        const { selectedLocale } = await browser.storage.local.get('selectedLocale')
        if (typeof selectedLocale === 'string') {
            return selectedLocale
        }
        return undefined
    }

    private static async _saveSelectedLocale(locale: string): Promise<void> {
        await browser.storage.local.set({ selectedLocale: locale })
    }

}
