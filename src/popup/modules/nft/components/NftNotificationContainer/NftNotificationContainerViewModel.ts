import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { NftStore } from '../../store'

@injectable()
export class NftNotificationContainerViewModel {

    constructor(private nftStore: NftStore) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    get opened(): boolean {
        return !!this.nftStore.lastHiddenItem
    }

    public async undo(): Promise<void> {
        await this.nftStore.undoHideCollection()
    }

}
