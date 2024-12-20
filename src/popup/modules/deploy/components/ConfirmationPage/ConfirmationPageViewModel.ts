import { makeAutoObservable, runInAction } from 'mobx'
import { injectable } from 'tsyringe'

import { Router } from '@app/popup/modules/shared'
import { parseError } from '@app/popup/utils'

import { DeployStore } from '../../store'

@injectable()
export class ConfirmationPageViewModel {

    public loading = false

    public error = ''

    constructor(public store: DeployStore, private router: Router) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public async submit(password?: string): Promise<boolean> {
        if (this.loading) return false
        this.loading = true
        this.error = ''

        try {
            await this.store.submitPassword(password)
        }
        catch (e) {
            runInAction(() => {
                this.error = parseError(e)
            })

            return false
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }

        return true
    }

    public handleBack(): void {
        this.router.navigate('/')
    }

}
