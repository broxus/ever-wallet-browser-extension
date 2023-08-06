import { makeAutoObservable, runInAction } from 'mobx'
import { UseFormReturn } from 'react-hook-form'
import { inject, injectable } from 'tsyringe'

import type { Nekoton } from '@app/models'
import { AccountabilityStore, NekotonToken, Router } from '@app/popup/modules/shared'

import { NftStore } from '../../store'

@injectable()
export class NftImportViewModel {

    public form!: UseFormReturn<ImportFormData>

    public loading = false

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private accountability: AccountabilityStore,
        private nftStore: NftStore,
        private router: Router,
    ) {
        makeAutoObservable(this, undefined, { autoBind: true })
    }

    public validateAddress(value: string): boolean {
        return this.nekoton.checkAddress(value)
    }

    public async submitManual(data: ImportFormData): Promise<void> {
        if (this.loading) return

        const { address } = data
        const owner = this.accountability.selectedAccountAddress!

        this.loading = true

        try {
            await this.nftStore.importNftCollection(owner, address)
            await this.router.navigate('/dashboard/nft')
        }
        catch (e: any) {
            if (e?.message === 'Not nft owner') {
                this.form.setError('address', { type: 'notowner' })
            }
            else {
                this.form.setError('address', { type: 'notfound' })
            }
        }
        finally {
            runInAction(() => {
                this.loading = false
            })
        }
    }

}

export interface ImportFormData {
    address: string;
}
