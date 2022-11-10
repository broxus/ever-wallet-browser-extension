import { makeAutoObservable, runInAction } from 'mobx'
import { UseFormReturn } from 'react-hook-form'
import { inject, injectable } from 'tsyringe'

import { Nekoton } from '@app/models'
import { AccountabilityStore, DrawerContext, NekotonToken } from '@app/popup/modules/shared'
import { Logger } from '@app/shared'

import { NftStore } from '../../store'

@injectable()
export class NftImportViewModel {

    public drawer!: DrawerContext

    public form!: UseFormReturn<ImportFormData>

    public loading = false

    constructor(
        @inject(NekotonToken) private nekoton: Nekoton,
        private accountability: AccountabilityStore,
        private nftStore: NftStore,
        private logger: Logger,
    ) {
        makeAutoObservable<NftImportViewModel, any>(this, {
            nekoton: false,
            accountability: false,
            nftStore: false,
            logger: false,
        }, { autoBind: true })
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
            this.drawer.close()
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
