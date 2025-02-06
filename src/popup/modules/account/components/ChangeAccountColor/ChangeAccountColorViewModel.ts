import { makeAutoObservable } from 'mobx'
import { injectable } from 'tsyringe'

import { SlidingPanelHandle } from '@app/popup/modules/shared'

@injectable()
export class ChangeAccountColorViewModel {

    constructor(
        public handle: SlidingPanelHandle,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

}
