import { makeAutoObservable } from 'mobx'
import { singleton } from 'tsyringe'

import { LocalizationStore } from '@app/popup/modules/shared'

@singleton()
export class LanguageSelectorStore {

    constructor(private localization: LocalizationStore) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get selectedLocale(): string {
        return this.localization.locale
    }

    public setLocale(locale: string): Promise<void> {
        return this.localization.setLocale(locale)
    }

}
