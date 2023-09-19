import { AbstractStore } from '@broxus/js-core'
import { action, computed, makeObservable } from 'mobx'
import { singleton } from 'tsyringe'

import { LocalizationStore } from '@app/popup/modules/shared'

type LanguageSelectorStoreData = {
    localization: LocalizationStore
}

type LanguageSelectorStoreState = {
}

@singleton()
export class LanguageSelectorStore extends AbstractStore<
    LanguageSelectorStoreData,
    LanguageSelectorStoreState
> {

    constructor(private localization: LocalizationStore) {
        super()
        this.setData('localization', this.localization)

        makeObservable(this)
    }

    @computed
    public get selectedLocale(): string {
        return this._data.localization.locale
    }

    @action.bound
    public setLocale(locale: string): Promise<void> {
        return this.localization.setLocale(locale)
    }

}
