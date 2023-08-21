import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { Router } from '@app/popup/modules/shared'

import { DeployStore } from '../../store'
import { parseError } from '@app/popup/utils'

@injectable()
export class ConfirmationPageViewModel {

    public loading = false

    public error = ''

    constructor(
        public store: DeployStore,
        private router: Router,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public async submit(password?: string): Promise<void> {
        if (this.loading) return
        this.loading = true

        try {
            await this.store.submitPassword(password)
            await this.router.navigate('/result')
        }
        catch (e) {
            runInAction(() => {
                this.error = parseError(e)
            })
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

    public handleBack(): void {
        this.router.navigate('/')
    }

}
