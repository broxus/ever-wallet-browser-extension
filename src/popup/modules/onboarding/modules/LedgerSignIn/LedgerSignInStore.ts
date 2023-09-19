import { AbstractStore } from '@broxus/js-core'
import { makeObservable } from 'mobx'
import { singleton } from 'tsyringe'


type LedgerSignInStoreData = {
}

type LedgerSignInStoreState = {
    name: string
}
@singleton()
export class LedgerSignInStore extends AbstractStore<
    LedgerSignInStoreData,
    LedgerSignInStoreState
> {

    constructor() {
        super()
        makeObservable(this)
    }


}
