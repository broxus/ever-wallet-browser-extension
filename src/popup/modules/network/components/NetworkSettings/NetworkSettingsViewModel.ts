import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { ConnectionDataItem } from '@app/models'
import { ConnectionStore } from '@app/popup/modules/shared'
import { Config } from '@app/shared'

@injectable()
export class NetworkSettingsViewModel {

    constructor(private connectionStore: ConnectionStore) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public get networks(): ConnectionDataItem[] {
        return this.connectionStore.connectionItems
    }

    public get config(): Config {
        return this.connectionStore.connectionConfig
    }

}
